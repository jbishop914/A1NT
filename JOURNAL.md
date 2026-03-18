# A1NT — Project Journal

Rolling development log for A1 Integrations platform. Updated each session with summaries of work completed, goals established, and deliverables produced.

---

## Session 1 — March 18, 2026

### Context
First working session for A1 Integrations (A1NT). The business concept, target market, and initial template strategy were established in a prior research session that produced a 29-page strategic analysis document.

### Goals Established
1. **Select the tech stack** for the A1NT web application — needed to support CRM, project management, invoicing, payments, user/employee databases, client dashboards, and a modular template system.
2. **Create the GitHub repository** and scaffold the initial project.
3. **Define the core data model** — the foundational schema that will power the template/module system, CRM, invoicing, and workforce management.
4. **Start this journal** for ongoing project continuity.

### Decisions Made
- **Tech Stack:** Next.js + React + TypeScript (framework), PostgreSQL + Prisma ORM (database), shadcn/ui + Tailwind CSS (UI). Chosen for ecosystem maturity, strong auth/payment library support, and suitability for data-heavy dashboard applications.
- **Repo Name:** `A1NT` on GitHub under `jbishop914`.
- **Architecture:** Modular template system where Templates contain Modules that can be toggled on/off per Organization. Eight "universal modules" (identified in strategic analysis) form the shared core framework.

