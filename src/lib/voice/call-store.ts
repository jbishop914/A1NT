/* ─── Call Record Store ─────────────────────────────────────────────────────
   Persistence layer for voice call records.
   
   Architecture:
   - Voice server (Railway) writes call records to PostgreSQL via Prisma
   - Vercel dashboard reads from the same PostgreSQL instance
   - Both connect via DATABASE_URL (internal for Railway, public for Vercel)
   
   This module provides a clean abstraction over Prisma for the voice server.
   It handles the mapping between in-memory VoiceSession data and the
   CallRecord database model.
   ──────────────────────────────────────────────────────────────────────── */

import { db } from "../db";
import type {
  CallRecord,
  CallStatus,
  CallIntent,
  CallPriority,
  CallSentiment,
  CallDirection,
} from "@/generated/prisma/client";

/* ─── Types for voice server usage ────────────────────────────────────── */

export interface TranscriptTurn {
  speaker: "ai" | "caller" | "system";
  text: string;
  timestamp: string; // ISO 8601
}

export interface StoredToolCall {
  id: string;
  name: string;
  arguments: string;
  output: string | null;
  timestamp: string;
  durationMs: number | null;
}

/** Input for creating a call record when a call ends */
export interface CallRecordInput {
  organizationId: string;
  callSid: string;
  streamSid: string | null;
  callerNumber: string;
  callerName: string | null;
  callerCity: string | null;
  callerState: string | null;
  direction: "INBOUND" | "OUTBOUND";
  status: "ACTIVE" | "COMPLETED" | "VOICEMAIL" | "MISSED" | "TRANSFERRED" | "FAILED";
  intent: "SERVICE_REQUEST" | "APPOINTMENT" | "BILLING" | "EMERGENCY" | "GENERAL" | "SALES_INQUIRY" | null;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  sentiment: "POSITIVE" | "NEUTRAL" | "FRUSTRATED" | null;
  startedAt: Date;
  endedAt: Date | null;
  duration: number;
  agentId: string;
  agentName: string;
  model: string;
  voice: string;
  transcript: TranscriptTurn[];
  summary: string | null;
  toolCalls: StoredToolCall[];
  actionsTaken: string[];
  workOrderId: string | null;
  clientId: string | null;
  appointmentBooked: boolean;
  isNewCustomer: boolean;
  tokensInput: number;
  tokensOutput: number;
  tokensTotal: number;
}

/* ─── Write Operations (voice server) ─────────────────────────────────── */

/**
 * Create a new call record when a call starts.
 * Returns the record ID for later updates.
 */
export async function createCallRecord(input: CallRecordInput): Promise<string> {
  try {
    const record = await db.callRecord.create({
      data: {
        organizationId: input.organizationId,
        callSid: input.callSid,
        streamSid: input.streamSid,
        callerNumber: input.callerNumber,
        callerName: input.callerName,
        callerCity: input.callerCity,
        callerState: input.callerState,
        direction: input.direction as CallDirection,
        status: input.status as CallStatus,
        intent: input.intent as CallIntent | null,
        priority: input.priority as CallPriority,
        sentiment: input.sentiment as CallSentiment | null,
        startedAt: input.startedAt,
        endedAt: input.endedAt,
        duration: input.duration,
        agentId: input.agentId,
        agentName: input.agentName,
        model: input.model,
        voice: input.voice,
        transcript: input.transcript as unknown as any,
        summary: input.summary,
        toolCalls: input.toolCalls as unknown as any,
        actionsTaken: input.actionsTaken,
        workOrderId: input.workOrderId,
        clientId: input.clientId,
        appointmentBooked: input.appointmentBooked,
        isNewCustomer: input.isNewCustomer,
        tokensInput: input.tokensInput,
        tokensOutput: input.tokensOutput,
        tokensTotal: input.tokensTotal,
      },
    });

    console.log(`[CallStore] Created call record: ${record.id} (callSid=${input.callSid})`);
    return record.id;
  } catch (err) {
    console.error("[CallStore] Failed to create call record:", err);
    throw err;
  }
}

/**
 * Update a call record (e.g., when call ends, to add final transcript/summary).
 */
