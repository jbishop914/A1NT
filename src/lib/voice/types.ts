/* ─── Voice Pipeline Types ─────────────────────────────────────────────────── */

/** Supported OpenAI Realtime models */
export type RealtimeModel =
  | "gpt-realtime-mini"
  | "gpt-realtime"
  | "gpt-4o-mini-realtime";

/** Available voice presets */
export type VoicePreset =
  | "alloy"
  | "ash"
  | "ballad"
  | "coral"
  | "echo"
  | "sage"
  | "shimmer"
  | "verse";

/** VAD (Voice Activity Detection) modes */
export type VadMode = "server_vad" | "semantic" | "disabled";

/** Audio format for Twilio ↔ OpenAI (µ-law, no transcoding needed) */
export type AudioFormat = "audio/pcmu" | "audio/pcm16";

/* ─── Session Configuration ─────────────────────────────────────────────── */

export interface AgentVoiceConfig {
  model: RealtimeModel;
  voice: VoicePreset;
  temperature: number;
  maxTokens: number;
  vadMode: VadMode;
  systemPrompt: string;
  tools: RealtimeTool[];
}

export interface RealtimeTool {
  type: "function";
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, ToolParameter>;
    required?: string[];
  };
}

export interface ToolParameter {
  type: string;
  description: string;
  enum?: string[];
}

/* ─── Session State ─────────────────────────────────────────────────────── */

export type SessionStatus =
  | "initializing"
  | "connected"
  | "active"
  | "ended"
  | "error";

export interface VoiceSession {
  id: string;
  agentId: string;
  callSid: string;
  streamSid: string | null;
  status: SessionStatus;
  startedAt: Date;
  endedAt: Date | null;
  callerNumber: string;
  callerName: string | null;
  model: RealtimeModel;
  voice: VoicePreset;
  /** Tracks tool calls made during the session */
  toolCalls: ToolCallRecord[];
  /** Token usage from OpenAI */
  usage: { input: number; output: number; total: number };
}

export interface ToolCallRecord {
  id: string;
  name: string;
  arguments: string;
  output: string | null;
  timestamp: Date;
  durationMs: number | null;
}

/* ─── Twilio Events ─────────────────────────────────────────────────────── */

/** Twilio Media Stream WebSocket events */
export type TwilioStreamEvent =
  | TwilioConnectedEvent
  | TwilioStartEvent
  | TwilioMediaEvent
  | TwilioStopEvent
  | TwilioMarkEvent;

export interface TwilioConnectedEvent {
  event: "connected";
  protocol: string;
  version: string;
}

export interface TwilioStartEvent {
  event: "start";
  sequenceNumber: string;
  start: {
    streamSid: string;
    accountSid: string;
    callSid: string;
    tracks: string[];
    customParameters: Record<string, string>;
    mediaFormat: {
      encoding: string;
      sampleRate: number;
      channels: number;
    };
  };
  streamSid: string;
}

export interface TwilioMediaEvent {
  event: "media";
  sequenceNumber: string;
  media: {
    track: string;
    chunk: string;
    timestamp: string;
    payload: string; // Base64-encoded µ-law audio
  };
  streamSid: string;
}

export interface TwilioStopEvent {
  event: "stop";
  sequenceNumber: string;
  stop: {
    accountSid: string;
    callSid: string;
  };
  streamSid: string;
}

export interface TwilioMarkEvent {
  event: "mark";
  sequenceNumber: string;
  mark: { name: string };
  streamSid: string;
}

/* ─── OpenAI Realtime Events (subset we care about) ─────────────────────── */

export interface OpenAISessionUpdate {
  type: "session.update";
  session: {
    type: "realtime";
    model: string;
    output_modalities: string[];
    audio: {
      input: {
        format: { type: AudioFormat };
        turn_detection: { type: string };
      };
      output: {
        format: { type: AudioFormat };
        voice: VoicePreset;
      };
    };
    instructions: string;
    tools?: RealtimeTool[];
    temperature?: number;
  };
}

export interface OpenAIAudioDelta {
  type: "response.output_audio.delta";
  response_id: string;
  item_id: string;
  output_index: number;
  delta: string; // Base64 audio chunk
}

export interface OpenAIFunctionCallDone {
  type: "response.function_call_arguments.done";
  response_id: string;
  item_id: string;
  output_index: number;
  call_id: string;
  name: string;
  arguments: string;
}

export interface OpenAIResponseDone {
  type: "response.done";
  response: {
    id: string;
    status: string;
    usage?: {
      input_tokens: number;
      output_tokens: number;
      total_tokens: number;
    };
    output?: Array<{
      type: string;
      name?: string;
      call_id?: string;
      arguments?: string;
    }>;
  };
}
