// Email Sending API — Send transactional, notification, and ad-hoc emails
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendEmail, formatFromAddress, getPlatformFromAddress } from '@/lib/resend';
import type { EmailType } from '@/generated/prisma/client';

// POST /api/email/send
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      organizationId,
      to,
      subject,
      html,
      text,
      type = 'TRANSACTIONAL',
      replyTo,
      cc,
      bcc,
      tags,
      templateId,
      triggerEvent,
      entityType,
      entityId,
      scheduledAt,
      attachments,
    } = body;

    if (!organizationId || !to || !subject) {
      return NextResponse.json(
        { error: 'organizationId, to, and subject are required' },
        { status: 400 }
      );
    }

    if (!html && !text && !templateId) {
      return NextResponse.json(
        { error: 'Email content required: provide html, text, or templateId' },
        { status: 400 }
      );
    }

    // Resolve sender: use org's verified domain or platform fallback
    let fromAddress = getPlatformFromAddress();
    const verifiedDomain = await db.emailDomain.findFirst({
      where: { organizationId, status: 'VERIFIED' },
      orderBy: { createdAt: 'asc' },
    });

    if (verifiedDomain && verifiedDomain.defaultFromName && verifiedDomain.defaultFromEmail) {
      fromAddress = formatFromAddress(verifiedDomain.defaultFromName, verifiedDomain.defaultFromEmail);
    }

    // If templateId provided, load template for subject/body
    let resolvedSubject = subject;
    let resolvedHtml = html;
    let resolvedText = text;

    if (templateId) {
      const template = await db.emailTemplate.findUnique({ where: { id: templateId } });
      if (template) {
        resolvedSubject = subject || template.subject;
        resolvedHtml = html || template.bodyHtml || undefined;
        resolvedText = text || template.bodyText || undefined;
      }
    }

    // Create email log entry (QUEUED)
    const emailLog = await db.emailLog.create({
      data: {
        organizationId,
        type: type as EmailType,
        status: 'QUEUED',
        fromAddress,
        toAddresses: Array.isArray(to) ? to : [to],
        ccAddresses: cc ? (Array.isArray(cc) ? cc : [cc]) : undefined,
        bccAddresses: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
        replyTo: replyTo || verifiedDomain?.defaultReplyTo || undefined,
        subject: resolvedSubject,
        templateId,
        triggerEvent,
        entityType,
        entityId,
        tags: tags || undefined,
      },
    });

    try {
      // Send via Resend
      const result = await sendEmail({
        from: fromAddress,
        to,
        subject: resolvedSubject,
        html: resolvedHtml,
        text: resolvedText,
        replyTo: replyTo || verifiedDomain?.defaultReplyTo || undefined,
        cc,
        bcc,
        tags: tags
          ? Object.entries(tags).map(([name, value]) => ({ name, value: String(value) }))
          : [
              { name: 'organization_id', value: organizationId },
              { name: 'email_type', value: type },
            ],
        scheduledAt,
        attachments,
      });

      // Update log with Resend email ID + SENT status
      const updated = await db.emailLog.update({
        where: { id: emailLog.id },
        data: {
          resendEmailId: result.resendEmailId,
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        emailLogId: updated.id,
        resendEmailId: result.resendEmailId,
      });
    } catch (sendError: any) {
      // Mark as failed
      await db.emailLog.update({
        where: { id: emailLog.id },
        data: { status: 'FAILED' },
      });

      return NextResponse.json(
        { error: `Failed to send email: ${sendError.message}`, emailLogId: emailLog.id },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in email send:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
