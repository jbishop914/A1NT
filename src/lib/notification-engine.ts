// Notification Engine — Event-driven email + SMS triggers
// Checks org preferences, resolves recipients, sends via Resend (email) and Twilio (SMS)
//
// Usage: await triggerNotification('invoice.created', orgId, { invoiceId: '...' })
//
// This is the central dispatcher. When any event happens in the platform
// (booking confirmed, invoice created, work order assigned, etc.), call
// triggerNotification() and the engine handles the rest — checking channel
// preferences (email, SMS, or both) and dispatching accordingly.

import { db } from '@/lib/db';
import { sendEmail, formatFromAddress, getPlatformFromAddress } from '@/lib/resend';
import { sendSms, normalizePhoneNumber, interpolateSmsTemplate, getPlatformSmsNumber } from '@/lib/twilio-sms';
import { SYSTEM_SMS_TEMPLATES } from '@/lib/sms-templates';
import type { EmailType } from '@/generated/prisma/client';

// ============================================================================
// MAIN DISPATCHER
// ============================================================================

export interface NotificationContext {
  // Entity references
  invoiceId?: string;
  bookingId?: string;
  workOrderId?: string;
  clientId?: string;
  employeeId?: string;
  paymentTransactionId?: string;
  // Override recipients
  toEmail?: string;
  toEmails?: string[];
  toPhone?: string;
  toPhones?: string[];
  // Extra data for templates
  extra?: Record<string, any>;
}

export interface NotificationResult {
  emailSent: boolean;
  smsSent: boolean;
  emailLogId?: string;
  smsLogId?: string;
  reason?: string;
}

export async function triggerNotification(
  event: string,
  organizationId: string,
  context: NotificationContext = {}
): Promise<NotificationResult> {
  const result: NotificationResult = { emailSent: false, smsSent: false };

  try {
    // 1. Check if this notification is enabled for the org
    const pref = await db.notificationPreference.findUnique({
      where: { organizationId_event: { organizationId, event } },
    });

    if (!pref || !pref.isEnabled) {
      result.reason = 'Notification disabled or not configured';
      return result;
    }

    // 2. Load organization details
    const org = await db.organization.findUnique({
      where: { id: organizationId },
      include: {
        emailDomains: { where: { status: 'VERIFIED' }, take: 1 },
      },
    });

    if (!org) {
      result.reason = 'Organization not found';
      return result;
    }

    // 3. Send EMAIL if enabled
    if (pref.sendEmail) {
      try {
        const emailResult = await sendEmailNotification(event, organizationId, context, org, pref);
        result.emailSent = emailResult.sent;
        result.emailLogId = emailResult.emailLogId;
        if (!emailResult.sent) {
          result.reason = emailResult.reason;
        }
      } catch (emailErr: any) {
        console.error(`Email notification failed [${event}]:`, emailErr);
        result.reason = `Email failed: ${emailErr.message}`;
      }
    }

    // 4. Send SMS if enabled
    if (pref.sendSms) {
      try {
        const smsResult = await sendSmsNotification(event, organizationId, context, org, pref);
        result.smsSent = smsResult.sent;
        result.smsLogId = smsResult.smsLogId;
        if (!smsResult.sent && !result.reason) {
          result.reason = smsResult.reason;
        }
      } catch (smsErr: any) {
        console.error(`SMS notification failed [${event}]:`, smsErr);
        if (!result.reason) result.reason = `SMS failed: ${smsErr.message}`;
      }
    }

    return result;
  } catch (error: any) {
    console.error(`Notification engine error [${event}]:`, error);
    return { emailSent: false, smsSent: false, reason: error.message };
  }
}

// ============================================================================
// EMAIL NOTIFICATION SENDER
// ============================================================================

