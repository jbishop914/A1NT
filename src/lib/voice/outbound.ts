/* ─── Outbound Call Manager ─────────────────────────────────────────────────
   Initiates outbound voice calls via Twilio REST API.
   
   Flow:
   1. API receives request (target number, campaign type, context)
   2. Creates a CallRecord in DB (direction=OUTBOUND, status=ACTIVE)
   3. Calls twilio.calls.create() with TwiML that connects a <Stream>
      back to our Railway WebSocket voice server
   4. When recipient answers, the Stream connects and session-manager.ts
      takes over — same as inbound, but with campaign-specific prompt
   
   The campaign type and context are passed as URL params on the Stream URL
   so session-manager.ts can load the right prompt.
   ──────────────────────────────────────────────────────────────────────── */

import { db } from "../db";
import type { CampaignType, CampaignContext } from "./campaign-prompts";

/* ─── Types ───────────────────────────────────────────────────────────── */

export interface OutboundCallRequest {
  /** Phone number to call (E.164 format) */
  targetNumber: string;
  /** Campaign type */
  campaignType: CampaignType;
  /** Recipient name for the prompt */
  recipientName: string;
  /** Campaign-specific context data */
  contextData: Record<string, unknown>;
  /** Organization ID (resolved from auth/env) */
  organizationId: string;
  /** Optional: linked work order ID */
  workOrderId?: string;
  /** Optional: linked client ID */
  clientId?: string;
  /** Optional: linked invoice ID */
  invoiceId?: string;
}

export interface OutboundCallResult {
  success: boolean;
  callSid?: string;
  recordId?: string;
  error?: string;
}

/* ─── Campaign Type → CallIntent Mapping ──────────────────────────────── */

const CAMPAIGN_INTENT_MAP: Record<CampaignType, string> = {
  "appointment-confirm": "APPOINTMENT",
  "appointment-reschedule": "APPOINTMENT",
  "pre-service-info": "SERVICE_REQUEST",
  "post-service-followup": "GENERAL",
  "invoice-followup": "BILLING",
  "seasonal-promo": "SALES_INQUIRY",
  "sales-prospecting": "SALES_INQUIRY",
  "custom": "GENERAL",
};

/* ─── Outbound Call Initiation ─────────────────────────────────────────── */

/**
 * Initiate an outbound call via Twilio.
 * 
 * This creates a CallRecord first, then triggers the Twilio call.
 * The Stream URL includes campaign context so the voice server
 * knows which prompt to load when the recipient answers.
 */
export async function initiateOutboundCall(
  request: OutboundCallRequest
): Promise<OutboundCallResult> {
  const {
    targetNumber,
    campaignType,
    recipientName,
    contextData,
    organizationId,
    workOrderId,
    clientId,
  } = request;

  // ─── Validate environment ─────────────────────────────────────
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER ?? "+16463321206";
  const voiceServerDomain = process.env.VOICE_SERVER_DOMAIN ?? "a1nt-production.up.railway.app";

  if (!accountSid || !authToken) {
    return { success: false, error: "Twilio credentials not configured" };
  }

  try {
    // ─── 1. Create CallRecord in DB ────────────────────────────────
    const record = await db.callRecord.create({
      data: {
        organizationId,
        callSid: `pending-${Date.now()}`, // Temp SID, updated after Twilio call
        callerNumber: fromNumber,
        callerName: "Alex (AI Agent)",
        direction: "OUTBOUND",
        status: "ACTIVE",
        intent: CAMPAIGN_INTENT_MAP[campaignType] as any,
        priority: "NORMAL",
        startedAt: new Date(),
        agentId: "agent-alex",
        agentName: "Alex",
        model: "gpt-realtime-mini",
        voice: "alloy",
        actionsTaken: [`Outbound ${campaignType} call to ${recipientName}`],
        workOrderId: workOrderId ?? null,
        clientId: clientId ?? null,
      },
    });

    // ─── 2. Build campaign context for Stream URL ──────────────────
    const campaignContext: CampaignContext = {
      type: campaignType,
      recipientName,
      recipientPhone: targetNumber,
      data: contextData,
    };

    const contextB64 = Buffer.from(JSON.stringify(campaignContext)).toString("base64url");

    // ─── 3. Build TwiML ────────────────────────────────────────────
    // When recipient answers, Twilio connects a Media Stream to our
    // voice server. The campaign context is passed as a URL parameter.
    const streamUrl = `wss://${voiceServerDomain}/api/voice/media-stream?direction=outbound&campaign=${campaignType}&context=${contextB64}&recordId=${record.id}`;

    const twiml = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      "<Response>",
      `  <Connect>`,
      `    <Stream url="${streamUrl}" />`,
      `  </Connect>`,
      "</Response>",
    ].join("\n");

    // ─── 4. Initiate Twilio call ───────────────────────────────────
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`;

    const formData = new URLSearchParams({
      From: fromNumber,
      To: targetNumber,
      Twiml: twiml,
      StatusCallback: `https://a1ntegrel.vercel.app/api/voice/status`,
      StatusCallbackMethod: "POST",
      StatusCallbackEvent: "initiated ringing answered completed",
    });

    const response = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[Outbound] Twilio API error:", response.status, errorBody);
      
      // Clean up the DB record
      await db.callRecord.update({
        where: { id: record.id },
        data: { status: "FAILED", endedAt: new Date() },
      });

      return { success: false, error: `Twilio error: ${response.status}` };
    }

    const twilioResponse = await response.json() as { sid: string };
    const callSid = twilioResponse.sid;

    // ─── 5. Update CallRecord with real Twilio SID ─────────────────
    await db.callRecord.update({
      where: { id: record.id },
      data: { callSid },
    });

    console.log(
      `[Outbound] Call initiated: ${callSid} → ${targetNumber} (campaign=${campaignType}, record=${record.id})`
    );

    return {
      success: true,
      callSid,
      recordId: record.id,
    };
  } catch (err) {
    console.error("[Outbound] Failed to initiate call:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

/**
 * Get the outbound call queue — scheduled outbound calls for today.
 */
export async function getOutboundQueue(organizationId: string) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  return db.callRecord.findMany({
    where: {
      organizationId,
      direction: "OUTBOUND",
      startedAt: { gte: todayStart },
    },
    orderBy: { startedAt: "desc" },
    include: {
      workOrder: { select: { id: true, orderNumber: true, title: true } },
      client: { select: { id: true, name: true, phone: true } },
    },
  });
}

/**
 * Get outbound call stats for the dashboard.
 */
export async function getOutboundStats(organizationId: string) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const records = await db.callRecord.findMany({
    where: {
      organizationId,
      direction: "OUTBOUND",
      startedAt: { gte: todayStart },
    },
  });

  const total = records.length;
  const completed = records.filter((r) => r.status === "COMPLETED").length;
  const failed = records.filter((r) => r.status === "FAILED").length;
  const active = records.filter((r) => r.status === "ACTIVE").length;

  return {
    totalOutboundToday: total,
    completedCalls: completed,
    failedCalls: failed,
    activeCalls: active,
    connectRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}
