/* ─── Booking Widget Config ────────────────────────────────────────────
   GET /api/booking/config?orgId=X
   → Public endpoint returning org name, booking types, business hours,
     service area, and widget theming for the embedded widget.
   ──────────────────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const orgId = req.nextUrl.searchParams.get("orgId");
  if (!orgId) {
    return NextResponse.json({ error: "orgId required" }, { status: 400 });
  }

  try {
    const org = await db.organization.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        address: true,
        city: true,
        state: true,
        zip: true,
        description: true,
        businessHours: true,
        serviceAreaType: true,
        serviceAreaRadius: true,
        serviceAreaCenter: true,
        serviceAreaPolygon: true,
      },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Get active booking types
    const bookingTypes = await db.bookingType.findMany({
      where: { organizationId: orgId, isActive: true },
      select: {
        id: true,
        type: true,
        label: true,
        durationMinutes: true,
        description: true,
        sortOrder: true,
      },
      orderBy: { sortOrder: "asc" },
    });

    // CORS headers for cross-origin widget embedding
    const response = NextResponse.json({
      org: {
        id: org.id,
        name: org.name,
        phone: org.phone,
        email: org.email,
        address: org.address,
        city: org.city,
        state: org.state,
        zip: org.zip,
        description: org.description,
      },
      bookingTypes,
      businessHours: org.businessHours,
      serviceArea: {
        type: org.serviceAreaType,
        radius: org.serviceAreaRadius,
        center: org.serviceAreaCenter,
        polygon: org.serviceAreaPolygon,
      },
      bookingWindowDays: 30,
    });

    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    return response;
  } catch (err) {
    console.error("[booking/config]", err);
    return NextResponse.json({ error: "Failed to load config" }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
