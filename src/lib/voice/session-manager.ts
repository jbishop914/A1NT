/* ─── Voice Session Manager ────────────────────────────────────────────────
   Manages the lifecycle of a voice call session:
   1. Twilio WebSocket connects (incoming call)
   2. Opens OpenAI Realtime WebSocket
   3. Proxies audio bidirectionally (Twilio ↔ OpenAI)
   4. Handles function calling (tool "ticks")
   5. Tracks session state, usage, and tool calls

   Architecture:
   ┌──────────┐     ┌──────────────┐     ┌──────────────┐
   │  Caller  │◄───►│  Twilio      │◄───►│  A1NT        │◄───►│ OpenAI     │
   │  (PSTN)  │     │  Media       │ WS  │  Gateway     │ WS  │ Realtime   │
   │          │     │  Streams     │     │  (this file) │     │ API        │
   └──────────┘     └──────────────┘     └──────────────┘     └────────────┘
                     G.711 µ-law          G.711 µ-law (no transcoding)
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
  "response.output_audio.done",
  "response.function_call_arguments.done",
  "input_audio_buffer.speech_started",
  "input_audio_buffer.speech_stopped",
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

  console.log("[Voice] Twilio WebSocket connected — initializing session");

  /* ─── Open OpenAI Realtime WebSocket ────────────────────────────── */
  const openaiUrl = `${OPENAI_REALTIME_URL}?model=${model}`;
  openaiWs = new WebSocket(openaiUrl, {
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "OpenAI-Beta": "realtime=v1",
    },
  });

  /* ─── OpenAI: Connection opened ─────────────────────────────────── */
  openaiWs.on("open", () => {
    console.log("[Voice] Connected to OpenAI Realtime API");

    // Small delay to ensure connection stability before configuring
    setTimeout(() => {
      if (!openaiWs || openaiWs.readyState !== WebSocket.OPEN) return;

      // Build system prompt — use caller info if available, else default
      const systemPrompt =
        config?.systemPrompt ?? buildDefaultPrompt(session?.callerNumber ?? "unknown");

      // OpenAI Realtime API session.update — flat structure per API spec
      // Model is set via URL param, NOT in session.update
      // Audio format: g711_ulaw = Twilio's native µ-law encoding (no transcoding needed)
      const sessionUpdate = {
        type: "session.update",
        session: {
          modalities: ["text", "audio"],
          input_audio_format: "g711_ulaw",
          output_audio_format: "g711_ulaw",
          input_audio_transcription: { model: "gpt-4o-mini-transcribe" },
          turn_detection: {
            type: "server_vad",
            prefix_padding_ms: 300,
            silence_duration_ms: 500,
          },
          voice,
          instructions: systemPrompt,
          tools,
          temperature,
        },
      };

      console.log("[Voice] Sending session.update to OpenAI");
      openaiWs.send(JSON.stringify(sessionUpdate));
    }, 250);
  });

  /* ─── OpenAI: Incoming messages ─────────────────────────────────── */
  openaiWs.on("message", (data: WebSocket.RawData) => {
    try {
      const event = JSON.parse(data.toString());

      // Debug logging for tracked event types
      if (LOG_EVENT_TYPES.includes(event.type)) {
        console.log(`[Voice] OpenAI event: ${event.type}`);
      }

      switch (event.type) {
        /* ── Session configured ──────────────────────────────────── */
        case "session.updated":
          console.log("[Voice] Session configured successfully");
          if (session) session.status = "active";
          break;

        /* ── Audio output from AI → send to Twilio ───────────────── */
        case "response.output_audio.delta":
          if (event.delta && streamSid && twilioWs.readyState === WebSocket.OPEN) {
            const audioDelta = {
              event: "media",
              streamSid,
              media: {
                payload: Buffer.from(event.delta, "base64").toString("base64"),
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
            if (streamSid) {
              const markName = `response-${Date.now()}`;
              twilioWs.send(
                JSON.stringify({
                  event: "mark",
                  streamSid,
                  mark: { name: markName },
                })
              );
              markQueue.push(markName);
            }
          }
          break;

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
              openaiWs.send(
                JSON.stringify({
                  type: "conversation.item.truncate",
                  item_id: lastAssistantItemId,
                  content_index: 0,
                  audio_end_ms: latestMediaTimestamp,
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
          console.error("[Voice] OpenAI error:", JSON.stringify(event.error));
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

  /* ─── Session Cleanup ───────────────────────────────────────────── */
  function endSession(reason: string) {
    console.log(`[Voice] Ending session — reason: ${reason}`);

    if (session) {
      session.status = "ended";
      session.endedAt = new Date();

      // Log session summary
      const duration = session.endedAt.getTime() - session.startedAt.getTime();
      console.log(
        `[Voice] Session summary: ` +
          `duration=${Math.round(duration / 1000)}s, ` +
          `toolCalls=${session.toolCalls.length}, ` +
          `tokens=${session.usage.total}`
      );

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
}
