/* ─── Message Seed API ─────────────────────────────────────────────────────
   POST /api/messages/seed

   Generates 8-10 sample threads with 25+ messages across phone/SMS/email.
   Body: { organizationId: string }
   ──────────────────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const SAMPLE_CONTACTS = [
  { name: "Maria Rodriguez", phone: "+1 (203) 555-0142", email: "maria@riversidemgmt.com" },
  { name: "James Chen", phone: "+1 (860) 555-0198", email: "jchen@oakstreetapts.com" },
  { name: "Sarah Thompson", phone: "+1 (203) 555-0267", email: "sarah.t@gmail.com" },
  { name: "Mike Petrov", phone: "+1 (475) 555-0311", email: "mpetrov@industrialpark.net" },
  { name: "Linda Wallace", phone: "+1 (860) 555-0445", email: "lwallace@cedarhill.org" },
  { name: "Robert Kim", phone: "+1 (203) 555-0523", email: "rkim@mainstreetdeli.com" },
  { name: "Amanda Foster", phone: "+1 (475) 555-0689", email: "afoster@fosterlaw.com" },
  { name: "David Martinez", phone: "+1 (860) 555-0771", email: "david.martinez@outlook.com" },
  { name: "Patricia Nguyen", phone: "+1 (203) 555-0834", email: "pnguyen@sunrisecare.com" },
  { name: "Tom Bradley", phone: "+1 (475) 555-0912", email: "tom.b@bradleyelectric.com" },
];

type Channel = "PHONE" | "SMS" | "EMAIL";
type Direction = "INBOUND" | "OUTBOUND";

interface MessageTemplate {
  channel: Channel;
  direction: Direction;
  body: string;
  subject?: string;
  hasVoicemail?: boolean;
  transcription?: string;
}

const THREAD_TEMPLATES: { contact: number; channel: Channel; subject?: string; messages: MessageTemplate[] }[] = [
  {
    contact: 0,
    channel: "PHONE",
    subject: "Emergency water heater leak",
    messages: [
      { channel: "PHONE", direction: "INBOUND", body: "Hi, this is Maria from Riverside Property Management. We have an emergency — one of our units has a water heater that's leaking badly. The tenant says there's water all over the basement floor. Can you send someone right away?", hasVoicemail: false },
      { channel: "PHONE", direction: "OUTBOUND", body: "Hi Maria, this is Alex from Old Bishop Farm. I've got your emergency request logged. We can have a technician out within the hour. The unit is at 42 Riverside Drive, unit 3B, correct?" },
      { channel: "SMS", direction: "OUTBOUND", body: "Maria — technician Mike R. is en route to 42 Riverside Dr Unit 3B. ETA 45 minutes. He'll call when he arrives." },
      { channel: "SMS", direction: "INBOUND", body: "Thank you! The tenant will be waiting. Please have him ring unit 3B when he gets there." },
    ],
  },
  {
    contact: 1,
    channel: "EMAIL",
    subject: "Quarterly HVAC maintenance scheduling",
    messages: [
      { channel: "EMAIL", direction: "INBOUND", body: "Hi team,\n\nIt's time for our quarterly HVAC maintenance across all 12 units at Oak Street Apartments. Can we schedule the visits for next week? Tuesdays and Thursdays work best for tenant access.\n\nBest,\nJames Chen\nProperty Manager", subject: "Quarterly HVAC maintenance scheduling" },
      { channel: "EMAIL", direction: "OUTBOUND", body: "Hi James,\n\nAbsolutely — I'll get those scheduled. We can do 6 units on Tuesday and 6 on Thursday. Our tech will arrive at 8 AM each day.\n\nI'll send over the confirmation with unit-by-unit time slots shortly.\n\nThanks,\nOld Bishop Farm", subject: "Re: Quarterly HVAC maintenance scheduling" },
      { channel: "EMAIL", direction: "INBOUND", body: "Perfect, that works great. Please make sure to coordinate with the front desk for building access. The code for the service entrance is 4482.\n\nThanks,\nJames", subject: "Re: Quarterly HVAC maintenance scheduling" },
    ],
  },
  {
    contact: 2,
    channel: "PHONE",
    subject: "AC not cooling — residential",
    messages: [
      { channel: "PHONE", direction: "INBOUND", body: "Hello, I'm calling because my air conditioning stopped working. It's blowing air but it's not cold at all. It was working fine yesterday. My name is Sarah Thompson and I'm at 88 Pine Street.", hasVoicemail: true, transcription: "Hi, this is Sarah Thompson at 88 Pine Street. My AC stopped cooling. It blows air but it's warm. Please call me back at 203-555-0267. Thank you." },
      { channel: "PHONE", direction: "OUTBOUND", body: "Hi Sarah, this is Old Bishop Farm returning your call. Based on your description, it sounds like it could be a refrigerant issue or a compressor problem. We can send someone out tomorrow morning between 9-11 AM. Would that work?" },
      { channel: "SMS", direction: "INBOUND", body: "Tomorrow morning works! Thank you for the quick response." },
      { channel: "SMS", direction: "OUTBOUND", body: "Great, you're confirmed for tomorrow 9-11 AM. Tech: Dave S. He'll text when he's 15 min away." },
    ],
  },
  {
    contact: 3,
    channel: "SMS",
    messages: [
      { channel: "SMS", direction: "INBOUND", body: "Hey, this is Mike from Industrial Park on Route 10. Our loading dock heater isn't firing up. It's the big ceiling-mounted unit. Can you take a look this week?" },
      { channel: "SMS", direction: "OUTBOUND", body: "Hi Mike! I remember that unit — we installed it last year. Let me check our schedule and get back to you with available slots." },
      { channel: "SMS", direction: "OUTBOUND", body: "We can come by Wednesday at 2 PM or Thursday at 10 AM. Which works better?" },
      { channel: "SMS", direction: "INBOUND", body: "Thursday 10 AM works. Ask for Mike at the front gate, I'll let security know you're coming." },
      { channel: "SMS", direction: "OUTBOUND", body: "Thursday 10 AM confirmed. See you then!" },
    ],
  },
  {
    contact: 4,
    channel: "PHONE",
    subject: "Annual boiler inspection quote",
    messages: [
      { channel: "PHONE", direction: "INBOUND", body: "Good morning, this is Linda Wallace from Cedar Hill Assisted Living. We need to schedule our annual boiler inspection. We have two commercial boilers. Can you send us a quote for the inspection and any recommended maintenance?" },
      { channel: "EMAIL", direction: "OUTBOUND", body: "Hi Linda,\n\nThank you for reaching out about your annual boiler inspection. Here's our quote for Cedar Hill:\n\n- 2x Commercial Boiler Inspection: $450 each ($900 total)\n- Recommended annual maintenance package: $350/boiler ($700 total)\n- Total estimate: $1,600\n\nThe inspection covers all safety checks, efficiency testing, and a detailed report. Let me know if you'd like to proceed.\n\nBest regards,\nOld Bishop Farm", subject: "Annual Boiler Inspection Quote — Cedar Hill" },
      { channel: "EMAIL", direction: "INBOUND", body: "Thanks for the quick quote. Let's go ahead with both the inspection and maintenance package. What dates do you have available in the next two weeks?\n\n- Linda", subject: "Re: Annual Boiler Inspection Quote — Cedar Hill" },
    ],
  },
  {
    contact: 5,
    channel: "SMS",
    messages: [
      { channel: "SMS", direction: "INBOUND", body: "Hi, Robert Kim here from Main Street Deli. The kitchen hood exhaust fan is making a terrible grinding noise. We're worried it might be a fire hazard. Can someone come look at it today?" },
      { channel: "SMS", direction: "OUTBOUND", body: "Hi Robert, that does sound urgent. Let me see if we can squeeze you in this afternoon. Standby." },
      { channel: "SMS", direction: "OUTBOUND", body: "Good news — we can have someone there by 3 PM today. Please make sure the kitchen area is accessible." },
      { channel: "SMS", direction: "INBOUND", body: "Amazing, thank you! We close at 2:30 so that's perfect timing." },
    ],
  },
  {
    contact: 6,
    channel: "EMAIL",
    subject: "New office HVAC installation consultation",
    messages: [
      { channel: "EMAIL", direction: "INBOUND", body: "Hello,\n\nI'm renovating office space at 220 Main Street for my law practice and need a complete HVAC system installed. It's about 2,400 sq ft across two floors. I'd like to discuss options — can we schedule a consultation?\n\nThank you,\nAmanda Foster\nFoster & Associates", subject: "New office HVAC installation consultation" },
      { channel: "EMAIL", direction: "OUTBOUND", body: "Hi Amanda,\n\nWe'd be happy to help with your new office HVAC installation! A space that size has several good options depending on your budget and efficiency goals.\n\nI can come by for a site assessment early next week. Would Monday or Tuesday work? The assessment takes about 45 minutes.\n\nLooking forward to it,\nOld Bishop Farm", subject: "Re: New office HVAC installation consultation" },
    ],
  },
  {
    contact: 7,
    channel: "PHONE",
    subject: "Furnace repair follow-up",
    messages: [
      { channel: "PHONE", direction: "INBOUND", body: "Hi, it's David Martinez. You guys came out last week to fix my furnace and it was working great, but now it's making that same clicking noise again. I think the part you replaced might not be holding up." },
      { channel: "PHONE", direction: "OUTBOUND", body: "I'm sorry to hear that, David. Since this is related to our recent repair, we'll send someone back out at no charge to take another look. This falls under our 30-day work guarantee." },
      { channel: "SMS", direction: "OUTBOUND", body: "David — follow-up visit scheduled for tomorrow 1-3 PM (warranty repair, no charge). Tech: Lisa K." },
      { channel: "SMS", direction: "INBOUND", body: "Thanks, I appreciate you standing behind your work." },
    ],
  },
  {
    contact: 8,
    channel: "SMS",
    messages: [
      { channel: "SMS", direction: "INBOUND", body: "Hi this is Patricia from Sunrise Senior Care. Our thermostat display went blank in the common area. Residents are complaining it's cold. Can you help?" },
      { channel: "SMS", direction: "OUTBOUND", body: "Hi Patricia! Could be a simple battery issue or a wiring problem. Can you check if there's a battery compartment on the back of the thermostat?" },
      { channel: "SMS", direction: "INBOUND", body: "Just checked — no batteries. It's wired directly." },
      { channel: "SMS", direction: "OUTBOUND", body: "OK, sounds like it needs a service call. We can come by tomorrow morning first thing — 8 AM work?" },
      { channel: "SMS", direction: "INBOUND", body: "8 AM is great. The front desk will let you in. Thank you!" },
      { channel: "SMS", direction: "OUTBOUND", body: "You're confirmed for 8 AM tomorrow. We'll take good care of it!" },
    ],
  },
];

function hoursAgo(hours: number): Date {
  return new Date(Date.now() - hours * 60 * 60 * 1000);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const orgId = body.organizationId || process.env.NEXT_PUBLIC_A1NT_ORG_ID || "demo-org";

    // Clean up any existing seed data
    await (db.threadMessage as any).deleteMany({
      where: { thread: { organizationId: orgId } },
    });
    await (db.messageReadStatus as any).deleteMany({
      where: { thread: { organizationId: orgId } },
    });
    await (db.draftResponse as any).deleteMany({
      where: { thread: { organizationId: orgId } },
    });
    await (db.messageThread as any).deleteMany({
      where: { organizationId: orgId },
    });

    const createdThreads = [];
    const baseTime = Date.now();

    for (let i = 0; i < THREAD_TEMPLATES.length; i++) {
      const tmpl = THREAD_TEMPLATES[i];
      const contact = SAMPLE_CONTACTS[tmpl.contact];
      // Stagger thread creation times
      const threadStartHoursAgo = (THREAD_TEMPLATES.length - i) * 6 + Math.random() * 12;

      const thread = await (db.messageThread as any).create({
        data: {
          organizationId: orgId,
          contactName: contact.name,
          contactPhone: contact.phone,
          contactEmail: contact.email,
          channel: tmpl.channel,
          subject: tmpl.subject || null,
          preview: tmpl.messages[tmpl.messages.length - 1].body.substring(0, 120),
          lastMessageAt: hoursAgo(threadStartHoursAgo - tmpl.messages.length),
          messageCount: tmpl.messages.length,
        },
      });

      // Create messages with staggered timestamps
      for (let j = 0; j < tmpl.messages.length; j++) {
        const msg = tmpl.messages[j];
        const msgHoursAgo = threadStartHoursAgo - j * 0.5 - Math.random() * 0.3;

        await (db.threadMessage as any).create({
          data: {
            threadId: thread.id,
            channel: msg.channel,
            direction: msg.direction,
            body: msg.body,
            preview: msg.body.substring(0, 120),
            subject: msg.subject || null,
            hasVoicemail: msg.hasVoicemail || false,
            transcription: msg.transcription || null,
            createdAt: hoursAgo(msgHoursAgo),
          },
        });
      }

      createdThreads.push(thread);
    }

    return NextResponse.json({
      success: true,
      threadsCreated: createdThreads.length,
      message: `Seeded ${createdThreads.length} threads with messages`,
    });
  } catch (error) {
    console.error("[messages/seed] Error:", error);
    return NextResponse.json(
      { error: "Failed to seed messages" },
      { status: 500 }
    );
  }
}
