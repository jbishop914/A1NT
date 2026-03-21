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
import { ingestMessage } from "@/lib/messages/ingest";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { threadId, messageId } = await ingestMessage(body);

    return NextResponse.json({ thread: { id: threadId }, message: { id: messageId } });
  } catch (error: any) {
    console.error("[messages/ingest] Error:", error);
    const status = error.message?.includes("required") ? 400 : 500;
    return NextResponse.json(
      { error: error.message || "Failed to ingest message" },
      { status }
    );
  }
}
