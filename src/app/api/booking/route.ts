/* ─── Booking API ──────────────────────────────────────────────────────
   GET  /api/booking?orgId=X&date=YYYY-MM-DD&type=ESTIMATE
        → available time slots for a given date + booking type
   POST /api/booking
        → create a new booking (public, no auth required)
   ──────────────────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isInServiceArea } from "@/lib/geo";

/* ── GET: Available time slots ─────────────────────────────────────── */

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const orgId = searchParams.get("orgId");
  const dateStr = searchParams.get("date"); // YYYY-MM-DD
  const typeStr = searchParams.get("type"); // ESTIMATE, FOLLOW_UP, etc.

  if (!orgId || !dateStr) {
    return NextResponse.json(
      { error: "orgId and date are required" },
      { status: 400 }
    );
  }

  try {
    // Get org with business hours
    const org = await db.organization.findUnique({
      where: { id: orgId },
      select: { businessHours: true },
    });
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Get booking type for duration
    let durationMinutes = 60; // default
    if (typeStr) {
      const bookingType = await db.bookingType.findUnique({
        where: { organizationId_type: { organizationId: orgId, type: typeStr as any } },
        select: { durationMinutes: true, isActive: true },
      });
      if (bookingType?.isActive) {
        durationMinutes = bookingType.durationMinutes;
      }
    }

    // Parse the date
    const date = new Date(dateStr + "T00:00:00");
    const dayNames = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const dayName = dayNames[date.getDay()].toLowerCase();

    // Get business hours for this day
    const hours = org.businessHours as Record<string, { open: string; close: string }> | null;
    const dayHours = hours?.[dayName];
    if (!dayHours) {
      return NextResponse.json({ slots: [], message: "Closed on this day" });
    }

    const [openH, openM] = dayHours.open.split(":").map(Number);
    const [closeH, closeM] = dayHours.close.split(":").map(Number);

    // Get existing events for this day to block out occupied slots
    const dayStart = new Date(dateStr + "T00:00:00");
    const dayEnd = new Date(dateStr + "T23:59:59");

    const existingEvents = await db.scheduleEvent.findMany({
      where: {
        organizationId: orgId,
        isCancelled: false,
        startTime: { gte: dayStart },
        endTime: { lte: dayEnd },
      },
      select: { startTime: true, endTime: true },
    });

    // Also check existing bookings that aren't cancelled
    const existingBookings = await db.booking.findMany({
      where: {
        organizationId: orgId,
        requestedDate: { gte: dayStart, lte: dayEnd },
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
      },
      select: { requestedDate: true, endTime: true },
    });

    // Build occupied ranges
    const occupied: { start: number; end: number }[] = [];
    for (const ev of existingEvents) {
      occupied.push({
        start: ev.startTime.getTime(),
        end: ev.endTime.getTime(),
      });
    }
    for (const bk of existingBookings) {
      if (bk.endTime) {
        occupied.push({
          start: bk.requestedDate.getTime(),
          end: bk.endTime.getTime(),
        });
      }
    }

    // Generate available slots (30-min intervals)
    const slots: { time: string; available: boolean }[] = [];
    const slotInterval = 30; // minutes
    const now = Date.now();

    for (let h = openH; h < closeH || (h === closeH && 0 < closeM); h++) {
      for (let m = h === openH ? openM : 0; m < 60; m += slotInterval) {
        if (h === closeH && m >= closeM) break;
        // Check if there's enough time before close
        const slotStart = new Date(dateStr);
        slotStart.setHours(h, m, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000);

        const closeTime = new Date(dateStr);
        closeTime.setHours(closeH, closeM, 0, 0);
        if (slotEnd > closeTime) continue;

        // Don't show past slots
        if (slotStart.getTime() < now) continue;

        // Check against occupied ranges
        const slotStartMs = slotStart.getTime();
        const slotEndMs = slotEnd.getTime();
        const isOccupied = occupied.some(
          (occ) => slotStartMs < occ.end && slotEndMs > occ.start
        );

        slots.push({
          time: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
          available: !isOccupied,
        });
      }
    }

    return NextResponse.json({ slots, durationMinutes, date: dateStr });
  } catch (err) {
    console.error("[booking/availability]", err);
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}

