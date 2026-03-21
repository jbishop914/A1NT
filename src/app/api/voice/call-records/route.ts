/* ─── Call Records API ─────────────────────────────────────────────────────
   GET /api/voice/call-records
   
   Returns call records from PostgreSQL for the dashboard.
   Supports filtering by status, intent, and date range.
   
   Query params:
     - status: CallStatus enum (ACTIVE, COMPLETED, etc.)
     - intent: CallIntent enum (SERVICE_REQUEST, APPOINTMENT, etc.)
     - limit: max records (default 100)
     - since: ISO date string for filtering by start date
   ──────────────────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { CallStatus, CallIntent } from "@/generated/prisma/client";

/** Map DB enum values to UI display strings */
const STATUS_DISPLAY: Record<string, string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  VOICEMAIL: "Voicemail",
  MISSED: "Missed",
  TRANSFERRED: "Transferred",
  FAILED: "Failed",
};

const INTENT_DISPLAY: Record<string, string> = {
  SERVICE_REQUEST: "Service Request",
  APPOINTMENT: "Appointment",
  BILLING: "Billing",
  EMERGENCY: "Emergency",
  GENERAL: "General",
  SALES_INQUIRY: "Sales Inquiry",
};

const PRIORITY_DISPLAY: Record<string, string> = {
  LOW: "Low",
  NORMAL: "Normal",
  HIGH: "High",
  URGENT: "Urgent",
};

const SENTIMENT_DISPLAY: Record<string, string> = {
  POSITIVE: "Positive",
  NEUTRAL: "Neutral",
  FRUSTRATED: "Frustrated",
};

const DIRECTION_DISPLAY: Record<string, string> = {
  INBOUND: "Inbound",
  OUTBOUND: "Outbound",
};

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") as CallStatus | null;
    const intent = searchParams.get("intent") as CallIntent | null;
    const limit = parseInt(searchParams.get("limit") ?? "100", 10);
    const since = searchParams.get("since");

    // For now, get all orgs' records. In production, resolve org from auth session.
    const orgId = process.env.A1NT_ORG_ID;

    // Auto-clean stale ACTIVE records (calls that ended without a status callback).
    // Any call marked ACTIVE for over 30 minutes is almost certainly done.
    const staleThreshold = new Date(Date.now() - 30 * 60 * 1000);
    await db.callRecord.updateMany({
      where: {
        status: "ACTIVE",
        startedAt: { lt: staleThreshold },
        ...(orgId ? { organizationId: orgId } : {}),
      },
      data: {
        status: "COMPLETED",
        endedAt: new Date(),
      },
    });

    const where: Record<string, unknown> = {};
    if (orgId) where.organizationId = orgId;
    if (status) where.status = status;
    if (intent) where.intent = intent;
    if (since) where.startedAt = { gte: new Date(since) };

    const records = await db.callRecord.findMany({
      where,
      orderBy: { startedAt: "desc" },
      take: limit,
      include: {
        workOrder: { select: { id: true, orderNumber: true, title: true } },
        client: { select: { id: true, name: true, phone: true } },
      },
    });

    // Transform DB records to match the UI's expected shape
    const callRecords = records.map((r) => ({
      id: r.id,
      callerName: r.callerName ?? "Unknown Caller",
      callerPhone: r.callerNumber,
      direction: DIRECTION_DISPLAY[r.direction] ?? "Inbound",
      status: STATUS_DISPLAY[r.status] ?? "Completed",
      intent: INTENT_DISPLAY[r.intent ?? "GENERAL"] ?? "General",
      priority: PRIORITY_DISPLAY[r.priority] ?? "Normal",
      duration: formatDuration(r.duration),
      startTime: formatTime(r.startedAt),
      date: formatDate(r.startedAt),
      summary: r.summary ?? "No summary available.",
      transcript: Array.isArray(r.transcript)
        ? (r.transcript as Array<{ speaker: string; text: string }>)
            .map((t) => {
              const label =
                t.speaker === "ai" ? "AI" : t.speaker === "caller" ? "Caller" : "";
              return label ? `${label}: ${t.text}` : t.text;
            })
            .join("\n")
        : "",
      actionsTaken: r.actionsTaken ?? [],
      assignedTo: null, // Phase 2: resolve from work order assignee
      workOrderCreated: r.workOrder?.orderNumber ?? null,
      appointmentBooked: r.appointmentBooked,
      isNewLead: r.isNewCustomer,
      sentiment: r.sentiment ? (SENTIMENT_DISPLAY[r.sentiment] ?? "Neutral") : "Neutral",
      // Extra fields for detail view
      agentName: r.agentName,
      model: r.model,
      tokens: r.tokensTotal,
      callSid: r.callSid,
      toolCalls: r.toolCalls ?? [],
    }));

    return NextResponse.json({
      callRecords,
      total: callRecords.length,
    });
  } catch (err) {
    console.error("[API] call-records GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch call records", callRecords: [], total: 0 },
      { status: 500 }
    );
  }
}
