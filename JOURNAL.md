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

## Session 2b — March 18, 2026 (New Modules: Infrastructure & Geo + Website Builder)

### Goals
Capture and spec out two major new module concepts Josh described: Infrastructure & Geo (spatial/GIS platform) and Website Builder & Manager (client-facing web presence).

### Work Produced

**`docs/MODULE-INFRASTRUCTURE-GEO.md`** — Full specification:
- Architecture: shared core map engine (Mapbox GL JS) that other modules layer onto
- Client-Side Geo: location directory, site drill-down, sticky pins with popups, drawing/annotation tools, photo geo-tagging
- Incident & Compliance: geolocation-tagged incidents, workers' comp with OSHA fields, trend analysis heat maps, audit trail
- In-House Geo: own facility management, utility/service pins, routine inspections, emergency preparedness (evacuation routes, protocols by situation type, drill scheduling)
- 3D Digital Twin: Three.js premium tier, photogrammetry integration path with separate Autodesk Reality Capture project
- Cross-module layer system: dispatch routes, fleet tracking, work order pins, sales territories all as toggleable layers
- Data model proposals: Location, MapAnnotation, Incident, EmergencyPlan, FacilityAsset
- Phased build plan (7 phases from core map through 3D digital twin)

**`docs/MODULE-WEBSITE-BUILDER.md`** — Full specification:
- Tier 1 (included): Static marketing site with live data from A1NT modules, industry templates, constrained builder
- Tier 2 (add-on): Customer portal with login, invoice viewing/payment, service requests, self-scheduling
- Tier 3 (premium): SaaS-style portal with subscriptions, route tracking, knowledge base, API, white-label
- Real-time sync architecture: 8 modules feed website data automatically
- Builder interface: template gallery, section toggles, content editing, preview, one-click publish
- Data model proposals: Website, WebsiteTemplate, WebsiteSection, WebsiteAnalytics
- Revenue implications and pricing tier structure

**Updated `docs/MODULES.md`:**
- Added modules #13 (Infrastructure & Geo) and #14 (Website Builder) with summaries
- Expanded build priority table to include phased delivery for both new modules
- Geo Phase 1-2 at P2, Phase 3-5 at P4, Phase 6-7 (3D) at P5
- Website Builder Tier 1 at P3, Tiers 2-3 at P4

**Dashboard updates:**
- Added Infrastructure & Geo page route (`/dashboard/infrastructure-geo`) with placeholder
- Added Website Builder page route (`/dashboard/website-builder`) with placeholder
- Updated sidebar: Geo under Management group, Website Builder under Growth & Analytics
- Updated breadcrumb nav with new route labels

### Key Design Decisions
- Geo module is a **platform service**, not a silo — its core map engine is shared, and other modules register layers onto it
- Mapbox GL JS recommended over Google Maps for core engine — better dev experience, monochrome styling matches A1NT aesthetic, built-in 3D terrain for future digital twin
- Website Builder is intentionally constrained (not Wix/Squarespace) — template-based with section toggles to prevent ugly results
- Both modules have clear upsell paths: Geo → 3D Digital Twin ($XX/month), Website → Customer Portal → Premium SaaS

### Up Next
- Continue P1 module development (Scheduling, Work Orders, Invoicing)
- Connect to PostgreSQL and seed with module definitions
- Role-based dashboard layouts
- Begin Geo module Phase 1 when P1 operational loop is solid

---

## Session 3 — March 18, 2026 (P1 Build: Scheduling, Work Orders, Invoicing)

### Goals
Build the three P1 operational modules that form the core business loop: Scheduling & Dispatching, Work Orders & Job Tracking, and Invoicing & Payments. Replace placeholder pages with fully functional UI powered by sample data.

### Work Produced

**Database Schema Updates (`prisma/schema.prisma`):**
- Added `WorkOrder` model with full relations (status pipeline, priority levels, client/employee FK, scheduling, cost tracking, notes)
- Added `ScheduleEvent` model with event types (Job, Appointment, Block, Recurring), employee assignment, work order linkage
- Both models include proper relations to existing Client, Employee, and Organization models

**Sample Data System (`src/lib/sample-data.ts`):**
- Comprehensive test data for all three P1 modules:
  - 4 employees with roles, initials, and skill sets
  - 10 work orders across all 7 statuses (New → Invoiced) with realistic service industry content
  - 9 schedule events spanning Mon Mar 16 – Fri Mar 20 (jobs, appointments, blocks, recurring)
  - 6 invoices with full line items, tax calculations, and multiple statuses (Draft, Sent, Paid, Overdue)
