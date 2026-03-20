/* ─── System Prompt Builder ────────────────────────────────────────────────
   Assembles the instruction set sent to OpenAI Realtime at session.update.
   Mirrors the "Context Layers" architecture from Module 16:
     1. Platform (static)   — A1NT behavioral rules
     2. Industry (template) — Industry-specific knowledge
     3. Company (dynamic)   — Business-specific details
     4. Role (persona)      — Role capabilities and rules
     5. Personality (persona)— Voice, tone, greeting style
     6. Live Context (runtime)— Injected per-call (caller info, etc.)
   ──────────────────────────────────────────────────────────────────────── */

interface CompanyInfo {
  name: string;
  location: string;
  industry: string;
  employeeCount: number;
  description: string;
  hours?: string;
  serviceArea?: string;
  serviceAreaType?: "RADIUS" | "POLYGON" | null;
  serviceAreaRadius?: number | null; // miles
  website?: string;
  phoneNumber?: string;
}

interface PersonaInfo {
  name: string;
  greeting: string;
  personality: string[];
  voiceStyle: string;
}

interface RoleInfo {
  title: string;
  department: string;
  capabilities: string[];
  constraints: string[];
}

interface LiveContext {
  callerNumber: string;
  callerName?: string;
  existingCustomer?: boolean;
  previousInteractions?: string;
  currentTime: string;
  todaySchedule?: string;
  /** If the caller tried to book online but was flagged out-of-area */
  bookingFlagAddress?: string;
  bookingFlagOutOfArea?: boolean;
}

/* ─── Layer 1: Platform ────────────────────────────────────────────────── */

const PLATFORM_LAYER = `
## Platform Rules
- You are an AI agent employee powered by the A1 Integrations platform.
- You are on a live phone call. Speak naturally and conversationally.
- Never mention that you are an AI unless directly asked. If asked, be honest.
- Never fabricate information. If you don't know something, say so and offer to find out.
- Keep responses concise — this is a voice conversation, not a text chat. Aim for 1-3 sentences per turn.
- Use the caller's name when you know it. Be warm but professional.
- If you need to use a tool (look up a customer, check the schedule, etc.), briefly tell the caller what you're doing: "Let me pull that up for you."
- If the caller is frustrated or upset, acknowledge their feelings first before problem-solving.
- You can transfer calls to a human if the situation requires it. Use the transfer_call tool.
- Track any commitments you make (callbacks, appointments, etc.) by creating appropriate records.
`.trim();

/* ─── Layer 2: Industry ────────────────────────────────────────────────── */

function buildIndustryLayer(industry: string): string {
  const industryKnowledge: Record<string, string> = {
    plumbing: `
## Industry Knowledge — Plumbing
- Common services: drain cleaning, pipe repair, water heater install/repair, sewer line work, fixture installation, leak detection, gas line work.
- Emergency calls (burst pipes, sewage backup, no hot water) are high priority — express urgency and fast response.
- Always ask about the type of property (residential vs commercial) and approximate age of plumbing.
- For estimates, explain that a technician needs to assess on-site. Never quote exact prices without authorization.
- Know that "expansion tank" checks are commonly needed with water heater work.
- Permit requirements vary by municipality — note but don't promise specifics.`,
    hvac: `
## Industry Knowledge — HVAC
- Common services: AC repair/install, heating repair/install, duct cleaning, thermostat issues, refrigerant recharge, indoor air quality.
- Seasonal awareness: AC issues peak in summer, heating in winter. Maintenance calls peak in spring/fall.
- Emergency calls (no heat in winter, no AC in extreme heat) are high priority.
- R-454B is replacing R-410A as the standard refrigerant (2025 transition).
- Always ask about system type (central, mini-split, heat pump, furnace type).
- Energy efficiency ratings (SEER2, HSPF2) are key selling points for new installs.`,
    electrical: `
## Industry Knowledge — Electrical
- Common services: panel upgrades, outlet/switch work, lighting, wiring, EV charger install, generator install, troubleshooting.
- Safety is paramount — always emphasize licensed electricians for any electrical work.
- 2026 NEC code changes affect residential work — note for new construction/major renovations.
- Emergency calls (power outages, sparking outlets, burning smell) require immediate dispatch.
- Ask about the age of the home and electrical panel amperage when relevant.`,
    general: `
## Industry Knowledge — General Service Business
- Focus on understanding the customer's specific need and urgency level.
- Categorize requests as: emergency, urgent, routine, or inquiry.
- Always confirm the service address and best contact number.
- For estimates, explain the assessment process.`,
  };

  return (industryKnowledge[industry.toLowerCase()] ?? industryKnowledge.general).trim();
}

/* ─── Layer 3: Company ─────────────────────────────────────────────────── */

