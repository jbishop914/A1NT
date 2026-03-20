/* ─── Outbound Call API ────────────────────────────────────────────────────
   POST /api/voice/outbound
   
   Initiates an outbound AI voice call via Twilio.
   
   Body:
     - targetNumber: string (E.164 format, e.g., "+12035551234")
     - campaignType: CampaignType
     - recipientName: string
     - contextData: object (campaign-specific data)
     - workOrderId?: string
     - clientId?: string
   
   GET /api/voice/outbound
   
   Returns outbound call queue and stats for the dashboard.
   ──────────────────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import {
  initiateOutboundCall,
  getOutboundQueue,
  getOutboundStats,
} from "@/lib/voice/outbound";
import type { CampaignType } from "@/lib/voice/campaign-prompts";

const VALID_CAMPAIGNS: CampaignType[] = [
  "appointment-confirm",
  "appointment-reschedule",
  "pre-service-info",
  "post-service-followup",
  "invoice-followup",
  "seasonal-promo",
];

/* ─── POST: Initiate outbound call ──────────────────────────────────── */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      targetNumber,
      campaignType,
      recipientName,
      contextData = {},
      workOrderId,
      clientId,
    } = body;

    // Validation
    if (!targetNumber || typeof targetNumber !== "string") {
      return NextResponse.json(
        { error: "targetNumber is required (E.164 format)" },
        { status: 400 }
      );
    }

    if (!campaignType || !VALID_CAMPAIGNS.includes(campaignType)) {
      return NextResponse.json(
        { error: `Invalid campaignType. Must be one of: ${VALID_CAMPAIGNS.join(", ")}` },
        { status: 400 }
      );
    }

    if (!recipientName || typeof recipientName !== "string") {
      return NextResponse.json(
        { error: "recipientName is required" },
        { status: 400 }
      );
    }

    const orgId = process.env.A1NT_ORG_ID;
    if (!orgId) {
      return NextResponse.json(
        { error: "Organization not configured" },
        { status: 500 }
      );
    }

    const result = await initiateOutboundCall({
      targetNumber,
      campaignType,
      recipientName,
      contextData,
      organizationId: orgId,
      workOrderId,
      clientId,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      callSid: result.callSid,
      recordId: result.recordId,
      message: `Outbound ${campaignType} call initiated to ${targetNumber}`,
    });
  } catch (err) {
    console.error("[API] outbound POST error:", err);
    return NextResponse.json(
      { error: "Failed to initiate outbound call" },
      { status: 500 }
    );
  }
}

/* ─── GET: Outbound queue + stats ───────────────────────────────────── */

export async function GET() {
  try {
    const orgId = process.env.A1NT_ORG_ID;

    if (!orgId) {
      return NextResponse.json({
        queue: [],
        stats: {
          totalOutboundToday: 0,
          completedCalls: 0,
          failedCalls: 0,
          activeCalls: 0,
          connectRate: 0,
        },
      });
    }

    const [queue, stats] = await Promise.all([
      getOutboundQueue(orgId),
      getOutboundStats(orgId),
    ]);

    // Transform queue records for the UI
    const formattedQueue = queue.map((r) => ({
      id: r.id,
      callSid: r.callSid,
      recipientName: r.callerName ?? "Unknown",
      recipientPhone: r.callerNumber,
      campaignType: r.intent ?? "GENERAL",
      status: r.status,
      startedAt: r.startedAt.toISOString(),
      duration: r.duration,
      summary: r.summary,
      workOrder: r.workOrder,
      client: r.client,
    }));

    return NextResponse.json({
      queue: formattedQueue,
      stats,
    });
  } catch (err) {
    console.error("[API] outbound GET error:", err);
    return NextResponse.json(
      {
        queue: [],
        stats: {
          totalOutboundToday: 0,
          completedCalls: 0,
          failedCalls: 0,
          activeCalls: 0,
          connectRate: 0,
        },
      },
      { status: 500 }
    );
  }
}
