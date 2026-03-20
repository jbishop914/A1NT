/**
 * Stripe Webhooks
 * 
 * POST /api/stripe/webhooks — Handle Stripe webhook events
 * 
 * Listens for:
 * - payment_intent.succeeded → Mark transaction & invoice as paid
 * - payment_intent.payment_failed → Mark transaction as failed
 * - charge.refunded → Process refund
 * - account.updated → Sync connected account status
 * - payout.paid / payout.failed → Track payouts
 * - checkout.session.completed → Process checkout completion
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { constructWebhookEvent, mapStripeAccountStatus, stripe } from '@/lib/stripe';
import type Stripe from 'stripe';

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  let event: Stripe.Event;

  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
    }

    // In production, verify the webhook signature
    if (WEBHOOK_SECRET) {
      event = constructWebhookEvent(body, signature, WEBHOOK_SECRET);
    } else {
      // Dev mode: parse without verification
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (error: any) {
    console.error('Webhook signature verification failed:', error.message);
    return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      // ================================================================
      // PAYMENT EVENTS
      // ================================================================
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(pi);
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(pi);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }

      // ================================================================
      // CHECKOUT EVENTS
      // ================================================================
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      // ================================================================
      // CONNECTED ACCOUNT EVENTS
      // ================================================================
      case 'account.updated': {
        const account = event.data.object as Stripe.Account;
        await handleAccountUpdated(account);
        break;
      }

      // ================================================================
      // PAYOUT EVENTS
      // ================================================================
      case 'payout.paid': {
        const payout = event.data.object as Stripe.Payout;
        await handlePayoutEvent(payout, 'PAID');
        break;
      }

      case 'payout.failed': {
        const payout = event.data.object as Stripe.Payout;
        await handlePayoutEvent(payout, 'FAILED');
        break;
      }

      default:
        // Unhandled event type — log but don't error
        console.log(`Unhandled Stripe event: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error(`Webhook handler error for ${event.type}:`, error);
    return NextResponse.json(
      { error: 'Webhook handler failed', detail: error.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// HANDLER FUNCTIONS
// ============================================================================

async function handlePaymentSucceeded(pi: Stripe.PaymentIntent) {
  const orgId = pi.metadata?.a1nt_org_id;
  const invoiceId = pi.metadata?.a1nt_invoice_id;
  const bookingId = pi.metadata?.a1nt_booking_id;

  // Update transaction record
  const transaction = await db.paymentTransaction.findUnique({
    where: { stripePaymentIntentId: pi.id },
  });

  if (transaction) {
    // Get charge details for card info
    const charges = pi.latest_charge
      ? await stripe.charges.retrieve(pi.latest_charge as string)
      : null;

    await db.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: 'SUCCEEDED',
        stripeChargeId: charges?.id || null,
        stripeFee: charges?.balance_transaction
          ? 0 // Will be updated when balance_transaction webhook fires
          : 0,
        paymentMethod: charges?.payment_method_details?.type || null,
        cardBrand: charges?.payment_method_details?.card?.brand || null,
        cardLast4: charges?.payment_method_details?.card?.last4 || null,
        customerEmail: pi.receipt_email || transaction.customerEmail,
      },
    });
  }

  // Update invoice if linked
  if (invoiceId && invoiceId !== '') {
    const invoice = await db.invoice.findUnique({ where: { id: invoiceId } });
    if (invoice) {
      const amountPaidDollars = pi.amount / 100;
      const newAmountPaid = invoice.amountPaid + amountPaidDollars;
      const isPaidInFull = newAmountPaid >= invoice.total;

      await db.invoice.update({
        where: { id: invoiceId },
        data: {
          amountPaid: newAmountPaid,
          status: isPaidInFull ? 'PAID' : 'PARTIALLY_PAID',
          paidAt: isPaidInFull ? new Date() : null,
        },
      });

      // Create payment record
      await db.payment.create({
        data: {
          invoiceId,
          amount: amountPaidDollars,
          method: 'stripe',
          reference: pi.id,
          paidAt: new Date(),
        },
      });
    }
  }

  // Update booking if linked
  if (bookingId && bookingId !== '') {
    await db.booking.update({
      where: { id: bookingId },
      data: { status: 'CONFIRMED', confirmedAt: new Date(), confirmedBy: 'stripe-payment' },
    }).catch(() => {}); // Ignore if booking not found
  }
}

async function handlePaymentFailed(pi: Stripe.PaymentIntent) {
  await db.paymentTransaction.updateMany({
    where: { stripePaymentIntentId: pi.id },
    data: {
      status: 'FAILED',
      failureReason: pi.last_payment_error?.message || 'Payment failed',
    },
  });
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  if (!charge.payment_intent) return;

  const piId = typeof charge.payment_intent === 'string'
    ? charge.payment_intent
    : charge.payment_intent.id;

  const isFullRefund = charge.refunded;

  await db.paymentTransaction.updateMany({
    where: { stripePaymentIntentId: piId },
    data: {
      status: isFullRefund ? 'REFUNDED' : 'PARTIALLY_REFUNDED',
    },
  });

  // If linked to invoice, update invoice status
  const transaction = await db.paymentTransaction.findUnique({
    where: { stripePaymentIntentId: piId },
  });

  if (transaction?.invoiceId && isFullRefund) {
    await db.invoice.update({
      where: { id: transaction.invoiceId },
      data: { status: 'REFUNDED' },
    }).catch(() => {});
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const invoiceId = session.metadata?.a1nt_invoice_id;
  
  // If a checkout session was completed but it had a payment intent,
  // the payment_intent.succeeded webhook will handle the rest.
  // This handler is for any checkout-specific follow-up.
  if (invoiceId) {
    console.log(`Checkout completed for invoice ${invoiceId}`);
  }
}

async function handleAccountUpdated(account: Stripe.Account) {
  const status = mapStripeAccountStatus(account);

  await db.stripeAccount.updateMany({
    where: { stripeAccountId: account.id },
    data: {
      status: status as any,
      chargesEnabled: account.charges_enabled ?? false,
      payoutsEnabled: account.payouts_enabled ?? false,
      detailsSubmitted: account.details_submitted ?? false,
      stripeOnboardingComplete: account.details_submitted && account.charges_enabled,
      businessName: account.business_profile?.name || undefined,
      businessType: account.business_type || undefined,
      onboardingCompletedAt:
        account.details_submitted && account.charges_enabled
          ? new Date()
          : undefined,
    },
  });
}

async function handlePayoutEvent(payout: Stripe.Payout, status: 'PAID' | 'FAILED') {
  // Get the connected account this payout belongs to
  const connectedAccountId = (payout as any).account;
  if (!connectedAccountId) return;

  const stripeAccount = await db.stripeAccount.findUnique({
    where: { stripeAccountId: connectedAccountId },
  });

  if (!stripeAccount) return;

  // Upsert payout record
  const existingPayout = await db.payout.findUnique({
    where: { stripePayoutId: payout.id },
  });

  if (existingPayout) {
    await db.payout.update({
      where: { id: existingPayout.id },
      data: {
        status: status as any,
        failureReason: status === 'FAILED' ? (payout.failure_message || 'Payout failed') : null,
      },
    });
  } else {
    await db.payout.create({
      data: {
        organizationId: stripeAccount.organizationId,
        stripeAccountId: connectedAccountId,
        stripePayoutId: payout.id,
        status: status as any,
        amount: payout.amount,
        currency: payout.currency,
        arrivalDate: new Date(payout.arrival_date * 1000),
        method: payout.method || 'standard',
        description: payout.description || null,
        failureReason: status === 'FAILED' ? (payout.failure_message || null) : null,
      },
    });
  }
}
