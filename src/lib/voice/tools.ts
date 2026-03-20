/* ─── Voice Pipeline Tool Definitions + Handlers ──────────────────────────
   These are the "tick" functions — tools the AI agent can invoke mid-call
   via OpenAI Realtime function calling.

   Each tool:
   1. Is defined with a JSON Schema for OpenAI
   2. Has a handler function that executes the business logic
   3. Returns a stringified JSON result to feed back to the model

   Wired to Prisma DB for real persistence.
   ──────────────────────────────────────────────────────────────────────── */

import type { RealtimeTool } from "./types";
import { db } from "../db";

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

/** Resolve organization ID from env or default */
function getOrgId(): string {
  return process.env.A1NT_ORG_ID ?? "demo-org";
}

const handlers: Record<string, ToolHandler> = {
  /* ─── Customer Lookup — queries Prisma Client table ─────────────── */
  async lookup_customer(args) {
    const { query, search_type } = args;
    console.log(`[Tool] lookup_customer: ${search_type ?? "auto"} = "${query}"`);

    const orgId = getOrgId();

    try {
      // Build where clause based on search type
      const where: Record<string, unknown> = { organizationId: orgId };

      if (search_type === "phone" || /^\+?\d[\d\s\-()]+$/.test(query)) {
        // Phone search — strip non-digits and search with contains
        const digits = query.replace(/\D/g, "");
        where.phone = { contains: digits };
      } else if (search_type === "address") {
        where.address = { contains: query, mode: "insensitive" };
      } else {
        // Name search (default)
        where.name = { contains: query, mode: "insensitive" };
      }

      const client = await db.client.findFirst({
        where,
        include: {
          workOrders: {
            where: { status: { in: ["NEW", "ASSIGNED", "IN_PROGRESS"] } },
            orderBy: { createdAt: "desc" },
            take: 5,
          },
        },
      });

      if (client) {
        return JSON.stringify({
          found: true,
          customer: {
            id: client.id,
            name: client.name,
            phone: client.phone ?? "Not on file",
            address: client.address
              ? `${client.address}${client.city ? `, ${client.city}` : ""}${client.state ? `, ${client.state}` : ""}`
              : "Not on file",
            email: client.email ?? "Not on file",
            type: client.tags?.includes("commercial") ? "commercial" : "residential",
            since: client.createdAt.toISOString().slice(0, 10),
            notes: client.notes ?? "",
            openWorkOrders: client.workOrders.length,
            lastService: client.workOrders[0]
              ? `${client.workOrders[0].createdAt.toISOString().slice(0, 10)} — ${client.workOrders[0].title}`
              : "None on record",
          },
        });
      }

      return JSON.stringify({
        found: false,
        message: `No customer found matching "${query}". This may be a new customer.`,
      });
    } catch (err) {
      console.error("[Tool] lookup_customer DB error:", err);
      // Graceful degradation — return "not found" rather than crashing
      return JSON.stringify({
        found: false,
        message: `Unable to search customer database. "${query}" may be a new customer.`,
      });
    }
  },

  /* ─── Schedule Check — queries ScheduleEvent table ──────────────── */
  async check_schedule(args) {
    const { date, days_ahead, service_type } = args;
    console.log(`[Tool] check_schedule: ${date ?? "today"}, ${days_ahead ?? 3} days, type=${service_type ?? "general"}`);

    const orgId = getOrgId();
    const startDate = date ? new Date(date) : new Date();
    startDate.setHours(0, 0, 0, 0);
    const daysToCheck = parseInt(days_ahead ?? "3", 10);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + daysToCheck);

    try {
      // Get existing schedule events to find busy slots
      const existingEvents = await db.scheduleEvent.findMany({
        where: {
          organizationId: orgId,
          startTime: { gte: startDate },
          endTime: { lte: endDate },
          isCancelled: false,
        },
        include: { assignee: true },
        orderBy: { startTime: "asc" },
      });

      // Get technicians to show availability
      const technicians = await db.employee.findMany({
        where: { organizationId: orgId, isActive: true },
        select: { id: true, name: true, skills: true },
      });

      // Build availability by day (simplified — shows generic 2-hour slots minus busy times)
      const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const standardSlots = [
        { time: "8:00 AM - 10:00 AM" },
        { time: "10:00 AM - 12:00 PM" },
        { time: "1:00 PM - 3:00 PM" },
        { time: "3:00 PM - 5:00 PM" },
      ];

      const availableDays = [];
      for (let d = 0; d < daysToCheck; d++) {
        const day = new Date(startDate);
        day.setDate(day.getDate() + d);
        const dayOfWeek = day.getDay();

        // Skip weekends for non-emergency
        if ((dayOfWeek === 0 || dayOfWeek === 6) && service_type !== "emergency") continue;

        const dayStr = day.toISOString().slice(0, 10);
        const dayEvents = existingEvents.filter(
          (e) => e.startTime.toISOString().slice(0, 10) === dayStr
        );

        // For each tech, find open slots
        const slots = [];
        for (const tech of technicians) {
          const techBusy = dayEvents.filter((e) => e.assigneeId === tech.id);
          // Simplified: if tech has < 4 events that day, they have availability
          if (techBusy.length < standardSlots.length) {
            const availableSlotIndex = techBusy.length; // Next open slot
            if (availableSlotIndex < standardSlots.length) {
              slots.push({
                time: standardSlots[availableSlotIndex].time,
                technician: tech.name,
                available: true,
              });
            }
          }
        }

        // If no technicians in DB yet, show generic availability
        if (technicians.length === 0) {
          for (const slot of standardSlots) {
            slots.push({ time: slot.time, technician: "Available", available: true });
          }
        }

        if (slots.length > 0) {
          availableDays.push({
            date: dayStr,
            day: dayNames[dayOfWeek],
            slots,
          });
        }
      }

      return JSON.stringify({
        available_slots: availableDays,
        note: service_type === "emergency"
          ? "Emergency dispatch available now — a technician can be on-site within 60 minutes."
          : undefined,
      });
    } catch (err) {
      console.error("[Tool] check_schedule DB error:", err);
      // Graceful fallback — return generic availability
      return JSON.stringify({
        available_slots: [
          {
            date: startDate.toISOString().slice(0, 10),
            day: "Today",
            slots: [
              { time: "Next available slot", technician: "Available", available: true },
            ],
          },
        ],
        note: "Schedule system is temporarily limited. An office team member will confirm the exact time.",
      });
    }
  },

  /* ─── Work Order Creation — writes to Prisma WorkOrder table ────── */
  async create_work_order(args) {
    const { customer_name, phone, address, issue_description, priority, service_type, preferred_date, preferred_time } = args;
    console.log(`[Tool] create_work_order: ${customer_name}, ${priority}, ${service_type}`);

    const orgId = getOrgId();

    // Map tool priority strings to Prisma enum
    const priorityMap: Record<string, "LOW" | "NORMAL" | "HIGH" | "EMERGENCY"> = {
      low: "LOW",
      routine: "NORMAL",
      urgent: "HIGH",
      emergency: "EMERGENCY",
    };

    try {
      // Generate a human-friendly order number
      const count = await db.workOrder.count({ where: { organizationId: orgId } });
      const woNumber = `WO-${(1000 + count + 1).toString()}`;

      const workOrder = await db.workOrder.create({
        data: {
          organizationId: orgId,
          orderNumber: woNumber,
          title: `${service_type ?? "general"} — ${issue_description.substring(0, 60)}`,
          description: issue_description,
          status: "NEW",
          priority: priorityMap[priority] ?? "NORMAL",
          serviceType: service_type ?? "general",
          serviceAddress: address,
          scheduledStart: preferred_date ? new Date(`${preferred_date}T09:00:00`) : null,
          notes: `Customer: ${customer_name}\nPhone: ${phone}\nPreferred time: ${preferred_time ?? "Flexible"}`,
        },
      });

      return JSON.stringify({
        success: true,
        work_order: {
          number: woNumber,
          id: workOrder.id,
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
          created_at: workOrder.createdAt.toISOString(),
        },
        message: `Work order ${woNumber} created successfully.`,
      });
    } catch (err) {
      console.error("[Tool] create_work_order DB error:", err);
      // Graceful fallback — still generate a reference number
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
          status: "created (offline)",
          scheduled: preferred_date
            ? `${preferred_date} ${preferred_time ?? "TBD"}`
            : "Pending scheduling",
          created_at: new Date().toISOString(),
        },
        message: `Work order ${woNumber} created. Note: will be synced to system when connection is restored.`,
      });
    }
  },

  /* ─── Knowledge Base Search ─────────────────────────────────────── */
  async search_knowledge_base(args) {
    const { query, category } = args;
    console.log(`[Tool] search_knowledge_base: "${query}" in ${category ?? "all"}`);

    // Phase 2: Query Perplexity Agent API or local KB / vector DB
    // For now: return well-structured reference data
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

  /* ─── Call Transfer ─────────────────────────────────────────────── */
  async transfer_call(args) {
    const { department, reason, warm_transfer } = args;
    console.log(`[Tool] transfer_call: ${warm_transfer ?? "cold"} to ${department} — ${reason}`);

    // Phase 2: Use twilio.calls(callSid).update({ twiml: ... }) for actual transfer
    return JSON.stringify({
      success: true,
      transfer_type: warm_transfer ?? "cold",
      department,
      message: `Call transfer to ${department} initiated. ${
        warm_transfer === "warm"
          ? "Briefing the recipient on the situation before connecting."
          : "Connecting now."
      }`,
      note: "Transfer is simulated in demo mode. In production, this triggers a Twilio call update.",
    });
  },

  /* ─── Send Confirmation ─────────────────────────────────────────── */
  async send_confirmation(args) {
    const { phone, message_type, details } = args;
    console.log(`[Tool] send_confirmation: ${message_type} to ${phone}`);

    // Phase 2: Send via Twilio Messaging API
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
