// SMS Template CRUD — Reusable text message templates with {{variable}} placeholders
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/sms/templates?organizationId=xxx
// Returns system templates + org-specific templates
export async function GET(request: NextRequest) {
  try {
    const orgId = request.nextUrl.searchParams.get('organizationId');
    if (!orgId) {
      return NextResponse.json({ error: 'organizationId required' }, { status: 400 });
    }

    const templates = await db.smsTemplate.findMany({
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

// POST /api/sms/templates — Create a new SMS template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, name, body: templateBody, description, variables } = body;

    if (!organizationId || !name || !templateBody) {
      return NextResponse.json(
        { error: 'organizationId, name, and body are required' },
        { status: 400 }
      );
    }

    // Validate character count
    if (templateBody.length > 1600) {
      return NextResponse.json(
        { error: 'SMS body exceeds 1600 character limit' },
        { status: 400 }
      );
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const template = await db.smsTemplate.create({
      data: {
        organizationId,
        name,
        slug,
        body: templateBody,
        description,
        variables: variables || undefined,
        isSystem: false,
      },
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Template with this name already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/sms/templates — Update an SMS template
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, body: templateBody, description, variables, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: 'Template id required' }, { status: 400 });
    }

    // Don't allow editing system templates
    const existing = await db.smsTemplate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    if (existing.isSystem) {
      return NextResponse.json({ error: 'Cannot edit system templates' }, { status: 403 });
    }

    if (templateBody && templateBody.length > 1600) {
      return NextResponse.json(
        { error: 'SMS body exceeds 1600 character limit' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (name !== undefined) {
      updateData.name = name;
      updateData.slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
    }
    if (templateBody !== undefined) updateData.body = templateBody;
    if (description !== undefined) updateData.description = description;
    if (variables !== undefined) updateData.variables = variables;
    if (isActive !== undefined) updateData.isActive = isActive;

    const template = await db.smsTemplate.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(template);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/sms/templates?id=xxx — Soft-delete (deactivate) a template
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Template id required' }, { status: 400 });
    }

    const existing = await db.smsTemplate.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    if (existing.isSystem) {
      return NextResponse.json({ error: 'Cannot delete system templates' }, { status: 403 });
    }

    await db.smsTemplate.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
