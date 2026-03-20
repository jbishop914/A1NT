/**
 * Stripe Checkout Session
 * 
 * POST /api/stripe/checkout — Create a Checkout Session for invoice payment
 * 
 * This is used for the "Pay Now" link on invoices. It creates a Stripe-hosted
 * checkout page so customers can pay securely without the org needing to handle
 * card data directly.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createCheckoutSession, formatCents, dollarsToCents } from '@/lib/stripe';

const ORG_ID = process.env.A1NT_ORG_ID || 'demo-org';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { invoiceId } = body;

    if (!invoiceId) {
      return NextResponse.json({ error: 'invoiceId is required' }, { status: 400 });
    }

    // Look up invoice
    const invoice = await db.invoice.findFirst({
      where: { id: invoiceId, organizationId: ORG_ID },
      include: {
        client: { select: { name: true, email: true } },
        organization: { select: { name: true } },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (invoice.status === 'PAID') {
      return NextResponse.json({ error: 'Invoice is already paid' }, { status: 400 });
    }

    // Get connected Stripe account
    const stripeAccount = await db.stripeAccount.findUnique({
      where: { organizationId: ORG_ID },
    });

    if (!stripeAccount || !stripeAccount.chargesEnabled) {
      return NextResponse.json(
        { error: 'Payment processing is not configured.' },
        { status: 400 }
      );
    }

    // Calculate remaining balance
    const remainingCents = dollarsToCents(invoice.total - invoice.amountPaid);

    if (remainingCents < 50) {
      return NextResponse.json(
        { error: 'Remaining balance is too small to process.' },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://a1ntegrel.vercel.app';

    // Create Stripe Checkout Session
    const session = await createCheckoutSession({
      stripeAccountId: stripeAccount.stripeAccountId,
      amountCents: remainingCents,
      description: `Invoice ${invoice.invoiceNumber} — ${invoice.organization.name}`,
      customerEmail: invoice.client.email || undefined,
      invoiceId: invoice.id,
      organizationId: ORG_ID,
      successUrl: `${appUrl}/pay/success?invoice=${invoice.invoiceNumber}`,
      cancelUrl: `${appUrl}/pay/cancel?invoice=${invoice.invoiceNumber}`,
      feePercent: stripeAccount.applicationFeePercent,
      feeFixedCents: stripeAccount.applicationFeeFixed,
    });

    // Update invoice with payment link
    await db.invoice.update({
      where: { id: invoiceId },
      data: {
        stripePaymentIntentId: session.payment_intent as string || null,
        stripePaymentLink: session.url,
        paymentLinkExpiresAt: session.expires_at
          ? new Date(session.expires_at * 1000)
          : null,
        status: invoice.status === 'DRAFT' ? 'SENT' : invoice.status,
      },
    });

    return NextResponse.json({
      checkoutUrl: session.url,
      sessionId: session.id,
      amount: remainingCents,
      formattedAmount: formatCents(remainingCents),
      expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
    });
  } catch (error: any) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session', detail: error.message },
      { status: 500 }
    );
  }
}
