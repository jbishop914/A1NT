// Email Logs — Query sent email history with filtering
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/email/logs?organizationId=xxx&type=TRANSACTIONAL&status=DELIVERED&page=1&limit=25
export async function GET(request: NextRequest) {
  try {
    const orgId = request.nextUrl.searchParams.get('organizationId');
    const type = request.nextUrl.searchParams.get('type');
    const status = request.nextUrl.searchParams.get('status');
    const search = request.nextUrl.searchParams.get('search');
    const from = request.nextUrl.searchParams.get('from'); // ISO date
    const to = request.nextUrl.searchParams.get('to');     // ISO date
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '25');

    if (!orgId) {
      return NextResponse.json({ error: 'organizationId required' }, { status: 400 });
    }

    const where: any = { organizationId: orgId };
    if (type) where.type = type;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { fromAddress: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to);
    }

    const [logs, total] = await Promise.all([
      db.emailLog.findMany({
        where,
        include: {
          template: { select: { id: true, name: true, slug: true } },
          campaign: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.emailLog.count({ where }),
    ]);

    // Aggregate stats for the filtered period
    const stats = await db.emailLog.groupBy({
      by: ['status'],
      where: { organizationId: orgId, ...(from || to ? { createdAt: where.createdAt } : {}) },
      _count: true,
    });

    const statsMap: Record<string, number> = {};
    stats.forEach((s) => {
      statsMap[s.status] = s._count;
    });

    return NextResponse.json({
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      stats: {
        queued: statsMap['QUEUED'] || 0,
        sent: statsMap['SENT'] || 0,
        delivered: statsMap['DELIVERED'] || 0,
        opened: statsMap['OPENED'] || 0,
        clicked: statsMap['CLICKED'] || 0,
        bounced: statsMap['BOUNCED'] || 0,
        complained: statsMap['COMPLAINED'] || 0,
        failed: statsMap['FAILED'] || 0,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
