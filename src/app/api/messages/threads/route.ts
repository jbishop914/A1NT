/* ─── Threads List API ──────────────────────────────────────────────────────
   GET /api/messages/threads

   Returns message threads for an organization, sorted by lastMessageAt desc.
   Query params:
     - orgId: organization ID (required)
     - filter: "phone" | "sms" | "email" (optional channel filter)
     - search: search term for contact name/phone/email (optional)
     - employeeId: include read status for this employee (optional)
     - limit: max threads (default 50)
   ──────────────────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { MessageChannel } from "@/generated/prisma/client";

export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const orgId = url.searchParams.get("orgId") || process.env.NEXT_PUBLIC_A1NT_ORG_ID || "demo-org";
    const filter = url.searchParams.get("filter")?.toUpperCase() as MessageChannel | undefined;
    const search = url.searchParams.get("search") || "";
    const employeeId = url.searchParams.get("employeeId") || "";
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50", 10), 200);

    const where: Record<string, unknown> = { organizationId: orgId };

    if (filter && ["PHONE", "SMS", "EMAIL"].includes(filter)) {
      where.channel = filter;
    }

    if (search) {
      where.OR = [
        { contactName: { contains: search, mode: "insensitive" } },
        { contactPhone: { contains: search } },
        { contactEmail: { contains: search, mode: "insensitive" } },
      ];
    }

    const threads = await (db.messageThread as any).findMany({
      where,
      orderBy: { lastMessageAt: "desc" },
      take: limit,
      include: {
        readStatuses: employeeId
          ? { where: { employeeId } }
          : false,
        messages: {
          orderBy: { createdAt: "desc" as const },
          take: 1,
          select: {
            id: true,
            channel: true,
            direction: true,
            body: true,
            preview: true,
            createdAt: true,
            hasVoicemail: true,
          },
        },
      },
    });

    const formatted = threads.map((t: any) => ({
      id: t.id,
      contactName: t.contactName,
      contactPhone: t.contactPhone,
      contactEmail: t.contactEmail,
      channel: t.channel,
      subject: t.subject,
      preview: t.preview,
      lastMessageAt: t.lastMessageAt,
      messageCount: t.messageCount,
      readStatus: t.readStatuses?.[0]?.status || "UNREAD",
      latestMessage: t.messages?.[0] || null,
      createdAt: t.createdAt,
    }));

    return NextResponse.json({ threads: formatted });
  } catch (error) {
    console.error("[messages/threads] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch threads" },
      { status: 500 }
    );
  }
}
