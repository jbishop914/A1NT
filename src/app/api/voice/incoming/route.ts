/* ─── Twilio Voice Webhook — Incoming Call Handler ─────────────────────────
   
   When a call comes in to the Twilio phone number, Twilio makes an HTTP
   request to this endpoint. We respond with TwiML that:
   1. Plays a brief greeting while the AI connects
   2. Opens a bidirectional Media Stream WebSocket to our voice server
   3. Passes caller info as custom parameters
   
   The Media Stream then connects to the WebSocket server (voice-server.ts)
   which proxies audio between Twilio and OpenAI Realtime.
   
   Twilio phone number webhook URL: https://your-domain.com/api/voice/incoming
   ──────────────────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";

/**
 * Handle incoming voice calls from Twilio.
 * Supports both GET and POST (Twilio may use either depending on config).
 */
export async function POST(request: NextRequest) {
  return handleIncomingCall(request);
}

export async function GET(request: NextRequest) {
  return handleIncomingCall(request);
}

async function handleIncomingCall(request: NextRequest) {
  // Extract caller info from Twilio's request parameters
  const formData = await request.formData().catch(() => null);
  const callerNumber = formData?.get("From")?.toString() ?? "unknown";
  const calledNumber = formData?.get("To")?.toString() ?? "";
  const callSid = formData?.get("CallSid")?.toString() ?? "";
  const callerCity = formData?.get("FromCity")?.toString() ?? "";
  const callerState = formData?.get("FromState")?.toString() ?? "";

  console.log(
    `[Voice] Incoming call: ${callerNumber} → ${calledNumber} (${callSid}) from ${callerCity}, ${callerState}`
  );

  // Determine the WebSocket URL for the media stream.
  // In production on Vercel, we need the voice server running separately
  // (Vercel serverless doesn't support persistent WebSockets).
  // For now, we construct the URL based on the request host.
  const host = request.headers.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "ws" : "wss";
  const wsUrl = `${protocol}://${host}/api/voice/media-stream`;

  // Build TwiML response
  // The <Connect><Stream> verb opens a bidirectional WebSocket
  // and proxies call audio through it.
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Google.en-US-Chirp3-HD-Aoede">Please hold while I connect you.</Say>
  <Pause length="1"/>
  <Connect>
    <Stream url="${wsUrl}">
      <Parameter name="callerNumber" value="${escapeXml(callerNumber)}" />
      <Parameter name="callSid" value="${escapeXml(callSid)}" />
      <Parameter name="callerCity" value="${escapeXml(callerCity)}" />
      <Parameter name="callerState" value="${escapeXml(callerState)}" />
    </Stream>
  </Connect>
</Response>`;

  return new NextResponse(twiml, {
    status: 200,
    headers: {
      "Content-Type": "text/xml",
    },
  });
}

/** Escape special XML characters to prevent injection in TwiML */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
