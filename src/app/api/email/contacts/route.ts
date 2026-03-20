// Email Contacts / Audience Management
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/email/contacts?organizationId=xxx&subscribed=true&search=john
export async function GET(request: NextRequest) {
  try {
    const orgId = request.nextUrl.searchParams.get('organizationId');
    const subscribedOnly = request.nextUrl.searchParams.get('subscribed') === 'true';
    const search = request.nextUrl.searchParams.get('search');
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');

    if (!orgId) {
      return NextResponse.json({ error: 'organizationId required' }, { status: 400 });
    }

    const where: any = { organizationId: orgId };
    if (subscribedOnly) where.isSubscribed = true;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [contacts, total] = await Promise.all([
      db.emailContact.findMany({
        where,
        include: { client: { select: { id: true, name: true, status: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.emailContact.count({ where }),
    ]);

    return NextResponse.json({
      contacts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/email/contacts — Add a contact (or bulk import)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId, contacts: bulkContacts, ...singleContact } = body;

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId required' }, { status: 400 });
    }

    // Bulk import
    if (bulkContacts && Array.isArray(bulkContacts)) {
      const created = await db.emailContact.createMany({
        data: bulkContacts.map((c: any) => ({
          organizationId,
          email: c.email,
          firstName: c.firstName,
          lastName: c.lastName,
          phone: c.phone,
          clientId: c.clientId,
          tags: c.tags,
          metadata: c.metadata,
        })),
        skipDuplicates: true,
      });

      return NextResponse.json({ imported: created.count }, { status: 201 });
    }

    // Single contact
    const { email, firstName, lastName, phone, clientId, tags, metadata } = singleContact;
    if (!email) {
      return NextResponse.json({ error: 'email required' }, { status: 400 });
    }

    const contact = await db.emailContact.upsert({
      where: { organizationId_email: { organizationId, email } },
      update: {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        phone: phone || undefined,
        clientId: clientId || undefined,
        tags: tags || undefined,
        metadata: metadata || undefined,
      },
      create: {
        organizationId,
        email,
        firstName,
        lastName,
        phone,
        clientId,
        tags,
        metadata,
      },
    });

    return NextResponse.json(contact, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH /api/email/contacts — Update contact or unsubscribe
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Contact id required' }, { status: 400 });
    }

    if (action === 'unsubscribe') {
      const contact = await db.emailContact.update({
        where: { id },
        data: {
          isSubscribed: false,
          unsubscribedAt: new Date(),
          unsubscribeReason: updates.reason || 'User requested',
        },
      });
      return NextResponse.json(contact);
    }

    if (action === 'resubscribe') {
      const contact = await db.emailContact.update({
        where: { id },
        data: {
          isSubscribed: true,
          unsubscribedAt: null,
          unsubscribeReason: null,
        },
      });
      return NextResponse.json(contact);
    }

    const contact = await db.emailContact.update({
      where: { id },
      data: updates,
    });

    return NextResponse.json(contact);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE /api/email/contacts?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Contact id required' }, { status: 400 });
    }

    await db.emailContact.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST /api/email/contacts/sync — Sync CRM clients into email contacts
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { organizationId } = body;

    if (!organizationId) {
      return NextResponse.json({ error: 'organizationId required' }, { status: 400 });
    }

    // Find all clients with email addresses that aren't yet email contacts
    const clients = await db.client.findMany({
      where: {
        organizationId,
        email: { not: null },
      },
      include: {
        contacts: { where: { isPrimary: true }, take: 1 },
      },
    });

    let synced = 0;
    for (const client of clients) {
      if (!client.email) continue;

      await db.emailContact.upsert({
        where: {
          organizationId_email: {
            organizationId,
            email: client.email,
          },
        },
        update: {
          clientId: client.id,
          firstName: client.name.split(' ')[0],
          lastName: client.name.split(' ').slice(1).join(' ') || undefined,
          phone: client.phone || undefined,
        },
        create: {
          organizationId,
          email: client.email,
          clientId: client.id,
          firstName: client.name.split(' ')[0],
          lastName: client.name.split(' ').slice(1).join(' ') || undefined,
          phone: client.phone || undefined,
          tags: [client.status.toLowerCase()],
        },
      });
      synced++;
    }

    return NextResponse.json({ synced, totalClients: clients.length });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
