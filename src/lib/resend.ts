// Resend email client — A1NT Platform Email Integration
// Single platform account, per-org sending domains

import { Resend } from 'resend';

// Singleton Resend client
let resendClient: Resend | null = null;

export function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set');
    }
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

// ============================================================================
// DOMAIN MANAGEMENT
// ============================================================================

export interface CreateDomainResult {
  resendDomainId: string;
  dnsRecords: Array<{
    record: string;
    name: string;
    type: string;
    ttl: string;
    status: string;
    value: string;
    priority?: number;
  }>;
}

export async function createResendDomain(domain: string, region = 'us-east-1'): Promise<CreateDomainResult> {
  const resend = getResendClient();
  const { data, error } = await resend.domains.create({
    name: domain,
    region: region as any,
  });

  if (error) {
    throw new Error(`Failed to create domain: ${error.message}`);
  }

  return {
    resendDomainId: data!.id,
    dnsRecords: data!.records.map((r: any) => ({
      record: r.record,
      name: r.name,
      type: r.type,
      ttl: r.ttl,
      status: r.status,
      value: r.value,
      priority: r.priority,
    })),
  };
}

export async function verifyResendDomain(resendDomainId: string) {
  const resend = getResendClient();
  const { data, error } = await resend.domains.verify(resendDomainId);
  if (error) {
    throw new Error(`Failed to verify domain: ${error.message}`);
  }
  return data;
}

export async function getResendDomain(resendDomainId: string) {
  const resend = getResendClient();
  const { data, error } = await resend.domains.get(resendDomainId);
  if (error) {
    throw new Error(`Failed to get domain: ${error.message}`);
  }
  return data;
}

export async function deleteResendDomain(resendDomainId: string) {
  const resend = getResendClient();
  const { data, error } = await resend.domains.remove(resendDomainId);
  if (error) {
    throw new Error(`Failed to delete domain: ${error.message}`);
  }
  return data;
}

// ============================================================================
// EMAIL SENDING
// ============================================================================

export interface SendEmailOptions {
  from: string;                    // "Company Name <noreply@subdomain.client.com>"
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  react?: React.ReactElement;
  replyTo?: string;
  cc?: string | string[];
  bcc?: string | string[];
  tags?: Array<{ name: string; value: string }>;
  scheduledAt?: string;            // ISO date string for scheduled sends
  headers?: Record<string, string>;
  attachments?: Array<{
    filename: string;
    content: string | Buffer;
    path?: string;
  }>;
}

export interface SendEmailResult {
  resendEmailId: string;
}

export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const resend = getResendClient();

  const { data, error } = await resend.emails.send({
    from: options.from,
    to: Array.isArray(options.to) ? options.to : [options.to],
    subject: options.subject,
    html: options.html,
    text: options.text,
    react: options.react as any,
    replyTo: options.replyTo,
    cc: options.cc ? (Array.isArray(options.cc) ? options.cc : [options.cc]) : undefined,
    bcc: options.bcc ? (Array.isArray(options.bcc) ? options.bcc : [options.bcc]) : undefined,
    tags: options.tags,
    scheduledAt: options.scheduledAt,
    headers: options.headers,
    attachments: options.attachments as any,
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }

  return {
    resendEmailId: data!.id,
  };
}

// ============================================================================
// BATCH SENDING (for campaigns)
// ============================================================================

export interface BatchEmailItem {
  from: string;
  to: string | string[];
  subject: string;
  html?: string;
  react?: React.ReactElement;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
}

export async function sendBatchEmails(emails: BatchEmailItem[]) {
  const resend = getResendClient();
  const { data, error } = await resend.batch.send(
    emails.map((e) => ({
      from: e.from,
      to: Array.isArray(e.to) ? e.to : [e.to],
      subject: e.subject,
      html: e.html,
      react: e.react as any,
      replyTo: e.replyTo,
      tags: e.tags,
    }))
  );

  if (error) {
    throw new Error(`Failed to send batch emails: ${error.message}`);
  }

  return data;
}

// ============================================================================
// CONTACTS / AUDIENCES (Resend Audiences API)
// ============================================================================

export async function createResendAudience(name: string) {
  const resend = getResendClient();
  const { data, error } = await resend.audiences.create({ name });
  if (error) {
    throw new Error(`Failed to create audience: ${error.message}`);
  }
  return data;
}

export async function addContactToAudience(
  audienceId: string,
  contact: { email: string; firstName?: string; lastName?: string; unsubscribed?: boolean }
) {
  const resend = getResendClient();
  const { data, error } = await resend.contacts.create({
    audienceId,
    email: contact.email,
    firstName: contact.firstName,
    lastName: contact.lastName,
    unsubscribed: contact.unsubscribed ?? false,
  });
  if (error) {
    throw new Error(`Failed to add contact: ${error.message}`);
  }
  return data;
}

export async function removeContactFromAudience(audienceId: string, contactId: string) {
  const resend = getResendClient();
  const { data, error } = await resend.contacts.remove({
    audienceId,
    id: contactId,
  });
  if (error) {
    throw new Error(`Failed to remove contact: ${error.message}`);
  }
  return data;
}

// ============================================================================
// HELPERS
// ============================================================================

/** Format a from address: "Company Name <email@domain.com>" */
export function formatFromAddress(name: string, email: string): string {
  return `${name} <${email}>`;
}

/** Get a fallback from address using platform domain */
export function getPlatformFromAddress(): string {
  return `A1 Integrations <noreply@${process.env.RESEND_PLATFORM_DOMAIN || 'resend.dev'}>`;
}