/* ── POST: Create booking ──────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orgId,
      customerName,
      customerPhone,
      customerEmail,
      serviceAddress,
      serviceCity,
      serviceState,
      serviceZip,
      bookingType, // "ESTIMATE", "FOLLOW_UP", etc.
      requestedDate, // ISO string
      description,
      source = "widget",
      widgetTheme,
      referrer,
    } = body;

    if (!orgId || !customerName || !customerPhone || !serviceAddress || !bookingType || !requestedDate) {
      return NextResponse.json(
        { error: "Missing required fields: orgId, customerName, customerPhone, serviceAddress, bookingType, requestedDate" },
        { status: 400 }
      );
    }

    // Get org + service area
    const org = await db.organization.findUnique({
      where: { id: orgId },
      select: {
        id: true,
        serviceAreaType: true,
        serviceAreaRadius: true,
        serviceAreaCenter: true,
        serviceAreaPolygon: true,
      },
    });
    if (!org) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    // Get booking type record for duration
    const bookingTypeRecord = await db.bookingType.findUnique({
      where: {
        organizationId_type: { organizationId: orgId, type: bookingType },
      },
    });
    if (!bookingTypeRecord || !bookingTypeRecord.isActive) {
      return NextResponse.json(
        { error: "Invalid or inactive booking type" },
        { status: 400 }
      );
    }

    // Geocode address (via Mapbox) for service area check
    let serviceLat: number | null = null;
    let serviceLng: number | null = null;
    let inServiceArea = true;

    const fullAddress = [serviceAddress, serviceCity, serviceState, serviceZip]
      .filter(Boolean)
      .join(", ");

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (mapboxToken && fullAddress) {
      try {
        const geoRes = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullAddress)}.json?access_token=${mapboxToken}&limit=1`
        );
        const geoData = await geoRes.json();
        if (geoData.features?.[0]?.center) {
          const [lng, lat] = geoData.features[0].center;
          serviceLat = lat;
          serviceLng = lng;

          // Check service area
          if (org.serviceAreaType) {
            inServiceArea = isInServiceArea(
              { lat, lng },
              {
                type: org.serviceAreaType as "RADIUS" | "POLYGON",
                radius: org.serviceAreaRadius,
                center: org.serviceAreaCenter as { lat: number; lng: number } | null,
                polygon: org.serviceAreaPolygon as [number, number][] | null,
              }
            );
          }
        }
      } catch (geoErr) {
        console.error("[booking] Geocoding failed:", geoErr);
        // Continue without geo — don't block booking
      }
    }

    // Calculate end time
    const startDate = new Date(requestedDate);
    const endDate = new Date(
      startDate.getTime() + bookingTypeRecord.durationMinutes * 60000
    );

    // Create booking
    const booking = await db.booking.create({
      data: {
        organizationId: orgId,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        serviceAddress,
        serviceCity: serviceCity || null,
        serviceState: serviceState || null,
        serviceZip: serviceZip || null,
        serviceLat,
        serviceLng,
        bookingTypeId: bookingTypeRecord.id,
        requestedDate: startDate,
        endTime: endDate,
        description: description || null,
        status: inServiceArea ? "PENDING" : "PENDING",
        source,
        widgetTheme: widgetTheme || null,
        referrer: referrer || null,
      },
    });

    // If outside service area, create a flag
    if (!inServiceArea) {
      await db.bookingFlag.create({
        data: {
          organizationId: orgId,
          bookingId: booking.id,
          flagType: "out-of-service-area",
          description: `Address "${fullAddress}" is outside the defined service area.`,
          serviceAddress: fullAddress,
        },
      });

      return NextResponse.json({
        success: false,
        outOfServiceArea: true,
        message:
          "The address you entered is outside of our normal service area. Please call the office if you need further assistance. Thank you.",
        bookingId: booking.id,
      });
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      requestedDate: startDate.toISOString(),
      endTime: endDate.toISOString(),
      durationMinutes: bookingTypeRecord.durationMinutes,
      status: "PENDING",
      message: "Your appointment request has been submitted! We'll confirm shortly.",
    });
  } catch (err) {
    console.error("[booking/create]", err);
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
