// Seed System SMS Templates — POST /api/sms/templates/seed
// Creates the built-in SMS templates (booking confirmation, payment receipt, etc.)
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { seedSystemSmsTemplates } from '@/lib/sms-templates';

export async function POST() {
  try {
    const seeded = await seedSystemSmsTemplates(db);
    return NextResponse.json({ success: true, templatesSeeded: seeded });
  } catch (error: any) {
    console.error('SMS template seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