- Typed interfaces and exported constants for UI consumption

**Scheduling & Dispatching Module (`/dashboard/scheduling`):**
- 4 KPI cards: Today's Jobs, This Week, Unassigned, Team Available (all computed from data)
- Toolbar: Day/Week tab switcher, date navigation arrows, technician filter dropdown, "New Event" button
- Week View Calendar: CSS grid layout with employee rows × 5-day columns. Event blocks show time range (monospace), title, and client name. Event types visually differentiated (Job=solid, Appointment=dashed border, Block=muted, Recurring=dashed). Today's column highlighted.
- Resource Sidebar: Team overview with utilization bars (busy hours / total hours) and skill badges per employee. Unassigned work orders quick view.
- Upcoming Events: Collapsible chronological list of next 5 events with assignee avatars and work order badges.
- Event Detail Sheet: Full slide-out with schedule info, assignee, client (linked), location, linked work order, action buttons.

**Work Orders & Job Tracking Module (`/dashboard/work-orders`):**
- 4 KPI cards: Total Orders (10), In Progress (1), Completed (4), Revenue ($7,300)
- Dual-view system with Pipeline/Table tab toggle:
  - **Pipeline View (Kanban):** 6 status columns (New → Invoiced) with draggable-looking cards. Each card shows order number, title, priority badge (Emergency=red, High=amber, Normal=secondary, Low=outline), client, assignee avatar, scheduled date. Empty state for columns with no orders.
  - **Table View:** Full data table with 9 columns, sort arrows, monospace for numbers/dates, avatar initials for assignees.
- Triple filter system: Status dropdown, Priority dropdown, Assignee dropdown (including "Unassigned" option)
- Work Order Detail Sheet: Full slide-out with job details (title, description, service type), client & location (linked), assignee info, schedule, time & cost breakdown, notes, timestamps. Context-aware actions: "Create Invoice" only for completed orders, plus Edit, Change Status, View Schedule.

**Invoicing & Payments Module (`/dashboard/invoicing`):**
- 4 KPI cards: Total Outstanding ($8,781.34), Overdue ($2,400 with red alert icon), Paid MTD ($1,651.35), Draft (1)
- Status Distribution Bar: Proportional colored segments showing Draft/Sent/Paid/Overdue breakdown with legend.
- Invoice Table: 8 columns (Invoice #, Client, Status, Issue Date, Due Date, Amount, Paid, Balance). Status badges with distinct colors (Paid=emerald, Sent=blue, Viewed=violet, Draft=secondary, Overdue=red). All monetary values in monospace with 2 decimal places.
- Invoice Detail Sheet: Full slide-out with invoice number + status header, client link, dates (overdue highlighted red), work order link, line items table (compact grid with description/qty/price/total), financial summary (subtotal → tax → total → paid → balance due), notes. Action buttons: Send, Mark as Paid, Download PDF, Edit.

**Cross-Module Links (all wired):**
- Work order numbers in Scheduling → link to Work Orders page
- Client names across all modules → link to Client Intelligence page
- "Create Invoice" from completed work order → link to Invoicing page
- Schedule references in Work Orders → link to Scheduling page
- Work order references in Invoicing → link to Work Orders page

### Design Consistency
- All three modules follow the established monochrome design system — oklch tokens, Geist font, minimal color
- Consistent patterns: `p-6 space-y-6 max-w-[1400px]` wrapper, `text-sm` body, `text-xs` labels, `text-[10px]` for tiny badges, `font-mono` for numbers/dates/codes
- Sheet slide-outs follow the Client Intelligence pattern: section headers as uppercase tracking-wider labels, Separator between sections, consistent action button placement
- Dark mode verified across all three modules
- All interactive elements have `data-testid` attributes for future test automation

### Decisions Made
- Pipeline (kanban) view is the default for Work Orders — matches how field service managers mentally model job flow
- Table view is secondary but essential for searching/filtering large datasets
- Invoice detail shows complete financial breakdown inline (no separate page) — supports the "content in drawers" philosophy
- Status distribution bar on Invoicing page provides at-a-glance health of AR — most useful for the owner/office manager role
- Scheduling resource sidebar shows utilization bars — quick visual for dispatch decisions

### Up Next
- Connect to PostgreSQL database and migrate sample data to real records
- Build P2 modules: Employee & Workforce, Inventory & Parts, AI Receptionist
- Implement role-based dashboard views (field tech mobile view, receptionist view)
- Add drag-and-drop to scheduling calendar and work order pipeline
- Implement real invoice PDF generation and email sending
- Begin Infrastructure & Geo Phase 1 (core map engine)

---
