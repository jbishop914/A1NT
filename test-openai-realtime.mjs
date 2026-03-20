/**
 * Test script: Verify OpenAI Realtime API responds with audio deltas
 * using the EXACT same session.update config as our voice server.
 * 
 * Usage: OPENAI_API_KEY=sk-... node test-openai-realtime.mjs
 */

import WebSocket from 'ws';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('Set OPENAI_API_KEY env var');
  process.exit(1);
}

const MODEL = 'gpt-realtime-mini';
const url = `wss://api.openai.com/v1/realtime?model=${MODEL}`;

console.log(`Connecting to OpenAI Realtime (model=${MODEL})...`);

const ws = new WebSocket(url, {
  headers: {
    Authorization: `Bearer ${OPENAI_API_KEY}`,
    'OpenAI-Beta': 'realtime=v1',
  },
});

let audioDeltaCount = 0;
let firstDeltaTime = null;

ws.on('open', () => {
  console.log('✅ Connected to OpenAI Realtime API');

  // Send session.update with EXACT same config as session-manager.ts
  setTimeout(() => {
    const sessionUpdate = {
      type: 'session.update',
      session: {
        type: 'realtime',
        model: MODEL,
        output_modalities: ['audio'],
        audio: {
          input: {
            format: { type: 'audio/pcmu' },
            turn_detection: {
              type: 'server_vad',
              prefix_padding_ms: 300,
              silence_duration_ms: 500,
            },
          },
          output: {
            format: { type: 'audio/pcmu' },
            voice: 'alloy',
          },
        },
        instructions: 'You are Alex, a friendly AI receptionist. Greet the caller warmly and ask how you can help them today.',
        temperature: 0.7,
      },
    };

    console.log('📤 Sending session.update...');
    ws.send(JSON.stringify(sessionUpdate));
  }, 250);
});

ws.on('message', (data) => {
  const event = JSON.parse(data.toString());

  // Log important events
  const importantEvents = [
    'session.created', 'session.updated', 'response.created',
    'response.done', 'response.output_item.added', 'error',
  ];
  
  if (importantEvents.includes(event.type)) {
    console.log(`📨 ${event.type}`);
    
    if (event.type === 'error') {
      console.error('   Error details:', JSON.stringify(event.error, null, 2));
    }
  }

  // After session.updated, send response.create to trigger greeting
  if (event.type === 'session.updated') {
    console.log('✅ Session configured — sending response.create...');
    ws.send(JSON.stringify({ type: 'response.create' }));
  }

  // Count audio deltas
  if (event.type === 'response.output_audio.delta' || event.type === 'response.audio.delta') {
    audioDeltaCount++;
    if (!firstDeltaTime) {
      firstDeltaTime = Date.now();
      console.log(`🔊 First audio delta received! (event type: ${event.type})`);
      console.log(`   Delta size: ${event.delta?.length ?? 0} base64 chars`);
    }
    if (audioDeltaCount % 50 === 0) {
      console.log(`🔊 Audio deltas received: ${audioDeltaCount}`);
    }
  }

  // Transcript
  if (event.type === 'response.output_audio_transcript.done') {
    console.log(`📝 Transcript: "${event.transcript}"`);
  }

  // Response done
  if (event.type === 'response.done') {
    const usage = event.response?.usage;
    console.log(`\n✅ Response complete!`);
    console.log(`   Audio deltas: ${audioDeltaCount}`);
    console.log(`   Tokens: ${JSON.stringify(usage)}`);
    
    // Close after a moment
    setTimeout(() => {
      console.log('\n🏁 Test complete — closing connection');
      ws.close();
      process.exit(0);
    }, 1000);
  }
});

ws.on('error', (err) => {
  console.error('❌ WebSocket error:', err.message);
  process.exit(1);
});

ws.on('close', (code, reason) => {
  console.log(`WebSocket closed: code=${code}, reason=${reason?.toString()}`);
});

// Timeout after 15 seconds
setTimeout(() => {
  console.error('\n⏰ Timeout after 15s — no complete response received');
  console.log(`   Audio deltas so far: ${audioDeltaCount}`);
  ws.close();
  process.exit(1);
}, 15000);
