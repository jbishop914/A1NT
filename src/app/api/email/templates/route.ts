// Email Templates CRUD
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/email/templates?organizationId=xxx
export async function GET(request: NextRequest) {
  try {
    const orgId = request.nextUrl.searchParams.get('organizationId');
    if (!orgId) {
      return NextResponse.json({ error: 'organizationId required' }, { status: 400 });
    }

    // Get org-specific templates + system templates
    const templates = await db.emailTemplate.findMany({
      where: {
        OR: [
          { organizationId: orgId },
          { isSystem: true },
        ],
        isActive: true,
      },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    });

    return NextResponse.json(templates);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/email/templates
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, name, slug, description, type, subject, bodyHtml, bodyText, variables } = body;

    if (!name || !slug || !type || !subject) {
      return NextResponse.json(
        { error: 'name, slug, type, and subject are required' },
        { status: 400 }
      );
    }

    const template = await db.emailTemplate.create({
      data: {
        organizationId: organizationId || null,
        name,
        slug,
        description,
        type,
        subject,
        bodyHtml,
        bodyText,
        variables: variables || undefined,
        isSystem: !organizationId,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/email/templates
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Template id required' }, { status: 400 });
    }

    const template = await db.emailTemplate.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json(template);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/email/templates?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Template id required' }, { status: 400 });
    }

    // Soft-delete: deactivate rather than remove
    await db.emailTemplate.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
