/* ─── Operator Routing Rules API ───────────────────────────────────────────
   PATCH /api/operator/routing/rules — Toggle rule enabled/disabled
   ──────────────────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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

    const updated = await db.routingRule.update({
      where: { id },
      data: { enabled },
    });

    return NextResponse.json({ success: true, rule: updated });
  } catch (err) {
    console.error("[API] routing/rules PATCH error:", err);
    return NextResponse.json(
      { error: "Failed to update rule" },
      { status: 500 }
    );
  }
}
