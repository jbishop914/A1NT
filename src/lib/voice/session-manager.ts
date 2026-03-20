/* ─── Voice Session Manager ────────────────────────────────────────────────
   Manages the lifecycle of a voice call session:
   1. Twilio WebSocket connects (incoming call)
   2. Twilio "start" event arrives with streamSid
   3. THEN opens OpenAI Realtime WebSocket (guarantees streamSid is set)
   4. Proxies audio bidirectionally (Twilio ↔ OpenAI)
   5. Handles function calling (tool "ticks")
   6. Tracks session state, usage, tool calls, and transcript
   7. Persists completed call record to the call store

   Architecture:
   ┌──────────┐     ┌──────────────┐     ┌──────────────┐
   │  Caller  │◄───►│  Twilio      │◄───►│  A1NT        │◄───►│ OpenAI     │
   │  (PSTN)  │     │  Media       │ WS  │  Gateway     │ WS  │ Realtime   │
   │          │     │  Streams     │     │  (this file) │     │ API        │
   └──────────┘     └──────────────┘     └──────────────┘     └────────────┘
                     G.711 µ-law          G.711 µ-law (no transcoding)

   Key design: OpenAI connection is deferred until AFTER Twilio's "start"
   event sets streamSid. This matches OpenAI's official Twilio demo and
   prevents audio deltas from being silently dropped.
   ──────────────────────────────────────────────────────────────────────── */

import WebSocket from "ws";
import type {
  VoiceSession,
  AgentVoiceConfig,
  TwilioStreamEvent,
  TwilioStartEvent,
  TwilioMediaEvent,
  ToolCallRecord,
  VoicePreset,
} from "./types";
import { AGENT_TOOLS, executeToolCall } from "./tools";
import { buildDefaultPrompt } from "./prompts";
import {
  createCallRecord,
  updateCallRecordById,
  type CallRecordInput,
  type TranscriptTurn,
  type StoredToolCall,
} from "./call-store";

/* ─── Constants ────────────────────────────────────────────────────────── */

const OPENAI_REALTIME_URL = "wss://api.openai.com/v1/realtime";
const DEFAULT_MODEL = "gpt-realtime-mini";
const DEFAULT_VOICE: VoicePreset = "alloy";
const DEFAULT_TEMPERATURE = 0.7;

/** OpenAI event types to log for debugging */
const LOG_EVENT_TYPES = [
  "session.created",
  "session.updated",
  "response.created",
  "response.done",
  "response.output_item.added",
  "response.output_item.done",
  "response.audio.delta",         // beta name (some models still emit this)
  "response.output_audio.done",
  "response.output_audio_transcript.done",
  "response.function_call_arguments.done",
  "input_audio_buffer.speech_started",
  "input_audio_buffer.speech_stopped",
  "input_audio_buffer.committed",
  "conversation.item.created",
  "conversation.item.input_audio_transcription.completed",
  "error",
];

/* ─── Active Sessions Registry ─────────────────────────────────────────── */

const activeSessions = new Map<string, VoiceSession>();

export function getActiveSessions(): VoiceSession[] {
  return Array.from(activeSessions.values());
}

export function getSession(callSid: string): VoiceSession | undefined {
  return activeSessions.get(callSid);
}

/* ─── Session Handler ──────────────────────────────────────────────────── */

/**
 * Handle an incoming Twilio Media Stream WebSocket connection.
 * This is the main entry point called by the WebSocket server.
 *
 * IMPORTANT: We do NOT connect to OpenAI here. We wait for Twilio's
 * "start" event which provides streamSid, THEN connect to OpenAI.
 * This guarantees audio deltas can always be forwarded to Twilio.
 *
 * @param twilioWs - WebSocket connection from Twilio Media Streams
 * @param config - Optional agent voice configuration (uses defaults if omitted)
 */
