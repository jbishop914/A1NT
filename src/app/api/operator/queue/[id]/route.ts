/* ─── Operator Queue Item API ──────────────────────────────────────────────
   PATCH  /api/operator/queue/[id] — Update queue item (status, agent, etc.)
   DELETE /api/operator/queue/[id] — Cancel/remove queue item
   ──────────────────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/* ─── PATCH: Update a queue item ────────────────────────────────────── */

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Record<string, unknown> = {};

    if (body.status) {
      const statusMap: Record<string, string> = {
        queued: "QUEUED",
        scheduled: "SCHEDULED",
        "in-progress": "IN_PROGRESS",
        completed: "COMPLETED",
        failed: "FAILED",
        cancelled: "CANCELLED",
      };
      updateData.status = statusMap[body.status] ?? body.status;
    }

    if (body.assignedAgentId !== undefined) {
      updateData.assignedAgentId = body.assignedAgentId;
      updateData.assignedAgentName = body.assignedAgentName ?? null;
    }

    if (body.priority) {
      const priorityMap: Record<string, string> = {
        normal: "NORMAL",
        high: "HIGH",
        urgent: "URGENT",
      };
      updateData.priority = priorityMap[body.priority] ?? body.priority;
    }

    if (body.scheduledTime !== undefined) {
      updateData.scheduledTime = body.scheduledTime ? new Date(body.scheduledTime) : null;
    }

    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    const updated = await db.outboundQueueItem.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, item: updated });
  } catch (err) {
    console.error("[API] operator/queue/[id] PATCH error:", err);
    return NextResponse.json(
      { error: "Failed to update queue item" },
      { status: 500 }
    );
  }
}

/* ─── DELETE: Remove/cancel a queue item ────────────────────────────── */

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await db.outboundQueueItem.update({
      where: { id },
      data: { status: "CANCELLED" as any },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[API] operator/queue/[id] DELETE error:", err);
    return NextResponse.json(
      { error: "Failed to cancel queue item" },
      { status: 500 }
    );
  }
}
