-- ─── A1NT Database Seed ──────────────────────────────────────────────────
-- Seeds demo org, users, employees, clients (including ABC Carpenters),
-- and the AI Receptionist module.
-- 
-- Run: psql $DATABASE_URL -f prisma/seed.sql
-- ──────────────────────────────────────────────────────────────────────────

-- Demo Organization
INSERT INTO "Organization" (id, name, industry, description, phone, email, website, address, city, state, zip, "employeeCount", "isActive", "createdAt", "updatedAt")
VALUES ('demo-org', 'Old Bishop Farm Plumbing & HVAC', 'PLUMBING_HVAC', 
  'Full-service plumbing, HVAC, and drain cleaning for residential and commercial clients in Connecticut.',
  '(203) 555-0100', 'office@oldbishopfarm.com', 'https://oldbishopfarm.com',
  '480 Main Street', 'Cheshire', 'CT', '06410', 8, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Demo User (Josh)
INSERT INTO "User" (id, email, name, role, phone, "isActive", "organizationId", "createdAt", "updatedAt")
VALUES ('user-josh', 'jbishop914@gmail.com', 'Josh Bishop', 'OWNER', '+12039155211', true, 'demo-org', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Employees
INSERT INTO "Employee" (id, "organizationId", name, email, phone, role, department, skills, certifications, "hourlyRate", "isActive", "createdAt", "updatedAt")
VALUES 
  ('emp-mike-rodriguez', 'demo-org', 'Mike Rodriguez', 'mike.r@oldbishopfarm.com', '(203) 555-0101', 'Senior Technician', 'Field Operations', ARRAY['HVAC','Plumbing','Residential','Commercial'], ARRAY['EPA 608 Universal','OSHA 30-Hour','CT P-1 Plumbing License'], 42, true, NOW(), NOW()),
  ('emp-dave-sullivan', 'demo-org', 'Dave Sullivan', 'dave.s@oldbishopfarm.com', '(203) 555-0102', 'Technician', 'Field Operations', ARRAY['Plumbing','Commercial','Water Heaters'], ARRAY['CT P-2 Plumbing License','OSHA 10-Hour'], 35, true, NOW(), NOW()),
  ('emp-lisa-kim', 'demo-org', 'Lisa Kim', 'lisa.k@oldbishopfarm.com', '(203) 555-0103', 'Technician', 'Field Operations', ARRAY['HVAC','Electrical','Residential'], ARRAY['EPA 608 Universal','CT E-2 Electrical License'], 35, true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Clients
INSERT INTO "Client" (id, "organizationId", name, phone, address, city, state, zip, status, notes, tags, "createdAt", "updatedAt")
VALUES
  ('client-johnson', 'demo-org', 'Mrs. Linda Johnson', '(203) 555-0147', '742 Evergreen Terrace', 'Cheshire', 'CT', '06410', 'ACTIVE', 'Prefers Mike for HVAC work. Has a dog — ring doorbell, don''t knock.', ARRAY['residential','loyal'], NOW(), NOW()),
  ('client-abc-carpenters', 'demo-org', 'ABC Carpenters', '+12039155211', NULL, NULL, NULL, NULL, 'LEAD', 'New customer from AI receptionist test call. Josh''s test account.', ARRAY['commercial','new-lead'], NOW(), NOW()),
  ('client-oak-street', 'demo-org', 'Oak Street Apartments', '(203) 555-6789', '120 Oak Ave', 'Cheshire', 'CT', NULL, 'ACTIVE', NULL, ARRAY['commercial','property-management'], NOW(), NOW()),
  ('client-sunset-senior', 'demo-org', 'Sunset Senior Living', '(203) 555-8901', '200 Sunset Drive', 'Cheshire', 'CT', NULL, 'ACTIVE', NULL, ARRAY['commercial','senior-care'], NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- AI Receptionist Module
INSERT INTO "Module" (id, slug, name, description, category, "isUniversal", icon, "sortOrder", "createdAt", "updatedAt")
VALUES ('mod-ai-receptionist', 'ai-receptionist', 'AI Receptionist & Call Handling', 
  '24/7 intelligent phone answering with work order creation, scheduling, and customer lookup.',
  'Communication', false, 'phone', 1, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Activate module for demo org
INSERT INTO "OrganizationModule" (id, "organizationId", "moduleId", status, "activatedAt", "createdAt", "updatedAt")
VALUES ('orgmod-demo-receptionist', 'demo-org', 'mod-ai-receptionist', 'ACTIVE', NOW(), NOW(), NOW())
ON CONFLICT ("organizationId", "moduleId") DO UPDATE SET status = 'ACTIVE';
