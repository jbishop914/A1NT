# Module 16 — AI Agent Employees: Technical Architecture

> This document is the implementation companion to `MODULE-AI-AGENTS.md` (the product spec).
> It answers the question: **how do we actually build this?**

---

## 1. The Honest Assessment: Perplexity Agent API vs OpenAI vs Hybrid

### Perplexity Agent API — Where It Fits

The Perplexity Agent API is excellent for what we already built: **knowledge work**. Web-grounded research, KB enrichment, document retrieval, question answering. It supports function calling, web search, and URL fetching out of the box. It routes across models (GPT-5.4, Claude, etc.) and handles multi-step reasoning well.

**Where it does NOT fit:** Real-time voice. Perplexity has no speech-to-speech API, no WebSocket streaming for audio, no voice activity detection (VAD), and no audio codec support. It is a text-in/text-out API with HTTP request/response semantics.

### OpenAI Realtime API — The Voice Backbone

OpenAI's Realtime API is purpose-built for exactly what we need:
- **Native speech-to-speech** — no STT→LLM→TTS pipeline. Audio in, audio out.
- **WebSocket (wss://) full-duplex** — simultaneous audio upload and download.
- **Sub-200ms latency** in most environments.
- **G.711 µ-law @ 8kHz** — the exact codec VoIP/SIP systems use natively.
- **Server-side VAD** — automatic turn detection (semantic or silence-based).
- **Function calling mid-conversation** — the model can call tools while on a live call.
- **gpt-realtime-1.5** — latest model with +10% transcription accuracy, +7% instruction following, more reliable tool calling.

### Claude / Anthropic — The Reasoning Specialist

Claude excels at long-context reasoning, nuanced instruction following, and complex document analysis. It supports tool/function calling via the Messages API. Twilio has a working integration via ConversationRelay. However, Claude has no native speech-to-speech — it requires a separate STT→Claude→TTS pipeline, adding 1-3 seconds of latency per turn.

### The Verdict: Hybrid Architecture

**No single API does everything.** The right answer is a layered architecture:

| Layer | Provider | Why |
|-------|----------|-----|
| **Voice Pipeline** (live calls) | OpenAI Realtime API | Only real option for sub-second speech-to-speech with native VoIP codec support and mid-call function calling |
| **Telephony Bridge** | Twilio Voice + Media Streams | Industry-standard VoIP/SIP bridge; proven integration with OpenAI Realtime via WebSocket proxy |
| **Knowledge & Research** | Perplexity Agent API | Web-grounded search, document retrieval, KB enrichment — what we already built |
| **Deep Reasoning** (async) | Claude / GPT-5.x (text) | Complex analysis, performance reviews, training generation, document drafting — not latency-sensitive |
| **Memory & Persona** | Custom (Markdown + Vector DB) | Tiered memory system inspired by Letta/MemGPT — persona docs, episodic memory, archival storage |

This gives us:
- **Best-in-class voice** (OpenAI Realtime — native audio, lowest latency)
- **Best-in-class knowledge** (Perplexity — web-grounded, citation-backed)
- **Best-in-class reasoning** (Claude/GPT text — for background analysis)
- **Full control over memory** (our own system, not locked to any provider)

---

## 2. Voice Pipeline Architecture

### The Call Flow

```
                    PSTN / SIP
                        │
                   ┌────▼────┐
                   │ Twilio  │  ← Business phone number
                   │ Voice   │  ← Call routing rules
                   └────┬────┘
                        │ WebSocket (Media Streams)
                        │ Audio: G.711 µ-law @ 8kHz
                        │
                   ┌────▼─────────────────────────┐
                   │     A1NT VOICE GATEWAY        │
                   │  (Node.js / Next.js API route) │
                   │                                │
                   │  ┌──────────┐  ┌────────────┐ │
                   │  │ Twilio   │  │  OpenAI    │ │
                   │  │ WS       │◄►│  Realtime  │ │
                   │  │ Handler  │  │  WS Client │ │
                   │  └──────────┘  └──────┬─────┘ │
                   │                       │       │
                   │  ┌────────────────────▼─────┐ │
                   │  │    AGENT ORCHESTRATOR     │ │
                   │  │  • Session state          │ │
                   │  │  • Tool dispatch          │ │
                   │  │  • Memory read/write      │ │
                   │  │  • Helper agent bridge    │ │
                   │  │  • Transcript logging     │ │
                   │  └──────────────────────────┘ │
                   └──────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
      ┌───────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
      │   A1NT API   │ │  Perplexity │ │  Helper    │
      │   (Internal) │ │  Agent API  │ │  Agent     │
      │              │ │             │ │  (Shadow)  │
      │ • Calendar   │ │ • KB search │ │ • Listens  │
      │ • Clients    │ │ • Research  │ │ • Retrieves│
      │ • Work Orders│ │ • Web search│ │ • Prepares │
      │ • Scheduling │ │             │ │   context  │
      └──────────────┘ └─────────────┘ └────────────┘
```

### Step-by-Step: Incoming Call

1. **Ring** — Call hits Twilio number. Twilio webhook fires to our `/api/voice/incoming` endpoint.
2. **TwiML Response** — We return TwiML that opens a Media Stream WebSocket back to our server.
3. **Session Init** — Our Voice Gateway:
   - Identifies the caller (Caller ID lookup → Clients module)
   - Loads the Receptionist agent's persona document
   - Opens a WebSocket to OpenAI Realtime API (`wss://api.openai.com/v1/realtime?model=gpt-realtime-1.5`)
   - Sends `session.update` with: system prompt, voice, audio format (G.711 µ-law), tools, VAD config
4. **Greeting** — OpenAI generates the greeting audio, streamed back through Twilio to the caller.
5. **Conversation Loop** — Audio flows bidirectionally:
   - Caller audio → Twilio WS → our server → OpenAI Realtime WS
   - OpenAI audio → our server → Twilio WS → caller's phone
   - OpenAI handles turn detection (VAD) automatically
6. **Tool Calls** — When the agent needs data (check calendar, look up client, etc.):
   - OpenAI emits `response.output_item.done` with `type: "function_call"`
   - Our orchestrator executes the function against A1NT internal APIs
   - Result sent back via `conversation.item.create` → `type: "function_call_output"`
   - OpenAI generates a response incorporating the result
7. **Call End** — Agent says goodbye, our server sends `<Hangup/>` TwiML or the caller hangs up.
8. **Post-Call** — Orchestrator saves: full transcript, call summary, any actions taken (bookings, notes), updates to agent metrics.

### Audio Format Details

```
Twilio Media Streams ←→ Our Server ←→ OpenAI Realtime
        G.711 µ-law              G.711 µ-law
        8kHz mono                8kHz mono
        Base64 encoded           Base64 encoded
```

No transcoding needed. OpenAI Realtime natively supports G.711, which is the standard VoIP codec. Audio passes through our server as a relay — we don't need to decode it.

---

## 3. The "Tick" System — Context Enrichment Loop

This is Josh's key insight: the agent should be able to **pause, gather more context, and then respond** rather than giving an uncertain answer.

### How It Works

```
                    ┌─────────────────────┐
                    │   Customer asks:    │
                    │  "Do you do toilet  │
                    │   repairs?"         │
                    └─────────┬───────────┘
                              │
                    ┌─────────▼───────────┐
                    │  Agent receives     │
                    │  transcribed input  │
                    │  via Realtime API   │
                    └─────────┬───────────┘
                              │
                    ┌─────────▼───────────┐
                    │  CONFIDENCE CHECK   │
                    │  Does agent have    │──── YES ──→ Respond directly
                    │  enough info?       │
                    └─────────┬───────────┘
                              │ NO
                    ┌─────────▼───────────┐
                    │  TICK: Agent calls  │
                    │  lookup_knowledge() │  ← This is a tool/function call
                    │  tool with query:   │     built into the session
                    │  "toilet repairs"   │
                    └─────────┬───────────┘
                              │
                    ┌─────────▼───────────┐
                    │  Our orchestrator   │
                    │  executes the tool: │
                    │  • Checks KB docs   │
                    │  • Helper agent may │
                    │    have pre-fetched │
                    │  • Returns: service │
                    │    description,     │
                    │    pricing range,   │
                    │    scheduling info  │
                    └─────────┬───────────┘
                              │
                    ┌─────────▼───────────┐
                    │  Agent now has      │
                    │  full context →     │
                    │  responds naturally │
                    └─────────────────────┘
```

### Implementation via OpenAI Realtime Function Calling

The "tick" is actually just a **function call**. OpenAI Realtime natively supports this — when the agent needs more info, it emits a `function_call` event instead of generating audio. Our server executes the function and returns the result. The agent then generates its response with the enriched context.

This is not a hack or workaround — it's the intended use of tool calling. The latency of a "tick" is:
- Function call emitted by OpenAI: ~50ms
- Our server executes lookup: ~100-500ms (depending on data source)
- Result sent back to OpenAI: ~50ms
- OpenAI generates audio response: ~200ms

**Total: ~400-800ms** — feels like a natural thinking pause to the caller.

### Available Tools for the Receptionist Agent

```typescript
const receptionistTools = [
  {
    type: "function",
    name: "lookup_knowledge",
    description: "Search the company knowledge base for information about services, procedures, pricing, policies, etc. Use when unsure about company-specific details.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "What to search for" },
        category: { type: "string", enum: ["services", "pricing", "policies", "procedures", "faq"] }
      },
      required: ["query"]
    }
  },
  {
    type: "function",
    name: "check_calendar",
    description: "Check available appointment slots on the company calendar. Use when a customer wants to schedule a visit or appointment.",
    parameters: {
      type: "object",
      properties: {
        date_range: { type: "string", description: "e.g. 'next week', 'tomorrow', 'March 25-28'" },
        appointment_type: { type: "string", enum: ["estimate", "service", "consultation", "follow-up"] },
        duration_minutes: { type: "integer", description: "Expected duration" }
      },
      required: ["appointment_type"]
    }
  },
  {
    type: "function",
    name: "book_appointment",
    description: "Book a confirmed appointment on the calendar after the customer agrees to a specific time.",
    parameters: {
      type: "object",
      properties: {
        customer_name: { type: "string" },
        customer_phone: { type: "string" },
        customer_address: { type: "string" },
        appointment_type: { type: "string" },
        date_time: { type: "string", description: "ISO 8601 datetime" },
        notes: { type: "string", description: "Work description, materials, timeline, etc." }
      },
      required: ["customer_name", "customer_phone", "appointment_type", "date_time"]
    }
  },
  {
    type: "function",
    name: "lookup_customer",
    description: "Look up an existing customer by name, phone number, or address to retrieve their history.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string" },
        phone: { type: "string" },
        address: { type: "string" }
      }
    }
  },
  {
    type: "function",
    name: "create_work_order",
    description: "Create a new work order in the system after gathering all necessary details.",
    parameters: {
      type: "object",
      properties: {
        customer_id: { type: "string" },
        description: { type: "string" },
        priority: { type: "string", enum: ["low", "normal", "high", "emergency"] },
        scheduled_date: { type: "string" },
        assigned_to: { type: "string", description: "Employee/team to assign to" },
        notes: { type: "string" }
      },
      required: ["description", "priority"]
    }
  },
  {
    type: "function",
    name: "update_event_notes",
    description: "Update notes on an existing calendar event or work order. Use when a customer provides additional information about an existing booking.",
    parameters: {
      type: "object",
      properties: {
        event_id: { type: "string" },
        additional_notes: { type: "string" },
        notify_team: { type: "boolean", description: "Whether to ping the assigned team about the update" }
      },
      required: ["event_id", "additional_notes"]
    }
  },
  {
    type: "function",
    name: "transfer_call",
    description: "Transfer the caller to a specific person or department. Use when the request requires a human or is outside your capabilities.",
    parameters: {
      type: "object",
      properties: {
        transfer_to: { type: "string", description: "Person name, role, or extension" },
        reason: { type: "string" },
        context_summary: { type: "string", description: "Brief summary for the person receiving the transfer" }
      },
      required: ["transfer_to", "reason"]
    }
  }
];
```

---

## 4. The Helper Agent — Shadow Context Retrieval

The Helper Agent runs in parallel with the main agent, listening to the conversation transcript in real-time and pre-fetching relevant context.

### Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    VOICE SESSION                          │
│                                                           │
│  ┌─────────────┐      ┌──────────────────────────────┐  │
│  │ RECEPTIONIST │      │       HELPER AGENT           │  │
│  │ (OpenAI      │      │   (Background, text-only)    │  │
│  │  Realtime)   │      │                              │  │
│  │              │      │  Receives: live transcript    │  │
│  │ Handles:     │      │  Analyzes: keywords, intent  │  │
│  │ • Voice I/O  │      │  Pre-fetches:                │  │
│  │ • Tool calls │◄─────│  • KB articles               │  │
│  │ • Responses  │      │  • Client history            │  │
│  │              │      │  • Service descriptions      │  │
│  └─────────────┘      │  • Pricing info              │  │
│                        │  • Relevant SOPs             │  │
│                        │                              │  │
│                        │  Stores: pre-fetched context  │
│                        │  in session context buffer   │  │
│                        └──────────────────────────────┘  │
│                                                           │
│  ┌────────────────────────────────────────────────────┐  │
│  │              SESSION CONTEXT BUFFER                 │  │
│  │  A shared in-memory store that the Receptionist's  │  │
│  │  lookup_knowledge() tool reads from FIRST before   │  │
│  │  hitting the full KB/API. If the Helper already    │  │
│  │  pre-fetched the answer, it's instant.             │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### How It Works

1. **Transcript Stream** — As OpenAI Realtime generates transcripts (`conversation.item.input_audio_transcription.completed`), we forward the text to the Helper Agent.
2. **Keyword Extraction** — The Helper (a lightweight LLM call or even regex/NLP) identifies topics: "toilet", "repair", "estimate", "schedule", "pricing".
3. **Pre-Fetch** — Helper queries our KB, services list, and pricing data for relevant content. Results go into the Session Context Buffer.
4. **Tool Acceleration** — When the Receptionist triggers `lookup_knowledge("toilet repairs")`, the orchestrator checks the buffer first. If the Helper already fetched it, the response is near-instant (no API call needed). If not, it falls back to a live query.

### Helper Agent Implementation

The Helper Agent is NOT another OpenAI Realtime session. It's a lightweight, cheap, text-only process:

```typescript
// Helper runs as a Perplexity Agent API or GPT-4o-mini call
// Triggered on each new transcript segment

async function helperAgentTick(transcript: string, contextBuffer: Map<string, string>) {
  // 1. Extract likely topics from recent transcript
  const extraction = await perplexity.responses.create({
    model: "sonar",  // Fast, cheap
    input: `Extract key topics and likely next questions from this conversation transcript. Return as JSON array of search queries.\n\nTranscript:\n${transcript}`,
    text: { format: { type: "json_object" } }
  });

  const queries = JSON.parse(extraction.output_text);

  // 2. Pre-fetch KB content for each topic
  for (const query of queries) {
    if (!contextBuffer.has(query)) {
      const result = await searchKnowledgeBase(query);
      contextBuffer.set(query, result);
    }
  }
}
```

**Cost:** The Helper uses Sonar (cheapest tier) for extraction and hits our own KB. Estimated cost: ~$0.001 per "tick". For a 5-minute call with 10 ticks, that's about $0.01 total for the Helper.

---

## 5. Memory & Persona System

### Tiered Memory (Inspired by Letta/MemGPT)

```
┌─────────────────────────────────────────────────────────┐
│                    AGENT MEMORY                          │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  TIER 1: CORE MEMORY (always in context window)  │   │
│  │  • Agent persona (name, role, personality)        │   │
│  │  • Company identity (name, location, team size)   │   │
│  │  • Current active protocols & SOPs (summaries)    │   │
│  │  • Critical business rules & escalation triggers  │   │
│  │  ~500-1000 tokens — always present                │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  TIER 2: WORKING MEMORY (session-scoped)         │   │
│  │  • Current conversation history                   │   │
│  │  • Caller identification & their history          │   │
│  │  • Active tool call results                       │   │
│  │  • Helper agent pre-fetched context               │   │
│  │  ~2000-4000 tokens — varies per call              │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  TIER 3: RECALL MEMORY (retrievable per-query)   │   │
│  │  • Past conversation summaries                    │   │
│  │  • Client interaction history                     │   │
│  │  • Learned patterns & preferences                 │   │
│  │  • Corrections received & lessons learned         │   │
│  │  Stored in: Postgres + vector embeddings          │   │
│  │  Retrieved via: lookup_memory() tool              │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  TIER 4: ARCHIVAL MEMORY (cold storage)          │   │
│  │  • Full conversation transcripts                  │   │
│  │  • Complete interaction logs                      │   │
│  │  • Training data & feedback history               │   │
│  │  • Performance review records                     │   │
│  │  Stored in: Object storage / Postgres JSONB       │   │
│  │  Retrieved via: search_archive() tool             │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### The Persona Document (Markdown)

Each agent's identity lives in a Markdown document that evolves over time. This is the "accumulated experience" Josh described.

```markdown
# Agent: Alex — AI Receptionist
## TripleA Plumbing | Cheshire, Connecticut

---

## Core Identity
- **Name:** Alex
- **Role:** Front Desk Receptionist & Office Assistant
- **Company:** TripleA Plumbing
- **Team Size:** 5 employees
- **Location:** Cheshire, Connecticut
- **Working Hours:** 24/7
- **Voice:** Alloy (warm, professional)

## Greeting Protocol
"Thank you for calling TripleA Plumbing, this is Alex. How can I help you today?"

## Personality
- Professional but warm — like a friendly office manager who genuinely cares
- Confident but honest — never guesses, says "let me check on that" when unsure
- Efficient — respects the caller's time, doesn't ramble
- Empathetic — acknowledges frustration (especially for emergency calls)

## Job Responsibilities
1. Answer all incoming calls on the business line
2. Handle customer inquiries about services and pricing
3. Schedule estimates and service appointments
4. Look up existing customer information and booking status
5. Take messages and relay to appropriate team members
6. Create and update work orders based on customer requests
7. Handle callback requests and follow-up scheduling

## Escalation Rules
- Emergency calls (burst pipe, gas leak, flooding) → immediate transfer to on-call tech
- Detailed technical questions beyond basics → "Our estimator can walk you through that in detail"
- Pricing disputes or complaints → transfer to office manager
- If unsure about ANYTHING → check knowledge base first, then escalate if still unsure

## Services We Offer
→ [Reference: /kb/services.md — full service catalog]
- Toilet repairs and installation [$150-$600]
- Water heater repair and replacement [$200-$2,500]
- Drain cleaning and unclogging [$125-$350]
- Faucet repair and installation [$100-$400]
- Pipe repair and replacement [$200-$3,000+]
- Bathroom renovations [Estimate required]
- Kitchen plumbing [Estimate required]
- Emergency plumbing [24/7, premium rates apply]

## Learned Behaviors (Updated by experience)
- Mrs. Johnson always requests Mike for HVAC work (learned 2026-03-18)
- Customers calling about water heater issues often also need expansion tank check (learned 2026-03-20)
- Tuesday mornings are busiest for estimate requests (learned 2026-03-22)
- When customers mention "bathroom remodel" — always confirm scope before booking (learned from correction 2026-03-25)

## Corrections Received
1. [2026-03-25] Booked a "bathroom remodel" estimate for 30 min — should have been 60 min for full remodels. CORRECTION: Always ask scope first. Simple fixture swap = 30 min. Full remodel = 60 min.
2. [2026-03-28] Gave pricing for tankless water heater install without mentioning gas line requirements. CORRECTION: Always mention that tankless may require gas line upgrade, which is a separate cost.

---
*Last updated: 2026-03-28T14:30:00Z*
*Experience score: 847 interactions, 96.2% accuracy*
```

### How the Persona Document Is Used

1. **Tier 1 (Core Memory)** is a compressed summary of this document (~500 tokens) that goes into every API call as the system prompt.
2. **The full document** is stored as a file that the agent can reference via `lookup_knowledge()` when it needs detailed info on any section.
3. **"Learned Behaviors"** and **"Corrections Received"** sections are appended automatically by the system after supervisor reviews and corrections.
4. **Dynamic values** (marked with `[brackets]` or `→ [Reference:]`) are resolved at runtime from the database or KB.

### Memory Write-Back After Each Interaction

```typescript
async function postInteractionMemoryUpdate(session: VoiceSession) {
  // 1. Generate interaction summary
  const summary = await generateSummary(session.transcript);

  // 2. Extract learned facts
  const facts = await extractFacts(session.transcript, session.toolResults);
  // e.g., "Customer Bob Smith prefers morning appointments"

  // 3. Write to Recall Memory (Tier 3)
  await db.agentMemory.create({
    agentId: session.agentId,
    key: `interaction-${session.id}`,
    value: JSON.stringify({ summary, facts, callerId: session.callerId }),
    category: "interaction",
  });

  // 4. If correction was received, append to Persona Document
  if (session.corrections.length > 0) {
    await appendToPersonaDocument(session.agentId, "corrections", session.corrections);
  }

  // 5. Update agent metrics
  await updateAgentMetrics(session.agentId, {
    tasksCompleted: 1,
    responseTime: session.avgResponseTime,
    accuracy: session.supervisorRating ?? null,
    escalated: session.wasEscalated,
  });
}
```

---

## 6. System Prompt Assembly

The system prompt sent to OpenAI Realtime is assembled from the tiered memory at session start:

```typescript
function assembleSystemPrompt(agent: Agent, caller?: Client): string {
  const layers = [];

  // Layer 1: Platform
  layers.push(`You are an AI agent employee on the A1 Integrations platform.
You have access to tools for calendar, customer lookup, knowledge base, and work orders.
Always use tools rather than guessing. If you need information, call the appropriate tool.
Never reveal that you are an AI unless directly asked.`);

  // Layer 2: Industry (from template)
  layers.push(agent.role.industryContext);
  // e.g., "You work in the plumbing/HVAC industry. Common services include..."

  // Layer 3: Organization
  layers.push(`Company: ${agent.org.name}
Location: ${agent.org.address}
Team size: ${agent.org.employeeCount} employees
Services: ${agent.org.services.map(s => s.name).join(", ")}`);

  // Layer 4: Role (from persona document — Tier 1 summary)
  layers.push(agent.coreMemory); // ~500 tokens of compressed persona

  // Layer 5: Personality
  layers.push(`Your name is ${agent.name}. ${agent.personality}`);

  // Layer 6: Live Context
  if (caller) {
    layers.push(`INCOMING CALLER: ${caller.name ?? "Unknown"}, phone: ${caller.phone}
Previous interactions: ${caller.interactionCount}
Last contact: ${caller.lastContact}
Open work orders: ${caller.openWorkOrders.map(wo => wo.summary).join("; ") || "None"}`);
  }

  layers.push(`Current date/time: ${new Date().toISOString()}
This is an incoming phone call on the company business line.
Begin with your standard greeting.`);

  return layers.join("\n\n---\n\n");
}
```

**Total prompt size:** ~1,500-2,500 tokens. Well within limits. Detailed info (full service catalog, SOP details, etc.) is accessed via tool calls, not crammed into the prompt.

---

## 7. Cost Analysis

### Per-Call Estimate (5-minute receptionist call)

| Component | Cost |
|-----------|------|
| Twilio Voice (inbound) | ~$0.0085/min × 5 = $0.04 |
| OpenAI Realtime (gpt-realtime-mini) | ~$0.06/min × 5 = $0.30 |
| Tool calls (2-3 function calls) | ~$0.01 |
| Helper Agent (Sonar ticks) | ~$0.01 |
| Post-call processing | ~$0.01 |
| **Total per call** | **~$0.37** |

### With gpt-realtime-1.5 (higher quality)

| Component | Cost |
|-----------|------|
| OpenAI Realtime 1.5 | ~$0.19/min × 5 = $0.95 |
| Other components | ~$0.07 |
| **Total per call** | **~$1.02** |

### Monthly Cost Comparison

| Scenario | AI Receptionist | Human Receptionist |
|----------|----------------|-------------------|
| 50 calls/day × 22 days | $407-$1,122/mo | $3,200+/mo |
| 100 calls/day × 22 days | $814-$2,244/mo | $3,200+/mo (overtime) |
| 24/7 availability | Same cost | $6,400+/mo (2 shifts) |

**Use gpt-realtime-mini for standard calls, gpt-realtime-1.5 for VIP callers or complex interactions.** The model can be selected per-session.

---

## 8. Technology Stack

### Required Services

| Service | Purpose | Estimated Cost |
|---------|---------|---------------|
| **Twilio** | Voice, SMS, phone numbers, Media Streams | ~$1/mo/number + usage |
| **OpenAI** | Realtime API (voice), GPT-5.x (text reasoning) | Pay-per-use |
| **Perplexity** | Agent API (KB search, research), Search API | Pay-per-use |
| **PostgreSQL** | Agent state, memory, personas, metrics | Already in stack |
| **Redis** (optional) | Session Context Buffer, real-time state | ~$15/mo |

### New Files / Routes Needed

```
src/
├── lib/
│   ├── agents/
│   │   ├── orchestrator.ts      — Core agent loop, session management
│   │   ├── memory.ts            — Tiered memory read/write
│   │   ├── persona.ts           — Persona document CRUD
│   │   ├── tools.ts             — Tool definitions + execution
│   │   ├── helper.ts            — Helper agent (shadow context)
│   │   └── metrics.ts           — Performance tracking
│   ├── voice/
│   │   ├── twilio.ts            — Twilio webhook handlers, TwiML
│   │   ├── realtime.ts          — OpenAI Realtime WS client
│   │   └── session.ts           — Voice session state management
│   └── perplexity.ts            — (already built) Search + Agent API
├── app/
│   ├── api/
│   │   ├── voice/
│   │   │   ├── incoming/route.ts    — Twilio webhook: incoming call
│   │   │   ├── media-stream/route.ts — WebSocket: audio relay
│   │   │   └── status/route.ts      — Call status callbacks
│   │   └── agents/
│   │       ├── [id]/route.ts        — Agent CRUD
│   │       ├── [id]/memory/route.ts — Memory management
│   │       └── [id]/metrics/route.ts — Performance data
│   └── dashboard/
│       └── ai-agents/
│           └── page.tsx             — Agent management UI
```

### Environment Variables

```env
# Voice Pipeline
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# LLM Providers
OPENAI_API_KEY=
PERPLEXITY_API_KEY=          # Already set

# Optional
ANTHROPIC_API_KEY=           # For async deep reasoning tasks
REDIS_URL=                   # For session context buffer
```

---

## 9. Build Phases

### Phase 1 — Voice Pipeline MVP (Receptionist answers the phone)
- Twilio Voice integration (phone number, webhook, Media Streams)
- OpenAI Realtime WebSocket relay
- Basic system prompt (hardcoded persona)
- Greeting + free-form conversation
- Call transcript logging
- **Deliverable:** Call the number, talk to Alex the receptionist

### Phase 2 — Tool Calling (Receptionist can DO things)
- Implement `check_calendar`, `book_appointment`, `lookup_customer` tools
- Wire tools to A1NT internal APIs (Scheduling, Clients modules)
- Implement `lookup_knowledge` tool → Perplexity KB search
- Post-call summary generation
- **Deliverable:** Book an appointment by phone, see it on the calendar

### Phase 3 — Memory & Persona (Agent learns and remembers)
- Tiered memory system (Core → Working → Recall → Archival)
- Persona document management
- Post-interaction memory write-back
- Correction ingestion (supervisor marks a response as incorrect → agent learns)
- **Deliverable:** Agent remembers returning callers and past corrections

### Phase 4 — Helper Agent (Shadow context retrieval)
- Real-time transcript forwarding
- Keyword extraction + pre-fetch loop
- Session Context Buffer
- Benchmark: measure latency improvement on tool calls with vs. without Helper
- **Deliverable:** Measurably faster, more informed responses

### Phase 5 — Agent Management UI
- Agent roster page (provision, configure, deploy)
- Performance dashboard (metrics, reviews, feedback)
- Persona editor (view/edit the Markdown document)
- Call history with playback and transcript
- **Deliverable:** Full management interface in the dashboard

### Phase 6 — Multi-Role Expansion
- Dispatcher, Inside Sales, Customer Service agent templates
- Multi-channel (add email, SMS, chat handling)
- Cross-agent coordination (Receptionist creates WO → Dispatcher assigns tech)
- Agent Marketplace (pre-built templates per industry)

---

## 10. Open Questions / Decisions Needed

1. **Twilio vs. alternatives?** Twilio is the most proven integration with OpenAI Realtime. Alternatives: Vonage, LiveKit (has built-in SIP support), or direct SIP trunk. Twilio is the safe bet for MVP.

2. **gpt-realtime-mini vs gpt-realtime-1.5?** Start with `mini` ($10/M input tokens vs $32/M). Upgrade to `1.5` if quality isn't sufficient. The model is a per-session config — easy to A/B test.

3. **Redis for Session Buffer?** For MVP, an in-memory Map per session is fine. Redis becomes valuable when we scale to multiple server instances or need cross-session state.

4. **Helper Agent: Perplexity Sonar vs local embedding search?** Sonar for KB search (already built), local pgvector for customer history/memory lookups. Both are fast enough.

5. **Voice persona customization?** OpenAI Realtime offers several voices (alloy, echo, fable, onyx, nova, shimmer). Should this be configurable per agent in the UI?

---

*This architecture document should be treated as a living spec. As we build each phase, update the relevant sections with implementation notes and decisions made.*
