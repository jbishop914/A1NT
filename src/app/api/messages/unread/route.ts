/* ─── Unread Counts API ────────────────────────────────────────────────────
   GET /api/messages/unread

   Returns unread/read/resolved counts for an employee.
   Query params:
     - orgId: organization ID
     - employeeId: employee to check status for
   ──────────────────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const orgId = url.searchParams.get("orgId") || process.env.NEXT_PUBLIC_A1NT_ORG_ID || "demo-org";
    const employeeId = url.searchParams.get("employeeId") || "";

    if (!employeeId) {
      // If no employeeId, count threads by org that have no read status
      const totalThreads = await (db.messageThread as any).count({
        where: { organizationId: orgId },
      });

      return NextResponse.json({
        unread: totalThreads,
        read: 0,
        resolved: 0,
        total: totalThreads,
      });
    }

    const [unread, read, resolved] = await Promise.all([
      (db.messageReadStatus as any).count({
        where: {
          employeeId,
          status: "UNREAD",
          thread: { organizationId: orgId },
        },
      }),
      (db.messageReadStatus as any).count({
        where: {
          employeeId,
          status: "READ",
          thread: { organizationId: orgId },
        },
      }),
      (db.messageReadStatus as any).count({
        where: {
          employeeId,
          status: "RESOLVED",
          thread: { organizationId: orgId },
        },
      }),
    ]);

    return NextResponse.json({
      unread,
      read,
      resolved,
      total: unread + read + resolved,
    });
  } catch (error) {
    console.error("[messages/unread] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch unread counts" },
      { status: 500 }
    );
  }
}
