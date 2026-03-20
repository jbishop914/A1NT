/* ─── Seed Booking Types ──────────────────────────────────────────────
   POST /api/booking/seed → Creates default booking types for the org.
   One-time setup endpoint.
   ──────────────────────────────────────────────────────────────────────── */

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const ORG_ID = () => process.env.A1NT_ORG_ID ?? "demo-org";

const DEFAULT_TYPES = [
  { type: "ESTIMATE" as const, label: "Free Estimate", durationMinutes: 30, description: "Schedule a free on-site estimate for your project.", sortOrder: 1 },
  { type: "FOLLOW_UP" as const, label: "Follow Up", durationMinutes: 30, description: "Follow-up visit for a previous estimate or service.", sortOrder: 2 },
  { type: "PRODUCT_DEMO" as const, label: "Product Demonstration", durationMinutes: 60, description: "See a demonstration of our products and equipment.", sortOrder: 3 },
  { type: "SERVICE_CALL" as const, label: "Service Call", durationMinutes: 60, description: "Schedule a service or repair visit.", sortOrder: 4 },
  { type: "WARRANTY" as const, label: "Warranty Service", durationMinutes: 60, description: "Warranty-related service or inspection.", sortOrder: 5 },
];

export async function POST() {
  try {
    const orgId = ORG_ID();
    let created = 0;

    for (const bt of DEFAULT_TYPES) {
      await db.bookingType.upsert({
        where: {
          organizationId_type: { organizationId: orgId, type: bt.type },
        },
        create: {
          organizationId: orgId,
          ...bt,
        },
        update: {
          label: bt.label,
          durationMinutes: bt.durationMinutes,
          description: bt.description,
          sortOrder: bt.sortOrder,
        },
      });
      created++;
    }

    return NextResponse.json({ success: true, created });
  } catch (err) {
    console.error("[booking/seed]", err);
    return NextResponse.json({ error: "Failed to seed" }, { status: 500 });
  }
}
