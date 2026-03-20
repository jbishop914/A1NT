/* ─── Active Voice Sessions API ────────────────────────────────────────────
   GET /api/voice/sessions
   
   Returns currently active voice sessions.
   
   Note: In Vercel serverless, we can't share in-memory state with the
   Railway voice server. Active sessions are tracked by querying for
   CallRecords with status=ACTIVE. The voice server updates status
   to COMPLETED when the call ends.
   
   Phase 2: Add Redis pub/sub for real-time session state sync.
   ──────────────────────────────────────────────────────────────────────── */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const orgId = process.env.A1NT_ORG_ID;

    const where: Record<string, unknown> = {
      status: "ACTIVE",
    };
    if (orgId) where.organizationId = orgId;

    const activeRecords = await db.callRecord.findMany({
      where,
      orderBy: { startedAt: "desc" },
    });

    const sessions = activeRecords.map((r) => ({
      id: r.id,
      agentId: r.agentId,
      agentName: r.agentName,
      callSid: r.callSid,
      status: "active" as const,
      startedAt: r.startedAt.toISOString(),
      callerNumber: r.callerNumber,
      callerName: r.callerName ?? "Unknown",
      model: r.model,
      duration: Math.round((Date.now() - r.startedAt.getTime()) / 1000),
      toolCalls: Array.isArray(r.toolCalls) ? (r.toolCalls as unknown[]).length : 0,
      tokensUsed: r.tokensTotal,
    }));

    return NextResponse.json({
      sessions,
      totalActive: sessions.length,
      serverStatus: "running",
    });
  } catch (err) {
    console.error("[API] sessions GET error:", err);
    return NextResponse.json({
      sessions: [],
      totalActive: 0,
      serverStatus: "unknown",
    });
  }
}
