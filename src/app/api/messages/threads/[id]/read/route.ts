/* ─── Read Status API ──────────────────────────────────────────────────────
   PATCH /api/messages/threads/[id]/read

   Updates the read status for a specific employee on a thread.
   Body: { employeeId: string, status: "UNREAD" | "READ" | "RESOLVED" }
   ──────────────────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: threadId } = await params;
    const body = await req.json();
    const { employeeId, status } = body;

    if (!employeeId || !status) {
      return NextResponse.json(
        { error: "employeeId and status are required" },
        { status: 400 }
      );
    }

    if (!["UNREAD", "READ", "RESOLVED"].includes(status)) {
      return NextResponse.json(
        { error: "status must be UNREAD, READ, or RESOLVED" },
        { status: 400 }
      );
    }

    const readStatus = await (db.messageReadStatus as any).upsert({
      where: {
        threadId_employeeId: { threadId, employeeId },
      },
      update: { status },
      create: { threadId, employeeId, status },
    });

    return NextResponse.json({ readStatus });
  } catch (error) {
    console.error("[messages/threads/[id]/read] Error:", error);
    return NextResponse.json(
      { error: "Failed to update read status" },
      { status: 500 }
    );
  }
}
