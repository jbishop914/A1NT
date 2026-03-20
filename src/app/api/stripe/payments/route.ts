/**
 * Stripe Payment Processing
 * 
 * POST /api/stripe/payments — Create a payment intent (for embedded payment forms)
 * GET  /api/stripe/payments — List payment transactions for org
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  createPaymentIntent,
  calculateApplicationFee,
  formatCents,
} from '@/lib/stripe';

const ORG_ID = process.env.A1NT_ORG_ID || 'demo-org';

/**
 * POST — Create a payment intent for a specific charge.
 * Used by: Invoice "Pay Now", Booking upfront payment
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amountCents,
      description,
      customerEmail,
      customerName,
      invoiceId,
      bookingId,
      type = 'INVOICE_PAYMENT', // INVOICE_PAYMENT | BOOKING_PAYMENT | DEPOSIT
    } = body;

    if (!amountCents || amountCents < 50) {
      return NextResponse.json(
        { error: 'Amount must be at least $0.50 (50 cents)' },
        { status: 400 }
      );
    }

    // Get the org's connected Stripe account
    const stripeAccount = await db.stripeAccount.findUnique({
      where: { organizationId: ORG_ID },
    });

    if (!stripeAccount || !stripeAccount.chargesEnabled) {
      return NextResponse.json(
        { error: 'Payment processing is not set up. Connect a Stripe account first.' },
        { status: 400 }
      );
    }

    // Calculate application fee
    const applicationFeeCents = calculateApplicationFee(
      amountCents,
      stripeAccount.applicationFeePercent,
      stripeAccount.applicationFeeFixed
    );

    // Create payment intent on connected account
    const paymentIntent = await createPaymentIntent({
      stripeAccountId: stripeAccount.stripeAccountId,
      amountCents,
      description: description || 'Payment',
      customerEmail,
      applicationFeeCents,
      metadata: {
        a1nt_org_id: ORG_ID,
        a1nt_invoice_id: invoiceId || '',
        a1nt_booking_id: bookingId || '',
        a1nt_type: type,
      },
    });

    // Record the transaction in our ledger
    await db.paymentTransaction.create({
      data: {
        organizationId: ORG_ID,
        stripeAccountId: stripeAccount.stripeAccountId,
        stripePaymentIntentId: paymentIntent.id,
        type: type as any,
        status: 'PENDING',
        amount: amountCents,
        applicationFee: applicationFeeCents,
        netAmount: amountCents - applicationFeeCents,
        customerName: customerName || null,
        customerEmail: customerEmail || null,
        description,
        invoiceId: invoiceId || null,
        bookingId: bookingId || null,
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: amountCents,
      applicationFee: applicationFeeCents,
      netAmount: amountCents - applicationFeeCents,
      formattedAmount: formatCents(amountCents),
    });
  } catch (error: any) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment', detail: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET — List payment transactions for the organization.
 * Query params: ?status=SUCCEEDED&type=INVOICE_PAYMENT&limit=50&offset=0
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = { organizationId: ORG_ID };
    if (status) where.status = status;
    if (type) where.type = type;

    const [transactions, total] = await Promise.all([
      db.paymentTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          invoice: {
            select: { invoiceNumber: true, clientId: true },
          },
          booking: {
            select: { customerName: true, bookingType: { select: { label: true } } },
          },
        },
      }),
      db.paymentTransaction.count({ where }),
    ]);

    // Calculate summary stats
    const stats = await db.paymentTransaction.aggregate({
      where: { organizationId: ORG_ID, status: 'SUCCEEDED' },
      _sum: {
        amount: true,
        applicationFee: true,
        netAmount: true,
        stripeFee: true,
      },
      _count: true,
    });

    return NextResponse.json({
      transactions,
      total,
      limit,
      offset,
      stats: {
        totalTransactions: stats._count,
        totalVolume: stats._sum.amount || 0,
        totalPlatformFees: stats._sum.applicationFee || 0,
        totalNetToMerchant: stats._sum.netAmount || 0,
        totalStripeFees: stats._sum.stripeFee || 0,
        formattedVolume: formatCents(stats._sum.amount || 0),
        formattedPlatformFees: formatCents(stats._sum.applicationFee || 0),
        formattedNet: formatCents(stats._sum.netAmount || 0),
      },
    });
  } catch (error: any) {
    console.error('Payment list error:', error);
    return NextResponse.json(
      { error: 'Failed to list transactions', detail: error.message },
      { status: 500 }
    );
  }
}
