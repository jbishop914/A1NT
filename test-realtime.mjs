import WebSocket from "ws";

const OPENAI_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_KEY) {
  console.error("Set OPENAI_API_KEY env var");
  process.exit(1);
}

const url = "wss://api.openai.com/v1/realtime?model=gpt-realtime-mini";
console.log("[Test] Connecting to:", url);

const ws = new WebSocket(url, {
  headers: {
    Authorization: `Bearer ${OPENAI_KEY}`,
    "OpenAI-Beta": "realtime=v1",
  },
});

ws.on("open", () => {
  console.log("[Test] Connected! Sending session.update...");

  const sessionUpdate = {
    type: "session.update",
    session: {
      modalities: ["text", "audio"],
      input_audio_format: "g711_ulaw",
      output_audio_format: "g711_ulaw",
      input_audio_transcription: { model: "gpt-4o-mini-transcribe" },
      turn_detection: {
        type: "server_vad",
        prefix_padding_ms: 300,
        silence_duration_ms: 500,
      },
      voice: "alloy",
      instructions: "You are Alex, a friendly receptionist. Greet the caller warmly.",
      tools: [],
      temperature: 0.8,
    },
  };

  ws.send(JSON.stringify(sessionUpdate));
});

let eventCount = 0;
ws.on("message", (data) => {
  const event = JSON.parse(data.toString());
  eventCount++;
  console.log(`[Test] Event #${eventCount}: ${event.type}`);
  
  if (event.type === "error") {
    console.log("[Test] ERROR:", JSON.stringify(event, null, 2));
  }
  
  if (event.type === "session.updated") {
    console.log("[Test] Session configured! Sending response.create to trigger greeting...");
    ws.send(JSON.stringify({ type: "response.create" }));
  }

  if (event.type === "response.output_audio.delta") {
    console.log(`[Test] Got audio delta! (${event.delta?.length ?? 0} chars base64)`);
  }

  if (event.type === "response.done") {
    console.log("[Test] Response complete:", JSON.stringify(event.response?.usage));
    console.log("[Test] SUCCESS - closing");
    ws.close();
  }
});

ws.on("error", (err) => {
  console.error("[Test] WebSocket error:", err.message);
});

ws.on("close", (code, reason) => {
  console.log(`[Test] Closed: code=${code}, reason=${reason.toString()}`);
  console.log(`[Test] Total events received: ${eventCount}`);
  process.exit(0);
});

// Timeout after 15 seconds
setTimeout(() => {
  console.log("[Test] Timeout after 15s");
  ws.close();
  process.exit(1);
}, 15000);
