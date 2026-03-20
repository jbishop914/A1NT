// Notification Preferences — Per-org configuration of which events trigger messages (email + SMS)
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Default notification events that get seeded for each org
export const DEFAULT_NOTIFICATION_EVENTS = [
  { event: 'invoice.created', description: 'New invoice created and ready for delivery', sendToClient: true, sendToAdmin: true, sendEmail: true, sendSms: false },
  { event: 'invoice.paid', description: 'Invoice payment received', sendToClient: true, sendToAdmin: true, sendEmail: true, sendSms: false },
  { event: 'invoice.overdue', description: 'Invoice past due reminder', sendToClient: true, sendToAdmin: true, sendEmail: true, sendSms: true },
  { event: 'booking.confirmed', description: 'Booking confirmed with customer', sendToClient: true, sendToAdmin: false, sendEmail: true, sendSms: true },
  { event: 'booking.reminder', description: 'Upcoming appointment reminder (24h before)', sendToClient: true, sendToAdmin: false, sendEmail: true, sendSms: true },
  { event: 'booking.cancelled', description: 'Booking cancellation notification', sendToClient: true, sendToAdmin: true, sendEmail: true, sendSms: false },
  { event: 'workorder.assigned', description: 'Work order assigned to technician', sendToClient: false, sendToAdmin: false, sendToAssignee: true, sendEmail: true, sendSms: true },
  { event: 'workorder.completed', description: 'Work order marked complete', sendToClient: true, sendToAdmin: true, sendEmail: true, sendSms: false },
  { event: 'estimate.sent', description: 'Estimate/quote sent to customer', sendToClient: true, sendToAdmin: false, sendEmail: true, sendSms: false },
  { event: 'estimate.approved', description: 'Customer approved estimate', sendToClient: false, sendToAdmin: true, sendEmail: true, sendSms: true },
  { event: 'payment.received', description: 'Payment received confirmation', sendToClient: true, sendToAdmin: true, sendEmail: true, sendSms: false },
  { event: 'payment.refunded', description: 'Refund processed notification', sendToClient: true, sendToAdmin: true, sendEmail: true, sendSms: false },
  { event: 'welcome.new_client', description: 'Welcome message for new clients', sendToClient: true, sendToAdmin: false, sendEmail: true, sendSms: true },
  { event: 'reminder.annual_service', description: 'Annual service reminder', sendToClient: true, sendToAdmin: false, sendEmail: true, sendSms: true },
  { event: 'reminder.follow_up', description: 'Post-service follow-up', sendToClient: true, sendToAdmin: false, sendEmail: true, sendSms: false },
];

// GET /api/email/preferences?organizationId=xxx
export async function GET(request: NextRequest) {
  try {
    const orgId = request.nextUrl.searchParams.get('organizationId');
    if (!orgId) {
      return NextResponse.json({ error: 'organizationId required' }, { status: 400 });
    }

    let prefs = await db.notificationPreference.findMany({
      where: { organizationId: orgId },
      orderBy: { event: 'asc' },
    });

    // Auto-seed defaults if none exist
    if (prefs.length === 0) {
      await db.notificationPreference.createMany({
        data: DEFAULT_NOTIFICATION_EVENTS.map((e) => ({
          organizationId: orgId,
          event: e.event,
          description: e.description,
          isEnabled: true,
          sendToClient: e.sendToClient,
          sendToAdmin: e.sendToAdmin ?? false,
          sendToAssignee: (e as any).sendToAssignee ?? false,
          sendEmail: e.sendEmail ?? true,
          sendSms: e.sendSms ?? false,
        })),
      });

      prefs = await db.notificationPreference.findMany({
        where: { organizationId: orgId },
        orderBy: { event: 'asc' },
      });
    }

    return NextResponse.json(prefs);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/email/preferences — Update a notification preference
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      isEnabled,
      sendToClient,
      sendToAdmin,
      sendToAssignee,
      sendEmail,
      sendSms,
      emailTemplateId,
      smsTemplateId,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Preference id required' }, { status: 400 });
    }

    const pref = await db.notificationPreference.update({
      where: { id },
      data: {
        ...(isEnabled !== undefined && { isEnabled }),
        ...(sendToClient !== undefined && { sendToClient }),
        ...(sendToAdmin !== undefined && { sendToAdmin }),
        ...(sendToAssignee !== undefined && { sendToAssignee }),
        ...(sendEmail !== undefined && { sendEmail }),
        ...(sendSms !== undefined && { sendSms }),
        ...(emailTemplateId !== undefined && { emailTemplateId }),
        ...(smsTemplateId !== undefined && { smsTemplateId }),
      },
    });

    return NextResponse.json(pref);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/email/preferences — Bulk update preferences
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { preferences } = body;

    if (!Array.isArray(preferences)) {
      return NextResponse.json({ error: 'preferences array required' }, { status: 400 });
    }

    const results = await Promise.all(
      preferences.map((p: any) =>
        db.notificationPreference.update({
          where: { id: p.id },
          data: {
            isEnabled: p.isEnabled,
            sendToClient: p.sendToClient,
            sendToAdmin: p.sendToAdmin,
            sendToAssignee: p.sendToAssignee,
            sendEmail: p.sendEmail,
            sendSms: p.sendSms,
          },
        })
      )
    );

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
