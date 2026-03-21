/**
 * A1NT — Stripe Connect Platform Utilities
 * 
 * Core helper functions for Stripe Connect Express integration.
 * A1NT is the platform; each client Organization is a connected account.
 * 
 * Fee model: Baked-in single rate per transaction
 * - Stripe base: 2.9% + 30¢
 * - A1NT application fee: 0.5% + 25¢
 * - Client sees: ~3.4% + 55¢ (single rate, no separate line items)
 */

import Stripe from 'stripe';

// Platform Stripe instance (A1NT's own keys) — lazy-initialized to avoid
// build-time errors when STRIPE_SECRET_KEY isn't available during static analysis.
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    _stripe = new Stripe(key, {
      apiVersion: '2025-03-31.basil' as any,
    });
  }
  return _stripe;
}

/** @deprecated Use getStripe() instead — kept for backward compatibility */
export const stripe = new Proxy({} as Stripe, {
  get(_, prop) {
    return (getStripe() as any)[prop];
  },
});

// ============================================================================
// APPLICATION FEE CALCULATION
// ============================================================================

/**
 * Calculate the application fee for a given transaction amount.
 * Default: 0.5% + $0.25 per transaction (configurable per org).
 * 
 * @param amountCents - Total charge amount in cents
 * @param feePercent - Platform fee percentage (default 0.5)
 * @param feeFixedCents - Platform fixed fee in cents (default 25)
 * @returns Application fee in cents (rounded up to nearest cent)
 */
export function calculateApplicationFee(
  amountCents: number,
  feePercent: number = 0.5,
  feeFixedCents: number = 25
): number {
  const percentFee = Math.ceil(amountCents * (feePercent / 100));
  return percentFee + feeFixedCents;
}

/**
 * Format cents to dollar string (e.g., 50000 → "$500.00")
 */
export function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/**
 * Parse dollar amount to cents (e.g., 500.00 → 50000, "$500" → 50000)
 */
export function dollarsToCents(dollars: number | string): number {
  const amount = typeof dollars === 'string' 
    ? parseFloat(dollars.replace(/[$,]/g, ''))
    : dollars;
  return Math.round(amount * 100);
}

// ============================================================================
// CONNECTED ACCOUNT MANAGEMENT
// ============================================================================

/**
 * Create a new Stripe Express connected account for an organization.
 * Returns the account ID and onboarding URL.
 */
export async function createConnectedAccount(params: {
  organizationId: string;
  businessName: string;
  email: string;
  country?: string;
}): Promise<{
  accountId: string;
  onboardingUrl: string;
}> {
  const account = await stripe.accounts.create({
    type: 'express',
    country: params.country || 'US',
    email: params.email,
    business_profile: {
      name: params.businessName,
    },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: {
      a1nt_org_id: params.organizationId,
    },
  });

  // Generate onboarding link
  const accountLink = await stripe.accountLinks.create({
    account: account.id,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://a1ntegrel.vercel.app'}/dashboard/settings?stripe=refresh`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://a1ntegrel.vercel.app'}/dashboard/settings?stripe=complete`,
    type: 'account_onboarding',
  });

  return {
    accountId: account.id,
    onboardingUrl: accountLink.url,
  };
}

/**
 * Generate a new onboarding link for an existing account (e.g., if previous link expired).
 */
export async function createOnboardingLink(stripeAccountId: string): Promise<string> {
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://a1ntegrel.vercel.app'}/dashboard/settings?stripe=refresh`,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://a1ntegrel.vercel.app'}/dashboard/settings?stripe=complete`,
    type: 'account_onboarding',
  });
  return accountLink.url;
}

/**
 * Retrieve a connected account's current status from Stripe.
 */
export async function getAccountStatus(stripeAccountId: string): Promise<{
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  requirements: Stripe.Account.Requirements | null;
}> {
  const account = await stripe.accounts.retrieve(stripeAccountId);
  return {
    chargesEnabled: account.charges_enabled ?? false,
    payoutsEnabled: account.payouts_enabled ?? false,
    detailsSubmitted: account.details_submitted ?? false,
    requirements: account.requirements ?? null,
  };
}

