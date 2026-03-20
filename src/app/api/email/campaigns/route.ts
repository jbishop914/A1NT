// Campaign CRUD + Send — Email, SMS, or Both
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail, formatFromAddress, getPlatformFromAddress } from '@/lib/resend';
import { sendBulkSms, normalizePhoneNumber, interpolateSmsTemplate, getPlatformSmsNumber } from '@/lib/twilio-sms';

// GET /api/email/campaigns?organizationId=xxx
export async function GET(request: NextRequest) {
  try {
    const orgId = request.nextUrl.searchParams.get('organizationId');
    if (!orgId) {
      return NextResponse.json({ error: 'organizationId required' }, { status: 400 });
    }

    const campaigns = await db.emailCampaign.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { emailLogs: true, smsLogs: true } },
      },
    });

    return NextResponse.json(campaigns);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/email/campaigns — Create or send a campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      organizationId,
      name,
      subject,
      fromName,
      fromEmail,
      replyTo,
      bodyHtml,
      emailTemplateId,
      // SMS fields
      channel,       // EMAIL | SMS | BOTH
      smsBody,
      smsTemplateId,
      // Shared
      audienceFilter,
      scheduledAt,
      action,        // "create" | "send"
      campaignId,    // for "send" action
    } = body;

    // SEND an existing campaign
    if (action === 'send' && campaignId) {
      return await sendCampaign(campaignId);
    }

    // CREATE a new campaign (draft)
    const campaignChannel = channel || 'EMAIL';

    // Validate: EMAIL/BOTH needs subject, SMS/BOTH needs smsBody
    if ((campaignChannel === 'EMAIL' || campaignChannel === 'BOTH') && !subject) {
      return NextResponse.json(
        { error: 'Subject is required for email campaigns' },
        { status: 400 }
      );
    }
    if ((campaignChannel === 'SMS' || campaignChannel === 'BOTH') && !smsBody && !smsTemplateId) {
      return NextResponse.json(
        { error: 'SMS body or SMS template is required for SMS campaigns' },
        { status: 400 }
      );
    }

    if (!organizationId || !name) {
      return NextResponse.json(
        { error: 'organizationId and name are required' },
        { status: 400 }
      );
    }

    const campaign = await db.emailCampaign.create({
      data: {
        organizationId,
        name,
        subject: subject || null,
        fromName,
        fromEmail,
        replyTo,
        bodyHtml,
        emailTemplateId,
        channel: campaignChannel,
        smsBody,
        smsTemplateId,
        audienceFilter: audienceFilter || undefined,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
        status: scheduledAt ? 'SCHEDULED' : 'DRAFT',
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error: any) {
    console.error('Campaign error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/email/campaigns — Update campaign details
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Campaign id required' }, { status: 400 });
    }

    const campaign = await db.emailCampaign.findUnique({ where: { id } });
    if (!campaign || (campaign.status !== 'DRAFT' && campaign.status !== 'SCHEDULED')) {
      return NextResponse.json({ error: 'Can only edit draft/scheduled campaigns' }, { status: 400 });
    }

    if (updates.scheduledAt) {
      updates.scheduledAt = new Date(updates.scheduledAt);
    }

    const updated = await db.emailCampaign.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/email/campaigns?id=xxx — Cancel/delete a campaign
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Campaign id required' }, { status: 400 });
    }

    const campaign = await db.emailCampaign.findUnique({ where: { id } });
    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    if (campaign.status === 'DRAFT' || campaign.status === 'SCHEDULED') {
      await db.emailCampaign.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ============================================================================
// CAMPAIGN SEND LOGIC
// ============================================================================

async function sendCampaign(campaignId: string) {
  const campaign = await db.emailCampaign.findUnique({
    where: { id: campaignId },
  });
  if (!campaign) {
    return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
  }
  if (campaign.status !== 'DRAFT' && campaign.status !== 'SCHEDULED') {
    return NextResponse.json({ error: 'Campaign already sent or cancelled' }, { status: 400 });
  }

  // Get audience contacts
  const contacts = await db.emailContact.findMany({
    where: {
      organizationId: campaign.organizationId,
      isSubscribed: true,
      ...(campaign.audienceFilter ? buildContactFilter(campaign.audienceFilter as any) : {}),
    },
  });

  if (contacts.length === 0) {
    return NextResponse.json({ error: 'No subscribed contacts match the audience' }, { status: 400 });
  }

  // Resolve from address for email
  let fromAddress = getPlatformFromAddress();
  const verifiedDomain = await db.emailDomain.findFirst({
    where: { organizationId: campaign.organizationId, status: 'VERIFIED' },
  });
  if (campaign.fromName && campaign.fromEmail) {
    fromAddress = formatFromAddress(campaign.fromName, campaign.fromEmail);
  } else if (verifiedDomain?.defaultFromName && verifiedDomain?.defaultFromEmail) {
    fromAddress = formatFromAddress(verifiedDomain.defaultFromName, verifiedDomain.defaultFromEmail);
  }

  // Update campaign status
  await db.emailCampaign.update({
    where: { id: campaignId },
    data: {
      status: 'SENDING',
      recipientCount: contacts.length,
      sentAt: new Date(),
    },
  });

  let totalEmailsSent = 0;
  let totalSmsSent = 0;

  // ---- SEND EMAILS ----
  if (campaign.channel === 'EMAIL' || campaign.channel === 'BOTH') {
    const emailContacts = contacts.filter((c) => c.email);
    const batchSize = 50;

    for (let i = 0; i < emailContacts.length; i += batchSize) {
      const batch = emailContacts.slice(i, i + batchSize);

      await Promise.allSettled(
        batch.map(async (contact) => {
          try {
            const result = await sendEmail({
              from: fromAddress,
              to: contact.email,
              subject: campaign.subject || campaign.name,
              html: campaign.bodyHtml || undefined,
              replyTo: campaign.replyTo || verifiedDomain?.defaultReplyTo || undefined,
              tags: [
                { name: 'campaign_id', value: campaignId },
                { name: 'organization_id', value: campaign.organizationId },
                { name: 'email_type', value: 'marketing' },
              ],
            });

            await db.emailLog.create({
              data: {
                organizationId: campaign.organizationId,
                resendEmailId: result.resendEmailId,
                type: 'MARKETING',
                status: 'SENT',
                fromAddress,
                toAddresses: [contact.email],
                subject: campaign.subject || campaign.name,
                campaignId,
                sentAt: new Date(),
                tags: { campaign_id: campaignId },
              },
            });

            totalEmailsSent++;
          } catch (err) {
            console.error(`Failed to email ${contact.email}:`, err);
          }
        })
      );
    }
  }

  // ---- SEND SMS ----
  if (campaign.channel === 'SMS' || campaign.channel === 'BOTH') {
    // Resolve SMS body
    let smsBodyText = campaign.smsBody;
    if (!smsBodyText && campaign.smsTemplateId) {
      const template = await db.smsTemplate.findUnique({ where: { id: campaign.smsTemplateId } });
      if (template) smsBodyText = template.body;
    }

    if (smsBodyText) {
      // Filter contacts that have phone numbers
      const smsContacts = contacts.filter((c) => c.phone);
      const smsItems = smsContacts
        .map((c) => {
          const normalized = normalizePhoneNumber(c.phone!);
          return normalized ? { to: normalized, body: smsBodyText! } : null;
        })
        .filter(Boolean) as Array<{ to: string; body: string }>;

      if (smsItems.length > 0) {
        const fromNumber = getPlatformSmsNumber();
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://a1ntegrel.vercel.app';
        const results = await sendBulkSms(smsItems, fromNumber, `${appUrl}/api/sms/webhooks`);

        // Create SMS log entries
        for (const r of results) {
          await db.smsLog.create({
            data: {
              organizationId: campaign.organizationId,
              status: r.messageSid ? 'SENT' : 'FAILED',
              fromNumber,
              toNumber: r.to,
              body: smsBodyText,
              campaignId,
              twilioMessageSid: r.messageSid,
              sentAt: r.messageSid ? new Date() : undefined,
              errorMessage: r.error,
            },
          });

          if (r.messageSid) totalSmsSent++;
        }
      }
    }
  }

  // Finalize campaign
  await db.emailCampaign.update({
    where: { id: campaignId },
    data: {
      status: 'SENT',
      totalSent: totalEmailsSent,
      totalSmsSent,
      completedAt: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    channel: campaign.channel,
    totalEmailsSent,
    totalSmsSent,
    totalContacts: contacts.length,
  });
}

// Helper: Build Prisma where clause from audience filter
function buildContactFilter(filter: { tags?: string[]; clientStatus?: string }) {
  const where: any = {};

  if (filter.tags && filter.tags.length > 0) {
    where.tags = { array_contains: filter.tags };
  }

  return where;
}
