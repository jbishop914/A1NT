/* ─── Message Ingest API ───────────────────────────────────────────────────
   POST /api/messages/ingest

   Accepts an incoming message, resolves or creates a MessageThread by
   contactPhone/contactEmail, creates a ThreadMessage, and sets read
   statuses to UNREAD for all employees in the org.

   Body: {
     channel: "PHONE" | "SMS" | "EMAIL",
     direction: "INBOUND" | "OUTBOUND",
     contactName: string,
     contactPhone?: string,
     contactEmail?: string,
     body: string,
     preview?: string,
     subject?: string,
     sourceId?: string,
     sourceType?: string,
     hasVoicemail?: boolean,
     transcription?: string,
     organizationId: string,
   }
   ──────────────────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      channel,
      direction,
      contactName,
      contactPhone,
      contactEmail,
      body: messageBody,
      preview,
      subject,
      sourceId,
      sourceType,
      hasVoicemail,
      transcription,
      organizationId,
    } = body;

    if (!channel || !direction || !contactName || !messageBody || !organizationId) {
      return NextResponse.json(
        { error: "channel, direction, contactName, body, and organizationId are required" },
        { status: 400 }
      );
    }

    // Try to find existing thread by contact phone or email within the org
    let thread = null;
    if (contactPhone) {
      thread = await (db.messageThread as any).findFirst({
        where: { organizationId, contactPhone },
        orderBy: { lastMessageAt: "desc" },
      });
    }
    if (!thread && contactEmail) {
      thread = await (db.messageThread as any).findFirst({
        where: { organizationId, contactEmail },
        orderBy: { lastMessageAt: "desc" },
      });
    }

    const messagePreview = preview || messageBody.substring(0, 120);
    const now = new Date();

    if (thread) {
      // Update existing thread
      thread = await (db.messageThread as any).update({
        where: { id: thread.id },
        data: {
          preview: messagePreview,
          lastMessageAt: now,
          messageCount: { increment: 1 },
          subject: subject || thread.subject,
        },
      });
    } else {
      // Create new thread
      thread = await (db.messageThread as any).create({
        data: {
          organizationId,
          contactName,
          contactPhone: contactPhone || null,
          contactEmail: contactEmail || null,
          channel,
          subject: subject || null,
          preview: messagePreview,
          lastMessageAt: now,
          messageCount: 1,
        },
      });
    }

    // Create the thread message
    const threadMessage = await (db.threadMessage as any).create({
      data: {
        threadId: thread.id,
        channel,
        direction,
        body: messageBody,
        preview: messagePreview,
        subject: subject || null,
        sourceId: sourceId || null,
        sourceType: sourceType || null,
        hasVoicemail: hasVoicemail || false,
        transcription: transcription || null,
      },
    });

    // Set all employees in the org to UNREAD for this thread
    const employees = await (db.employee as any).findMany({
      where: { organizationId, isActive: true },
      select: { id: true },
    });

    if (employees.length > 0) {
      await Promise.all(
        employees.map((emp: { id: string }) =>
          (db.messageReadStatus as any).upsert({
            where: {
              threadId_employeeId: {
                threadId: thread.id,
                employeeId: emp.id,
              },
            },
            update: { status: "UNREAD" },
            create: {
              threadId: thread.id,
              employeeId: emp.id,
              status: "UNREAD",
            },
          })
        )
      );
    }

    return NextResponse.json({
      thread,
      message: threadMessage,
    });
  } catch (error) {
    console.error("[messages/ingest] Error:", error);
    return NextResponse.json(
      { error: "Failed to ingest message" },
      { status: 500 }
    );
  }
}
