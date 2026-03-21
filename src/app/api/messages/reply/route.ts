/* ─── Reply from Inbox API ─────────────────────────────────────────────────
   POST /api/messages/reply

   Sends a reply from the Messages inbox. Loads the thread to get contact
   info, sends via SMS or email, and the send functions auto-ingest the
   outbound message into the thread.

   Body: {
     threadId: string,
     channel: "SMS" | "EMAIL",
     body: string,
     subject?: string,
     organizationId: string,
     employeeId?: string,
   }
   ──────────────────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  sendSms,
  getPlatformSmsNumber,
  normalizePhoneNumber,
  calculateSegments,
} from "@/lib/twilio-sms";
import { sendEmail, getPlatformFromAddress, formatFromAddress } from "@/lib/resend";
import { ingestMessage } from "@/lib/messages/ingest";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { threadId, channel, body: messageBody, subject, organizationId, employeeId } = body;

    if (!threadId || !channel || !messageBody || !organizationId) {
      return NextResponse.json(
        { error: "threadId, channel, body, and organizationId are required" },
        { status: 400 }
      );
    }

    // Load thread to get contact info
    const thread = await (db.messageThread as any).findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    let result: { id: string; sid?: string };

    if (channel === "SMS") {
      if (!thread.contactPhone) {
        return NextResponse.json(
          { error: "Thread has no phone number for SMS reply" },
          { status: 400 }
        );
      }

      const normalizedTo = normalizePhoneNumber(thread.contactPhone);
      if (!normalizedTo) {
        return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
      }

      const fromNumber = getPlatformSmsNumber();
      const segments = calculateSegments(messageBody);

      // Create SmsLog
      const smsLog = await db.smsLog.create({
        data: {
          organizationId,
          status: "QUEUED",
          direction: "OUTBOUND",
          fromNumber,
          toNumber: normalizedTo,
          body: messageBody,
          segmentCount: segments,
        },
      });

      // Send via Twilio
      const smsResult = await sendSms({
        to: normalizedTo,
        body: messageBody,
        from: fromNumber,
      });

      await db.smsLog.update({
        where: { id: smsLog.id },
        data: {
          twilioMessageSid: smsResult.messageSid,
          status: "SENT",
          sentAt: new Date(),
          segmentCount: smsResult.segmentCount,
        },
      });

      // Ingest into thread
      await ingestMessage({
        channel: "SMS",
        direction: "OUTBOUND",
        contactName: thread.contactName,
        contactPhone: normalizedTo,
        body: messageBody,
        preview: messageBody.substring(0, 120),
        sourceId: smsLog.id,
        sourceType: "SmsLog",
        organizationId,
      });

      result = { id: smsLog.id, sid: smsResult.messageSid };
    } else if (channel === "EMAIL") {
      if (!thread.contactEmail) {
        return NextResponse.json(
          { error: "Thread has no email address for email reply" },
          { status: 400 }
        );
      }

      // Resolve sender
      let fromAddress = getPlatformFromAddress();
      const verifiedDomain = await db.emailDomain.findFirst({
        where: { organizationId, status: "VERIFIED" },
        orderBy: { createdAt: "asc" },
      });
      if (verifiedDomain?.defaultFromName && verifiedDomain?.defaultFromEmail) {
        fromAddress = formatFromAddress(
          verifiedDomain.defaultFromName,
          verifiedDomain.defaultFromEmail
        );
      }

      const emailSubject = subject || thread.subject || "Re: Message";

      // Create EmailLog
      const emailLog = await db.emailLog.create({
        data: {
          organizationId,
          type: "TRANSACTIONAL",
          status: "QUEUED",
          fromAddress,
          toAddresses: [thread.contactEmail],
          subject: emailSubject,
          replyTo: verifiedDomain?.defaultReplyTo || undefined,
        },
      });

      // Send via Resend
      const emailResult = await sendEmail({
        from: fromAddress,
        to: thread.contactEmail,
        subject: emailSubject,
        text: messageBody,
        replyTo: verifiedDomain?.defaultReplyTo || undefined,
      });

      await db.emailLog.update({
        where: { id: emailLog.id },
        data: {
          resendEmailId: emailResult.resendEmailId,
          status: "SENT",
          sentAt: new Date(),
        },
      });

      // Ingest into thread
      await ingestMessage({
        channel: "EMAIL",
        direction: "OUTBOUND",
        contactName: thread.contactName,
        contactEmail: thread.contactEmail,
        body: messageBody,
        subject: emailSubject,
        preview: messageBody.substring(0, 120),
        sourceId: emailLog.id,
        sourceType: "EmailLog",
        organizationId,
      });

      result = { id: emailLog.id, sid: emailResult.resendEmailId };
    } else {
      return NextResponse.json(
        { error: "channel must be SMS or EMAIL" },
        { status: 400 }
      );
    }

    // Mark thread as RESOLVED for the sending employee
    if (employeeId) {
      await (db.messageReadStatus as any)
        .upsert({
          where: {
            threadId_employeeId: { threadId, employeeId },
          },
          update: { status: "RESOLVED" },
          create: { threadId, employeeId, status: "RESOLVED" },
        })
        .catch(() => {});
    }

    return NextResponse.json({ success: true, ...result });
  } catch (error: any) {
    console.error("[Messages Reply] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send reply" },
      { status: 500 }
    );
  }
}
