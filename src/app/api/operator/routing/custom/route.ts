/* ─── Custom Routing Rules API ─────────────────────────────────────────────
   POST   /api/operator/routing/custom — Create a custom routing rule
   DELETE /api/operator/routing/custom — Delete a custom routing rule
   PATCH  /api/operator/routing/custom — Toggle enabled/disabled
   ──────────────────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const ORG_ID = () => process.env.A1NT_ORG_ID ?? "demo-org";

const destToDb: Record<string, string> = {
  "ai-receptionist": "AI_RECEPTIONIST",
  "ai-receptionist-limited": "AI_RECEPTIONIST_LIMITED",
  human: "HUMAN",
  voicemail: "VOICEMAIL",
  "ivr-menu": "IVR_MENU",
  "emergency-only": "EMERGENCY_ONLY",
  "forward-cell": "FORWARD_CELL",
  "forward-employee": "FORWARD_EMPLOYEE",
};

const destFromDb: Record<string, string> = Object.fromEntries(
  Object.entries(destToDb).map(([k, v]) => [v, k])
);

/* ─── POST: Create custom rule ──────────────────────────────────────── */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      match,
      destination,
      forwardTo,
      voicemailMessage,
      expiresAt,
      note = "",
    } = body;

    if (!type || !match || !destination) {
      return NextResponse.json(
        { error: "type, match, and destination are required" },
        { status: 400 }
      );
    }

    const rule = await db.customRoutingRule.create({
      data: {
        organizationId: ORG_ID(),
        type,
        match,
        destination: (destToDb[destination] ?? "AI_RECEPTIONIST") as any,
        forwardTo: forwardTo ?? null,
        voicemailMessage: voicemailMessage ?? null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        note,
      },
    });

    return NextResponse.json({
      success: true,
      rule: {
        id: rule.id,
        type: rule.type,
        match: rule.match,
        destination: destFromDb[rule.destination] ?? "ai-receptionist",
        forwardTo: rule.forwardTo,
        voicemailMessage: rule.voicemailMessage,
        expiresAt: rule.expiresAt?.toISOString() ?? null,
        enabled: rule.enabled,
        note: rule.note,
      },
    });
  } catch (err) {
    console.error("[API] routing/custom POST error:", err);
    return NextResponse.json(
      { error: "Failed to create custom rule" },
      { status: 500 }
    );
  }
}

/* ─── DELETE: Remove custom rule ────────────────────────────────────── */

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id query parameter is required" },
        { status: 400 }
      );
    }

    await db.customRoutingRule.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[API] routing/custom DELETE error:", err);
    return NextResponse.json(
      { error: "Failed to delete custom rule" },
      { status: 500 }
    );
  }
}

/* ─── PATCH: Toggle custom rule ─────────────────────────────────────── */

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, enabled } = body;

    if (!id || typeof enabled !== "boolean") {
      return NextResponse.json(
        { error: "id and enabled (boolean) are required" },
        { status: 400 }
      );
    }

    const updated = await db.customRoutingRule.update({
      where: { id },
      data: { enabled },
    });

    return NextResponse.json({
      success: true,
      rule: {
        id: updated.id,
        type: updated.type,
        match: updated.match,
        destination: destFromDb[updated.destination] ?? "ai-receptionist",
        enabled: updated.enabled,
      },
    });
  } catch (err) {
    console.error("[API] routing/custom PATCH error:", err);
    return NextResponse.json(
      { error: "Failed to toggle custom rule" },
      { status: 500 }
    );
  }
}
