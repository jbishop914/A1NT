// Combined Message Logs — Query both email + SMS history in unified view
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/messages/logs?organizationId=xxx&channel=email|sms|all&status=...&page=1&limit=25
export async function GET(request: NextRequest) {
  try {
    const orgId = request.nextUrl.searchParams.get('organizationId');
    const channel = request.nextUrl.searchParams.get('channel') || 'all'; // email | sms | all
    const status = request.nextUrl.searchParams.get('status');
    const search = request.nextUrl.searchParams.get('search');
    const from = request.nextUrl.searchParams.get('from');
    const to = request.nextUrl.searchParams.get('to');
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '25');

    if (!orgId) {
      return NextResponse.json({ error: 'organizationId required' }, { status: 400 });
    }

    const dateFilter: any = {};
    if (from) dateFilter.gte = new Date(from);
    if (to) dateFilter.lte = new Date(to);

    // Fetch email logs
    let emailLogs: any[] = [];
    let emailTotal = 0;
    let emailStats: Record<string, number> = {};

    if (channel === 'all' || channel === 'email') {
      const emailWhere: any = { organizationId: orgId };
      if (status) emailWhere.status = status;
      if (from || to) emailWhere.createdAt = dateFilter;
      if (search) {
        emailWhere.OR = [
          { subject: { contains: search, mode: 'insensitive' } },
          { fromAddress: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [logs, total, stats] = await Promise.all([
        db.emailLog.findMany({
          where: emailWhere,
          orderBy: { createdAt: 'desc' },
          take: channel === 'all' ? limit * 2 : limit, // Fetch extra for merging
          skip: channel === 'email' ? (page - 1) * limit : 0,
        }),
        db.emailLog.count({ where: emailWhere }),
        db.emailLog.groupBy({
          by: ['status'],
          where: { organizationId: orgId, ...(from || to ? { createdAt: dateFilter } : {}) },
          _count: true,
        }),
      ]);

      emailLogs = logs.map((log: any) => ({
        id: log.id,
        channel: 'email' as const,
        status: log.status,
        subject: log.subject,
        recipient: Array.isArray(log.toAddresses) ? log.toAddresses[0] : null,
        sender: log.fromAddress,
        triggerEvent: log.triggerEvent,
        entityType: log.entityType,
        entityId: log.entityId,
        sentAt: log.sentAt,
        createdAt: log.createdAt,
        type: log.type,
        campaignId: log.campaignId,
      }));
      emailTotal = total;
      stats.forEach((s) => { emailStats[s.status.toLowerCase()] = s._count; });
    }

    // Fetch SMS logs
    let smsLogs: any[] = [];
    let smsTotal = 0;
    let smsStats: Record<string, number> = {};

    if (channel === 'all' || channel === 'sms') {
      const smsWhere: any = { organizationId: orgId };
      if (status) {
        // Map common status names between email and SMS
        smsWhere.status = status;
      }
      if (from || to) smsWhere.createdAt = dateFilter;
      if (search) {
        smsWhere.OR = [
          { body: { contains: search, mode: 'insensitive' } },
          { toNumber: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [logs, total, stats] = await Promise.all([
        db.smsLog.findMany({
          where: smsWhere,
          orderBy: { createdAt: 'desc' },
          take: channel === 'all' ? limit * 2 : limit,
          skip: channel === 'sms' ? (page - 1) * limit : 0,
        }),
        db.smsLog.count({ where: smsWhere }),
        db.smsLog.groupBy({
          by: ['status'],
          where: { organizationId: orgId, ...(from || to ? { createdAt: dateFilter } : {}) },
          _count: true,
        }),
      ]);

      smsLogs = logs.map((log: any) => ({
        id: log.id,
        channel: 'sms' as const,
        status: log.status,
        subject: log.body?.slice(0, 80) + (log.body?.length > 80 ? '...' : ''),
        recipient: log.toNumber,
        sender: log.fromNumber,
        triggerEvent: log.triggerEvent,
        entityType: log.entityType,
        entityId: log.entityId,
        sentAt: log.sentAt,
        createdAt: log.createdAt,
        type: null,
        campaignId: log.campaignId,
        segmentCount: log.segmentCount,
        errorMessage: log.errorMessage,
      }));
      smsTotal = total;
      stats.forEach((s) => { smsStats[s.status.toLowerCase()] = s._count; });
    }

    // Merge and sort by createdAt
    let allLogs = [...emailLogs, ...smsLogs];
    allLogs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Paginate the merged result
    if (channel === 'all') {
      const start = (page - 1) * limit;
      allLogs = allLogs.slice(start, start + limit);
    }

    return NextResponse.json({
      logs: allLogs,
      total: emailTotal + smsTotal,
      page,
      totalPages: Math.ceil((emailTotal + smsTotal) / limit),
      stats: {
        email: {
          sent: emailStats['sent'] || 0,
          delivered: emailStats['delivered'] || 0,
          opened: emailStats['opened'] || 0,
          bounced: emailStats['bounced'] || 0,
          failed: emailStats['failed'] || 0,
          total: emailTotal,
        },
        sms: {
          sent: smsStats['sent'] || 0,
          delivered: smsStats['delivered'] || 0,
          failed: smsStats['failed'] || 0,
          undelivered: smsStats['undelivered'] || 0,
          total: smsTotal,
        },
      },
    });
  } catch (error: any) {
    console.error('Message logs error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