async function sendEmailNotification(
  event: string,
  organizationId: string,
  context: NotificationContext,
  org: any,
  pref: any
): Promise<{ sent: boolean; emailLogId?: string; reason?: string }> {
  // Resolve from address
  let fromAddress = getPlatformFromAddress();
  const domain = org.emailDomains[0];
  if (domain?.defaultFromName && domain?.defaultFromEmail) {
    fromAddress = formatFromAddress(domain.defaultFromName, domain.defaultFromEmail);
  }

  // Build email content
  const emailData = await buildEmailContent(event, organizationId, context, org);
  if (!emailData) {
    return { sent: false, reason: 'Could not build email content' };
  }

  // Resolve email recipients
  const recipients = await resolveEmailRecipients(pref, organizationId, context);
  if (recipients.length === 0) {
    return { sent: false, reason: 'No email recipients found' };
  }

  // Send
  const sendResult = await sendEmail({
    from: fromAddress,
    to: recipients,
    subject: emailData.subject,
    html: emailData.html,
    replyTo: domain?.defaultReplyTo || org.email || undefined,
    tags: [
      { name: 'organization_id', value: organizationId },
      { name: 'event', value: event },
      { name: 'email_type', value: emailData.type },
    ],
  });

  // Log
  const emailLog = await db.emailLog.create({
    data: {
      organizationId,
      resendEmailId: sendResult.resendEmailId,
      type: emailData.type as EmailType,
      status: 'SENT',
      fromAddress,
      toAddresses: recipients,
      subject: emailData.subject,
      triggerEvent: event,
      entityType: emailData.entityType,
      entityId: emailData.entityId,
      sentAt: new Date(),
      tags: { event, organization_id: organizationId },
    },
  });

  return { sent: true, emailLogId: emailLog.id };
}

// ============================================================================
// SMS NOTIFICATION SENDER
// ============================================================================

async function sendSmsNotification(
  event: string,
  organizationId: string,
  context: NotificationContext,
  org: any,
  pref: any
): Promise<{ sent: boolean; smsLogId?: string; reason?: string }> {
  // Resolve SMS body from event-specific template
  const smsData = await buildSmsContent(event, organizationId, context, org, pref.smsTemplateId);
  if (!smsData) {
    return { sent: false, reason: 'Could not build SMS content' };
  }

  // Resolve phone recipients
  const phoneNumbers = await resolveSmsRecipients(pref, organizationId, context);
  if (phoneNumbers.length === 0) {
    return { sent: false, reason: 'No SMS recipients found (no phone numbers)' };
  }

  const fromNumber = getPlatformSmsNumber();
  let lastSmsLogId: string | undefined;

  // Send to each recipient
  for (const phone of phoneNumbers) {
    const normalized = normalizePhoneNumber(phone);
    if (!normalized) continue;

    // Create log entry
    const smsLog = await db.smsLog.create({
      data: {
        organizationId,
        status: 'QUEUED',
        fromNumber,
        toNumber: normalized,
        body: smsData.body,
        segmentCount: smsData.segments,
        templateId: smsData.templateId,
        triggerEvent: event,
        entityType: smsData.entityType,
        entityId: smsData.entityId,
      },
    });

    try {
      const result = await sendSms({
        to: normalized,
        body: smsData.body,
        from: fromNumber,
      });

      await db.smsLog.update({
        where: { id: smsLog.id },
        data: {
          twilioMessageSid: result.messageSid,
          status: 'SENT',
          sentAt: new Date(),
          segmentCount: result.segmentCount,
        },
      });

      lastSmsLogId = smsLog.id;
    } catch (err: any) {
      await db.smsLog.update({
        where: { id: smsLog.id },
        data: {
          status: 'FAILED',
          errorMessage: err.message,
          errorCode: err.code?.toString(),
        },
      });
    }
  }

  return { sent: !!lastSmsLogId, smsLogId: lastSmsLogId };
}

// ============================================================================
// SMS CONTENT BUILDER
// ============================================================================

interface SmsContent {
  body: string;
  segments: number;
  templateId?: string;
  entityType?: string;
  entityId?: string;
}

