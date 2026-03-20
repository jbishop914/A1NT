/* ─── Database Seed ───────────────────────────────────────────────────────
   Seeds the demo organization, ABC Carpenters client, and sample data.
   
   Run: node --loader tsx/esm prisma/seed.mts
   ──────────────────────────────────────────────────────────────────────── */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");

const adapter = new PrismaPg({ connectionString });
const db = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...\n");

  // ─── Demo Organization ─────────────────────────────────────────
  const org = await db.organization.upsert({
    where: { id: "demo-org" },
    update: {},
    create: {
      id: "demo-org",
      name: "Old Bishop Farm Plumbing & HVAC",
      industry: "PLUMBING_HVAC",
      description: "Full-service plumbing, HVAC, and drain cleaning for residential and commercial clients in Connecticut.",
      phone: "(203) 555-0100",
      email: "office@oldbishopfarm.com",
      website: "https://oldbishopfarm.com",
      address: "480 Main Street",
      city: "Cheshire",
      state: "CT",
      zip: "06410",
      employeeCount: 8,
      isActive: true,
    },
  });
  console.log(`✅ Organization: ${org.name} (${org.id})`);

  // ─── Demo User ─────────────────────────────────────────────────
  const user = await db.user.upsert({
    where: { email: "jbishop914@gmail.com" },
    update: {},
    create: {
      email: "jbishop914@gmail.com",
      name: "Josh Bishop",
      role: "OWNER",
      phone: "+12039155211",
      organizationId: org.id,
    },
  });
  console.log(`✅ User: ${user.name} (${user.role})`);

  // ─── Employees ─────────────────────────────────────────────────
  const employees = [
    { id: "emp-mike-rodriguez", name: "Mike Rodriguez", email: "mike.r@oldbishopfarm.com", phone: "(203) 555-0101", role: "Senior Technician", department: "Field Operations", skills: ["HVAC", "Plumbing", "Residential", "Commercial"], certifications: ["EPA 608 Universal", "OSHA 30-Hour", "CT P-1 Plumbing License"], hourlyRate: 42 },
    { id: "emp-dave-sullivan", name: "Dave Sullivan", email: "dave.s@oldbishopfarm.com", phone: "(203) 555-0102", role: "Technician", department: "Field Operations", skills: ["Plumbing", "Commercial", "Water Heaters"], certifications: ["CT P-2 Plumbing License", "OSHA 10-Hour"], hourlyRate: 35 },
    { id: "emp-lisa-kim", name: "Lisa Kim", email: "lisa.k@oldbishopfarm.com", phone: "(203) 555-0103", role: "Technician", department: "Field Operations", skills: ["HVAC", "Electrical", "Residential"], certifications: ["EPA 608 Universal", "CT E-2 Electrical License"], hourlyRate: 35 },
  ];
  for (const emp of employees) {
    await db.employee.upsert({ where: { id: emp.id }, update: {}, create: { organizationId: org.id, ...emp } });
  }
  console.log(`✅ Employees: ${employees.length} technicians`);

  // ─── Clients ───────────────────────────────────────────────────
  const johnson = await db.client.upsert({
    where: { id: "client-johnson" },
    update: {},
    create: { id: "client-johnson", organizationId: org.id, name: "Mrs. Linda Johnson", phone: "(203) 555-0147", address: "742 Evergreen Terrace", city: "Cheshire", state: "CT", zip: "06410", status: "ACTIVE", notes: "Prefers Mike for HVAC work. Has a dog — ring doorbell, don't knock.", tags: ["residential", "loyal"] },
  });
  console.log(`✅ Client: ${johnson.name}`);

  const abc = await db.client.upsert({
    where: { id: "client-abc-carpenters" },
    update: {},
    create: { id: "client-abc-carpenters", organizationId: org.id, name: "ABC Carpenters", phone: "+12039155211", status: "LEAD", notes: "New customer from AI receptionist test call. Josh's test account.", tags: ["commercial", "new-lead"] },
  });
  console.log(`✅ Client: ${abc.name} (new lead from test call)`);

  const sampleClients = [
    { id: "client-oak-street", name: "Oak Street Apartments", phone: "(203) 555-6789", address: "120 Oak Ave", city: "Cheshire", state: "CT", status: "ACTIVE" as const, tags: ["commercial", "property-management"] },
    { id: "client-sunset-senior", name: "Sunset Senior Living", phone: "(203) 555-8901", address: "200 Sunset Drive", city: "Cheshire", state: "CT", status: "ACTIVE" as const, tags: ["commercial", "senior-care"] },
  ];
  for (const c of sampleClients) {
    await db.client.upsert({ where: { id: c.id }, update: {}, create: { organizationId: org.id, ...c } });
  }
  console.log(`✅ Sample clients: ${sampleClients.length}`);

  // ─── AI Receptionist Module ────────────────────────────────────
  const mod = await db.module.upsert({
    where: { slug: "ai-receptionist" },
    update: {},
    create: { slug: "ai-receptionist", name: "AI Receptionist & Call Handling", description: "24/7 intelligent phone answering with work order creation, scheduling, and customer lookup.", category: "Communication", isUniversal: false, icon: "phone", sortOrder: 1 },
  });
  await db.organizationModule.upsert({
    where: { organizationId_moduleId: { organizationId: org.id, moduleId: mod.id } },
    update: { status: "ACTIVE" },
    create: { organizationId: org.id, moduleId: mod.id, status: "ACTIVE", activatedAt: new Date() },
  });
  console.log(`✅ Module: ${mod.name} → ACTIVE`);

  console.log("\n🎉 Seed complete!");
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
