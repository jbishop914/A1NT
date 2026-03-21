// Resend Webhook Handler — Delivery tracking + Inbound email receiving
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { ingestMessage } from '@/lib/messages/ingest';
import { getResendClient } from '@/lib/resend';

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
    // Inbound-specific fields
    cc?: string[];
    bcc?: string[];
    reply_to?: string[];
    message_id?: string;
    attachments?: Array<{
      id: string;
      filename: string;
      content_type: string;
    }>;
    // Outbound-specific fields
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

// POST /api/email/webhooks — Resend sends delivery events + inbound emails here
export async function POST(request: NextRequest) {
  try {
    const event: ResendWebhookEvent = await request.json();
    const { type, data } = event;
    const resendEmailId = data.email_id;

    // ─── Handle inbound emails (email.received) ──────────────────────
    // This is a completely separate flow from outbound delivery tracking.
    // Inbound emails don't have an existing EmailLog — they're new messages
    // from external senders arriving at our domain.
    if (type === 'email.received') {
      console.log(`[Email] Inbound email received: ${resendEmailId} from ${data.from} — ${data.subject}`);

      // Fetch the full email content from Resend Receiving API
      // (Webhook only includes metadata, not the body)
      let emailBody = '';
      let emailText = '';
      try {
        const resend = getResendClient();
        const { data: fullEmail } = await (resend.emails as any).receiving.get(resendEmailId);
        if (fullEmail) {
          emailText = fullEmail.text || '';
          emailBody = fullEmail.text || fullEmail.html || '';
          // Strip HTML tags for plain text preview if only HTML available
          if (!fullEmail.text && fullEmail.html) {
            emailBody = fullEmail.html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
          }
        }
      } catch (fetchErr) {
        console.warn(`[Email] Could not fetch full email content for ${resendEmailId}:`, fetchErr);
        emailBody = `[Email received: ${data.subject}]`;
      }

      // Parse sender info — Resend "from" format is "Name <email@example.com>" or just "email@example.com"
      const fromMatch = data.from.match(/^(.+?)\s*<(.+?)>$/);
      const senderName = fromMatch ? fromMatch[1].trim().replace(/^"|"$/g, '') : data.from;
      const senderEmail = fromMatch ? fromMatch[2] : data.from;

      // Determine org — for now use env default. In production, resolve from the "to" address.
      const orgId = process.env.A1NT_ORG_ID ?? 'demo-org';

      // Try to resolve contact name from CRM
      let contactName = senderName;
      try {
        const client = await db.client.findFirst({
          where: { organizationId: orgId, email: senderEmail },
          select: { name: true },
        });
        if (client) contactName = client.name;
      } catch { /* ignore */ }

      // Create an EmailLog for the inbound email
      const emailLog = await db.emailLog.create({
        data: {
          organizationId: orgId,
          type: 'TRANSACTIONAL' as any,
          status: 'DELIVERED' as any,
          fromAddress: data.from,
          toAddresses: data.to,
          subject: data.subject,
          resendEmailId,
          sentAt: new Date(data.created_at),
          deliveredAt: new Date(data.created_at),
        },
      });

      // Ingest into Messages thread
      try {
        await ingestMessage({
          channel: 'EMAIL',
          direction: 'INBOUND',
          contactName,
          contactEmail: senderEmail,
          body: emailBody || `[Email: ${data.subject}]`,
          preview: (emailBody || data.subject).substring(0, 120),
          subject: data.subject,
          sourceId: emailLog.id,
          sourceType: 'EmailLog',
          organizationId: orgId,
        });
        console.log(`[Email] Inbound email ingested into Messages thread: ${senderEmail} — ${data.subject}`);
      } catch (ingestErr) {
        console.error('[Email] Failed to ingest inbound email:', ingestErr);
      }

      // Log activity
      await db.activityLog.create({
        data: {
          organizationId: orgId,
          action: 'email.received',
          entityType: 'EmailLog',
          entityId: emailLog.id,
          metadata: {
            resendEmailId,
            from: data.from,
            to: data.to,
            subject: data.subject,
            attachmentCount: data.attachments?.length ?? 0,
          },
        },
      });

      return NextResponse.json({ received: true });
    }

    // ─── Handle outbound delivery events ──────────────────────────────
    // Everything below is for tracking emails WE sent (delivery, opens, bounces, etc.)

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