async function buildSmsContent(
  event: string,
  organizationId: string,
  context: NotificationContext,
  org: any,
  customTemplateId?: string | null
): Promise<SmsContent | null> {
  const companyName = org.name;
  const companyPhone = org.phone || '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://a1ntegrel.vercel.app';

  // If a custom template is assigned, use it
  if (customTemplateId) {
    const template = await db.smsTemplate.findUnique({ where: { id: customTemplateId } });
    if (template) {
      const vars = await resolveTemplateVariables(event, context, org);
      const body = interpolateSmsTemplate(template.body, vars);
      const hasUnicode = /[^\x00-\x7F]/.test(body);
      const singleLimit = hasUnicode ? 70 : 160;
      const multiLimit = hasUnicode ? 67 : 153;
      const segments = body.length <= singleLimit ? 1 : Math.ceil(body.length / multiLimit);
      return { body, segments, templateId: template.id, ...resolveEntity(event, context) };
    }
  }

  // Fall back to system templates matched by event
  const templateSlugMap: Record<string, string> = {
    'invoice.created': 'invoice-notification',
    'invoice.overdue': 'invoice-overdue',
    'booking.confirmed': 'booking-confirmation',
    'booking.reminder': 'appointment-reminder',
    'workorder.assigned': 'work-order-assigned',
    'workorder.completed': 'work-order-completed',
    'payment.received': 'payment-receipt',
    'estimate.sent': 'estimate-ready',
    'welcome.new_client': 'welcome',
  };

  const slug = templateSlugMap[event];
  if (!slug) return null;

  // Try DB first (may have been seeded), fall back to hardcoded
  let templateBody: string | null = null;
  let templateId: string | undefined;

  const dbTemplate = await db.smsTemplate.findFirst({
    where: { slug, isSystem: true },
  });

  if (dbTemplate) {
    templateBody = dbTemplate.body;
    templateId = dbTemplate.id;
  } else {
    // Use hardcoded system template
    const systemTmpl = SYSTEM_SMS_TEMPLATES.find((t) => t.slug === slug);
    if (systemTmpl) {
      templateBody = systemTmpl.body;
    }
  }

  if (!templateBody) return null;

  const vars = await resolveTemplateVariables(event, context, org);
  const body = interpolateSmsTemplate(templateBody, vars);
  const hasUnicode = /[^\x00-\x7F]/.test(body);
  const singleLimit = hasUnicode ? 70 : 160;
  const multiLimit = hasUnicode ? 67 : 153;
  const segments = body.length <= singleLimit ? 1 : Math.ceil(body.length / multiLimit);

  return { body, segments, templateId, ...resolveEntity(event, context) };
}

// Resolve template variables by fetching relevant entity data
async function resolveTemplateVariables(
  event: string,
  context: NotificationContext,
  org: any
): Promise<Record<string, string>> {
  const vars: Record<string, string> = {
    companyName: org.name || 'Our Team',
    companyPhone: org.phone || '',
    websiteUrl: org.website || process.env.NEXT_PUBLIC_APP_URL || '',
  };
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://a1ntegrel.vercel.app';

  // Invoice events
  if (context.invoiceId) {
    const invoice = await db.invoice.findUnique({
      where: { id: context.invoiceId },
      include: { client: true },
    });
    if (invoice) {
      vars.invoiceNumber = invoice.invoiceNumber || invoice.id.slice(-6).toUpperCase();
      vars.amount = `$${Number(invoice.total).toFixed(2)}`;
      vars.dueDate = invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A';
      vars.clientName = invoice.client?.name || '';
      vars.paymentLink = invoice.stripePaymentLink || `${appUrl}/pay/${invoice.id}`;
    }
  }

  // Booking events
  if (context.bookingId) {
    const booking = await db.booking.findUnique({
      where: { id: context.bookingId },
      include: { bookingType: true, assignee: true },
    });
    if (booking) {
      const date = new Date(booking.requestedDate);
      vars.date = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      vars.time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      vars.serviceName = booking.bookingType?.label || 'Service Call';
      vars.confirmationCode = booking.id.slice(-8).toUpperCase();
      vars.address = booking.serviceAddress || '';
      vars.clientName = booking.customerName || '';
    }
  }

  // Work order events
  if (context.workOrderId) {
    const wo = await db.workOrder.findUnique({
      where: { id: context.workOrderId },
      include: { client: true, assignee: true },
    });
    if (wo) {
      vars.title = wo.title || '';
      vars.clientName = wo.client?.name || '';
      vars.priority = wo.priority || 'MEDIUM';
      vars.address = wo.client?.address || '';
    }
  }

  // Payment events
  if (context.paymentTransactionId) {
    const txn = await db.paymentTransaction.findUnique({
      where: { id: context.paymentTransactionId },
      include: { invoice: { include: { client: true } } },
    });
    if (txn) {
      vars.amount = `$${(txn.amount / 100).toFixed(2)}`;
      vars.transactionId = txn.stripePaymentIntentId?.slice(-8) || txn.id.slice(-8);
      vars.clientName = txn.invoice?.client?.name || '';
    }
  }

  // Client/welcome events
  if (context.clientId) {
    const client = await db.client.findUnique({ where: { id: context.clientId } });
    if (client) {
      vars.clientName = client.name || '';
    }
  }

  // Merge any extra vars
  if (context.extra) {
    Object.assign(vars, context.extra);
  }

  return vars;
}