export async function updateCallRecord(
  callSid: string,
  data: Partial<CallRecordInput>
): Promise<void> {
  try {
    await db.callRecord.update({
      where: { callSid },
      data: {
        ...(data.status && { status: data.status as CallStatus }),
        ...(data.intent && { intent: data.intent as CallIntent }),
        ...(data.priority && { priority: data.priority as CallPriority }),
        ...(data.sentiment && { sentiment: data.sentiment as CallSentiment }),
        ...(data.endedAt && { endedAt: data.endedAt }),
        ...(data.duration !== undefined && { duration: data.duration }),
        ...(data.transcript && { transcript: data.transcript as unknown as any }),
        ...(data.summary && { summary: data.summary }),
        ...(data.toolCalls && { toolCalls: data.toolCalls as unknown as any }),
        ...(data.actionsTaken && { actionsTaken: data.actionsTaken }),
        ...(data.workOrderId && { workOrderId: data.workOrderId }),
        ...(data.clientId && { clientId: data.clientId }),
        ...(data.appointmentBooked !== undefined && { appointmentBooked: data.appointmentBooked }),
        ...(data.isNewCustomer !== undefined && { isNewCustomer: data.isNewCustomer }),
        ...(data.callerName && { callerName: data.callerName }),
        ...(data.tokensInput !== undefined && { tokensInput: data.tokensInput }),
        ...(data.tokensOutput !== undefined && { tokensOutput: data.tokensOutput }),
        ...(data.tokensTotal !== undefined && { tokensTotal: data.tokensTotal }),
      },
    });
    console.log(`[CallStore] Updated call record for callSid=${callSid}`);
  } catch (err) {
    console.error(`[CallStore] Failed to update call record (callSid=${callSid}):`, err);
  }
}

/* ─── Read Operations (dashboard API) ─────────────────────────────────── */

/**
 * Get call records for an organization, newest first.
 */
export async function getCallRecords(
  organizationId: string,
  opts?: {
    status?: CallStatus;
    intent?: CallIntent;
    limit?: number;
    since?: Date;
  }
): Promise<CallRecord[]> {
  return db.callRecord.findMany({
    where: {
      organizationId,
      ...(opts?.status && { status: opts.status }),
      ...(opts?.intent && { intent: opts.intent }),
      ...(opts?.since && { startedAt: { gte: opts.since } }),
    },
    orderBy: { startedAt: "desc" },
    take: opts?.limit ?? 100,
    include: {
      workOrder: true,
      client: true,
    },
  });
}

/**
 * Get a single call record by ID.
 */
export async function getCallRecordById(id: string): Promise<CallRecord | null> {
  return db.callRecord.findUnique({
    where: { id },
    include: {
      workOrder: true,
      client: true,
    },
  });
}

/**
 * Get aggregate phone stats for an organization.
 */
export async function getPhoneStats(organizationId: string) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [todayRecords, totals] = await Promise.all([
    db.callRecord.findMany({
      where: {
        organizationId,
        startedAt: { gte: todayStart },
      },
    }),
    db.callRecord.aggregate({
      where: {
        organizationId,
        startedAt: { gte: todayStart },
      },
      _count: true,
      _avg: { duration: true },
    }),
  ]);

  const total = todayRecords.length;
  const missed = todayRecords.filter((r) => r.status === "MISSED").length;
  const avgDuration = Math.round(totals._avg.duration ?? 0);
  const mins = Math.floor(avgDuration / 60);
  const secs = avgDuration % 60;

  return {
    totalCallsToday: total,
    avgWaitTime: "0:03",
    avgCallDuration: total > 0 ? `${mins}:${secs.toString().padStart(2, "0")}` : "0:00",
    missedCallRate: total > 0 ? Math.round((missed / total) * 100 * 10) / 10 : 0,
    aiHandledRate: 100,
    leadsCapture: todayRecords.filter((r) => r.isNewCustomer).length,
    workOrdersCreated: todayRecords.filter((r) => r.workOrderId).length,
    appointmentsBooked: todayRecords.filter((r) => r.appointmentBooked).length,
  };
}
