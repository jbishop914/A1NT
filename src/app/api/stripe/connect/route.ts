/**
 * Stripe Connect Account Management
 * 
 * GET  /api/stripe/connect — Get connected account status for current org
 * POST /api/stripe/connect — Create new connected account (start onboarding)
 * PUT  /api/stripe/connect — Refresh onboarding link / get dashboard link
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  createConnectedAccount,
  createOnboardingLink,
  createDashboardLink,
  getAccountStatus,
  mapStripeAccountStatus,
} from '@/lib/stripe';

const ORG_ID = process.env.A1NT_ORG_ID || 'demo-org';

/**
 * GET — Retrieve the connected account status for the current organization.
 */
export async function GET() {
  try {
    const stripeAccount = await db.stripeAccount.findUnique({
      where: { organizationId: ORG_ID },
    });

    if (!stripeAccount) {
      return NextResponse.json({
        connected: false,
        status: null,
        message: 'No payment account connected. Set up payments to start accepting online payments.',
      });
    }

    // If account exists but onboarding not complete, check with Stripe for latest status
    let liveStatus = null;
    if (!stripeAccount.stripeOnboardingComplete || stripeAccount.status !== 'ACTIVE') {
      try {
        liveStatus = await getAccountStatus(stripeAccount.stripeAccountId);
        
        // Update local record if status changed
        const mappedStatus = liveStatus.chargesEnabled && liveStatus.payoutsEnabled
          ? 'ACTIVE' : liveStatus.detailsSubmitted ? 'PENDING_REVIEW' : 'ONBOARDING';
        
        if (
          mappedStatus !== stripeAccount.status ||
          liveStatus.chargesEnabled !== stripeAccount.chargesEnabled ||
          liveStatus.payoutsEnabled !== stripeAccount.payoutsEnabled
        ) {
          await db.stripeAccount.update({
            where: { id: stripeAccount.id },
            data: {
              status: mappedStatus as any,
              chargesEnabled: liveStatus.chargesEnabled,
              payoutsEnabled: liveStatus.payoutsEnabled,
              detailsSubmitted: liveStatus.detailsSubmitted,
              stripeOnboardingComplete: liveStatus.detailsSubmitted && liveStatus.chargesEnabled,
              onboardingCompletedAt: (liveStatus.detailsSubmitted && liveStatus.chargesEnabled && !stripeAccount.onboardingCompletedAt)
                ? new Date() : stripeAccount.onboardingCompletedAt,
            },
          });
        }
      } catch {
        // If Stripe API fails, return cached data
      }
    }

    return NextResponse.json({
      connected: true,
      status: liveStatus ? (
        liveStatus.chargesEnabled && liveStatus.payoutsEnabled ? 'ACTIVE' :
        liveStatus.detailsSubmitted ? 'PENDING_REVIEW' : 'ONBOARDING'
      ) : stripeAccount.status,
      chargesEnabled: liveStatus?.chargesEnabled ?? stripeAccount.chargesEnabled,
      payoutsEnabled: liveStatus?.payoutsEnabled ?? stripeAccount.payoutsEnabled,
      detailsSubmitted: liveStatus?.detailsSubmitted ?? stripeAccount.detailsSubmitted,
      businessName: stripeAccount.businessName,
      stripeAccountId: stripeAccount.stripeAccountId,
      applicationFeePercent: stripeAccount.applicationFeePercent,
      applicationFeeFixed: stripeAccount.applicationFeeFixed,
      payoutScheduleInterval: stripeAccount.payoutScheduleInterval,
      onboardingCompletedAt: stripeAccount.onboardingCompletedAt,
      requirements: liveStatus?.requirements || null,
    });
  } catch (error: any) {
    console.error('Stripe Connect GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve payment account status', detail: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST — Create a new Stripe Express connected account and return onboarding URL.
 */
export async function POST(request: NextRequest) {
  try {
    // Check if account already exists
    const existing = await db.stripeAccount.findUnique({
      where: { organizationId: ORG_ID },
    });

    if (existing) {
      // If already exists but onboarding incomplete, generate new link
      if (!existing.stripeOnboardingComplete) {
        const onboardingUrl = await createOnboardingLink(existing.stripeAccountId);
        return NextResponse.json({
          accountId: existing.stripeAccountId,
          onboardingUrl,
          message: 'Existing account found. Resuming onboarding.',
        });
      }
      return NextResponse.json(
        { error: 'Payment account already connected and active.' },
        { status: 409 }
      );
    }

    // Get org info for the account
    const org = await db.organization.findUnique({
      where: { id: ORG_ID },
      select: { name: true, email: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // Create Stripe Express account
    const { accountId, onboardingUrl } = await createConnectedAccount({
      organizationId: ORG_ID,
      businessName: org.name,
      email: org.email || 'admin@example.com',
    });

    // Save to database
    await db.stripeAccount.create({
      data: {
        organizationId: ORG_ID,
        stripeAccountId: accountId,
        businessName: org.name,
        status: 'ONBOARDING',
        onboardingStartedAt: new Date(),
      },
    });

    return NextResponse.json({
      accountId,
      onboardingUrl,
      message: 'Stripe account created. Complete onboarding to start accepting payments.',
    });
  } catch (error: any) {
    console.error('Stripe Connect POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create payment account', detail: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT — Refresh onboarding link or get Express dashboard link.
 * Body: { action: "refresh_onboarding" | "dashboard_link" }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    const stripeAccount = await db.stripeAccount.findUnique({
      where: { organizationId: ORG_ID },
    });

    if (!stripeAccount) {
      return NextResponse.json(
        { error: 'No payment account found. Create one first.' },
        { status: 404 }
      );
    }

    if (action === 'refresh_onboarding') {
      const onboardingUrl = await createOnboardingLink(stripeAccount.stripeAccountId);
      return NextResponse.json({ onboardingUrl });
    }

    if (action === 'dashboard_link') {
      if (!stripeAccount.chargesEnabled) {
        return NextResponse.json(
          { error: 'Account must complete onboarding before accessing dashboard.' },
          { status: 400 }
        );
      }
      const dashboardUrl = await createDashboardLink(stripeAccount.stripeAccountId);
      return NextResponse.json({ dashboardUrl });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Stripe Connect PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to process request', detail: error.message },
      { status: 500 }
    );
  }
}
