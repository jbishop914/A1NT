/* ─── Operator Routing API ─────────────────────────────────────────────────
   GET  /api/operator/routing — All routing config (rules, override, custom rules, schedule)
   PUT  /api/operator/routing — Update routing override
   ──────────────────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const ORG_ID = () => process.env.A1NT_ORG_ID ?? "demo-org";

/* ── Enum mappers ───────────────────────────────────────────────────── */

const destFromDb: Record<string, string> = {
  AI_RECEPTIONIST: "ai-receptionist",
  AI_RECEPTIONIST_LIMITED: "ai-receptionist-limited",
  HUMAN: "human",
  VOICEMAIL: "voicemail",
  IVR_MENU: "ivr-menu",
  EMERGENCY_ONLY: "emergency-only",
  FORWARD_CELL: "forward-cell",
  FORWARD_EMPLOYEE: "forward-employee",
};

const destToDb: Record<string, string> = Object.fromEntries(
  Object.entries(destFromDb).map(([k, v]) => [v, k])
);

const modeFromDb: Record<string, string> = {
  NORMAL: "normal",
  OVERRIDE: "override",
  EMERGENCY: "emergency",
};

const modeToDb: Record<string, string> = {
  normal: "NORMAL",
  override: "OVERRIDE",
  emergency: "EMERGENCY",
};

const dayFromDb: Record<string, string> = {
  MON: "mon", TUE: "tue", WED: "wed", THU: "thu", FRI: "fri", SAT: "sat", SUN: "sun",
};

/* ─── GET: Full routing configuration ───────────────────────────────── */

export async function GET() {
  try {
    const orgId = ORG_ID();

    const [rules, overrides, customRules, schedule] = await Promise.all([
      db.routingRule.findMany({
        where: { organizationId: orgId },
        orderBy: { sortOrder: "asc" },
      }),
      db.routingOverride.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" },
        take: 1,
      }),
      db.customRoutingRule.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" },
      }),
      db.routingScheduleBlock.findMany({
        where: { organizationId: orgId },
        orderBy: [{ day: "asc" }, { startHour: "asc" }],
      }),
    ]);

    // Check if override has expired
    const activeOverride = overrides[0];
    if (activeOverride?.active && activeOverride.expiresAt && activeOverride.expiresAt < new Date()) {
      // Auto-expire the override
      await db.routingOverride.update({
        where: { id: activeOverride.id },
        data: { active: false },
      });
      activeOverride.active = false;
    }

    return NextResponse.json({
      rules: rules.map((r) => ({
        id: r.id,
        name: r.name,
        intent: r.intent,
        businessHoursRoute: r.businessHoursRoute,
        afterHoursRoute: r.afterHoursRoute,
        priority: r.priority,
        enabled: r.enabled,
      })),
      override: activeOverride
        ? {
            id: activeOverride.id,
            active: activeOverride.active,
            mode: modeFromDb[activeOverride.mode] ?? "normal",
            destination: destFromDb[activeOverride.destination] ?? "ai-receptionist",
            forwardToNumber: activeOverride.forwardToNumber,
            forwardToName: activeOverride.forwardToName,
            reason: activeOverride.reason,
            activatedAt: activeOverride.activatedAt?.toISOString() ?? null,
            expiresAt: activeOverride.expiresAt?.toISOString() ?? null,
            activatedBy: activeOverride.activatedBy,
          }
        : {
            id: null,
            active: false,
            mode: "normal",
            destination: "ai-receptionist",
            forwardToNumber: null,
            forwardToName: null,
            reason: "",
            activatedAt: null,
            expiresAt: null,
            activatedBy: "",
          },
      customRules: customRules.map((r) => ({
        id: r.id,
        type: r.type,
        match: r.match,
        destination: destFromDb[r.destination] ?? "ai-receptionist",
        forwardTo: r.forwardTo,
        voicemailMessage: r.voicemailMessage,
        expiresAt: r.expiresAt?.toISOString() ?? null,
        enabled: r.enabled,
        note: r.note,
      })),
      schedule: schedule.map((s) => ({
        id: s.id,
        day: dayFromDb[s.day] ?? "mon",
        startHour: s.startHour,
        endHour: s.endHour,
        destination: destFromDb[s.destination] ?? "ai-receptionist",
        label: s.label,
        agentScript: s.agentScript,
        forwardToNumber: s.forwardToNumber,
        forwardToName: s.forwardToName,
      })),
    });
  } catch (err) {
    console.error("[API] operator/routing GET error:", err);
    return NextResponse.json(
      {
        rules: [],
        override: { id: null, active: false, mode: "normal", destination: "ai-receptionist", forwardToNumber: null, forwardToName: null, reason: "", activatedAt: null, expiresAt: null, activatedBy: "" },
        customRules: [],
        schedule: [],
      },
      { status: 500 }
    );
  }
}

/* ─── PUT: Activate/deactivate routing override ─────────────────────── */

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const orgId = ORG_ID();

    const {
      active,
      mode = "override",
      destination = "forward-cell",
      forwardToNumber,
      forwardToName,
      reason = "",
      durationMinutes,
    } = body;

    // Calculate expiration
    const expiresAt = durationMinutes
      ? new Date(Date.now() + durationMinutes * 60 * 1000)
      : null;

    // Upsert — only one active override per org
    const existing = await db.routingOverride.findFirst({
      where: { organizationId: orgId },
    });

    const data = {
      active: active ?? true,
      mode: (modeToDb[mode] ?? "OVERRIDE") as any,
      destination: (destToDb[destination] ?? "FORWARD_CELL") as any,
      forwardToNumber: forwardToNumber ?? null,
      forwardToName: forwardToName ?? null,
      reason,
      activatedAt: active ? new Date() : null,
      expiresAt,
      activatedBy: "Josh Bishop",
    };

    let override;
    if (existing) {
      override = await db.routingOverride.update({
        where: { id: existing.id },
        data,
      });
    } else {
      override = await db.routingOverride.create({
        data: { organizationId: orgId, ...data },
      });
    }

    return NextResponse.json({
      success: true,
      override: {
        id: override.id,
        active: override.active,
        mode: modeFromDb[override.mode] ?? "normal",
        destination: destFromDb[override.destination] ?? "ai-receptionist",
        forwardToNumber: override.forwardToNumber,
        forwardToName: override.forwardToName,
        reason: override.reason,
        activatedAt: override.activatedAt?.toISOString() ?? null,
        expiresAt: override.expiresAt?.toISOString() ?? null,
        activatedBy: override.activatedBy,
      },
    });
  } catch (err) {
    console.error("[API] operator/routing PUT error:", err);
    return NextResponse.json(
      { error: "Failed to update routing override" },
      { status: 500 }
    );
  }
}
