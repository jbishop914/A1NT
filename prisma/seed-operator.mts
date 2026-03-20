/* ─── Seed Operator Module Data ─────────────────────────────────────────────
   Seeds routing rules, schedule blocks, and initial override config.
   Run: npx tsx prisma/seed-operator.mts
   ──────────────────────────────────────────────────────────────────────── */

import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter });

const ORG_ID = process.env.A1NT_ORG_ID ?? "demo-org";

async function main() {
  console.log("🔧 Seeding Operator module data...\n");

  // ─── Routing Rules ──────────────────────────────────────────────────
  console.log("  📋 Seeding routing rules...");

  const existingRules = await db.routingRule.count({ where: { organizationId: ORG_ID } });
  if (existingRules === 0) {
    await db.routingRule.createMany({
      data: [
        { organizationId: ORG_ID, name: "Emergency", intent: "Emergency", businessHoursRoute: "Immediate dispatch + notify on-call tech", afterHoursRoute: "AI handles + page on-call", priority: "urgent", enabled: true, sortOrder: 0 },
        { organizationId: ORG_ID, name: "Service Request", intent: "Service Request", businessHoursRoute: "AI creates work order draft → Office review", afterHoursRoute: "AI captures details + schedules callback", priority: "normal", enabled: true, sortOrder: 1 },
        { organizationId: ORG_ID, name: "Appointment", intent: "Appointment", businessHoursRoute: "AI books directly from calendar", afterHoursRoute: "AI books directly from calendar", priority: "normal", enabled: true, sortOrder: 2 },
        { organizationId: ORG_ID, name: "Billing", intent: "Billing", businessHoursRoute: "AI answers from invoice data → escalate if needed", afterHoursRoute: "Voicemail → flag for morning", priority: "low", enabled: true, sortOrder: 3 },
        { organizationId: ORG_ID, name: "Sales Inquiry", intent: "Sales Inquiry", businessHoursRoute: "AI captures lead info → sales queue", afterHoursRoute: "AI captures lead info → sales queue", priority: "normal", enabled: true, sortOrder: 4 },
        { organizationId: ORG_ID, name: "General", intent: "General", businessHoursRoute: "AI answers FAQs → transfer to office if complex", afterHoursRoute: "Voicemail", priority: "low", enabled: true, sortOrder: 5 },
      ],
    });
    console.log("    ✅ 6 routing rules created");
  } else {
    console.log(`    ⏭  Already has ${existingRules} routing rules, skipping`);
  }

  // ─── Routing Override (initial state) ───────────────────────────────
  console.log("  🔀 Seeding routing override...");

  const existingOverride = await db.routingOverride.count({ where: { organizationId: ORG_ID } });
  if (existingOverride === 0) {
    await db.routingOverride.create({
      data: {
        organizationId: ORG_ID,
        active: false,
        mode: "NORMAL",
        destination: "AI_RECEPTIONIST",
        reason: "",
        activatedBy: "Josh Bishop",
      },
    });
    console.log("    ✅ Default override created (inactive)");
  } else {
    console.log("    ⏭  Override already exists, skipping");
  }

  // ─── Schedule Blocks ────────────────────────────────────────────────
  console.log("  📅 Seeding schedule blocks...");

  const existingSchedule = await db.routingScheduleBlock.count({ where: { organizationId: ORG_ID } });
  if (existingSchedule === 0) {
    const weekdayBlocks = ["MON", "TUE", "WED", "THU", "FRI"].flatMap((day) => [
      {
        organizationId: ORG_ID,
        day: day as any,
        startHour: 8,
        endHour: 17,
        destination: "AI_RECEPTIONIST" as any,
        label: "AI Receptionist (Full Service)",
        agentScript: null,
        forwardToNumber: null,
        forwardToName: null,
      },
      {
        organizationId: ORG_ID,
        day: day as any,
        startHour: 17,
        endHour: 21,
        destination: "AI_RECEPTIONIST_LIMITED" as any,
        label: "AI Receptionist (After Hours)",
        agentScript: "Take messages only. Do not book appointments. Inform caller they will receive a callback tomorrow.",
        forwardToNumber: null,
        forwardToName: null,
      },
      {
        organizationId: ORG_ID,
        day: day as any,
        startHour: 21,
        endHour: 8,
        destination: "EMERGENCY_ONLY" as any,
        label: "Emergency Only + Voicemail",
        agentScript: null,
        forwardToNumber: null,
        forwardToName: null,
      },
    ]);

    const weekendBlocks = [
      {
        organizationId: ORG_ID,
        day: "SAT" as any,
        startHour: 9,
        endHour: 14,
        destination: "AI_RECEPTIONIST" as any,
        label: "AI Receptionist (Limited Saturday)",
        agentScript: "Saturday hours. Limited booking availability. Check Saturday-only calendar.",
        forwardToNumber: null,
        forwardToName: null,
      },
      {
        organizationId: ORG_ID,
        day: "SAT" as any,
        startHour: 14,
        endHour: 9,
        destination: "EMERGENCY_ONLY" as any,
        label: "Emergency Only + Voicemail",
        agentScript: null,
        forwardToNumber: null,
        forwardToName: null,
      },
      {
        organizationId: ORG_ID,
        day: "SUN" as any,
        startHour: 0,
        endHour: 24,
        destination: "EMERGENCY_ONLY" as any,
        label: "Emergency Only + Voicemail",
        agentScript: null,
        forwardToNumber: null,
        forwardToName: null,
      },
    ];

    await db.routingScheduleBlock.createMany({
      data: [...weekdayBlocks, ...weekendBlocks],
    });
    console.log(`    ✅ ${weekdayBlocks.length + weekendBlocks.length} schedule blocks created`);
  } else {
    console.log(`    ⏭  Already has ${existingSchedule} schedule blocks, skipping`);
  }

  console.log("\n✅ Operator seed complete!\n");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
