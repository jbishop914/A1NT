// SMS Sending API — Send transactional and ad-hoc text messages
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ingestMessage } from '@/lib/messages/ingest';
import {
  sendSms,
  getPlatformSmsNumber,
  normalizePhoneNumber,
  calculateSegments,
  interpolateSmsTemplate,
} from '@/lib/twilio-sms';

// POST /api/sms/send
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      organizationId,
      to,
      message,
      templateId,
      templateVariables,
      triggerEvent,
      entityType,
      entityId,
      campaignId,
    } = body;

    if (!organizationId || !to) {
      return NextResponse.json(
        { error: 'organizationId and to (phone number) are required' },
        { status: 400 }
      );
    }

    // Normalize phone number
    const normalizedTo = normalizePhoneNumber(to);
    if (!normalizedTo) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Resolve message body
    let smsBody = message;

    if (templateId) {
      const template = await db.smsTemplate.findUnique({ where: { id: templateId } });
      if (template) {
        smsBody = interpolateSmsTemplate(template.body, templateVariables || {});
      }
    }

    if (!smsBody) {
      return NextResponse.json({ error: 'Message body required (provide message or templateId)' }, { status: 400 });
    }

    const fromNumber = getPlatformSmsNumber();
    const segments = calculateSegments(smsBody);

    // Create SMS log entry (QUEUED)
    const smsLog = await db.smsLog.create({
      data: {
        organizationId,
        status: 'QUEUED',
        fromNumber,
        toNumber: normalizedTo,
        body: smsBody,
        segmentCount: segments,
        templateId,
        campaignId,
        triggerEvent,
        entityType,
        entityId,
      },
    });

    try {
      // Send via Twilio
      const result = await sendSms({
        to: normalizedTo,
        body: smsBody,
        from: fromNumber,
      });

      // Update log with Twilio SID + SENT status
      const updated = await db.smsLog.update({
        where: { id: smsLog.id },
        data: {
          twilioMessageSid: result.messageSid,
          status: 'SENT',
          sentAt: new Date(),
          segmentCount: result.segmentCount,
        },
      });

      // Ingest outbound SMS into Unified Messages
      try {
        let contactName = normalizedTo;
        const client = await db.client.findFirst({
          where: {
            organizationId,
            phone: { contains: normalizedTo.replace('+1', '').replace('+', '') },
          },
          select: { name: true },
        });
        if (client) contactName = client.name;

        await ingestMessage({
          channel: 'SMS',
          direction: 'OUTBOUND',
          contactName,
          contactPhone: normalizedTo,
          body: smsBody,
          preview: smsBody.substring(0, 120),
          sourceId: updated.id,
          sourceType: 'SmsLog',
          organizationId,
        });
      } catch (ingestErr) {
        console.log('[SMS Send] Could not ingest into Messages:', ingestErr);
      }

      return NextResponse.json({
        success: true,
        smsLogId: updated.id,
        messageSid: result.messageSid,
        segments: result.segmentCount,
      });
    } catch (sendError: any) {
      // Mark as failed
      await db.smsLog.update({
        where: { id: smsLog.id },
        data: {
          status: 'FAILED',
          errorMessage: sendError.message,
          errorCode: sendError.code?.toString(),
        },
      });

      return NextResponse.json(
        { error: `Failed to send SMS: ${sendError.message}`, smsLogId: smsLog.id },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('SMS send error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
