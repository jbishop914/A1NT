/* ─── A1NT Voice Server ────────────────────────────────────────────────────
   Standalone WebSocket server for the voice pipeline.
   
   Why standalone? Next.js App Router (especially on Vercel) doesn't support
   persistent WebSocket connections. Voice calls require a long-lived
   bidirectional WebSocket between Twilio and our server. This process runs
   alongside Next.js (or on a separate port in production).
   
   In production, this would run on:
   - A dedicated Node.js server (e.g., Railway, Render, Fly.io)
   - Or a Vercel Edge-compatible WebSocket service
   - With the TwiML webhook URL pointing to this server's domain
   
   Usage:
     npx tsx src/lib/voice/voice-server.ts
   
   Or via npm script:
     npm run voice-server
   ──────────────────────────────────────────────────────────────────────── */

import { createServer, IncomingMessage } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { handleMediaStream } from "./session-manager";

/* ─── Configuration ────────────────────────────────────────────────────── */

// Railway assigns PORT dynamically; fall back to VOICE_SERVER_PORT or 8081 for local dev
const PORT = parseInt(process.env.PORT ?? process.env.VOICE_SERVER_PORT ?? "8081", 10);
const HOST = "0.0.0.0"; // Required for Railway / containerized environments
const HEALTH_CHECK_PATH = "/health";
const MEDIA_STREAM_PATH = "/api/voice/media-stream";

/* ─── HTTP Server (health checks + WebSocket upgrade) ─────────────────── */

const server = createServer((req, res) => {
  // Health check endpoint
  if (req.url === HEALTH_CHECK_PATH) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        service: "a1nt-voice-server",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      })
    );
    return;
  }

  // Info page
  if (req.url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        service: "A1NT Voice Pipeline Server",
        version: "1.0.0",
        endpoints: {
          health: HEALTH_CHECK_PATH,
          mediaStream: `ws://host:${PORT}${MEDIA_STREAM_PATH}`,
        },
        docs: "https://github.com/jbishop914/A1NT/blob/main/docs/MODULE-16-ARCHITECTURE.md",
      })
    );
    return;
  }

  // TwiML handler for incoming calls (alternative to Next.js route)
  if (req.url === "/api/voice/incoming" && req.method === "POST") {
    handleTwimlRequest(req, res);
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

/* ─── TwiML Handler ────────────────────────────────────────────────────── */

function handleTwimlRequest(req: IncomingMessage, res: import("http").ServerResponse) {
  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    const params = new URLSearchParams(body);
    const callerNumber = params.get("From") ?? "unknown";
    const callSid = params.get("CallSid") ?? "";
    const callerCity = params.get("FromCity") ?? "";
    const callerState = params.get("FromState") ?? "";
    const host = req.headers.host ?? `localhost:${PORT}`;

    console.log(`[Voice] Incoming call: ${callerNumber} (${callSid}) from ${callerCity}, ${callerState}`);

    const wsProtocol = host.includes("localhost") ? "ws" : "wss";
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Google.en-US-Chirp3-HD-Aoede">Please hold while I connect you.</Say>
  <Pause length="1"/>
  <Connect>
    <Stream url="${wsProtocol}://${host}${MEDIA_STREAM_PATH}">
      <Parameter name="callerNumber" value="${escapeXml(callerNumber)}" />
      <Parameter name="callSid" value="${escapeXml(callSid)}" />
      <Parameter name="callerCity" value="${escapeXml(callerCity)}" />
      <Parameter name="callerState" value="${escapeXml(callerState)}" />
    </Stream>
  </Connect>
</Response>`;

    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml);
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/* ─── WebSocket Server ─────────────────────────────────────────────────── */

const wss = new WebSocketServer({ server, path: MEDIA_STREAM_PATH });

wss.on("connection", (ws: WebSocket, req: IncomingMessage) => {
  console.log(`[Voice] WebSocket connection from ${req.socket.remoteAddress}`);

  // The session manager handles the full lifecycle:
  // Twilio audio → OpenAI Realtime → function calling → audio back to Twilio
  handleMediaStream(ws);
});

wss.on("error", (err) => {
  console.error("[Voice] WebSocket server error:", err);
});

/* ─── Start Server ─────────────────────────────────────────────────────── */

server.listen(PORT, HOST, () => {
  console.log("╔══════════════════════════════════════════════════════╗");
  console.log("║          A1NT Voice Pipeline Server v1.0.0          ║");
  console.log("╠══════════════════════════════════════════════════════╣");
  console.log(`║  HTTP:  http://localhost:${PORT}                       ║`);
  console.log(`║  WS:    ws://localhost:${PORT}${MEDIA_STREAM_PATH}  ║`);
  console.log(`║  Health: http://localhost:${PORT}${HEALTH_CHECK_PATH}                 ║`);
  console.log("╠══════════════════════════════════════════════════════╣");
  console.log("║  Twilio Webhook URL:                                ║");
  console.log(`║  POST /api/voice/incoming                           ║`);
  console.log("║                                                      ║");
  console.log("║  Set this URL in Twilio Console under your          ║");
  console.log("║  phone number's Voice Configuration.                ║");
  console.log("╚══════════════════════════════════════════════════════╝");

  if (!process.env.OPENAI_API_KEY) {
    console.warn("⚠ OPENAI_API_KEY not set — voice sessions will fail");
  }
  if (!process.env.TWILIO_ACCOUNT_SID) {
    console.warn("⚠ TWILIO_ACCOUNT_SID not set — webhook validation disabled");
  }
});

/* ─── Graceful Shutdown ────────────────────────────────────────────────── */

process.on("SIGTERM", () => {
  console.log("[Voice] SIGTERM received — shutting down gracefully");
  wss.close();
  server.close(() => {
    console.log("[Voice] Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("[Voice] SIGINT received — shutting down");
  wss.close();
  server.close(() => process.exit(0));
});
