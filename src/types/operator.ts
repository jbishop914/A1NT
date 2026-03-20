/* ─── Operator Module Types ─────────────────────────────────────────────────
   Types for the Operator phone system command center.
   Covers outbound call queue, inbound routing, and IVR configuration.
   ──────────────────────────────────────────────────────────────────────── */

// ─── Outbound Queue ─────────────────────────────────────────────────

export type OutboundCallStatus =
  | "queued"
  | "scheduled"
  | "in-progress"
  | "completed"
  | "failed"
  | "cancelled";

export type CampaignType =
  | "appointment-confirm"
  | "appointment-reschedule"
  | "pre-service-info"
  | "post-service-followup"
  | "invoice-followup"
  | "seasonal-promo"
  | "sales-prospecting"
  | "custom";

export type CallPriority = "normal" | "high" | "urgent";

export type CallOutcome =
  | "answered"
  | "voicemail"
  | "no-answer"
  | "busy"
  | "declined"
  | "wrong-number";

export interface OutboundQueueItem {
  id: string;
  contactName: string;
  contactPhone: string;
  campaignType: CampaignType;
  assignedAgentId: string | null;
  assignedAgentName: string | null;
  status: OutboundCallStatus;
  priority: CallPriority;
  scheduledTime: string | null;
  queuedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  duration: number | null; // seconds
  outcome: CallOutcome | null;
  notes: string;
  retryCount: number;
  maxRetries: number;
}

export interface CompletedCallDetail extends OutboundQueueItem {
  transcript: TranscriptTurn[];
  summary: string;
  sentiment: "positive" | "neutral" | "negative";
  actionsKicked: ActionKicked[];
  suggestedActions: SuggestedAction[];
}

export interface TranscriptTurn {
  role: "agent" | "contact";
  text: string;
  timestamp: string;
}

export interface ActionKicked {
  type: "work-order" | "estimate" | "lead" | "follow-up-call" | "appointment" | "invoice";
  description: string;
  referenceId: string;
  createdAt: string;
}

export interface SuggestedAction {
  type: "work-order" | "estimate" | "lead" | "follow-up-call" | "send-to-tech" | "appointment" | "reschedule" | "invoice";
  label: string;
  description: string;
  prefilled: Record<string, string>;
}

// ─── Live Call Monitor ──────────────────────────────────────────────

export interface LiveCall {
  id: string;
  callSid: string;
  contactName: string;
  contactPhone: string;
  agentName: string;
  campaignType: CampaignType;
  direction: "inbound" | "outbound";
  startedAt: string;
  duration: number; // live seconds
  liveTranscript: TranscriptTurn[];
  canTransfer: boolean;
  canTakeOver: boolean;
}

// ─── Agent Pool ─────────────────────────────────────────────────────

export interface AgentPoolEntry {
  id: string;
  name: string;
  type: string;
  status: "idle" | "on-call" | "post-processing" | "offline";
  currentCallId: string | null;
  callsCompleted: number;
  avgCallDuration: number;
  isClone: boolean;
  clonedFromId: string | null;
}

// ─── Inbound Routing ────────────────────────────────────────────────

export type RoutingMode = "normal" | "override" | "emergency";

export type RoutingDestination =
  | "ai-receptionist"
  | "ai-receptionist-limited"
  | "human"
  | "voicemail"
  | "ivr-menu"
  | "emergency-only"
  | "forward-cell"
  | "forward-employee";

export interface RoutingOverride {
  id: string;
  active: boolean;
  mode: RoutingMode;
  destination: RoutingDestination;
  forwardToNumber: string | null;
  forwardToName: string | null;
  reason: string;
  activatedAt: string | null;
  expiresAt: string | null;
  activatedBy: string;
}

export interface RoutingRule {
  id: string;
  name: string;
  intent: string;
  businessHoursRoute: string;
  afterHoursRoute: string;
  priority: "low" | "normal" | "high" | "urgent";
  enabled: boolean;
}

export interface CustomRoutingRule {
  id: string;
  type: "area-code" | "specific-number" | "caller-id";
  match: string; // area code or phone number
  destination: RoutingDestination;
  forwardTo: string | null;
  voicemailMessage: string | null;
  expiresAt: string | null;
  enabled: boolean;
  note: string;
}

// ─── Schedule-Based Routing ─────────────────────────────────────────

export type DayOfWeek = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface ScheduleBlock {
  id: string;
  day: DayOfWeek;
  startHour: number; // 0-23
  endHour: number; // 0-23
  destination: RoutingDestination;
  label: string;
  agentScript: string | null;
  forwardToNumber: string | null;
  forwardToName: string | null;
}

// ─── Queue Stats ────────────────────────────────────────────────────

export interface QueueStats {
  totalQueued: number;
  inProgress: number;
  completedToday: number;
  failedToday: number;
  avgWaitTime: number; // seconds
  avgCallDuration: number; // seconds
  successRate: number; // percentage
  agentsActive: number;
  agentsIdle: number;
}
