/* ─── Operator Queue API ───────────────────────────────────────────────────
   GET  /api/operator/queue — Queue items + stats + active calls
   POST /api/operator/queue — Add item to queue or dial immediately
   ──────────────────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { initiateOutboundCall } from "@/lib/voice/outbound";
import type { CampaignType } from "@/lib/voice/campaign-prompts";

const ORG_ID = () => process.env.A1NT_ORG_ID ?? "demo-org";

/* ── Enum mappers (DB ENUM_CASE → UI kebab-case) ──────────────────── */

const campaignToDb: Record<string, string> = {
  "appointment-confirm": "APPOINTMENT_CONFIRM",
  "appointment-reschedule": "APPOINTMENT_RESCHEDULE",
  "pre-service-info": "PRE_SERVICE_INFO",
  "post-service-followup": "POST_SERVICE_FOLLOWUP",
  "invoice-followup": "INVOICE_FOLLOWUP",
  "seasonal-promo": "SEASONAL_PROMO",
  "sales-prospecting": "SALES_PROSPECTING",
  "custom": "CUSTOM",
};

const campaignFromDb: Record<string, string> = Object.fromEntries(
  Object.entries(campaignToDb).map(([k, v]) => [v, k])
);

const statusFromDb: Record<string, string> = {
  QUEUED: "queued",
  SCHEDULED: "scheduled",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
  FAILED: "failed",
  CANCELLED: "cancelled",
};

const priorityFromDb: Record<string, string> = {
  NORMAL: "normal",
  HIGH: "high",
  URGENT: "urgent",
};

const priorityToDb: Record<string, string> = {
  normal: "NORMAL",
  high: "HIGH",
  urgent: "URGENT",
};

const outcomeFromDb: Record<string, string> = {
  ANSWERED: "answered",
  VOICEMAIL: "voicemail",
  NO_ANSWER: "no-answer",
  BUSY: "busy",
  DECLINED: "declined",
  WRONG_NUMBER: "wrong-number",
};

/* ─── GET: Queue items + stats ──────────────────────────────────────── */

export async function GET() {
  try {
    const orgId = ORG_ID();

    // Fetch all non-cancelled queue items
    const items = await db.outboundQueueItem.findMany({
      where: { organizationId: orgId },
      orderBy: [{ priority: "desc" }, { queuedAt: "asc" }],
    });

    // Transform for UI
    const queue = items.map((item) => ({
      id: item.id,
      contactName: item.contactName,
      contactPhone: item.contactPhone,
      campaignType: campaignFromDb[item.campaignType] ?? "custom",
      assignedAgentId: item.assignedAgentId,
      assignedAgentName: item.assignedAgentName,
      status: statusFromDb[item.status] ?? "queued",
      priority: priorityFromDb[item.priority] ?? "normal",
      scheduledTime: item.scheduledTime?.toISOString() ?? null,
      queuedAt: item.queuedAt.toISOString(),
      startedAt: item.startedAt?.toISOString() ?? null,
      completedAt: item.completedAt?.toISOString() ?? null,
      duration: item.duration,
      outcome: item.outcome ? outcomeFromDb[item.outcome] ?? null : null,
      notes: item.notes,
      retryCount: item.retryCount,
      maxRetries: item.maxRetries,
      callRecordId: item.callRecordId,
    }));

    // Compute stats
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayItems = items.filter((i) => i.queuedAt >= todayStart);
    const queued = todayItems.filter((i) => i.status === "QUEUED" || i.status === "SCHEDULED").length;
    const inProgress = todayItems.filter((i) => i.status === "IN_PROGRESS").length;
    const completed = todayItems.filter((i) => i.status === "COMPLETED").length;
    const failed = todayItems.filter((i) => i.status === "FAILED").length;

    const stats = {
      totalQueued: queued,
      inProgress,
      completedToday: completed,
      failedToday: failed,
      avgWaitTime: 0,
      avgCallDuration: 0,
      successRate: completed + failed > 0 ? Math.round((completed / (completed + failed)) * 100) : 0,
      agentsActive: inProgress,
      agentsIdle: 0,
    };

    // Get active outbound CallRecords for live monitor
    const liveCalls = await db.callRecord.findMany({
      where: {
        organizationId: orgId,
        direction: "OUTBOUND",
        status: "ACTIVE",
      },
    });

    const live = liveCalls.map((c) => ({
      id: c.id,
      callSid: c.callSid,
      contactName: c.callerName ?? "Unknown",
      contactPhone: c.callerNumber,
      agentName: c.agentName,
      campaignType: "custom",
      direction: "outbound" as const,
      startedAt: c.startedAt.toISOString(),
      duration: c.duration,
      liveTranscript: [],
      canTransfer: false,
      canTakeOver: false,
    }));

    return NextResponse.json({ queue, stats, live });
  } catch (err) {
    console.error("[API] operator/queue GET error:", err);
    return NextResponse.json(
      {
        queue: [],
        stats: { totalQueued: 0, inProgress: 0, completedToday: 0, failedToday: 0, avgWaitTime: 0, avgCallDuration: 0, successRate: 0, agentsActive: 0, agentsIdle: 0 },
        live: [],
      },
      { status: 500 }
    );
  }
}