### Work Produced
- **GitHub repo created:** [github.com/jbishop914/A1NT](https://github.com/jbishop914/A1NT)
- **Next.js app scaffolded** with TypeScript, Tailwind, ESLint, App Router, and `src/` directory structure.
- **shadcn/ui initialized** with core dashboard components: Button, Card, Table, Input, Label, Dialog, Select, Tabs, Badge, Separator, Sheet, Avatar, Dropdown Menu, Sidebar, Chart, Tooltip.
- **Prisma ORM initialized** with PostgreSQL datasource.
- **Core database schema designed** (`prisma/schema.prisma`) with 15 models:
  - Auth: `User`, `Session`
  - Organizations: `Organization` (with industry type enum covering all 10 target verticals)
  - Template System: `Template`, `Module`, `TemplateModule`, `OrganizationModule` (with status tracking for module activation)
  - CRM: `Client`, `Contact`
  - Workforce: `Employee`
  - Project Management: `Task`
  - Invoicing: `Invoice`, `InvoiceLineItem`, `Payment`
  - Audit: `ActivityLog`
- **Prisma client utility** created at `src/lib/db.ts` with singleton pattern for development.
- **README.md** written with stack overview, setup instructions, and project structure.
- **JOURNAL.md** (this file) created.

### Up Next
- Build initial dashboard layout (sidebar navigation, header, main content area)
- Seed database with sample template and module data for Plumbing/HVAC template (#1)
- Implement auth flow
- Build the "Organization Onboarding" flow — where a new client business selects their industry, gets matched to a template, and sees their module dashboard
- Begin module toggle UI — the core interaction where clients activate/deactivate AI modules

---

## Session 1b — March 18, 2026 (Design Direction & CI Module)

### Design Direction Established
- **Aesthetic:** Nuxt UI Pro-inspired — clean, minimal, professional, elegant.
- **Color Philosophy:** Monochrome as the default. Color used sparingly and intentionally for contrast, status indicators, and calls to action. Monochrome icons and symbols throughout.
- **Space:** Maximize efficiency. No wasted pixels.
- **Modular Dashboard:** Users can pin important content front-and-center or tuck it into menus/slide-outs/drawers. Layout adapts to role:
  - **Receptionist/Office Manager:** Calls in progress, work orders created today, incoming queue.
  - **Field Technician (mobile):** Work orders front and center, quick-access camera button for attaching photos to current work order, minimal chrome.
  - **Owner/Ops Manager:** Business intelligence, KPIs, module status overview.
- **Key Principle:** Every user should be able to customize their view to match their workflow, but smart defaults per role should make it useful immediately out of the box.

### New Module Specified: Client Intelligence (CI)
A universal module available across all industry templates. Serves as both a core business tool and a showcase of A1NT's AI capabilities.

**Core Layer (Client Directory):**
- Client detail cards with basic info, links to all relevant site areas
- Document uploads: forms, certifications, tax info, photos of operations
- Contact info, notes, tags

**Smart Features Layer:**
- **One-Time Analysis:** Basic scan or Advanced scan across full client list
- **Recurring Analysis:** Scheduled reports on configurable cadence
- **Client Filtering:** Sort/group by location, size, subcategory, revenue, onboarding date, sales volume
- **Benchmarking:** Calculate averages across all clients (weekly service calls, installs, estimates). Compare to industry averages. Score and rank each client.
- **Opportunity Detection:**
  - Identify high-performing client behaviors to replicate across lower-activity clients
  - Spot category trends (e.g., "spring cleaning packages sell well here — propose to these 130 clients")
  - Auto-queue marketing actions → pushes to Sales & Marketing module with one click
- **Regional/Climate Intelligence:** Factor in weather, precipitation, seasonal patterns for outdoor industries. Correlate client activity dips with environmental data.
- **Industry News Integration:** Background agents scan for relevant industry news (pest activity, new regulations, product recalls, material shortages) and surface actionable suggestions tied to specific client segments.
- **Preventative Forecasting:** Identify emerging problems before they hit — declining activity trends, seasonal risk patterns, supply chain signals.

### Product Philosophy Note
A1NT clients should always feel confident they have the best, most cutting-edge AI technology at their fingertips — ahead of or at worst alongside their competition. The platform must constantly evaluate and integrate the latest AI capabilities. The CI module is the flagship demonstration of this commitment.

### Up Next
- Begin dashboard layout implementation with the established design direction
- Add CI module models to the Prisma schema
- Create design system documentation (color tokens, spacing, typography)
- Build role-adaptive dashboard shell

---

## Session 1c — March 18, 2026 (Module Architecture)

### Goals
Define the complete universal module list for the A1NT core framework, with detailed feature specs and build priority.

### Work Produced
- **`docs/MODULES.md`** — Full specification for 12 universal modules:
  1. Command Center (Dashboard) — role-adaptive shell, widget system, KPI bar
  2. Client Intelligence (CI) — directory + AI analysis + benchmarking + forecasting
  3. Scheduling & Dispatching — calendar, dispatch board, route optimization, booking widget
  4. Work Orders & Job Tracking — digital work orders, photo attachments, status pipeline
  5. Invoicing & Payments — auto-invoicing from work orders, Stripe, payment portal
  6. Employee & Workforce Management — profiles, time tracking, certifications, payroll export
  7. Inventory & Parts Management — stock tracking, multi-location, POs, reorder automation
  8. AI Receptionist & Phone System — AI voice agent, call routing, transcript logging
  9. Sales & Marketing Automation — campaigns, lead pipeline, estimates, referral tracking
  10. Financial Reporting & Analytics — P&L, cash flow, revenue breakdowns, report builder
  11. Fleet & Equipment Management — vehicles, maintenance scheduling, GPS, fuel tracking
  12. Documents & Knowledge Base — storage, templates, SOPs, form builder, e-signatures

- **Build priority established:**
  - P0: Command Center + Client Intelligence (the shell and the client foundation)
  - P1: Scheduling, Work Orders, Invoicing (core operational loop)
  - P2: Workforce, Inventory, AI Receptionist (operational depth)
  - P3: Sales & Marketing, Financial Reports, Fleet, Documents (growth and analysis layer)

### Up Next
- Begin building P0: Command Center dashboard shell with sidebar navigation
- Scaffold the page routes for all 12 modules
- Seed the database with module definitions
- Start CI module core layer (client directory)

---

## Session 2 — March 18, 2026 (P0 Build: Dashboard Shell + Client Intelligence)

### Goals
Build the P0 deliverables: Command Center dashboard shell with sidebar navigation, all 12 module page routes, and the Client Intelligence module's core client directory.

### Design System Established
- **Monochrome design system** implemented in `globals.css` — Nuxt UI Pro-inspired palette using oklch color space
- Light mode: warm-neutral whites (#F8F7F5 feel) with near-black text and subtle borders
- Dark mode: deep neutral (#1C1B19 feel) with properly contrasted light text
- Color used only for semantic meaning: emerald for positive trends, single accent for active states
- `font-variant-numeric: tabular-nums lining-nums` on body for data-aligned numbers
- Chart colors follow a monochrome gradient rather than rainbow — stays on-brand

### Work Produced

**Dashboard Layout Shell:**
- `src/app/dashboard/layout.tsx` — SidebarProvider + SidebarInset layout with sticky header
- `src/components/app-sidebar.tsx` — Full sidebar with:
  - A1 Integrations logo (inline SVG geometric mark)
  - 4 collapsible nav groups: Core, Operations, Management, Growth & Analytics
  - All 12 modules with Lucide icons, active state highlighting
  - Settings and Organization links in footer
- `src/components/breadcrumb-nav.tsx` — Dynamic breadcrumb from pathname
- `src/components/theme-provider.tsx` — Client-side theme context (system preference + manual toggle)
- `src/components/theme-toggle.tsx` — Sun/Moon toggle button
- shadcn Collapsible component added

**Command Center Page (`/dashboard`):**
- 4 KPI cards: Revenue MTD, Active Jobs, Active Clients, Open Invoices — with trend indicators
- Quick action buttons: New Work Order, New Client, New Invoice
- Recent Activity feed with timestamped events and type indicators
- Today's Schedule panel with time slots, job descriptions, technician assignments, and status badges
- Responsive grid layout (4-col KPIs, 3+2 col main content)

**Client Intelligence Module (`/dashboard/clients`):**
- 4 summary cards: Total Clients, Active, New Leads, Avg Revenue
- Search bar with real-time filtering across name, email, city, tags
- Filter and Sort toolbar buttons (UI ready, functionality stub)
- Full client data table with: Name/City, Status badge, Tags, Revenue (monospace), Open Jobs, Last Service, actions menu
- Client detail slide-out (Sheet) with:
  - Contact info (email, phone, location)
  - Revenue and activity overview
  - Tags display
  - Quick links to Work Orders, Invoices, Schedule
- 8 sample clients across Commercial, Residential, and Institutional categories
- Dropdown menu per row: View Details, Edit, Create Work Order, Create Invoice

**Module Placeholder Pages (10 routes):**
- Scheduling, Work Orders, Invoicing (P1)
- Workforce, Inventory, AI Receptionist (P2)
- Sales & Marketing, Financial Reports, Fleet & Equipment, Documents (P3)
- Settings page with section links
- Each placeholder shows module icon, description, priority badge, and planned features list
- Consistent "Coming Soon" pattern with dashed border

**Infrastructure:**
- Root `/` redirects to `/dashboard`
- All navigation uses Next.js `<Link>` for client-side routing
- `data-testid` attributes on all interactive elements
- Dark mode works correctly across all pages
- Sidebar active state tracks current route

### Decisions Made
- Used Geist (the Next.js default font) as both display and body — it's a clean sans-serif that matches the Nuxt UI Pro aesthetic without adding extra font loads
- Chart colors are monochrome (gray gradient) rather than colorful — stays true to the "color sparingly" directive
- Sidebar groups default collapsed for Management and Growth to keep the nav clean on first load
- Client table uses monospace for currency values (tabular-nums) for proper column alignment
- Slide-out panel (Sheet) rather than full page for client details — supports the "modular" philosophy of content tucked in drawers

### Up Next
- Connect to real database (PostgreSQL) and seed with module definitions + sample data
- Build P1 modules: Scheduling calendar view, Work Order status pipeline, Invoice creation
- Implement role-based dashboard layouts (Owner vs. Manager vs. Technician views)
- Add pinnable widget system to Command Center
- Mobile-responsive testing and technician field view

---
