/* ─── Voice Pipeline Tool Definitions + Handlers ──────────────────────────
   These are the "tick" functions — tools the AI agent can invoke mid-call
   via OpenAI Realtime function calling.

   Each tool:
   1. Is defined with a JSON Schema for OpenAI
   2. Has a handler function that executes the business logic
   3. Returns a stringified JSON result to feed back to the model

   Phase 1: Stub implementations that return realistic demo data.
   Phase 2: Wire to actual Prisma DB / external APIs.
   ──────────────────────────────────────────────────────────────────────── */

import type { RealtimeTool } from "./types";

/* ═══════════════════════════════════════════════════════════════════════════
   Tool Definitions — sent to OpenAI in session.update
   ═══════════════════════════════════════════════════════════════════════════ */

export const AGENT_TOOLS: RealtimeTool[] = [
  {
    type: "function",
    name: "lookup_customer",
    description:
      "Look up a customer by phone number, name, or address. Returns customer profile, service history, and any open work orders.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Phone number, customer name, or address to search",
        },
        search_type: {
          type: "string",
          description: "Type of search to perform",
          enum: ["phone", "name", "address"],
        },
      },
      required: ["query"],
    },
  },
  {
    type: "function",
    name: "check_schedule",
    description:
      "Check available appointment slots for a given date range and service type. Returns open time slots with assigned technicians.",
    parameters: {
      type: "object",
      properties: {
        date: {
          type: "string",
          description: "Date to check (YYYY-MM-DD format). Defaults to today.",
        },
        days_ahead: {
          type: "string",
          description: "Number of days ahead to check. Default 3.",
        },
        service_type: {
          type: "string",
          description: "Type of service needed",
          enum: [
            "plumbing",
            "hvac",
            "electrical",
            "drain_cleaning",
            "emergency",
            "estimate",
            "general",
          ],
        },
      },
    },
  },
  {
    type: "function",
    name: "create_work_order",
    description:
      "Create a new work order for a customer. Captures the issue description, priority, and scheduling preference.",
    parameters: {
      type: "object",
      properties: {
        customer_name: {
          type: "string",
          description: "Customer's full name",
        },
        phone: {
          type: "string",
          description: "Customer's phone number",
        },
        address: {
          type: "string",
          description: "Service address",
        },
        issue_description: {
          type: "string",
          description: "Description of the issue or service needed",
        },
        priority: {
          type: "string",
          description: "Priority level",
          enum: ["emergency", "urgent", "routine", "low"],
        },
        service_type: {
          type: "string",
          description: "Type of service",
          enum: [
            "plumbing",
            "hvac",
            "electrical",
            "drain_cleaning",
            "general",
          ],
        },
        preferred_date: {
          type: "string",
          description:
            "Customer's preferred date (YYYY-MM-DD). Optional.",
        },
        preferred_time: {
          type: "string",
          description:
            "Customer's preferred time window (e.g., 'morning', 'afternoon', '9am-12pm'). Optional.",
        },
      },
      required: [
        "customer_name",
        "phone",
        "address",
        "issue_description",
        "priority",
        "service_type",
      ],
    },
  },
  {
    type: "function",
    name: "search_knowledge_base",
    description:
      "Search the company knowledge base for information about services, pricing guidelines, procedures, or policies.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search query for the knowledge base",
        },
        category: {
          type: "string",
          description: "Category to search within",
          enum: [
            "services",
            "pricing",
            "procedures",
            "policies",
            "faq",
            "all",
          ],
        },
      },
      required: ["query"],
    },
  },
  {
    type: "function",
    name: "transfer_call",
    description:
      "Transfer the current call to a human employee or specific department. Use when the situation requires human intervention.",
    parameters: {
      type: "object",
      properties: {
        department: {
          type: "string",
          description: "Department or person to transfer to",
          enum: ["manager", "dispatch", "billing", "technician", "emergency"],
        },
        reason: {
          type: "string",
          description: "Brief reason for the transfer",
        },
        warm_transfer: {
          type: "string",
          description: "Whether to do a warm transfer (brief the recipient) or cold transfer",
          enum: ["warm", "cold"],
        },
      },
      required: ["department", "reason"],
    },
  },
  {
    type: "function",
    name: "send_confirmation",
    description:
      "Send a confirmation message (SMS or email) to the customer with appointment details, work order number, or other information.",
    parameters: {
      type: "object",
      properties: {
        phone: {
          type: "string",
          description: "Customer's phone number for SMS",
        },
        message_type: {
          type: "string",
          description: "Type of confirmation to send",
          enum: [
            "appointment_booked",
            "work_order_created",
            "estimate_scheduled",
            "callback_scheduled",
          ],
        },
        details: {
          type: "string",
          description: "Key details to include in the confirmation",
        },
      },
      required: ["phone", "message_type", "details"],
    },
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   Tool Handlers — execute business logic and return results
   ═══════════════════════════════════════════════════════════════════════════ */

type ToolHandler = (args: Record<string, string>) => Promise<string>;

const handlers: Record<string, ToolHandler> = {
  /* ─── Customer Lookup ────────────────────────────────────────────── */
  async lookup_customer(args) {
    const { query, search_type } = args;
    console.log(`[Tool] lookup_customer: ${search_type ?? "auto"} = "${query}"`);

    // Phase 1: Stub — return demo data
    // Phase 2: Query Prisma Client table
    const isKnown = query.includes("555") || query.toLowerCase().includes("johnson");

    if (isKnown) {
      return JSON.stringify({
        found: true,
        customer: {
          id: "CL-1047",
          name: "Mrs. Linda Johnson",
          phone: "(203) 555-0147",
          address: "742 Evergreen Terrace, Cheshire, CT",
          type: "residential",
          since: "2023-06-15",
          notes: "Prefers Mike for HVAC work. Has a dog — ring doorbell, don't knock.",
          openWorkOrders: 0,
          lastService: "2026-01-22 — Furnace maintenance",
          lifetimeValue: "$4,280",
        },
      });
    }

    return JSON.stringify({
      found: false,
      message: `No customer found matching "${query}". This may be a new customer.`,
    });
  },

  /* ─── Schedule Check ─────────────────────────────────────────────── */
  async check_schedule(args) {
    const { date, days_ahead, service_type } = args;
    console.log(`[Tool] check_schedule: ${date ?? "today"}, ${days_ahead ?? 3} days, type=${service_type ?? "general"}`);

    // Phase 1: Stub — return demo availability
    return JSON.stringify({
      available_slots: [
        {
          date: "2026-03-20",
          day: "Friday",
          slots: [
            { time: "10:00 AM - 12:00 PM", technician: "Mike R.", available: true },
            { time: "2:00 PM - 4:00 PM", technician: "Dave S.", available: true },
          ],
        },
        {
          date: "2026-03-21",
          day: "Saturday",
          slots: [
            { time: "8:00 AM - 10:00 AM", technician: "Mike R.", available: true },
          ],
        },
        {
          date: "2026-03-23",
          day: "Monday",
          slots: [
            { time: "8:00 AM - 10:00 AM", technician: "Mike R.", available: true },
            { time: "10:00 AM - 12:00 PM", technician: "Lisa K.", available: true },
            { time: "1:00 PM - 3:00 PM", technician: "Dave S.", available: true },
            { time: "3:00 PM - 5:00 PM", technician: "Mike R.", available: true },
          ],
        },
      ],
      note: service_type === "emergency"
        ? "Emergency dispatch available now — a technician can be on-site within 60 minutes."
        : undefined,
    });
  },

  /* ─── Work Order Creation ────────────────────────────────────────── */
  async create_work_order(args) {
    const { customer_name, phone, address, issue_description, priority, service_type, preferred_date, preferred_time } = args;
    console.log(`[Tool] create_work_order: ${customer_name}, ${priority}, ${service_type}`);

    // Phase 1: Stub — return generated work order number
    const woNumber = `WO-${Date.now().toString(36).toUpperCase().slice(-6)}`;

    return JSON.stringify({
      success: true,
      work_order: {
        number: woNumber,
        customer: customer_name,
        phone,
        address,
        issue: issue_description,
        priority,
        service_type,
        status: "created",
        scheduled: preferred_date
          ? `${preferred_date} ${preferred_time ?? "TBD"}`
          : "Pending scheduling",
        created_at: new Date().toISOString(),
      },
      message: `Work order ${woNumber} created successfully.`,
    });
  },

  /* ─── Knowledge Base Search ──────────────────────────────────────── */
  async search_knowledge_base(args) {
    const { query, category } = args;
    console.log(`[Tool] search_knowledge_base: "${query}" in ${category ?? "all"}`);

    // Phase 1: Stub — return relevant demo results
    // Phase 2: Query Perplexity Agent API or local KB
    return JSON.stringify({
      results: [
        {
          title: "Standard Service Pricing Guidelines",
          content:
            "Service call fee: $89 (waived if work is approved). " +
            "Drain cleaning starts at $150. Water heater install: $800-$2,500 depending on type. " +
            "After-hours emergency surcharge: 1.5x standard rate. " +
            "Always note: final pricing requires on-site assessment by technician.",
          category: "pricing",
          relevance: 0.92,
        },
        {
          title: "Appointment Scheduling Policy",
          content:
            "Standard appointments are 2-hour windows. " +
            "Technician will call 30 minutes before arrival. " +
            "Same-day appointments available based on schedule. " +
            "Emergency dispatch: technician on-site within 60 minutes.",
          category: "procedures",
          relevance: 0.78,
        },
      ],
      total_results: 2,
    });
  },

  /* ─── Call Transfer ──────────────────────────────────────────────── */
  async transfer_call(args) {
    const { department, reason, warm_transfer } = args;
    console.log(`[Tool] transfer_call: ${warm_transfer ?? "cold"} to ${department} — ${reason}`);

    // Phase 1: Stub — in production, this would use Twilio API to modify the call
    // Phase 2: Use twilio.calls(callSid).update({ twiml: ... })
    return JSON.stringify({
      success: true,
      transfer_type: warm_transfer ?? "cold",
      department,
      message: `Call transfer to ${department} initiated. ${
        warm_transfer === "warm"
          ? "Briefing the recipient on the situation before connecting."
          : "Connecting now."
      }`,
      // In production: include the actual transfer phone number
      note: "Transfer is simulated in demo mode. In production, this triggers a Twilio call update.",
    });
  },

  /* ─── Send Confirmation ──────────────────────────────────────────── */
  async send_confirmation(args) {
    const { phone, message_type, details } = args;
    console.log(`[Tool] send_confirmation: ${message_type} to ${phone}`);

    // Phase 1: Stub — in production, sends via Twilio SMS
    return JSON.stringify({
      success: true,
      channel: "sms",
      recipient: phone,
      message_type,
      message: `Confirmation sent to ${phone}: ${details}`,
      note: "SMS is simulated in demo mode. In production, this sends via Twilio Messaging API.",
    });
  },
};

/* ═══════════════════════════════════════════════════════════════════════════
   Public API
   ═══════════════════════════════════════════════════════════════════════════ */

/**
 * Execute a tool call from OpenAI Realtime function calling.
 * Returns a stringified JSON result to feed back to the model.
 */
export async function executeToolCall(
  name: string,
  argsJson: string
): Promise<string> {
  const handler = handlers[name];
  if (!handler) {
    return JSON.stringify({
      error: true,
      message: `Unknown tool: ${name}. Available tools: ${Object.keys(handlers).join(", ")}`,
    });
  }

  try {
    const args = JSON.parse(argsJson) as Record<string, string>;
    const startTime = Date.now();
    const result = await handler(args);
    const duration = Date.now() - startTime;
    console.log(`[Tool] ${name} completed in ${duration}ms`);
    return result;
  } catch (err) {
    console.error(`[Tool] ${name} error:`, err);
    return JSON.stringify({
      error: true,
      message: `Tool execution failed: ${err instanceof Error ? err.message : "Unknown error"}`,
    });
  }
}