/* ─── POST: Add to queue or dial now ────────────────────────────────── */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      contactName,
      contactPhone,
      campaignType,
      assignedAgentId,
      assignedAgentName,
      priority = "normal",
      notes = "",
      scheduledTime,
      dialNow = false,
    } = body;

    // Validation
    if (!contactName || !contactPhone) {
      return NextResponse.json(
        { error: "contactName and contactPhone are required" },
        { status: 400 }
      );
    }

    if (!campaignType || !campaignToDb[campaignType]) {
      return NextResponse.json(
        { error: `Invalid campaignType: ${campaignType}` },
        { status: 400 }
      );
    }

    const orgId = ORG_ID();

    // Create queue item
    const item = await db.outboundQueueItem.create({
      data: {
        organizationId: orgId,
        contactName,
        contactPhone,
        campaignType: campaignToDb[campaignType] as any,
        assignedAgentId: assignedAgentId || null,
        assignedAgentName: assignedAgentName || null,
        priority: (priorityToDb[priority] ?? "NORMAL") as any,
        notes,
        scheduledTime: scheduledTime ? new Date(scheduledTime) : null,
        status: dialNow ? ("IN_PROGRESS" as any) : scheduledTime ? ("SCHEDULED" as any) : ("QUEUED" as any),
      },
    });

    // If dial now, initiate the call immediately
    if (dialNow) {
      // Map campaign type for the voice system
      const voiceCampaigns: CampaignType[] = [
        "appointment-confirm",
        "appointment-reschedule",
        "pre-service-info",
        "post-service-followup",
        "invoice-followup",
        "seasonal-promo",
      ];

      const voiceCampaign = voiceCampaigns.includes(campaignType as CampaignType)
        ? (campaignType as CampaignType)
        : ("post-service-followup" as CampaignType); // fallback

      const result = await initiateOutboundCall({
        targetNumber: contactPhone,
        campaignType: voiceCampaign,
        recipientName: contactName,
        contextData: { notes, queueItemId: item.id },
        organizationId: orgId,
      });

      if (result.success) {
        await db.outboundQueueItem.update({
          where: { id: item.id },
          data: {
            status: "IN_PROGRESS" as any,
            startedAt: new Date(),
            callRecordId: result.recordId ?? null,
          },
        });

        return NextResponse.json({
          success: true,
          item: { ...item, status: "IN_PROGRESS" },
          callSid: result.callSid,
          message: `Call initiated to ${contactPhone}`,
        });
      } else {
        await db.outboundQueueItem.update({
          where: { id: item.id },
          data: { status: "FAILED" as any },
        });

        return NextResponse.json({
          success: false,
          item: { ...item, status: "FAILED" },
          error: result.error,
        });
      }
    }

    return NextResponse.json({
      success: true,
      item: {
        id: item.id,
        contactName: item.contactName,
        contactPhone: item.contactPhone,
        campaignType,
        status: statusFromDb[item.status] ?? "queued",
        priority,
      },
      message: scheduledTime
        ? `Call scheduled for ${new Date(scheduledTime).toLocaleString()}`
        : `Added to queue: ${contactName} (${contactPhone})`,
    });
  } catch (err) {
    console.error("[API] operator/queue POST error:", err);
    return NextResponse.json(
      { error: "Failed to add to queue" },
      { status: 500 }
    );
  }
}