function resolveEntity(event: string, context: NotificationContext): { entityType?: string; entityId?: string } {
  if (context.invoiceId) return { entityType: 'Invoice', entityId: context.invoiceId };
  if (context.bookingId) return { entityType: 'Booking', entityId: context.bookingId };
  if (context.workOrderId) return { entityType: 'WorkOrder', entityId: context.workOrderId };
  if (context.paymentTransactionId) return { entityType: 'PaymentTransaction', entityId: context.paymentTransactionId };
  if (context.clientId) return { entityType: 'Client', entityId: context.clientId };
  return {};
}

// ============================================================================
// EMAIL CONTENT BUILDER
// ============================================================================

interface EmailContent {
  subject: string;
  html: string;
  type: string;
  entityType?: string;
  entityId?: string;
}

async function buildEmailContent(
  event: string,
  organizationId: string,
  context: NotificationContext,
  org: any
): Promise<EmailContent | null> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://a1ntegrel.vercel.app';
  const companyName = org.name;

  switch (event) {
    // ---- INVOICE EVENTS ----
    case 'invoice.created': {
      if (!context.invoiceId) return null;
      const invoice = await db.invoice.findUnique({
        where: { id: context.invoiceId },
        include: { client: true, lineItems: true },
      });
      if (!invoice) return null;

      return {
        subject: `Invoice #${invoice.invoiceNumber} from ${companyName}`,
        html: buildInvoiceHtml(invoice, companyName, 'new', appUrl),
        type: 'TRANSACTIONAL',
        entityType: 'Invoice',
        entityId: invoice.id,
      };
    }

    case 'invoice.overdue': {
      if (!context.invoiceId) return null;
      const invoice = await db.invoice.findUnique({
        where: { id: context.invoiceId },
        include: { client: true, lineItems: true },
      });
      if (!invoice) return null;

      return {
        subject: `Invoice #${invoice.invoiceNumber} is past due`,
        html: buildInvoiceHtml(invoice, companyName, 'overdue', appUrl),
        type: 'TRANSACTIONAL',
        entityType: 'Invoice',
        entityId: invoice.id,
      };
    }

    // ---- BOOKING EVENTS ----
    case 'booking.confirmed': {
      if (!context.bookingId) return null;
      const booking = await db.booking.findUnique({
        where: { id: context.bookingId },
        include: { bookingType: true, assignee: true },
      });
      if (!booking) return null;

      const date = new Date(booking.requestedDate);
      return {
        subject: `Booking Confirmed — ${booking.bookingType.label} on ${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`,
        html: buildBookingHtml(booking, companyName, appUrl),
        type: 'NOTIFICATION',
        entityType: 'Booking',
        entityId: booking.id,
      };
    }

    case 'booking.reminder': {
      if (!context.bookingId) return null;
      const booking = await db.booking.findUnique({
        where: { id: context.bookingId },
        include: { bookingType: true },
      });
      if (!booking) return null;

      return {
        subject: `Reminder: Your appointment tomorrow — ${booking.bookingType?.label}`,
        html: buildReminderHtml(booking, companyName, 'appointment_reminder', appUrl),
        type: 'REMINDER',
        entityType: 'Booking',
        entityId: booking.id,
      };
    }

    // ---- WORK ORDER EVENTS ----
    case 'workorder.assigned': {
      if (!context.workOrderId) return null;
      const wo = await db.workOrder.findUnique({
        where: { id: context.workOrderId },
        include: { client: true, assignee: true },
      });
      if (!wo) return null;

      return {
        subject: `New Work Order #${wo.id.slice(-6).toUpperCase()} Assigned`,
        html: buildWorkOrderHtml(wo, companyName, appUrl),
        type: 'NOTIFICATION',
        entityType: 'WorkOrder',
        entityId: wo.id,
      };
    }

    case 'workorder.completed': {
      if (!context.workOrderId) return null;
      const wo = await db.workOrder.findUnique({
        where: { id: context.workOrderId },
        include: { client: true },
      });
      if (!wo) return null;

      return {
        subject: `Work Order Complete — ${wo.title}`,
        html: `<div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0a0a0a;">Work Order Complete</h2>
          <p>Hi ${wo.client?.name || 'there'},</p>
          <p>Good news — your work order <strong>${wo.title}</strong> has been completed.</p>
          <p>If you have any questions or concerns about the work performed, please don't hesitate to contact us.</p>
          <p>Thank you for choosing ${companyName}.</p>
        </div>`,
        type: 'NOTIFICATION',
        entityType: 'WorkOrder',
        entityId: wo.id,
      };
    }

    // ---- PAYMENT EVENTS ----
    case 'payment.received': {
      if (!context.paymentTransactionId) return null;
      const txn = await db.paymentTransaction.findUnique({
        where: { id: context.paymentTransactionId },
        include: { invoice: { include: { client: true } }, booking: true },
      });
      if (!txn) return null;

      const amount = `$${(txn.amount / 100).toFixed(2)}`;
      return {
        subject: `Payment Received — ${amount}`,
        html: `<div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 24px 0;">
            <div style="font-size: 40px;">✓</div>
            <h2 style="color: #0a0a0a; margin: 8px 0;">Payment Received</h2>
            <p style="font-size: 28px; font-weight: 700; color: #16a34a; margin: 8px 0;">${amount}</p>
          </div>
          <p>Hi ${txn.invoice?.client?.name || 'there'},</p>
          <p>We've received your payment of <strong>${amount}</strong>. Thank you.</p>
          <div style="background: #f9f9fa; border-radius: 6px; padding: 16px 20px; margin: 16px 0;">
            <p style="margin: 4px 0; font-size: 13px;"><strong>Transaction ID:</strong> ${txn.stripePaymentIntentId || txn.id}</p>
            ${txn.invoice ? `<p style="margin: 4px 0; font-size: 13px;"><strong>Invoice:</strong> #${txn.invoice.invoiceNumber}</p>` : ''}
          </div>
          <p>Thank you for your business.</p>
        </div>`,
        type: 'TRANSACTIONAL',
        entityType: 'PaymentTransaction',
        entityId: txn.id,
      };
    }

    // ---- WELCOME ----
    case 'welcome.new_client': {
      if (!context.clientId) return null;
      const client = await db.client.findUnique({
        where: { id: context.clientId },
      });
      if (!client) return null;

      return {
        subject: `Welcome to ${companyName}`,
        html: `<div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0a0a0a;">Welcome to ${companyName}</h2>
          <p>Hi ${client.name},</p>
          <p>Thank you for choosing ${companyName}. We're committed to providing you with exceptional service and look forward to working with you.</p>
          ${org.phone ? `<p>📞 ${org.phone}</p>` : ''}
          ${org.email ? `<p>✉ ${org.email}</p>` : ''}
          <p>If you ever need anything, we're just a call or click away.</p>
        </div>`,
        type: 'NOTIFICATION',
        entityType: 'Client',
        entityId: client.id,
      };
    }

    default:
      console.warn(`No email builder for event: ${event}`);
      return null;
  }
}

// ============================================================================
// RECIPIENT RESOLVERS
// ============================================================================

async function resolveEmailRecipients(
  pref: any,
  organizationId: string,
  context: NotificationContext
): Promise<string[]> {
  const recipients: string[] = [];

  // Direct override
  if (context.toEmail) recipients.push(context.toEmail);
  if (context.toEmails) recipients.push(...context.toEmails);

  // Send to client
  if (pref.sendToClient && context.clientId) {
    const client = await db.client.findUnique({
      where: { id: context.clientId },
      select: { email: true },
    });
    if (client?.email) recipients.push(client.email);
  }

  // Resolve client from entities if not provided
  if (pref.sendToClient && !context.clientId) {
    if (context.invoiceId) {
      const invoice = await db.invoice.findUnique({
        where: { id: context.invoiceId },
        include: { client: { select: { email: true } } },
      });
      if (invoice?.client?.email) recipients.push(invoice.client.email);
    }
    if (context.bookingId) {
      const booking = await db.booking.findUnique({
        where: { id: context.bookingId },
        select: { customerEmail: true },
      });
      if (booking?.customerEmail) recipients.push(booking.customerEmail);
    }
  }

  // Send to admin
  if (pref.sendToAdmin) {
    const admins = await db.user.findMany({
      where: { organizationId, role: { in: ['OWNER', 'ADMIN'] }, isActive: true },
      select: { email: true },
    });
    recipients.push(...admins.map((a) => a.email));
  }

  // Send to assignee
  if (pref.sendToAssignee && context.employeeId) {
    const employee = await db.employee.findUnique({
      where: { id: context.employeeId },
      select: { email: true },
    });
    if (employee?.email) recipients.push(employee.email);
  }

  if (pref.sendToAssignee && !context.employeeId && context.workOrderId) {
    const wo = await db.workOrder.findUnique({
      where: { id: context.workOrderId },
      include: { assignee: { select: { email: true } } },
    });
    if (wo?.assignee?.email) recipients.push(wo.assignee.email);
  }

  return [...new Set(recipients.filter(Boolean))];
}

async function resolveSmsRecipients(
  pref: any,
  organizationId: string,
  context: NotificationContext
): Promise<string[]> {
  const phones: string[] = [];

  // Direct override
  if (context.toPhone) phones.push(context.toPhone);
  if (context.toPhones) phones.push(...context.toPhones);

  // Send to client phone
  if (pref.sendToClient && context.clientId) {
    const client = await db.client.findUnique({
      where: { id: context.clientId },
      select: { phone: true },
    });
    if (client?.phone) phones.push(client.phone);
  }

  // Resolve client phone from entities
  if (pref.sendToClient && !context.clientId) {
    if (context.invoiceId) {
      const invoice = await db.invoice.findUnique({
        where: { id: context.invoiceId },
        include: { client: { select: { phone: true } } },
      });
      if (invoice?.client?.phone) phones.push(invoice.client.phone);
    }
    if (context.bookingId) {
      const booking = await db.booking.findUnique({
        where: { id: context.bookingId },
        select: { customerPhone: true },
      });
      if (booking?.customerPhone) phones.push(booking.customerPhone);
    }
  }

  // Send to admin phones
  if (pref.sendToAdmin) {
    const admins = await db.user.findMany({
      where: { organizationId, role: { in: ['OWNER', 'ADMIN'] }, isActive: true },
      select: { phone: true },
    });
    admins.forEach((a) => { if (a.phone) phones.push(a.phone); });
  }

  // Send to assignee phone
  if (pref.sendToAssignee && context.employeeId) {
    const employee = await db.employee.findUnique({
      where: { id: context.employeeId },
      select: { phone: true },
    });
    if (employee?.phone) phones.push(employee.phone);
  }

  if (pref.sendToAssignee && !context.employeeId && context.workOrderId) {
    const wo = await db.workOrder.findUnique({
      where: { id: context.workOrderId },
      include: { assignee: { select: { phone: true } } },
    });
    if (wo?.assignee?.phone) phones.push(wo.assignee.phone);
  }

  return [...new Set(phones.filter(Boolean))];
}

// ============================================================================
// HTML BUILDERS (Inline HTML for server-side rendering without React)
// ============================================================================

function buildInvoiceHtml(invoice: any, companyName: string, status: string, appUrl: string): string {
  const items = invoice.lineItems?.map((li: any) =>
    `<tr>
      <td style="padding: 8px 0; font-size: 13px; color: #333; border-bottom: 1px solid #f0f0f0;">${li.description}</td>
      <td style="padding: 8px 0; font-size: 13px; color: #333; text-align: center; border-bottom: 1px solid #f0f0f0;">${li.quantity}</td>
      <td style="padding: 8px 0; font-size: 13px; color: #333; text-align: right; border-bottom: 1px solid #f0f0f0;">$${Number(li.unitPrice).toFixed(2)}</td>
      <td style="padding: 8px 0; font-size: 13px; color: #333; text-align: right; border-bottom: 1px solid #f0f0f0;">$${Number(li.amount).toFixed(2)}</td>
    </tr>`
  ).join('') || '';

  const paymentLink = invoice.stripePaymentLink
    ? `<div style="text-align: center; margin-top: 32px;">
        <a href="${invoice.stripePaymentLink}" style="background: #0a0a0a; color: #fff; padding: 14px 32px; border-radius: 6px; font-size: 14px; font-weight: 600; text-decoration: none; display: inline-block;">Pay Now</a>
      </div>`
    : '';

  return `<div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #0a0a0a;">${status === 'overdue' ? '⚠ ' : ''}Invoice #${invoice.invoiceNumber}</h2>
    <p>Hi ${invoice.client?.name || 'there'},</p>
    <p>${status === 'overdue' ? 'Your invoice is past due. Please arrange payment.' : 'Please find your invoice details below.'}</p>
    <div style="background: #f9f9fa; border-radius: 6px; padding: 16px 20px; margin: 16px 0;">
      <table style="width: 100%;"><tr>
        <td><span style="font-size: 11px; color: #888; text-transform: uppercase;">Date</span><br><strong>${new Date(invoice.issueDate).toLocaleDateString()}</strong></td>
        <td><span style="font-size: 11px; color: #888; text-transform: uppercase;">Due</span><br><strong style="${status === 'overdue' ? 'color: #dc2626;' : ''}">${invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</strong></td>
      </tr></table>
    </div>
    <table style="width: 100%; border-collapse: collapse;">
      <thead><tr style="border-bottom: 1px solid #e5e5e5;">
        <th style="text-align: left; font-size: 11px; color: #888; padding-bottom: 8px;">Description</th>
        <th style="text-align: center; font-size: 11px; color: #888; padding-bottom: 8px;">Qty</th>
        <th style="text-align: right; font-size: 11px; color: #888; padding-bottom: 8px;">Rate</th>
        <th style="text-align: right; font-size: 11px; color: #888; padding-bottom: 8px;">Amount</th>
      </tr></thead>
      <tbody>${items}</tbody>
    </table>
    <div style="text-align: right; margin-top: 16px; padding-top: 12px; border-top: 2px solid #0a0a0a;">
      <span style="font-size: 16px; font-weight: 700;">Total: $${Number(invoice.total).toFixed(2)}</span>
    </div>
    ${paymentLink}
    <p style="margin-top: 24px;">Thank you for your business.</p>
  </div>`;
}

function buildBookingHtml(booking: any, companyName: string, appUrl: string): string {
  const date = new Date(booking.requestedDate);
  return `<div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #0a0a0a;">Booking Confirmed ✓</h2>
    <p>Hi ${booking.customerName},</p>
    <p>Your appointment has been confirmed. Here are the details:</p>
    <div style="background: #f9f9fa; border-radius: 6px; padding: 20px 24px; margin: 16px 0;">
      <table style="width: 100%;">
        <tr><td style="padding: 6px 0; font-size: 12px; color: #888; width: 120px;">Service</td><td style="font-size: 14px; font-weight: 500;">${booking.bookingType?.label || 'Service Call'}</td></tr>
        <tr><td style="padding: 6px 0; font-size: 12px; color: #888;">Date</td><td style="font-size: 14px; font-weight: 500;">${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</td></tr>
        <tr><td style="padding: 6px 0; font-size: 12px; color: #888;">Time</td><td style="font-size: 14px; font-weight: 500;">${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</td></tr>
        <tr><td style="padding: 6px 0; font-size: 12px; color: #888;">Address</td><td style="font-size: 14px; font-weight: 500;">${booking.serviceAddress}</td></tr>
        ${booking.assignee ? `<tr><td style="padding: 6px 0; font-size: 12px; color: #888;">Technician</td><td style="font-size: 14px; font-weight: 500;">${booking.assignee.name}</td></tr>` : ''}
        <tr><td style="padding: 6px 0; font-size: 12px; color: #888;">Confirmation #</td><td style="font-size: 14px; font-weight: 500; font-family: monospace;">${booking.id.slice(-8).toUpperCase()}</td></tr>
      </table>
    </div>
    <p>If you have any questions, don't hesitate to reach out. We look forward to seeing you.</p>
  </div>`;
}

function buildWorkOrderHtml(wo: any, companyName: string, appUrl: string): string {
  const priorityColors: Record<string, string> = { LOW: '#6b7280', MEDIUM: '#2563eb', HIGH: '#ea580c', URGENT: '#dc2626' };
  return `<div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #0a0a0a;">New Work Order Assigned</h2>
    <p>Hi ${wo.assignee?.name || 'there'},</p>
    <p>A new work order has been assigned to you. Please review the details below.</p>
    <div style="background: #f9f9fa; border-radius: 6px; padding: 20px 24px; margin: 16px 0;">
      <table style="width: 100%;">
        <tr><td style="padding: 6px 0; font-size: 12px; color: #888; width: 130px;">Work Order #</td><td style="font-family: monospace; font-size: 14px; font-weight: 500;">${wo.id.slice(-6).toUpperCase()}</td></tr>
        <tr><td style="padding: 6px 0; font-size: 12px; color: #888;">Priority</td><td style="font-size: 14px; font-weight: 700; color: ${priorityColors[wo.priority] || '#333'};">${wo.priority}</td></tr>
        <tr><td style="padding: 6px 0; font-size: 12px; color: #888;">Client</td><td style="font-size: 14px; font-weight: 500;">${wo.client?.name || 'N/A'}</td></tr>
        <tr><td style="padding: 6px 0; font-size: 12px; color: #888;">Title</td><td style="font-size: 14px; font-weight: 500;">${wo.title}</td></tr>
      </table>
    </div>
    ${wo.description ? `<p><strong>Description:</strong> ${wo.description}</p>` : ''}
    <div style="text-align: center; margin-top: 24px;">
      <a href="${appUrl}/dashboard/work-orders" style="background: #0a0a0a; color: #fff; padding: 12px 28px; border-radius: 6px; font-size: 13px; font-weight: 600; text-decoration: none; display: inline-block;">View Work Order</a>
    </div>
  </div>`;
}

function buildReminderHtml(booking: any, companyName: string, type: string, appUrl: string): string {
  const date = new Date(booking.requestedDate);
  return `<div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #0a0a0a;">Appointment Reminder</h2>
    <p>Hi ${booking.customerName},</p>
    <p>This is a friendly reminder about your upcoming appointment:</p>
    <div style="background: #f9f9fa; border-radius: 6px; padding: 20px; margin: 16px 0; text-align: center;">
      <div style="font-size: 16px; font-weight: 600; color: #0a0a0a;">${date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</div>
      <div style="font-size: 14px; color: #555; margin-top: 4px;">at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</div>
      <div style="font-size: 13px; color: #888; margin-top: 8px;">${booking.bookingType?.label || 'Service Call'}</div>
    </div>
    <p>We look forward to seeing you. If you need to reschedule, please contact us.</p>
  </div>`;
}