function buildCompanyLayer(company: CompanyInfo): string {
  const lines = [
    `## Company Information`,
    `- Company: ${company.name}`,
    `- Location: ${company.location}`,
    `- Industry: ${company.industry}`,
    `- Team size: ${company.employeeCount} employees`,
    `- Services: ${company.description}`,
  ];
  if (company.hours) lines.push(`- Business hours: ${company.hours}`);
  if (company.serviceArea) {
    lines.push(`- Service area: ${company.serviceArea}`);
    if (company.serviceAreaType === "RADIUS" && company.serviceAreaRadius) {
      lines.push(`- Service area boundary: ${company.serviceAreaRadius}-mile radius from base location`);
    } else if (company.serviceAreaType === "POLYGON") {
      lines.push(`- Service area boundary: Custom polygon boundary (defined in system settings)`);
    }
  }
  if (company.website) lines.push(`- Website: ${company.website}`);
  if (company.phoneNumber) lines.push(`- Phone: ${company.phoneNumber}`);

  // Service area handling instructions
  lines.push(``);
  lines.push(`### Service Area Policy`);
  lines.push(`- When a caller asks about whether their area is served, check their address against the service area.`);
  lines.push(`- If the caller was flagged by the online booking system as out-of-service-area:`);
  lines.push(`  1. Confirm the address with the caller`);
  lines.push(`  2. If the address matches the flagged address, politely explain: "I'm sorry, but that location is outside our current service area. We appreciate your interest and apologize for the inconvenience."`);
  lines.push(`  3. If the address is different from what was entered online, note the new address and offer to check if it's within the service area.`);
  lines.push(`- If unsure whether an address is within the service area, offer to have the office review and follow up.`);
  lines.push(`- Track out-of-area inquiries — if many callers from the same area are requesting service, note it for potential service area expansion.`);

  return lines.join("\n");
}

/* ─── Layer 4: Role ────────────────────────────────────────────────────── */

function buildRoleLayer(role: RoleInfo): string {
  const lines = [
    `## Your Role: ${role.title} (${role.department})`,
    `### Capabilities`,
    ...role.capabilities.map((c) => `- ${c}`),
  ];
  if (role.constraints.length > 0) {
    lines.push(`### Constraints`);
    lines.push(...role.constraints.map((c) => `- ${c}`));
  }
  return lines.join("\n");
}

/* ─── Layer 5: Personality ─────────────────────────────────────────────── */

function buildPersonalityLayer(persona: PersonaInfo): string {
  return [
    `## Personality`,
    `- Your name is ${persona.name}.`,
    `- When answering the phone, greet callers with: "${persona.greeting}"`,
    `- Voice style: ${persona.voiceStyle}`,
    `- Personality traits: ${persona.personality.join(", ")}`,
  ].join("\n");
}

/* ─── Layer 6: Live Context ────────────────────────────────────────────── */

function buildLiveContextLayer(ctx: LiveContext): string {
  const lines = [
    `## Current Call Context`,
    `- Current time: ${ctx.currentTime}`,
    `- Caller phone: ${ctx.callerNumber}`,
  ];
  if (ctx.callerName) lines.push(`- Caller name: ${ctx.callerName}`);
  if (ctx.existingCustomer !== undefined) {
    lines.push(`- Existing customer: ${ctx.existingCustomer ? "Yes" : "Unknown/New"}`);
  }
  if (ctx.previousInteractions) {
    lines.push(`- Previous interactions: ${ctx.previousInteractions}`);
  }
  if (ctx.todaySchedule) {
    lines.push(`- Today's schedule summary: ${ctx.todaySchedule}`);
  }
  if (ctx.bookingFlagOutOfArea && ctx.bookingFlagAddress) {
    lines.push(``);
    lines.push(`⚠️ BOOKING FLAG: This caller recently attempted to book online but was flagged as OUTSIDE the service area.`);
    lines.push(`   Flagged address: ${ctx.bookingFlagAddress}`);
    lines.push(`   Action: Confirm the address, explain the service area limitation politely, and log the interaction.`);
  }
  return lines.join("\n");
}

/* ─── Public API ───────────────────────────────────────────────────────── */

export interface PromptBuilderInput {
  company: CompanyInfo;
  persona: PersonaInfo;
  role: RoleInfo;
  liveContext: LiveContext;
}

/**
 * Builds the complete system prompt for an OpenAI Realtime session.
 * Assembles all 6 context layers in priority order.
 */
export function buildSystemPrompt(input: PromptBuilderInput): string {
  const layers = [
    PLATFORM_LAYER,
    buildIndustryLayer(input.company.industry),
    buildCompanyLayer(input.company),
    buildRoleLayer(input.role),
    buildPersonalityLayer(input.persona),
    buildLiveContextLayer(input.liveContext),
  ];

  return layers.join("\n\n");
}

/**
 * Builds a default system prompt for demo/testing when no agent is configured.
 */
export function buildDefaultPrompt(callerNumber: string): string {
  return buildSystemPrompt({
    company: {
      name: "TripleA Plumbing",
      location: "Cheshire, CT",
      industry: "plumbing",
      employeeCount: 5,
      description: "Residential & commercial plumbing, HVAC, drain cleaning",
      hours: "Mon-Fri 7am-6pm, Sat 8am-2pm, Emergency 24/7",
      serviceArea: "Greater New Haven, CT area",
      phoneNumber: "(203) 555-0100",
    },
    persona: {
      name: "Alex",
      greeting: "Thank you for calling TripleA Plumbing, this is Alex. How can I help you today?",
      personality: [
        "Professional but warm",
        "Friendly office manager",
        "Genuinely cares",
        "Confident but honest",
        "Efficient",
        "Empathetic",
      ],
      voiceStyle: "Clear, concise, and friendly",
    },
    role: {
      title: "Receptionist",
      department: "Front Office",
      capabilities: [
        "Answer phone calls",
        "Handle email inquiries",
        "Schedule appointments",
        "Create work orders",
        "Look up customer info",
        "Transfer calls",
      ],
      constraints: [
        "Never quote exact prices without manager approval",
        "Cannot authorize discounts over 10%",
        "Must escalate complaints to manager after 2 failed resolution attempts",
      ],
    },
    liveContext: {
      callerNumber,
      currentTime: new Date().toLocaleString("en-US", {
        timeZone: "America/New_York",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }),
    },
  });
}