export function handleMediaStream(
  twilioWs: WebSocket,
  config?: Partial<AgentVoiceConfig>
): void {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    console.error("[Voice] OPENAI_API_KEY not set — cannot start session");
    twilioWs.close(1008, "Server misconfigured");
    return;
  }

  /* ─── Resolve config with defaults ──────────────────────────────── */
  const model = config?.model ?? DEFAULT_MODEL;
  const voice = config?.voice ?? DEFAULT_VOICE;
  const temperature = config?.temperature ?? DEFAULT_TEMPERATURE;
  const tools = config?.tools ?? AGENT_TOOLS;

  /* ─── Session state ─────────────────────────────────────────────── */
  let streamSid: string | null = null;
  let callSid: string | null = null;
  let session: VoiceSession | null = null;
  let openaiWs: WebSocket | null = null;

  /* Interruption handling */
  let lastAssistantItemId: string | null = null;
  let responseStartTimestamp: number | null = null;
  let latestMediaTimestamp = 0;
  const markQueue: string[] = [];

  /* ─── Transcript + Actions tracking ─────────────────────────────── */
  const transcript: TranscriptTurn[] = [];
  const actionsTaken: string[] = [];
  let workOrderCreated: string | null = null;
  let appointmentBooked = false;
  let customerName: string | null = null;
  let customerPhone: string | null = null;
  let isNewCustomer = false;
  let callerCity: string | null = null;
  let callerState: string | null = null;

  console.log("[Voice] Twilio WebSocket connected — waiting for start event");

  /* ─── Connect to OpenAI Realtime API ───────────────────────────────
     Called ONLY after Twilio's "start" event provides streamSid.
     This is the key architectural fix: by deferring the OpenAI
     connection, we guarantee streamSid is available before any
     audio deltas arrive from OpenAI.
     ─────────────────────────────────────────────────────────────── */
  function connectToOpenAI() {
    if (openaiWs) {
      console.warn("[Voice] OpenAI already connected — skipping");
      return;
    }

    const openaiUrl = `${OPENAI_REALTIME_URL}?model=${model}`;
    console.log(`[Voice] Connecting to OpenAI Realtime (model=${model})`);

    openaiWs = new WebSocket(openaiUrl, {
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "OpenAI-Beta": "realtime=v1",
      },
    });

    /* ─── OpenAI: Connection opened ───────────────────────────────── */
    openaiWs.on("open", () => {
      console.log("[Voice] Connected to OpenAI Realtime API");
      console.log(`[Voice] streamSid=${streamSid} (should be set)`);

      // Small delay to ensure connection stability before configuring
      setTimeout(() => {
        if (!openaiWs || openaiWs.readyState !== WebSocket.OPEN) return;

        // Build system prompt — use caller info from session
        const systemPrompt =
          config?.systemPrompt ?? buildDefaultPrompt(session?.callerNumber ?? "unknown");

        // OpenAI Realtime API session.update — FLAT structure per official API reference:
        // https://platform.openai.com/docs/api-reference/realtime-client-events/session/update
        // g711_ulaw = µ-law = Twilio's native format (no transcoding)
        const sessionUpdate = {
          type: "session.update",
          session: {
            modalities: ["text", "audio"],
            voice,
            input_audio_format: "g711_ulaw",
            output_audio_format: "g711_ulaw",
            input_audio_transcription: { model: "whisper-1" },
            turn_detection: {
              type: "server_vad" as const,
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
            },
            instructions: systemPrompt,
            // Realtime API uses FLAT tool format (name at top level),
            // NOT the Chat Completions format (name inside function wrapper)
            tools,
            temperature,
          },
        };

        console.log("[Voice] Sending session.update to OpenAI:", JSON.stringify(sessionUpdate, null, 2));
        openaiWs!.send(JSON.stringify(sessionUpdate));
      }, 250);
    });

    /* ─── OpenAI: Incoming messages ───────────────────────────────── */
    openaiWs.on("message", (data: WebSocket.RawData) => {
      try {
        const event = JSON.parse(data.toString());

        // Debug logging for tracked event types
        if (LOG_EVENT_TYPES.includes(event.type)) {
          console.log(`[Voice] OpenAI event: ${event.type}`);
        }

        switch (event.type) {
          /* ── Session configured ──────────────────────────────────── */
          case "session.created":
            console.log("[Voice] Session created by OpenAI");
            break;

          case "session.updated":
            console.log("[Voice] Session configured successfully:", JSON.stringify({
              modalities: event.session?.modalities,
              voice: event.session?.voice,
              input_audio_format: event.session?.input_audio_format,
              output_audio_format: event.session?.output_audio_format,
              turn_detection: event.session?.turn_detection?.type,
              tools_count: event.session?.tools?.length,
            }));
            if (session) session.status = "active";

            // Kick off the conversation — tell the AI to greet the caller.
            // Without this, server_vad waits for user speech first, but
            // the caller expects the receptionist to speak first.
            // streamSid is GUARANTEED to be set at this point because
            // we deferred the OpenAI connection until after "start".
            if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
              console.log(
                `[Voice] Sending response.create — streamSid=${streamSid} (ready to receive audio)`
              );
              openaiWs.send(JSON.stringify({ type: "response.create" }));
            }
            break;

          /* ── Audio output from AI → send to Twilio ───────────────── */
          case "response.audio.delta":          // beta event name
          case "response.output_audio.delta":   // GA event name
            if (event.delta && streamSid && twilioWs.readyState === WebSocket.OPEN) {
              const audioDelta = {
                event: "media",
                streamSid,
                media: {
                  payload: event.delta, // Already base64 from OpenAI — pass through directly
                },
              };
              twilioWs.send(JSON.stringify(audioDelta));

              // Track response timing for interruption handling
              if (responseStartTimestamp === null) {
                responseStartTimestamp = latestMediaTimestamp;
              }

              // Track the assistant item for potential interruption
              if (event.item_id) {
                lastAssistantItemId = event.item_id;
              }

              // Send mark for interruption tracking
              twilioWs.send(
                JSON.stringify({
                  event: "mark",
                  streamSid,
                })
              );
            } else if (event.delta && !streamSid) {
              // This should never happen with the deferred connection,
              // but log it loudly if it does
              console.error(
                "[Voice] BUG: Audio delta arrived but streamSid is null! " +
                  "This means the OpenAI connection was opened before Twilio start."
              );
            }
            break;

          /* ── AI transcript completed — capture what AI said ──────── */
          case "response.audio_transcript.done":
          case "response.output_audio_transcript.done": {
            const aiText = event.transcript ?? event.text ?? "";
            if (aiText) {
              transcript.push({
                speaker: "ai",
                text: aiText,
                timestamp: new Date().toISOString(),
              });
              console.log(`[Voice] AI said: "${aiText.substring(0, 80)}..."`);
            }
            break;
          }

          /* ── Caller transcript completed — capture what caller said ─ */
          case "conversation.item.input_audio_transcription.completed": {
            const callerText = event.transcript ?? "";
            if (callerText) {
              transcript.push({
                speaker: "caller",
                text: callerText,
                timestamp: new Date().toISOString(),
              });
              console.log(`[Voice] Caller said: "${callerText.substring(0, 80)}..."`);
            }
            break;
          }

          /* ── Function call completed — execute tool ──────────────── */
          case "response.function_call_arguments.done": {
            const { call_id, name, arguments: argsJson } = event;
            console.log(`[Voice] Function call: ${name}(${argsJson})`);

            const toolStart = Date.now();

            // Execute the tool asynchronously
            executeToolCall(name, argsJson).then((result) => {
              const record: ToolCallRecord = {
                id: call_id,
                name,
                arguments: argsJson,
                output: result,
                timestamp: new Date(),
                durationMs: Date.now() - toolStart,
              };

              if (session) session.toolCalls.push(record);

              // Track actions from tool results
              trackToolAction(name, argsJson, result);

              // Add tool call to transcript as system event
              transcript.push({
                speaker: "system",
                text: `[Tool: ${name}] ${summarizeToolResult(name, result)}`,
                timestamp: new Date().toISOString(),
              });

              // Send function result back to OpenAI
              if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
                // Step 1: Add function output to conversation
                openaiWs.send(
                  JSON.stringify({
                    type: "conversation.item.create",
                    item: {
                      type: "function_call_output",
                      call_id,
                      output: result,
                    },
                  })
                );

                // Step 2: Trigger model to continue speaking with the result
                openaiWs.send(JSON.stringify({ type: "response.create" }));
              }
            });
            break;
          }

          /* ── Speech started — handle interruption ────────────────── */
          case "input_audio_buffer.speech_started": {
            console.log("[Voice] Caller started speaking (interruption)");
            if (lastAssistantItemId) {
              // Truncate the current assistant response
              if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
                const elapsedMs = latestMediaTimestamp - (responseStartTimestamp ?? 0);
                openaiWs.send(
                  JSON.stringify({
                    type: "conversation.item.truncate",
                    item_id: lastAssistantItemId,
                    content_index: 0,
                    audio_end_ms: elapsedMs > 0 ? elapsedMs : 0,
                  })
                );
              }

              // Clear Twilio's audio buffer
              if (streamSid && twilioWs.readyState === WebSocket.OPEN) {
                twilioWs.send(
                  JSON.stringify({
                    event: "clear",
                    streamSid,
                  })
                );
              }
            }

            responseStartTimestamp = null;
            lastAssistantItemId = null;
            break;
          }

          /* ── Response completed — track usage ────────────────────── */
          case "response.done": {
            if (event.response?.usage && session) {
              session.usage.input += event.response.usage.input_tokens ?? 0;
              session.usage.output += event.response.usage.output_tokens ?? 0;
              session.usage.total += event.response.usage.total_tokens ?? 0;
            }
            responseStartTimestamp = null;
            break;
          }

          /* ── Error from OpenAI ───────────────────────────────────── */
          case "error":
            console.error("[Voice] OpenAI error:", JSON.stringify(event, null, 2));
            if (session) session.status = "error";
            break;
        }
      } catch (err) {
        console.error("[Voice] Error processing OpenAI message:", err);
      }
    });

    openaiWs.on("close", () => {
      console.log("[Voice] OpenAI WebSocket closed");
      endSession("openai_disconnect");
    });

    openaiWs.on("error", (err) => {
      console.error("[Voice] OpenAI WebSocket error:", err);
      if (session) session.status = "error";
    });
  }

  /* ─── Track actions from tool calls ────────────────────────────────── */

  function trackToolAction(name: string, argsJson: string, result: string) {
    try {
      const args = JSON.parse(argsJson);
      const res = JSON.parse(result);

      switch (name) {
        case "create_work_order":
          if (res.success && res.work_order?.number) {
            workOrderCreated = res.work_order.number;
            actionsTaken.push(`Work order ${res.work_order.number} created`);
            if (args.customer_name) customerName = args.customer_name;
            if (args.phone) customerPhone = args.phone;
          }
          break;

        case "check_schedule":
          if (args.date || args.preferred_date) {
            appointmentBooked = true;
            actionsTaken.push(
              `Schedule checked for ${args.date ?? args.preferred_date}`
            );
          }
          break;

        case "lookup_customer":
          if (res.found === false) {
            isNewCustomer = true;
            actionsTaken.push(`New customer identified: ${args.query}`);
            if (!customerName && args.query) customerName = args.query;
          } else if (res.found && res.customer) {
            customerName = res.customer.name;
            customerPhone = res.customer.phone;
            actionsTaken.push(`Customer found: ${res.customer.name}`);
          }
          break;

        case "send_confirmation":
          actionsTaken.push(`Confirmation SMS sent to ${args.phone}`);
          break;

        case "transfer_call":
          actionsTaken.push(`Call transferred to ${args.department}`);
          break;

        case "search_knowledge_base":
          actionsTaken.push(`Knowledge base searched: ${args.query}`);
          break;
      }
    } catch {
      // Ignore parse errors
    }
  }

  /** Summarize a tool result for the transcript */
  function summarizeToolResult(name: string, result: string): string {
    try {
      const res = JSON.parse(result);
      switch (name) {
        case "create_work_order":
          return res.success ? `Created ${res.work_order?.number}` : "Failed";
        case "lookup_customer":
          return res.found ? `Found: ${res.customer?.name}` : "No customer found";
        case "check_schedule":
          return `${res.available_slots?.length ?? 0} days with availability`;
        case "send_confirmation":
          return res.success ? "Sent" : "Failed";
        case "transfer_call":
          return res.success ? `To ${res.department}` : "Failed";
        case "search_knowledge_base":
          return `${res.total_results ?? 0} results`;
        default:
          return "Completed";
      }
    } catch {
      return "Completed";
    }
  }

  /* ─── Twilio: Incoming messages ─────────────────────────────────── */
  twilioWs.on("message", (message: WebSocket.RawData) => {
    try {
      const data = JSON.parse(message.toString()) as TwilioStreamEvent;

      switch (data.event) {
        /* ── Stream started — capture session metadata ────────── */
        case "start": {
          const startData = data as TwilioStartEvent;
          streamSid = startData.start.streamSid;
          callSid = startData.start.callSid;

          // Extract caller info from custom parameters
          const params = startData.start.customParameters ?? {};
          callerCity = params.callerCity ?? null;
          callerState = params.callerState ?? null;

          session = {
            id: `vs-${Date.now().toString(36)}`,
            agentId: params.agentId ?? "agent-alex",
            callSid: callSid,
            streamSid,
            status: "connected",
            startedAt: new Date(),
            endedAt: null,
            callerNumber: params.callerNumber ?? "unknown",
            callerName: params.callerName ?? null,
            model,
            voice,
            toolCalls: [],
            usage: { input: 0, output: 0, total: 0 },
          };

          activeSessions.set(callSid, session);
          console.log(
            `[Voice] Stream started — callSid=${callSid}, streamSid=${streamSid}`
          );

          // NOW connect to OpenAI — streamSid is guaranteed set
          connectToOpenAI();
          break;
        }

        /* ── Audio from caller → forward to OpenAI ────────────── */
        case "media": {
          const mediaData = data as TwilioMediaEvent;
          latestMediaTimestamp = parseInt(mediaData.media.timestamp, 10);

          if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
            openaiWs.send(
              JSON.stringify({
                type: "input_audio_buffer.append",
                audio: mediaData.media.payload,
              })
            );
          }
          break;
        }

        /* ── Mark received (for interruption timing) ──────────── */
        case "mark":
          if (markQueue.length > 0) {
            markQueue.shift();
          }
          break;

        /* ── Stream stopped ───────────────────────────────────── */
        case "stop":
          console.log("[Voice] Twilio stream stopped");
          endSession("twilio_stop");
          break;
      }
    } catch (err) {
      console.error("[Voice] Error parsing Twilio message:", err);
    }
  });

  twilioWs.on("close", () => {
    console.log("[Voice] Twilio WebSocket closed");
    endSession("twilio_disconnect");
  });

  twilioWs.on("error", (err) => {
    console.error("[Voice] Twilio WebSocket error:", err);
  });

  /* ─── Session Cleanup + Call Record Persistence ────────────────────── */
  let sessionEnded = false;

  function endSession(reason: string) {
    if (sessionEnded) return; // Prevent double-end
    sessionEnded = true;

    console.log(`[Voice] Ending session — reason: ${reason}`);

    if (session) {
      session.status = "ended";
      session.endedAt = new Date();

      // Log session summary
      const duration = session.endedAt.getTime() - session.startedAt.getTime();
      const durationSecs = Math.round(duration / 1000);
      console.log(
        `[Voice] Session summary: ` +
          `duration=${durationSecs}s, ` +
          `toolCalls=${session.toolCalls.length}, ` +
          `tokens=${session.usage.total}, ` +
          `transcript=${transcript.length} turns`
      );

      // ─── Persist to database via Prisma ────────────────────────
      // organizationId: In production, resolved from Twilio number → org mapping.
      // For now, use env var or default demo org.
      const orgId = process.env.A1NT_ORG_ID ?? "demo-org";

      const isOutbound = config?.direction === "outbound";
      const finalStatus = reason === "twilio_stop" || reason === "twilio_disconnect" ? "COMPLETED" : "FAILED";

      const callRecordInput: CallRecordInput = {
        organizationId: orgId,
        callSid: session.callSid,
        streamSid: session.streamSid,
        callerNumber: session.callerNumber,
        callerName: customerName ?? session.callerName,
        callerCity,
        callerState,
        direction: isOutbound ? "OUTBOUND" : "INBOUND",
        status: finalStatus,
        intent: inferIntent(),
        priority: inferPriority(),
        sentiment: null, // Phase 2: post-call sentiment analysis
        startedAt: session.startedAt,
        endedAt: session.endedAt!,
        duration: durationSecs,
        agentId: session.agentId,
        agentName: "Alex", // Default persona
        model: session.model,
        voice: session.voice,
        transcript,
        summary: buildCallSummary(),
        toolCalls: session.toolCalls.map((tc) => ({
          id: tc.id,
          name: tc.name,
          arguments: tc.arguments,
          output: tc.output,
          timestamp: tc.timestamp.toISOString(),
          durationMs: tc.durationMs,
        })),
        actionsTaken,
        workOrderId: null,  // Phase 2: link to real work order ID
        clientId: null,     // Phase 2: link to real client ID
        appointmentBooked,
        isNewCustomer,
        tokensInput: session.usage.input,
        tokensOutput: session.usage.output,
        tokensTotal: session.usage.total,
      };

      if (isOutbound && config?.recordId) {
        // Outbound calls: outbound.ts already created the CallRecord.
        // UPDATE it instead of creating a duplicate.
        updateCallRecordById(config.recordId, callRecordInput)
          .then((id) => console.log(`[Voice] Outbound call record updated: ${id}`))
          .catch((err) => console.error("[Voice] Failed to update outbound call record:", err));
      } else {
        // Inbound calls: create a fresh CallRecord.
        createCallRecord(callRecordInput)
          .then((id) => console.log(`[Voice] Call record persisted to DB: ${id}`))
          .catch((err) => console.error("[Voice] Failed to persist call record:", err));
      }

      // Keep in activeSessions for 5 minutes for status queries, then clean up
      if (callSid) {
        setTimeout(() => {
          activeSessions.delete(callSid!);
        }, 5 * 60 * 1000);
      }
    }

    // Close OpenAI WebSocket if still open
    if (openaiWs && openaiWs.readyState === WebSocket.OPEN) {
      openaiWs.close();
    }
    openaiWs = null;
  }

  /* ─── Inference helpers ────────────────────────────────────────────── */

  function inferIntent(): CallRecordInput["intent"] {
    const toolNames = session?.toolCalls.map((tc) => tc.name) ?? [];
    if (toolNames.includes("create_work_order")) return "SERVICE_REQUEST";
    if (toolNames.includes("check_schedule")) return "APPOINTMENT";
    if (toolNames.includes("transfer_call")) return "GENERAL";
    if (toolNames.includes("search_knowledge_base")) return "GENERAL";
    if (isNewCustomer) return "SALES_INQUIRY";
    return "GENERAL";
  }

  function inferPriority(): CallRecordInput["priority"] {
    const args = session?.toolCalls
      .filter((tc) => tc.name === "create_work_order")
      .map((tc) => {
        try { return JSON.parse(tc.arguments); } catch { return {}; }
      }) ?? [];
    for (const a of args) {
      if (a.priority === "emergency") return "URGENT";
      if (a.priority === "urgent") return "HIGH";
    }
    return "NORMAL";
  }

  function buildCallSummary(): string {
    const parts: string[] = [];

    if (isNewCustomer && customerName) {
      parts.push(`New customer: ${customerName}.`);
    } else if (customerName) {
      parts.push(`Existing customer: ${customerName}.`);
    }

    if (workOrderCreated) {
      parts.push(`Work order ${workOrderCreated} created.`);
    }

    if (appointmentBooked) {
      parts.push("Appointment scheduled.");
    }

    if (actionsTaken.length > 0 && parts.length === 0) {
      parts.push(actionsTaken.join(". ") + ".");
    }

    if (parts.length === 0) {
      parts.push("General inquiry call handled by AI receptionist.");
    }

    return parts.join(" ");
  }
}
