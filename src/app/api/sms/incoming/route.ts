/* ─── Inbound SMS Webhook ──────────────────────────────────────────────────
   POST /api/sms/incoming — Twilio sends incoming SMS here

   Configure in Twilio console under the phone number's Messaging webhook URL:
   https://your-domain.com/api/sms/incoming

   Parses Twilio incoming SMS form data, validates signature, creates an
   SmsLog entry with direction INBOUND, ingests into Unified Messages,
   and returns an empty TwiML response.
   ──────────────────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ingestMessage } from "@/lib/messages/ingest";
import twilio from "twilio";

const ORG_ID = process.env.A1NT_ORG_ID ?? "demo-org";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const from = formData.get("From")?.toString() ?? "";
    const to = formData.get("To")?.toString() ?? "";
    const body = formData.get("Body")?.toString() ?? "";
    const messageSid = formData.get("MessageSid")?.toString() ?? "";
    const fromCity = formData.get("FromCity")?.toString() ?? "";
    const fromState = formData.get("FromState")?.toString() ?? "";

    if (!from || !body) {
      return twimlResponse();
    }

    // Validate Twilio signature
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (authToken) {
      const twilioSignature = request.headers.get("x-twilio-signature") || "";
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://a1ntegrel.vercel.app";
      const webhookUrl = `${appUrl}/api/sms/incoming`;

      const params: Record<string, string> = {};
      formData.forEach((value, key) => {
        params[key] = value.toString();
      });

      const isValid = twilio.validateRequest(
        authToken,
        twilioSignature,
        webhookUrl,
        params
      );
      if (!isValid) {
        console.warn("[SMS Incoming] Invalid Twilio signature");
        return twimlResponse();
      }
    }

    // Create SmsLog entry for the inbound message
    const smsLog = await db.smsLog.create({
      data: {
        organizationId: ORG_ID,
        twilioMessageSid: messageSid || undefined,
        status: "DELIVERED",
        direction: "INBOUND",
        fromNumber: from,
        toNumber: to,
        body,
        segmentCount: 1,
        deliveredAt: new Date(),
      },
    });

    // Resolve contact name from CRM Client by phone number
    let contactName = from;
    try {
      const client = await db.client.findFirst({
        where: {
          organizationId: ORG_ID,
          phone: { contains: from.replace("+1", "").replace("+", "") },
        },
        select: { name: true },
      });
      if (client) {
        contactName = client.name;
      }
    } catch {
      // Fall back to phone number
    }

    // Ingest into Unified Messages
    await ingestMessage({
      channel: "SMS",
      direction: "INBOUND",
      contactName,
      contactPhone: from,
      body,
      preview: body.substring(0, 120),
      sourceId: smsLog.id,
      sourceType: "SmsLog",
      organizationId: ORG_ID,
    });

    console.log(
      `[SMS Incoming] ${from}${fromCity ? ` (${fromCity}, ${fromState})` : ""}: "${body.substring(0, 80)}"`
    );

    return twimlResponse();
  } catch (error) {
    console.error("[SMS Incoming] Error:", error);
    return twimlResponse();
  }
}

/** Return empty TwiML — Twilio expects XML back */
function twimlResponse() {
  return new NextResponse(
    '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
    {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    }
  );
}
