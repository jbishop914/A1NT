/* ─── Service Area API ─────────────────────────────────────────────────
   GET  /api/organization/service-area → current service area config
   POST /api/organization/service-area → save/update service area
   ──────────────────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const ORG_ID = () => process.env.A1NT_ORG_ID ?? "demo-org";

export async function GET() {
  try {
    const org = await db.organization.findUnique({
      where: { id: ORG_ID() },
      select: {
        serviceAreaType: true,
        serviceAreaRadius: true,
        serviceAreaCenter: true,
        serviceAreaPolygon: true,
        address: true,
        city: true,
        state: true,
        zip: true,
        businessHours: true,
      },
    });

    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    return NextResponse.json({
      serviceArea: {
        type: org.serviceAreaType,
        radius: org.serviceAreaRadius,
        center: org.serviceAreaCenter,
        polygon: org.serviceAreaPolygon,
      },
      address: {
        street: org.address,
        city: org.city,
        state: org.state,
        zip: org.zip,
      },
      businessHours: org.businessHours,
    });
  } catch (err) {
    console.error("[service-area/GET]", err);
    return NextResponse.json({ error: "Failed to load" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { serviceArea, businessHours } = body;

    const updateData: Record<string, unknown> = {};

    if (serviceArea) {
      updateData.serviceAreaType = serviceArea.type || null; // "RADIUS" | "POLYGON" | null
      updateData.serviceAreaRadius = serviceArea.radius ?? null;
      updateData.serviceAreaCenter = serviceArea.center ?? null;
      updateData.serviceAreaPolygon = serviceArea.polygon ?? null;
    }

    if (businessHours !== undefined) {
      updateData.businessHours = businessHours;
    }

    const org = await db.organization.update({
      where: { id: ORG_ID() },
      data: updateData,
      select: {
        serviceAreaType: true,
        serviceAreaRadius: true,
        serviceAreaCenter: true,
        serviceAreaPolygon: true,
        businessHours: true,
      },
    });

    return NextResponse.json({ success: true, ...org });
  } catch (err) {
    console.error("[service-area/POST]", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
