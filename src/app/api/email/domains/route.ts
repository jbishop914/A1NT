// Email Domain Management — Add, verify, list, remove sending domains per org
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  createResendDomain,
  verifyResendDomain,
  getResendDomain,
  deleteResendDomain,
} from '@/lib/resend';

// GET /api/email/domains?organizationId=xxx
export async function GET(request: NextRequest) {
  try {
    const orgId = request.nextUrl.searchParams.get('organizationId');
    if (!orgId) {
      return NextResponse.json({ error: 'organizationId required' }, { status: 400 });
    }

    const domains = await db.emailDomain.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(domains);
  } catch (error: any) {
    console.error('Error fetching email domains:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/email/domains — Add a new sending domain
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, domain, defaultFromName, defaultFromEmail, defaultReplyTo, region } = body;

    if (!organizationId || !domain) {
      return NextResponse.json(
        { error: 'organizationId and domain are required' },
        { status: 400 }
      );
    }

    // Check if domain already exists for this org
    const existing = await db.emailDomain.findUnique({
      where: { organizationId_domain: { organizationId, domain } },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Domain already registered for this organization' },
        { status: 409 }
      );
    }

    // Create domain in Resend
    const resendResult = await createResendDomain(domain, region);

    // Store in our database
    const emailDomain = await db.emailDomain.create({
      data: {
        organizationId,
        domain,
        resendDomainId: resendResult.resendDomainId,
        status: 'PENDING',
        region: region || 'us-east-1',
        dnsRecords: resendResult.dnsRecords as any,
        defaultFromName,
        defaultFromEmail: defaultFromEmail || `noreply@${domain}`,
        defaultReplyTo,
      },
    });

    return NextResponse.json(emailDomain, { status: 201 });
  } catch (error: any) {
    console.error('Error creating email domain:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/email/domains — Verify or update a domain
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, defaultFromName, defaultFromEmail, defaultReplyTo } = body;

    if (!id) {
      return NextResponse.json({ error: 'Domain id required' }, { status: 400 });
    }

    const domain = await db.emailDomain.findUnique({ where: { id } });
    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    // Verify domain
    if (action === 'verify') {
      if (!domain.resendDomainId) {
        return NextResponse.json({ error: 'No Resend domain ID found' }, { status: 400 });
      }

      await verifyResendDomain(domain.resendDomainId);

      // Check current status from Resend
      const resendDomain = await getResendDomain(domain.resendDomainId);
      const isVerified = resendDomain?.status === 'verified';

      const updated = await db.emailDomain.update({
        where: { id },
        data: {
          status: isVerified ? 'VERIFIED' : 'VERIFYING',
          dnsRecords: (resendDomain as any)?.records ?? domain.dnsRecords,
          verifiedAt: isVerified ? new Date() : undefined,
        },
      });

      return NextResponse.json(updated);
    }

    // Update sender defaults
    if (action === 'update') {
      const updated = await db.emailDomain.update({
        where: { id },
        data: {
          ...(defaultFromName !== undefined && { defaultFromName }),
          ...(defaultFromEmail !== undefined && { defaultFromEmail }),
          ...(defaultReplyTo !== undefined && { defaultReplyTo }),
        },
      });

      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating email domain:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/email/domains?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Domain id required' }, { status: 400 });
    }

    const domain = await db.emailDomain.findUnique({ where: { id } });
    if (!domain) {
      return NextResponse.json({ error: 'Domain not found' }, { status: 404 });
    }

    // Remove from Resend
    if (domain.resendDomainId) {
      try {
        await deleteResendDomain(domain.resendDomainId);
      } catch (e) {
        // Domain may already be deleted on Resend side
        console.warn('Could not delete domain from Resend:', e);
      }
    }

    // Remove from our database
    await db.emailDomain.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting email domain:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
