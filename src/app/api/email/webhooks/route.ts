// Resend Webhook Handler — Delivery tracking (delivered, opened, bounced, complained)
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ingestMessage } from '@/lib/messages/ingest';

// Resend webhook event types we handle
type ResendWebhookEvent = {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    bounce?: {
      message: string;
      subType: string;
      type: string; // "Permanent" | "Transient"
    };
    click?: {
      ipAddress: string;
      link: string;
      timestamp: string;
      userAgent: string;
    };
    tags?: Record<string, string>;
  };
};

// POST /api/email/webhooks — Resend sends delivery events here
export async function POST(request: NextRequest) {
  try {
    const event: ResendWebhookEvent = await request.json();
    const { type, data } = event;
    const resendEmailId = data.email_id;

    if (!resendEmailId) {
      return NextResponse.json({ received: true });
    }

    // Find the email log by Resend email ID
    const emailLog = await db.emailLog.findFirst({
      where: { resendEmailId },
    });

    if (!emailLog) {
      // Email not tracked by us (could be from Resend dashboard sends)
      console.warn(`Webhook received for unknown email: ${resendEmailId}`);
      return NextResponse.json({ received: true });
    }

    // Update email log based on event type
    switch (type) {
      case 'email.sent':
        await db.emailLog.update({
          where: { id: emailLog.id },
          data: { status: 'SENT', sentAt: new Date(event.created_at) },
        });
        break;

      case 'email.delivered':
        await db.emailLog.update({
          where: { id: emailLog.id },
          data: { status: 'DELIVERED', deliveredAt: new Date(event.created_at) },
        });
        // Update campaign stats if applicable
        if (emailLog.campaignId) {
          await db.emailCampaign.update({
            where: { id: emailLog.campaignId },
            data: { totalDelivered: { increment: 1 } },
          });
        }
        // Ingest into Unified Messages
        try {
          const toAddress = data.to?.[0] || '';
          let contactName = toAddress;
          const client = await db.client.findFirst({
            where: {
              organizationId: emailLog.organizationId,
              email: toAddress,
            },
            select: { name: true },
          });
          if (client) contactName = client.name;

          await ingestMessage({
            channel: 'EMAIL',
            direction: 'OUTBOUND',
            contactEmail: toAddress,
            contactName,
            body: data.subject || emailLog.subject || 'No subject',
            subject: data.subject || emailLog.subject || undefined,
            sourceId: emailLog.id,
            sourceType: 'EmailLog',
            organizationId: emailLog.organizationId,
          });
        } catch (ingestErr) {
          console.log('[Email Webhook] Could not ingest into Messages:', ingestErr);
        }
        break;

      case 'email.opened':
        await db.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: 'OPENED',
            openedAt: emailLog.openedAt || new Date(event.created_at), // First open only
          },
        });
        if (emailLog.campaignId) {
          // Only increment if first open
          if (!emailLog.openedAt) {
            await db.emailCampaign.update({
              where: { id: emailLog.campaignId },
              data: { totalOpened: { increment: 1 } },
            });
          }
        }
        break;

      case 'email.clicked':
        await db.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: 'CLICKED',
            clickedAt: emailLog.clickedAt || new Date(event.created_at),
          },
        });
        if (emailLog.campaignId && !emailLog.clickedAt) {
          await db.emailCampaign.update({
            where: { id: emailLog.campaignId },
            data: { totalClicked: { increment: 1 } },
          });
        }
        break;

      case 'email.bounced':
        await db.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: 'BOUNCED',
            bouncedAt: new Date(event.created_at),
            bounceType: data.bounce?.type || 'Unknown',
            bounceMessage: data.bounce?.message || 'No details provided',
          },
        });
        if (emailLog.campaignId) {
          await db.emailCampaign.update({
            where: { id: emailLog.campaignId },
            data: { totalBounced: { increment: 1 } },
          });
        }

        // Auto-unsubscribe on permanent bounce
        if (data.bounce?.type === 'Permanent' && data.to?.[0]) {
          const toAddress = data.to[0];
          await db.emailContact.updateMany({
            where: {
              organizationId: emailLog.organizationId,
              email: toAddress,
              isSubscribed: true,
            },
            data: {
              isSubscribed: false,
              unsubscribedAt: new Date(),
              unsubscribeReason: `Permanent bounce: ${data.bounce.message}`,
            },
          });
        }
        break;

      case 'email.complained':
        await db.emailLog.update({
          where: { id: emailLog.id },
          data: {
            status: 'COMPLAINED',
            complainedAt: new Date(event.created_at),
          },
        });
        if (emailLog.campaignId) {
          await db.emailCampaign.update({
            where: { id: emailLog.campaignId },
            data: { totalComplaints: { increment: 1 } },
          });
        }

        // Auto-unsubscribe on complaint
        if (data.to?.[0]) {
          await db.emailContact.updateMany({
            where: {
              organizationId: emailLog.organizationId,
              email: data.to[0],
              isSubscribed: true,
            },
            data: {
              isSubscribed: false,
              unsubscribedAt: new Date(),
              unsubscribeReason: 'Spam complaint reported',
            },
          });
        }
        break;

      default:
        console.log(`Unhandled webhook event type: ${type}`);
    }

    // Log activity
    await db.activityLog.create({
      data: {
        organizationId: emailLog.organizationId,
        action: `email.${type.replace('email.', '')}`,
        entityType: 'EmailLog',
        entityId: emailLog.id,
        metadata: {
          resendEmailId,
          eventType: type,
          to: data.to,
          subject: data.subject,
        },
      },
    });

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    // Always return 200 to Resend to prevent retries on our processing errors
    return NextResponse.json({ received: true, error: error.message });
  }
}
