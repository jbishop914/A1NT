// SMS Delivery Status Webhook — Twilio sends status updates here
// Twilio POSTs to this URL when message status changes (sent → delivered → failed)
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import twilio from 'twilio';

// POST /api/sms/webhooks — Called by Twilio on delivery status changes
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    // Extract Twilio webhook fields
    const messageSid = formData.get('MessageSid') as string;
    const messageStatus = formData.get('MessageStatus') as string;
    const errorCode = formData.get('ErrorCode') as string | null;
    const errorMessage = formData.get('ErrorMessage') as string | null;

    if (!messageSid || !messageStatus) {
      return NextResponse.json({ error: 'Missing MessageSid or MessageStatus' }, { status: 400 });
    }

    // Validate the request is from Twilio (signature verification)
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (authToken) {
      const twilioSignature = request.headers.get('x-twilio-signature') || '';
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://a1ntegrel.vercel.app';
      const webhookUrl = `${appUrl}/api/sms/webhooks`;

      // Convert FormData to params object for validation
      const params: Record<string, string> = {};
      formData.forEach((value, key) => {
        params[key] = value.toString();
      });

      const isValid = twilio.validateRequest(authToken, twilioSignature, webhookUrl, params);
      if (!isValid) {
        console.warn('Invalid Twilio signature for SMS webhook');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
      }
    }

    // Map Twilio status to our SmsLogStatus enum
    const statusMap: Record<string, string> = {
      queued: 'QUEUED',
      sent: 'SENT',
      delivered: 'DELIVERED',
      undelivered: 'UNDELIVERED',
      failed: 'FAILED',
    };

    const dbStatus = statusMap[messageStatus.toLowerCase()];
    if (!dbStatus) {
      // Ignore intermediate statuses (sending, receiving, etc.)
      return new NextResponse('OK', { status: 200 });
    }

    // Find and update the SMS log entry
    const smsLog = await db.smsLog.findFirst({
      where: { twilioMessageSid: messageSid },
    });

    if (!smsLog) {
      console.warn(`SMS log not found for SID: ${messageSid}`);
      return new NextResponse('OK', { status: 200 });
    }

    // Build update data
    const updateData: any = {
      status: dbStatus,
    };

    if (dbStatus === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    if (dbStatus === 'FAILED' || dbStatus === 'UNDELIVERED') {
      updateData.errorCode = errorCode || null;
      updateData.errorMessage = errorMessage || `Message ${messageStatus}`;
    }

    // Extract price if available
    const price = formData.get('Price') as string | null;
    if (price) {
      // Twilio price is negative (cost), in USD — convert to cents
      const priceCents = Math.abs(parseFloat(price) * 100);
      if (!isNaN(priceCents)) {
        updateData.priceCents = Math.round(priceCents);
      }
    }

    await db.smsLog.update({
      where: { id: smsLog.id },
      data: updateData,
    });

    // Update campaign stats if this SMS was part of a campaign
    if (smsLog.campaignId) {
      if (dbStatus === 'DELIVERED') {
        await db.emailCampaign.update({
          where: { id: smsLog.campaignId },
          data: { totalSmsDelivered: { increment: 1 } },
        });
      } else if (dbStatus === 'FAILED' || dbStatus === 'UNDELIVERED') {
        await db.emailCampaign.update({
          where: { id: smsLog.campaignId },
          data: { totalSmsFailed: { increment: 1 } },
        });
      }
    }

    // Twilio expects a 200 response
    return new NextResponse('OK', { status: 200 });
  } catch (error: any) {
    console.error('SMS webhook error:', error);
    return new NextResponse('OK', { status: 200 }); // Still 200 to prevent retries
  }
}