/**
 * Create a login link for the connected account's Express dashboard.
 */
export async function createDashboardLink(stripeAccountId: string): Promise<string> {
  const link = await stripe.accounts.createLoginLink(stripeAccountId);
  return link.url;
}

// ============================================================================
// PAYMENT PROCESSING
// ============================================================================

/**
 * Create a payment intent on a connected account (destination charge).
 * A1NT collects the application fee automatically.
 */
export async function createPaymentIntent(params: {
  stripeAccountId: string;
  amountCents: number;
  currency?: string;
  description?: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
  applicationFeeCents?: number;
  feePercent?: number;
  feeFixedCents?: number;
}): Promise<Stripe.PaymentIntent> {
  const applicationFee = params.applicationFeeCents 
    ?? calculateApplicationFee(
      params.amountCents,
      params.feePercent,
      params.feeFixedCents
    );

  const paymentIntent = await stripe.paymentIntents.create({
    amount: params.amountCents,
    currency: params.currency || 'usd',
    description: params.description,
    application_fee_amount: applicationFee,
    receipt_email: params.customerEmail,
    metadata: params.metadata || {},
    automatic_payment_methods: {
      enabled: true,
    },
    transfer_data: {
      destination: params.stripeAccountId,
    },
  });

  return paymentIntent;
}

/**
 * Create a Stripe Checkout Session for a "Pay Now" invoice link.
 * Supports card, bank transfer, and Link.
 */
export async function createCheckoutSession(params: {
  stripeAccountId: string;
  amountCents: number;
  description: string;
  customerEmail?: string;
  invoiceId: string;
  organizationId: string;
  successUrl: string;
  cancelUrl: string;
  feePercent?: number;
  feeFixedCents?: number;
}): Promise<Stripe.Checkout.Session> {
  const applicationFee = calculateApplicationFee(
    params.amountCents,
    params.feePercent,
    params.feeFixedCents
  );

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: params.description,
          },
          unit_amount: params.amountCents,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: applicationFee,
      transfer_data: {
        destination: params.stripeAccountId,
      },
      metadata: {
        a1nt_invoice_id: params.invoiceId,
        a1nt_org_id: params.organizationId,
      },
    },
    customer_email: params.customerEmail,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      a1nt_invoice_id: params.invoiceId,
      a1nt_org_id: params.organizationId,
    },
  });

  return session;
}

/**
 * Process a refund on a connected account charge.
 */
export async function createRefund(params: {
  paymentIntentId: string;
  amountCents?: number; // Partial refund amount, or omit for full refund
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
  refundApplicationFee?: boolean;
}): Promise<Stripe.Refund> {
  const refund = await stripe.refunds.create({
    payment_intent: params.paymentIntentId,
    amount: params.amountCents,
    reason: params.reason || 'requested_by_customer',
    refund_application_fee: params.refundApplicationFee ?? true,
  });

  return refund;
}

// ============================================================================
// WEBHOOK HANDLING
// ============================================================================

/**
 * Verify and construct a Stripe webhook event.
 */
export function constructWebhookEvent(
  body: string | Buffer,
  signature: string,
  endpointSecret: string
): Stripe.Event {
  return stripe.webhooks.constructEvent(body, signature, endpointSecret);
}

/**
 * Map Stripe account status to A1NT StripeAccountStatus enum.
 */
export function mapStripeAccountStatus(account: Stripe.Account): 
  'ONBOARDING' | 'PENDING_REVIEW' | 'ACTIVE' | 'RESTRICTED' | 'DISABLED' {
  if (!account.details_submitted) return 'ONBOARDING';
  if (account.charges_enabled && account.payouts_enabled) return 'ACTIVE';
  if (account.requirements?.currently_due?.length) return 'RESTRICTED';
  if (account.details_submitted && !account.charges_enabled) return 'PENDING_REVIEW';
  return 'RESTRICTED';
}
