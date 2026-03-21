// Twilio SMS Client — A1NT Platform Text Messaging
// Uses the same Twilio account as the voice system

import twilio from 'twilio';

// Singleton Twilio client
let twilioClient: twilio.Twilio | null = null;

export function getTwilioClient(): twilio.Twilio {
  if (!twilioClient) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    if (!accountSid || !authToken) {
      throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN are required');
    }
    twilioClient = twilio(accountSid, authToken);
  }
  return twilioClient;
}

/** Default A1NT SMS number (toll-free) — falls back to voice number if not set */
export function getPlatformSmsNumber(): string {
  return process.env.TWILIO_SMS_NUMBER || process.env.TWILIO_PHONE_NUMBER || '+16463321206';
}

// ============================================================================
// SEND SMS
// ============================================================================

export interface SendSmsOptions {
  to: string;           // E.164 format: +12025551234
  body: string;         // Message body (max ~1600 chars for multi-segment)
  from?: string;        // Override from number (default: platform number)
  statusCallback?: string; // Webhook URL for delivery status updates
}

export interface SendSmsResult {
  messageSid: string;
  status: string;
  segmentCount: number;
  price?: string;
}

export async function sendSms(options: SendSmsOptions): Promise<SendSmsResult> {
  const client = getTwilioClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://a1ntegrel.vercel.app';

  const message = await client.messages.create({
    to: options.to,
    from: options.from || getPlatformSmsNumber(),
    body: options.body,
    statusCallback: options.statusCallback || `${appUrl}/api/sms/webhooks`,
  });

  return {
    messageSid: message.sid,
    status: message.status,
    segmentCount: message.numSegments ? parseInt(message.numSegments) : 1,
    price: message.price || undefined,
  };
}

// ============================================================================
// BULK SEND (for campaigns)
// ============================================================================

export interface BulkSmsItem {
  to: string;
  body: string;
}

export async function sendBulkSms(
  items: BulkSmsItem[],
  from?: string,
  statusCallback?: string
): Promise<Array<{ to: string; messageSid?: string; error?: string }>> {
  const results: Array<{ to: string; messageSid?: string; error?: string }> = [];
  const batchSize = 30; // Twilio concurrent request limit

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(
      batch.map(async (item) => {
        const result = await sendSms({
          to: item.to,
          body: item.body,
          from,
          statusCallback,
        });
        return { to: item.to, messageSid: result.messageSid };
      })
    );

    batchResults.forEach((r, idx) => {
      if (r.status === 'fulfilled') {
        results.push(r.value);
      } else {
        results.push({ to: batch[idx].to, error: r.reason?.message || 'Failed' });
      }
    });

    // Small delay between batches to avoid rate limits
    if (i + batchSize < items.length) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  return results;
}

// ============================================================================
// HELPERS
// ============================================================================

/** Format phone number to E.164 (+1XXXXXXXXXX for US) */
export function normalizePhoneNumber(phone: string): string | null {
  // Strip everything that isn't a digit
  const digits = phone.replace(/\D/g, '');

  // US numbers
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;

  // Already has country code
  if (digits.length > 10) return `+${digits}`;

  return null; // Invalid
}

/** Calculate SMS segment count based on character length */
export function calculateSegments(body: string): number {
  // GSM-7 encoding: 160 chars for single, 153 chars per segment for multi
  // Unicode: 70 chars for single, 67 chars per segment for multi
  const hasUnicode = /[^\x00-\x7F]/.test(body);
  const singleLimit = hasUnicode ? 70 : 160;
  const multiLimit = hasUnicode ? 67 : 153;

  if (body.length <= singleLimit) return 1;
  return Math.ceil(body.length / multiLimit);
}

/** Replace {{variable}} placeholders in template body */
export function interpolateSmsTemplate(
  template: string,
  variables: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return variables[key] !== undefined ? variables[key] : match;
  });
}
