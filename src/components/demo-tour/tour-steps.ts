// ─── Tour Step Definitions ─────────────────────────────────────────────────
// 16-step guided story tour: "TripleA Plumbing" — full business lifecycle

export interface TourStep {
  id: number;
  title: string;
  message: string;
  /** CSS selector for the spotlight highlight element */
  targetSelector: string;
  /** Dashboard route this step lives on */
  targetPage: string;
  /** Friendly label for the area being highlighted */
  highlightArea: string;
  /** Optional narrative aside shown as a sub-note */
  aside?: string;
  /** Whether the user is expected to interact or just observe */
  interaction: "observe" | "click" | "read" | "view";
}

export const tourSteps: TourStep[] = [
  // ── Step 1: Sales & Marketing ───────────────────────────────────────
  {
    id: 1,
    title: "Launch a Seasonal Campaign",
    message:
      "It's the start of spring. TripleA Plumbing wants to capitalize on AC tune-up season. Here in the Sales & Marketing module, we toggle the seasonal campaign ON — and the platform takes it from there.",
    targetSelector: "[data-tour='campaign-toggle']",
    targetPage: "/dashboard/sales-marketing",
    highlightArea: "Sales & Marketing — Campaigns",
    aside: "AI drafts the campaign copy, selects the contact list, and schedules outbound calls automatically.",
    interaction: "click",
  },

  // ── Step 2: AI Receptionist — Outbound Queue ─────────────────────────
  {
    id: 2,
    title: "The Phone System Lights Up",
    message:
      "Watch the AI Receptionist module as outbound calls begin going out. The queue is filling in real time — every call logged, every outcome tracked.",
    targetSelector: "[data-tour='call-queue']",
    targetPage: "/dashboard/ai-receptionist",
    highlightArea: "AI Receptionist — Call Queue",
    aside: "AI agents make hundreds of calls simultaneously. No hold music. No missed leads.",
    interaction: "observe",
  },

  // ── Step 3: AI Receptionist — Incoming Bookings ─────────────────────
  {
    id: 3,
    title: "Bookings Are Coming In",
    message:
      "Bookings are starting to populate. Click on one of these call transcripts — let's see exactly how a customer just booked a tune-up appointment.",
    targetSelector: "[data-tour='transcript-list']",
    targetPage: "/dashboard/ai-receptionist",
    highlightArea: "AI Receptionist — Transcripts",
    interaction: "click",
  },

  // ── Step 4: Transcript — Repeat Customer Recognition ────────────────
  {
    id: 4,
    title: "A Familiar Voice",
    message:
      "Read this transcript. The AI instantly recognized a returning customer and noted his preference: \"Make sure it's Ryan — he's our favorite tech.\" That preference is now attached to the booking automatically.",
    targetSelector: "[data-tour='transcript-detail']",
    targetPage: "/dashboard/ai-receptionist",
    highlightArea: "Call Transcript Detail",
    aside: "Customer history, preferences, and special instructions are surfaced in real time during every call.",
    interaction: "read",
  },

  // ── Step 5: Scheduling — Weekly View ────────────────────────────────
  {
    id: 5,
    title: "The Schedule Fills Fast",
    message:
      "Jump over to Scheduling. Notice how Mike's calendar is filling up — spring campaign bookings are stacking in. The system handles conflicts automatically.",
    targetSelector: "[data-tour='schedule-week-view']",
    targetPage: "/dashboard/scheduling",
    highlightArea: "Scheduling — Weekly Calendar",
    interaction: "view",
  },

  // ── Step 6: Scheduling — Auto-Swap ──────────────────────────────────
  {
    id: 6,
    title: "The AI Notices the Preference",
    message:
      "The customer specifically requested Ryan. The AI detected that Mike was originally assigned — and it's about to swap the technician automatically. Watch.",
    targetSelector: "[data-tour='auto-swap-event']",
    targetPage: "/dashboard/scheduling",
    highlightArea: "Scheduling — Technician Swap",
    aside: "The system checks Ryan's availability, travel time, and workload before confirming the reassignment.",
    interaction: "observe",
  },

  // ── Step 7: Scheduling — Confirmation ────────────────────────────────
  {
    id: 7,
    title: "Updated. Instantly.",
    message:
      "Done. Ryan is now assigned. Mike's schedule is freed. The customer's dashboard, the dispatcher view, and Ryan's mobile app all reflect the change in real time — zero manual work.",
    targetSelector: "[data-tour='schedule-confirmation']",
    targetPage: "/dashboard/scheduling",
    highlightArea: "Scheduling — Updated Assignment",
    interaction: "view",
  },

  // ── Step 8: Fleet & Routes ────────────────────────────────────────────
  {
    id: 8,
    title: "Ryan's Day Is Routed",
    message:
      "The dispatcher opens the Fleet view. Ryan's full day is now mapped — the AI calculated the most efficient route across all his stops, factoring in job duration, traffic, and part pickups.",
    targetSelector: "[data-tour='fleet-route-map']",
    targetPage: "/dashboard/fleet-equipment",
    highlightArea: "Fleet — Route Map",
    aside: "Fuel savings, on-time rates, and tech satisfaction all improve with AI-optimized routing.",
    interaction: "view",
  },

  // ── Step 9: Work Orders — Lifecycle Start ────────────────────────────
  {
    id: 9,
    title: "Estimate → Sold → Work Order",
    message:
      "The estimate appointment is complete. The customer approved the work on-site. Watch the work order lifecycle: estimate converts to a sold job, a work order is created, and it lands in Ryan's queue — all without anyone touching a keyboard.",
    targetSelector: "[data-tour='work-order-pipeline']",
    targetPage: "/dashboard/work-orders",
    highlightArea: "Work Orders — Pipeline",
    interaction: "observe",
  },

  // ── Step 10: Work Orders — Live Timeline ─────────────────────────────
  {
    id: 10,
    title: "Live Progress Tracking",
    message:
      "Track every event on the work order in real time. Parts pulled, job started, photos uploaded, notes added — the full events timeline updates as Ryan works.",
    targetSelector: "[data-tour='work-order-timeline']",
    targetPage: "/dashboard/work-orders",
    highlightArea: "Work Orders — Events Timeline",
    interaction: "view",
  },

  // ── Step 11: Work Orders — Follow-Up ──────────────────────────────────
  {
    id: 11,
    title: "Work Complete. Follow-Up Automatic.",
    message:
      "Ryan marks the job complete. Within seconds, a follow-up call is automatically initiated by the AI Receptionist. No one needs to remember to call the customer back.",
    targetSelector: "[data-tour='work-order-complete']",
    targetPage: "/dashboard/work-orders",
    highlightArea: "Work Orders — Completion & Follow-Up",
    aside: "Follow-up calls have a 3× higher review conversion rate than email-only outreach.",
    interaction: "observe",
  },

  // ── Step 12: AI Receptionist — Post-Service Call ─────────────────────
  {
    id: 12,
    title: "Happy Customer",
    message:
      "Read the post-service call transcript. The customer says: \"As usual, you guys did a great job!\" The AI captures the positive sentiment and flags it for a review request — automatically.",
    targetSelector: "[data-tour='followup-transcript']",
    targetPage: "/dashboard/ai-receptionist",
    highlightArea: "AI Receptionist — Post-Service Transcript",
    interaction: "read",
  },

  // ── Step 13: Invoicing — Auto-Generated ──────────────────────────────
  {
    id: 13,
    title: "Invoice Generated",
    message:
      "Over in Invoicing — the invoice was generated automatically from the completed work order. Line items, labor, parts, tax — all populated. Ready to send.",
    targetSelector: "[data-tour='invoice-detail']",
    targetPage: "/dashboard/invoicing",
    highlightArea: "Invoicing — Auto-Generated Invoice",
    interaction: "view",
  },

  // ── Step 14: Invoicing — Payment Received ────────────────────────────
  {
    id: 14,
    title: "Payment Received",
    message:
      "The customer pays from their phone. Watch the invoice status flip from \"Sent\" to \"Paid\" in real time. The revenue is immediately recognized and flows through to your books.",
    targetSelector: "[data-tour='invoice-status']",
    targetPage: "/dashboard/invoicing",
    highlightArea: "Invoicing — Payment Status",
    interaction: "observe",
  },

  // ── Step 15: Financial Reports ────────────────────────────────────────
  {
    id: 15,
    title: "Revenue Reflected Immediately",
    message:
      "Check the Financial Reports. That payment just hit. The month-to-date revenue chart updates, the year-to-date line ticks up, and the spring campaign's ROI is already measurable — in the same session it started.",
    targetSelector: "[data-tour='financial-report-chart']",
    targetPage: "/dashboard/financial-reports",
    highlightArea: "Financial Reports — Revenue Chart",
    interaction: "view",
  },

  // ── Step 16: Summary ──────────────────────────────────────────────────
  {
    id: 16,
    title: "That's the A1 Platform",
    message:
      "From a seasonal campaign toggle to a paid invoice — without a single manual handoff. That's what A1 Integrations does for your business, every day. Ready to see it with your own data?",
    targetSelector: "[data-tour='demo-summary']",
    targetPage: "/dashboard/demo-training",
    highlightArea: "Demo Summary",
    interaction: "observe",
  },
];

export const TOUR_TOTAL_STEPS = tourSteps.length;
