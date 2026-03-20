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

## Session 3b — March 18, 2026 (Vercel Build Fixes)

### Context
After pushing the P1 module build, Vercel deployment failed with multiple TypeScript compilation errors. These were caused by shadcn v4's migration from Radix primitives to Base UI, Prisma 7.x client generation changes, and strict TypeScript narrowing.

### Problems Fixed

1. **`asChild` prop removal (shadcn v4 / Base UI):**
   - shadcn v4 uses `@base-ui/react` instead of Radix — the `asChild` prop does not exist.
   - Replaced all `asChild` usage in DropdownMenuTrigger, CollapsibleTrigger, and similar components with direct children or the `render` prop pattern.
   - Affected files: `app-sidebar.tsx`, `clients/page.tsx`, `page.tsx` (dashboard)

2. **Select `onValueChange` null handling (Base UI):**
   - Base UI's Select passes `string | null` to `onValueChange`, not `string`.
   - Added null coalescing: `(v) => setState(v ?? "all")` across all Select usages in Scheduling, Work Orders, and Invoicing modules.

3. **KPI trend type narrowing (TypeScript strict):**
   - TypeScript strict mode detected that `as const` narrowed trend values to specific literal strings, making some union branches unreachable.
   - Widened type to `as "up" | "down" | "neutral"` to satisfy the compiler.

4. **Prisma module resolution (`@/generated/prisma`):**
   - Prisma 7.x generates client files without an `index.ts` barrel — `PrismaClient` lives in `client.ts`.
   - Generated files are in `.gitignore` (correct), so they don't exist on Vercel at build time.
   - **Fix:** Added `prisma generate` to the build script (`"build": "prisma generate && next build"`).
   - **Fix:** Commented out `db.ts` as a placeholder since no modules import it yet and Prisma 7.x constructor API requires `accelerateUrl` when not using a direct connection.

### Build Result
- Clean build: all 19 routes compiled and generated successfully.
- `prisma generate` runs automatically before `next build` on Vercel.

### Work Produced
- Modified: `package.json` (build script), `src/lib/db.ts` (placeholder stub)
- Modified: `app-sidebar.tsx`, `clients/page.tsx`, `dashboard/page.tsx`, `scheduling/page.tsx`, `work-orders/page.tsx`, `invoicing/page.tsx` (type fixes)
- All changes committed and pushed to `main`.

### Up Next
- Build P2 modules: Employee & Workforce, Inventory & Parts, AI Receptionist
- Implement role-based dashboard views
- Begin Infrastructure & Geo Phase 1

---

## Session 4 — March 18, 2026 (Command Center Visual Overhaul)

### Goals
Transform the Command Center from a standard dashboard into an immersive, map-first command interface. Full-bleed satellite map background, floating glass overlay widgets, redesigned sidebar, security camera feeds, and UniFi Protect integration scaffold.

### Design Decisions
- **Full-bleed map:** Satellite imagery with 3D terrain spans the entire viewport edge-to-edge, no borders or partitions
- **Glass overlays:** All widgets (KPIs, activity feed, schedule, cameras) float on top of the map with `bg-black/50 backdrop-blur-xl` treatment
- **Dual map providers:** Mapbox GL JS as primary (satellite-streets-v12 style with 3D terrain), Google Maps 3D Tiles as secondary/fallback
- **Sidebar redesign:** Minimized to icons only (w-14) by default, expands to full width on click. Notification dot system with blue→yellow→orange→red spectrum. Quick links flyout on hover in collapsed state. Section dividers with aggregate notification indicators.
- **Business branding:** Sidebar header shows client business name ("Old Bishop Farm") with "Powered by A1 Integrations" subtitle. Platform logo moved to subtle branding.
- **Camera widgets:** Compact floating feeds with status indicators (Live/Recording/Motion/Offline), door access controls for doorbell cameras, mute/expand toggles, scan-line mock feed aesthetic

### Work Produced

**New Components:**
- `src/components/command-map.tsx` — Full-bleed satellite map with Mapbox GL JS (3D terrain, satellite-streets hybrid, HQ marker with popup) and Google Maps fallback. Graceful degradation when API keys not set.
- `src/components/camera-widget.tsx` — Security camera feed widget with mock feeds, status indicators, door access controls, expand/collapse, mute toggle. CameraGrid wrapper for multiple feeds.
- `src/components/app-sidebar.tsx` — Complete rewrite: icon-minimized default state, expandable with business name, 4 section groups (Core/Operations/Management/Growth), notification dot system (blue→red spectrum), quick links flyout tooltips, notification count badges.

**New Libraries:**
- `src/lib/unifi-protect.ts` — Full UniFi Protect API client scaffold: authentication, camera listing, RTSP/snapshot/web stream URLs, door unlock control, event polling, WebSocket event subscription. Ready to connect to live NVR.

**Modified Files:**
- `src/app/dashboard/layout.tsx` — Stripped old SidebarProvider/SidebarInset. New layout: dark bg-neutral-950, fixed sidebar + offset main content.
- `src/app/dashboard/page.tsx` — Complete rewrite: full-bleed CommandMap, floating KPI cards, quick action buttons, collapsible Recent Activity panel, collapsible Today's Schedule panel, camera feed toggle with CameraWidget instances.
- `src/app/globals.css` — Added scrollbar-none utility class.
- `package.json` — Added mapbox-gl, @types/mapbox-gl, @types/google.maps

**Environment Variables (to set on Vercel):**
- `NEXT_PUBLIC_MAPBOX_TOKEN` — Mapbox access token for satellite map
- `NEXT_PUBLIC_GOOGLE_MAPS_KEY` — Google Maps API key (fallback)
- `UNIFI_PROTECT_HOST` — UniFi NVR hostname (future)
- `UNIFI_PROTECT_USERNAME` / `UNIFI_PROTECT_PASSWORD` — NVR auth (future)

### Demo Configuration
- HQ Address: 500 S Meriden Rd, Cheshire, CT 06410 (Old Bishop Farm)
- Map center: 41.4989, -72.8685
- Default view: 60° pitch, -30° bearing, zoom 17

### Up Next
- Add Mapbox token to Vercel environment variables to activate satellite map
- Add Google Maps API key for 3D Tiles fallback
- Connect live UniFi Protect camera feeds
- Continue P2 module development (Employee & Workforce, Inventory, AI Receptionist)
- Build section "mini landing pages" for sidebar section icons
- Add notification preferences to Settings page

---

## Session 5 — March 18, 2026 (Map Feature Planning & Roadmap)

### Context
Map is live and working on the deployed Command Center. Josh is excited about the satellite view with 3D terrain and wants to plan advanced map capabilities: address search for navigating to client sites, 3D object editing (draw shapes and extrude them SketchUp-style), color/material customization, client grouping visualization, and geo data layers for lead generation and marketing intelligence.

### Research Completed
Deep dive into Mapbox GL JS 3D capabilities and ecosystem:

- **`@mapbox/search-js-react`** — Official React geocoder component. Drop-in address search bar with autocomplete, fly-to-location, and marker placement. Can be combined with internal client directory for a hybrid "search addresses OR clients" bar.
- **`@mapbox/mapbox-gl-draw`** — Official drawing plugin. Supports rectangles, polygons, lines, freehand, circles with vertex editing. Pairs with the `fill-extrusion` layer type for 3D.
- **`fill-extrusion` (native Mapbox)** — Built-in layer type that extrudes any GeoJSON polygon to a specified height in meters. Supports per-polygon color, opacity, base height. This IS the SketchUp-style push/pull Josh described — draw a rectangle, set a height, it rises from the ground. No extra library needed.
- **Threebox / Three.js integration** — For premium features: imported 3D models (glTF, FBX), full material system (textures, reflections, lighting), custom meshes. Uses Mapbox `CustomLayerInterface` to sync Three.js camera with Mapbox camera.
- **Mapbox Boundaries** — 4M+ boundary polygons (ZIP, county, state, legislative, postal). Paid add-on for territory planning and jurisdiction mapping.
- **US Census API** — Free demographic data down to block-group level (income, housing age, homeownership, business establishment counts). Overlayable as choropleth layers.
- **Commercial data APIs** — CoreLogic/ATTOM for property parcels, BuildZoom for permits, weather APIs for seasonal intelligence. Future integration targets.

### Work Produced

**`docs/MAP-FEATURES.md`** — Comprehensive feature roadmap for the Command Center map:
1. Address Search Bar — geocoder with client directory hybrid search
2. 3D Object Editing — 7-phase plan from 2D drawing through full 3D model import
3. Client Grouping & Visualization — clustering, color coding, heat maps, service area polygons
4. Geo Data Layers — demographic overlays, lead scoring, industry-specific intelligence layers
5. Implementation matrix: what's native today vs. needs libraries vs. future premium
6. Use cases mapped to all 10 industry templates (HVAC targeting old homes by ZIP, landscaping targeting large lots, etc.)

### Key Findings
- The SketchUp-style 3D editing Josh described is natively supported by Mapbox via `fill-extrusion` — no need for heavy external 3D libraries for the core feature
- Colors and opacity per shape are trivial (native paint properties)
- Full texture/material support requires Three.js bridge (threebox) — maps to the premium Digital Twin tier already planned in Infrastructure & Geo module
- Census data is free and powerful for lead generation — income, housing age, business density all available by ZIP/tract
- The geocoder + client search hybrid will be the most immediately useful feature for day-to-day operations

### Up Next
- Continue to P2 module development (Employee & Workforce, Inventory & Parts, AI Receptionist)
- Implement address search bar as first map enhancement (low effort, high impact)
- Begin 2D drawing tools integration when Infrastructure & Geo Phase 1-2 is scheduled
- Evaluate Mapbox Boundaries pricing for territory/jurisdiction features

---

## Session 5b — March 18, 2026 (Map Quick Wins: Search + Drawing + 3D Extrusion)

### Goals
Implement the low-hanging fruit map features before moving to P2 modules: address/client hybrid search bar, polygon drawing tools, 3D extrusion controls with color picker.

### Work Produced

**New Dependencies:**
- `@mapbox/mapbox-gl-draw` v1.5.1 — Official drawing plugin
- `@mapbox/search-js-react` v1.5.1 — Official geocoder React component
- `@types/mapbox__mapbox-gl-draw` — TypeScript definitions

**New Components:**

- **`src/components/map-search.tsx`** — Hybrid address/client search bar:
  - Glass-styled floating search bar in the Command Center top row
  - Dual-source search: filters internal client directory AND queries Mapbox Geocoding API
  - Client results show name, status badge (Active/Lead/Inactive), address, building/person icon
  - Geocoder results show address with map pin icon
  - Selecting a result flies the map to that location with smooth animation
  - Proximity bias centered on Old Bishop Farm HQ
  - Debounced geocoder requests (400ms) to avoid API spam
  - 8 sample clients with geocoded lat/lng in the Cheshire, CT area
  - Keyboard-friendly with clear button and loading spinner

- **`src/components/map-draw.tsx`** — Drawing toolbar with 3D extrusion:
  - Collapsible "Draw" button that expands into a full toolbar panel
  - 4 drawing tools: Select (arrow), Rectangle, Polygon, Line
  - Mapbox GL Draw integration with custom emerald-accented draw styles
  - Per-shape properties panel ("Next Shape" for defaults, shape-specific when selected):
    - Color picker: 8 material-inspired presets (Steel, Concrete, Brick, Wood, Glass, Forest, Navy, White)
    - Height slider: 0–50m with real-time 3D extrusion via Mapbox `fill-extrusion`
    - Opacity slider: 10%–100%
  - Delete selected shape, clear all shapes
  - Shape counter badge on collapsed button
  - All drawn shapes automatically extruded in 3D using native Mapbox fill-extrusion layer

**Modified Components:**

- **`src/components/command-map.tsx`** — Added `onMapReady` callback prop to expose map instance. Added `user-extrusions` GeoJSON source and `user-extrusions-3d` fill-extrusion layer for drawn shapes.

- **`src/app/dashboard/page.tsx`** — Integrated MapSearch in top bar row (between location badge and system status). Integrated MapDraw below quick actions. Map instance passed to both components via `onMapReady` callback and React state.

**New Files:**
- `src/types/mapbox-draw.d.ts` — TypeScript declarations for @mapbox/mapbox-gl-draw

### Technical Notes
- Draw CSS loaded dynamically via `<link>` tag injection (avoids Tailwind v4 CSS module resolution issues)
- Mapbox Geocoding API called directly via fetch (simpler than the full search-js-react component for our hybrid use case)
- Fill-extrusion layer uses data-driven expressions: `['get', 'color']`, `['get', 'height']`, `['get', 'opacity']` so each shape has independent properties
- All 19 routes compile clean in production build

### Up Next
- Build P2 modules: Employee & Workforce, Inventory & Parts, AI Receptionist
- Wire client markers/clustering on the map (when client data is in database)
- Add measurement display (area, perimeter) to drawn polygons
- Census demographic choropleth layers

---

## Session 6 — March 18, 2026 (P2 Build: Workforce, Inventory, AI Receptionist)

### Goals
Build all three P2 modules — Employee & Workforce, Inventory & Parts Management, and AI Receptionist & Phone System — with full sample data, completing the operational depth layer of the platform.

### Work Produced

**Sample Data (`src/lib/sample-data-p2.ts`):**
- 6 employees with detailed profiles: skills, certifications (with expiry tracking), weekly hours, performance ratings, departments, roles, pay rates
- 12 inventory items across 7 categories (Piping, Fittings, Equipment, Filters, Consumables, Valves, HVAC, Tools) with SKU codes, stock levels, min/max thresholds, unit costs, suppliers, location tracking, monthly usage
- 5 warehouse/shop locations with per-category value breakdowns
- 4 purchase orders in various statuses (Pending, Ordered, Partial, Received)
- 10 call log entries with caller info, AI-detected intent classification, priority levels, duration, status, transcript excerpts, and auto-created actions (work orders, appointments, leads)
- 6 call routing rules with conditions, destinations, and schedules
- All data types fully typed with TypeScript interfaces

**Employee & Workforce Module (`/dashboard/workforce`):**
- 4 KPI cards: Total Employees (6), Active Today (5), Certs Expiring (3), Hours This Week (196)
- Directory / Time Tracking tab system
- Directory view: searchable, filterable employee table with:
  - Avatar initials, name, role, department
  - Skill badges (HVAC, Plumbing, Electrical, etc.)
  - Certification count with expiry alerts (amber "alert" badges)
  - Weekly hours and performance rating (star display)
  - Action dropdown per row (View, Edit, Assign, View Schedule)
- Time Tracking view: weekly timesheet grid per employee with daily hours, overtime flagging, and summary row
- Employee Detail Sheet: slide-out with full profile, contact info, skills & certifications section (with expiry dates and status badges), current week hours, performance history, pay rate, assigned work orders link
- Department and status filter dropdowns with null-safe handling

**Inventory & Parts Module (`/dashboard/inventory`):**
- 4 KPI cards: Total SKUs (12), Low/Out of Stock (4), Inventory Value ($4,943.40), Open POs (4)
- Category value breakdown: horizontal scrollable cards showing value per category (All, Piping, Fittings, Equipment, HVAC, Tools) with icons — acts as quick category filter
- Inventory / Purchase Orders tab system
- Inventory view: dense data table with:
  - SKU (monospace), item name, category badge, stock level (color-coded: green=in stock, amber=low, red=out), min/max thresholds, unit cost, location, supplier, monthly usage, status badge
  - Action dropdown per row (View, Edit, Reorder, Usage History)
- Purchase Orders view: PO table with order number, supplier, date, status, item count, total, expected delivery
- Item Detail Sheet: slide-out with full item info, stock history section, supplier info, reorder point, usage trends, linked work orders
- Category, status, and location filter dropdowns

**AI Receptionist & Phone System (`/dashboard/ai-receptionist`):**
- Live Call Banner: green pulsing indicator with caller name, phone number, intent badges (Emergency, Urgent), duration timer, assigned technician — appears at top when active call detected
- 8 KPI cards across 2 rows:
  - Row 1: Calls Today (23), Avg Wait (0:08), AI Handled (78%), Missed Rate (4.3%)
  - Row 2: Leads Captured (4), WOs Created (6), Appointments (3), Avg Duration (3:42)
- Call Log / Call Routing tab system
- Call Log view: detailed call table with:
  - Time (monospace), caller name & phone, AI-detected intent badge (Emergency=red, Service Request=blue, Appointment=purple, Sales Inquiry=emerald, Billing=secondary, General=outline), priority level, duration, status (Active=green pulse, Completed=green check, Voicemail=amber, Missed=red), auto-created actions (WO links, Apt badges, Lead badges)
  - Action dropdown per row (View Transcript, Listen, Create Work Order, Add to CRM)
- Call Routing view: routing rules table with rule name, conditions, destination, schedule, active toggle, priority
- Call Detail Sheet: slide-out with full call info, AI transcript with speaker labels and timestamps, intent classification confidence score, actions taken, caller history
- Call type and status filter dropdowns

### Cross-Module Integration
- Workforce → Work Orders: employee assignments link to work order detail
- Workforce → Scheduling: "View Schedule" action links to scheduling module
- Inventory → Work Orders: parts used tracked per work order
- AI Receptionist → Work Orders: auto-created WOs show linked WO number with clickable badge
- AI Receptionist → Scheduling: auto-created appointments show linked appointment badge
- AI Receptionist → Clients: leads captured link to Client Intelligence

### Design Consistency
- All modules follow established patterns: `p-6 space-y-6 max-w-[1400px]` wrapper, KPI card grid, toolbar with search + filters, table + sheet detail
- Monochrome design system with oklch tokens, color used only for semantic status
- `font-mono` for all numbers, dates, codes, and currency values
- All interactive elements have `data-testid` attributes
- Dark mode verified across all three modules
- Base UI Select null-safety pattern applied consistently

### Build Verification
- TypeScript: `npx tsc --noEmit` — clean, zero errors
- Production build: `npm run build` — all 19 routes compiled and generated successfully
- Visual QA: Playwright screenshots captured for all 3 modules at 1600×900 viewport
- Sidebar navigation already wired for all 3 P2 modules from Session 4

### Up Next
- Build P3 modules: Sales & Marketing, Financial Reporting, Fleet & Equipment, Documents & Knowledge Base
- Connect to PostgreSQL and migrate from sample data to real database records
- Begin Infrastructure & Geo Phase 1-2 build (map-first features already partially in place)
- Role-based dashboard views (field tech mobile view, receptionist view)
- Drag-and-drop scheduling and work order pipeline
- Live UniFi Protect camera feed integration

---

## Session 7 — March 18, 2026 (P3 Build: Sales & Marketing, Financial Reports, Fleet, Documents)

### Goals
Build all four P3 modules — Sales & Marketing Automation, Financial Reporting & Analytics, Fleet & Equipment Management, and Documents & Knowledge Base — completing the growth and analysis layer of the platform.

### Context
Josh confirmed plans for deep hardware integrations:
- **VoIP + Ubiquiti:** AI Receptionist will integrate with VoIP phone system and Ubiquiti desk phones (small screens for camera feeds), all connected via VoIP and Ubiquiti APIs
- **Mobile RFID Inventory:** Stick-on RFID tags scanned via mobile app/webapp, updating inventory in real time. Parts usage traces directly to work orders → invoices → year-end accounting. Manual entry as fallback.

### Work Produced

**Sample Data (`src/lib/sample-data-p3.ts`):**
- 8 leads across all pipeline stages (New → Won/Lost) with AI lead scores, sources, follow-ups
- 6 marketing campaigns (Email, SMS, Automated Sequence, Direct Mail, Referral Program) with open/click/convert metrics and ROI
- 5 estimates with full line items, varying statuses (Sent, Viewed, Accepted, Declined)
- 5 referrals from clients, partners, and employees with reward tracking
- 6 months of financial data (Oct 2025 – Mar 2026) with revenue, expenses, profit, jobs
- 8 expense categories with budgeted vs actual amounts
- 6 revenue-by-service breakdowns with trend indicators
- 5 AR aging buckets with client-level detail
- 4 technician performance profiles
- 5 vehicles (3 vans, 1 truck, 1 trailer) with full specs, assignments, insurance/registration dates
- 7 maintenance records across all statuses
- 8 pieces of equipment with serial numbers, conditions, assignments
- 12 documents across 6 categories (Operations, HR, Client-Facing, Technical, Administrative, Safety)
- 6 knowledge base articles including a draft RFID scanning guide
- 6 form templates with submission counts
- All data types fully typed with TypeScript interfaces

**Sales & Marketing Module (`/dashboard/sales-marketing`):**
- 4 KPI cards: Pipeline Value ($68,400), Conversion Rate (12.5%), Campaign Revenue ($70,100), Referrals (5)
- Leads tab: Kanban pipeline view with 4 active columns (New, Contacted, Qualified, Proposal) + Won/Lost summary cards below. Each lead card shows name, company, AI lead score (color-coded bar: green 70+, amber 50-69, gray <50), value, source, assignee avatar, follow-up date.
- Campaigns tab: Campaign table with type icons, audience, sent/opened/clicked/converted funnel, revenue, ROI percentage (color-coded green/red)
- Estimates tab: Estimate table with number, client, title, status badge, amount, dates. Detail sheet with full line items grid (negative amounts in red for discounts)
- Referrals tab: Summary cards (total, converted value, pending value) + referral table with referrer type badges

**Financial Reporting Module (`/dashboard/financial-reports`):**
- 4 KPI cards: Revenue MTD ($48,200 / +21.1%), Net Profit ($17,800 / 36.9% margin), Expenses MTD ($33,873 / vs $35,900 budget), AR Outstanding ($12,981.34 / $7,750 overdue)
- Overview tab: CSS bar chart showing 6-month revenue/expense/profit trends. Monthly summary table with margin percentages (emerald for 30%+ margins)
- Expenses tab: Budget vs actual per category with progress bars, over/under budget indicators
- Revenue tab: Revenue by service type with horizontal bars, trend arrows, percentage of total
- AR Aging tab: Stacked distribution bar, clickable aging bucket cards (Current → 90+ Days) with color gradient (emerald → red), client-level breakdown with links to Client Intelligence
- Team Performance tab: Technician comparison with revenue bars, jobs, avg job value, $/hour, cost/job, star ratings, cross-linked to Workforce module

**Fleet & Equipment Module (`/dashboard/fleet-equipment`):**
- 4 KPI cards: Active Fleet (4/5, 1 in shop), Maintenance (2, 1 overdue), Monthly Fleet Cost ($2,305), Equipment Out (4/8, 3 available)
- Vehicles tab: Vehicle table with name/make/model, type, status (Active/In Shop/Out of Service), assigned employee, mileage, next service date, monthly cost. Detail sheet with VIN, plate, fuel type, insurance/registration expiry warnings, cost summary, maintenance history
- Maintenance tab: Records table with vehicle, service type, status, dates, cost, vendor. Contextual actions (Start Service, Mark Complete, Reschedule). Filters by status and vehicle
- Equipment tab: Equipment table with name, serial number, category, status, condition, assignment, location, cost. Condition badges (Excellent → Poor). Checkout/checkin actions

**Documents & Knowledge Base Module (`/dashboard/documents`):**
- 4 KPI cards: Documents (12, 11 active), KB Articles (6, 5 published), Form Templates (6, 1,443 submissions), KB Views (586 all-time)
- Documents tab: 12 documents with distinct type badges (Document=blue, Template=violet, SOP=amber, Form=emerald, Certificate=cyan, Training=pink), category, status, version tracking (v1-v5), file sizes, shared indicator. Search + type/category filters
- Knowledge Base tab: Article card grid with title, category, excerpt, author, views, helpful count, tags. Published/Draft/Under Review status
- Forms tab: Form templates table with field count, submissions, last used, assigned roles

### Cross-Module Integration
- Sales → Clients: Lead/client names link to Client Intelligence
- Sales → Work Orders: Estimate conversion creates work orders
- Financial → Clients: AR aging client names link to Client Intelligence
- Financial → Workforce: Technician names link to Workforce module
- Fleet → Workforce: Assigned employees link to Workforce profiles
- Documents → all modules: SOPs, forms, and templates serve operational workflows

### Build Verification
- TypeScript: `npx tsc --noEmit` — clean, zero errors
- Production build: `npm run build` — all 19 routes compiled and generated successfully
- Visual QA: Playwright screenshots captured for all 4 modules at 1600×900 viewport

### Up Next
- Begin Website Builder module (Tier 1 — static marketing sites with live data)
- Connect to PostgreSQL and migrate from sample data to real database records
- Continue Infrastructure & Geo Phase 1-2 build
- Role-based dashboard views (field tech mobile view, receptionist view)
- VoIP integration planning for AI Receptionist
- RFID scanner integration planning for Inventory module
- Mobile webapp responsive design pass

---

## Session 8 — March 18, 2026 (New Module Specs: Import/Onboarding + AI Agents)

### Context
With all 12 original universal modules built (P0–P3), Josh defined two major new additions to round out the core platform: an Import & Onboarding system to make switching from competitors painless, and an AI Agents framework that represents the defining vision of A1 Integrations.

### Work Produced

**`docs/MODULE-IMPORT-ONBOARDING.md`** — Module 15: Import, Onboarding & Automated Reporting
Three-pillar module:
1. **Data Import & Migration:** 9 import channels (file upload, QuickBooks, Xero, Google Sheets, industry CRM connectors, email parsing, OCR document scanning, manual entry, API). 7-step import wizard with AI field mapping, duplicate detection (fuzzy matching), data normalization (USPS address validation, phone formatting, date parsing), relationship inference (auto-link invoices to clients), historical date preservation, incremental sync, and full rollback. Industry-specific import templates for ServiceTitan, Housecall Pro, Jobber, PestPac, ZenMaid, etc.
2. **Guided Onboarding:** AI onboarding assistant that walks through a 15-step setup checklist, configures the platform per industry template, runs verification sweeps (missing data, unlinked records, incomplete config), produces an "Onboarding Report Card." Includes role-based tutorial paths, practice/sandbox mode, and employee certification tracking.
3. **Automated Reporting:** Custom report builder with drag-and-drop field selection from any module, scheduled delivery (daily/weekly/monthly via email PDF, SMS summary, or in-app), AI-generated executive summaries, 12 pre-built report templates. Per-role alert matrix (alert type × role × channel × frequency) with quiet hours and priority override.

Data model: ImportJob, ImportMapping, OnboardingProgress, AlertRule, ReportTemplate, ScheduledReport, ReportDelivery.
Phased build: file upload wizard → QuickBooks/Xero connectors → OCR + custom reports → industry-specific connectors.

**`docs/MODULE-AI-AGENTS.md`** — Module 16: AI Agents
The core differentiator of the A1 platform. Two tiers:

1. **Tier 1 — Assistant Agents:**
   - Web App Helper (context-aware chat on every page, can perform actions and navigate)
   - Onboarding Agent (guided setup, verification sweeps)
   - Training Agent (interactive tutorials, certification, best practices)

2. **Tier 2 — Agent Employees:**
   - Appear as literal line items on the employee roster alongside human employees
   - 22+ assignable roles: Receptionist, Dispatcher, Inside Sales, Customer Service, Follow-Up Manager, Clerical/Data Entry, Financial Analyst, Tax Prep Assistant, Bookkeeper, Social Media Manager, Content Creator, Lead Generator, Advertising Assistant, Troubleshooting Tech, Systems Planner, MEP Draftsman, Building Code Reviewer, Continuing Ed Instructor, Legal Framework Reviewer, Risk/Liability Analyst, Customer Satisfaction Manager, and more
   - Full employee lifecycle: provision → configure → onboard → deploy → learn → review → tune → promote/demote
   - Performance review system: automated metrics (task volume, accuracy, response time, escalation rate, resolution rate, client satisfaction) + supervisor ratings (5 categories) + client feedback + peer comparison + improvement tracking
   - Multi-channel communication: phone (VoIP), email, chat, SMS, web forms, voice
   - Real-time context system: live data access, event stream subscription, cross-agent coordination, long-term memory, full context window per interaction
   - 6-layer system prompt architecture: platform → industry → organization → role → personality → live context — all layers update in real time
   - Security: role-based access (same RBAC as humans), configurable action permissions, spend limits, full audit trail, human-in-the-loop gates, kill switch
   - Future: Agent Marketplace with pre-built templates, community sharing, custom builder, performance benchmarks

Josh’s vision articulated: "depending on your industry and use case, you could potentially run and operate an entire business solely with our agents on the A1 system. You could leave that feature off, or layer in a handful to work hybrid and enhance your human equity — the choice is yours."

Data model: Agent, AgentRole, AgentPermission, AgentTask, AgentReview, AgentFeedback, AgentMemory, AgentEscalation, AgentMetrics.
Phased build: helper agent → onboarding + receptionist agents → agent employee framework → additional roles → advanced roles → marketplace.

**Updated `docs/MODULES.md`:**
- Added Module 15 (Import & Onboarding) and Module 16 (AI Agents) summaries
- Updated build priority table with status indicators for all completed modules (✅ Built)
- Import & Onboarding slotted at P4 (Phase 1-2)
- AI Agents slotted at P4 (Phase 1-2) and P5 (Phase 3-6)
- Total module count now: 16 universal modules

### Up Next
- Website Builder (Tier 1) — last remaining P3 item
- Begin building Import/Onboarding UI pages (import wizard, onboarding checklist, alert matrix, report builder)
- Begin building AI Agents UI pages (agent roster, agent profile, agent chat panel, performance dashboard)
- Continue Infrastructure & Geo Phase 1-2 completion
- Database connection and migration from sample data to real records

---

## Session 9 — March 18, 2026

### Context
All P3 modules were completed in Session 8 except Website Builder, which was in the architecture planning phase. Josh approved the architecture discussion and asked to proceed with building the Website Builder management module in the dashboard. He confirmed the key insight: the builder UI is the same regardless of hosting strategy — it's a content management and configuration tool that produces structured data. The deployment strategy (multi-tenant Next.js vs static HTML push) can be decided later since the "Publish" button is just the seam where that plugs in. Josh also noted the appeal of starting with simple static site generation — clean HTML landing pages with contact info — as a fast path to getting clients live.

### Goals Established
1. Build the Website Builder module page in the A1NT dashboard
2. Include template gallery, site management, theme configuration, section editor, preview, publish controls, and analytics
3. Add a "Quick Launch" flow concept for clients to go from zero to live landing page in minutes
4. Follow the same P3 design patterns (shadcn v4, monochrome aesthetic, sheet detail views, KPI cards)

### Work Produced

**`src/lib/sample-data-p3.ts` — Website Builder data added:**
- 6 industry-specific templates: Pro Service (Plumbing), Climate Control (HVAC), Greenscape (Landscaping), PowerLine (Electrical), FleetPro (Auto Repair), SparkClean (Cleaning)
- 5 client websites with varying statuses: 3 Published, 1 Draft, 1 Maintenance
- Full section configurations per site with module sync sources (Workforce, Organization, Geo, Sales & Marketing, etc.)
- Analytics data: 30-day page views, unique visitors, form submissions, top pages, daily traffic sparklines
- Theme configs per site: primary/accent colors, font family, dark mode toggle
- SEO configs: title, meta description, OG image
- Tier system: Static (Tier 1), Portal (Tier 2), Premium (Tier 3)

**`src/app/dashboard/website-builder/page.tsx` — Full module page (1,290 lines):**

Three main tabs:
1. **My Sites** — Card-based site list with color swatches, status/tier badges, sparkline traffic trends, section pills showing active sections with sync indicators (⚡ Zap icon for module-synced sections), hidden section count
2. **Templates** — 3-column grid of template cards with gradient preview swatches, industry badges, section icon pills, popularity scores, hover preview button
3. **Analytics** — Aggregate traffic overview (total views, visitors, submissions) + per-site performance table with sparklines, top pages, sortable by views

Site detail Sheet (slide-out) with 4 sub-tabs:
- **Sections** — Drag-handle reorderable section list with visibility toggles (Switch), sync source indicators with recency, edit buttons, add section button
- **Theme** — Primary/accent color swatches with hex values, typography preview, dark mode toggle, responsive device preview (Desktop/Tablet/Mobile) with mock site rendering
- **SEO** — Title and meta description with character counters, Google search preview card, sitemap/schema markup/OG image toggles
- **Stats** — Per-site analytics: 3 KPI cards, bar chart for daily traffic, top pages with percentage bars

Action buttons adapt by status:
- Draft sites: "Publish Site" primary CTA + Quick Launch card ("Get a live landing page in under 2 minutes")
- Published/Maintenance: "Rebuild" + "View Live Site" buttons

Domain info panel shows custom domain or A1NT subdomain (`*.a1nt.app`) with copy/open buttons.

**Also added:** `@/components/ui/switch.tsx` via shadcn CLI (was not previously installed).

**Build status:** `tsc --noEmit` clean, `npm run build` clean (19 static pages generated).

### Architecture Decision (Ongoing)
Recommended Approach B (Multi-Tenant Next.js with subdomain routing) for the deployment side, but Josh noted that starting simple with static HTML generation is tempting and practical. The builder module itself is deployment-agnostic — the "Publish" button is a placeholder seam. Decision on hosting strategy deferred; builder UI is complete.

### Up Next
- Josh to test Website Builder module UI
- Finalize hosting/deployment strategy for client sites
- P4: Begin Import & Onboarding module UI (import wizard, onboarding checklist, alert matrix)
- P4: Begin AI Agents module UI (agent roster, agent profile, performance dashboard)
- Infrastructure & Geo: remaining 3D Digital Twin features
- Database connection and migration from sample data to real records

---

## Session 9b — March 19, 2026

### Context
Continuation of Website Builder work. Josh confirmed the builder UI is deployment-agnostic and asked to get a basic working prototype — clients should be able to see their generated site and eventually publish a static HTML landing page.

### Goals Established
1. Build a static site generator that produces complete, self-contained HTML from a ClientWebsite config
2. Wire it into the dashboard with live preview (iframe), device toggle, and publish flow
3. Make the entire path work end-to-end: click site → see preview → download or publish

### Work Produced

**`src/lib/site-generator.ts` — Static site generator (859 lines):**
- Takes a `ClientWebsite` config and produces a complete, self-contained HTML page
- Embedded CSS with CSS custom properties driven by the site's theme (primary/accent colors)
- Google Fonts loaded per the site's font family config
- Renders all 10 section types: Hero, Services, About, Team, Reviews, Contact (with form), Map (placeholder), Promotions, Gallery, FAQ (with toggle)
- Responsive design — mobile breakpoints, sticky nav, flexible grids
- Section order follows the site's configured section ordering
- Nav links auto-generated from visible sections
- SEO meta tags (title, description, Open Graph)
- HTML entity escaping for security
- Footer with "Powered by A1 Integrations" branding
- Default content per section (would come from DB/modules in production)

**`src/app/api/website/generate/route.ts` — First API route in the project:**
- GET endpoint accepting `?siteId=` parameter
- Looks up site from sample data, generates HTML, returns `text/html`
- Error handling for missing/invalid IDs

**Updated `src/app/dashboard/website-builder/page.tsx`:**
- Added **Preview tab** (now the default when opening a site) with:
  - Live iframe rendering the generated site via API call
  - Device toggle (Desktop/Tablet/Mobile) adjusting iframe width
  - Full Screen mode (fixed overlay with device toggle)
  - Download button (generates blob, triggers file download as HTML)
  - Loading spinner during generation
  - Published URL success card
- **Rebuild Preview** button regenerates the preview from the API
- **Publish / View Live Site** button opens the generated HTML in a new tab and simulates publish
- Quick Launch CTA shows for draft sites without a preview yet
- All 5 sheet tabs: Preview, Sections, Theme, SEO, Stats

**Visual QA — generated sites look professional:**
- Tested Ace Plumbing (blue theme, Inter font) and Summit HVAC (dark+cyan theme, DM Sans)
- Both sites render with proper nav, hero, services grid, reviews, contact form, footer
- Different section configurations produce different nav links (Specials, FAQ, etc.)
- Responsive layout confirmed at desktop width
- Dashboard preview iframe loads and renders correctly

**Build status:** `tsc --noEmit` clean, `npm run build` clean. API route appears as dynamic (`ƒ`) in build output.

### Up Next
- Wire real hosting (S3 or Vercel) for actual publish-to-URL functionality
- Custom domain CNAME setup wizard
- Content editing within the builder (inline text, image uploads)
- P4: Import & Onboarding, AI Agents

---

## Session 10 — Perplexity AI Integration: KB Research + Service Layer
**Date:** March 19, 2026
**Focus:** Integrate Perplexity Search API + Agent API into the platform — typed service layer, API routes, and AI Research tab in Documents & KB module

### Goals
1. Deep-dive Perplexity API documentation (Chat Completions, Search API, Agent API, presets, tools)
2. Build typed service layer abstracting all three Perplexity API surfaces
3. Create API routes for search, ask (agent), and save-to-KB
4. Add "AI Research" tab to Documents & KB with search bar, mode selector, result rendering, and save-to-KB flow
5. Add sample saved research data for demo purposes
6. Visual QA + commit

### Work Produced

**New file: `src/lib/perplexity.ts`** — Typed Perplexity API service layer
- `PerplexityConfig` type with model overrides, API key injection
- `PerplexitySearchClient` — wraps the Search API (completions endpoint with `search_recency_filter`, `return_related_questions`)
- `PerplexityAgentClient` — wraps the Agent API with preset support (fast-search, pro-search, deep-research)
- `PerplexitySonarClient` — wraps Sonar models for embeddings / lightweight inference
- `createPerplexityClients()` factory function for environment-driven config
- Helper: `searchAndSummarize()` — full pipeline: search → summarize → format for KB storage
- Helper: `formatForKB()` — transforms API responses into KB article format with auto-tags and citations

**New file: `src/app/api/ai/search/route.ts`** — Search API proxy
- POST handler accepting `{ query, filters?, recency? }`
- Returns typed search results with citations, related questions

**New file: `src/app/api/ai/ask/route.ts`** — Agent API route
- POST handler accepting `{ query, mode: "quick" | "research" | "deep" }`
- Maps modes to Perplexity presets (fast-search, pro-search, deep-research)
- Returns answer with citations and source results

**New file: `src/app/api/ai/save-to-kb/route.ts`** — Save research to KB
- POST handler accepting research data
- Demo mode: returns success with generated ID
- TODO comment for Prisma integration when DB is connected

**Extended: `src/lib/sample-data-p3.ts`**
- Added `SavedResearch` interface with fields: id, title, query, summary, citations, tags, category, source, savedBy, savedAt, status, viewCount, citationCount
- Added `ResearchSource` type union: `"ai-quick" | "ai-research" | "ai-deep" | "manual" | "import"`
- 4 sample entries:
  - R-454B Refrigerant Transition Guide (Research mode, HVAC tags)
  - 2026 NEC Code Changes for Residential Electrical (Deep mode, Electrical tags)
  - Proper Brazing Techniques for ACR Copper (Research mode, HVAC tags)
  - Plumbing Permit Requirements by State — 2026 (Quick mode, Plumbing tags)
- Each entry includes realistic summary content with markdown formatting, citations with URLs, and auto-extracted tags

**Rewrote: `src/app/dashboard/documents/page.tsx`**
- Added third tab: "AI Research" alongside Documents and Knowledge Base
- Summary card row now includes "AI Research" count (4 items, 3 published)
- AI Research tab features:
  - "AI-Powered Research — Powered by Perplexity" header
  - Search bar with contextual placeholder examples
  - Mode selector dropdown (Quick / Research / Deep) with description labels
  - Search button with loading state (spinner animation)
  - AI response card: query title, mode badge, date, markdown-rendered summary
  - Inline markdown rendering: headings (##, ###), bold (**text**), bullets (- item), numbered lists (1. item), and clickable links ([text](url))
  - "Save to KB" button with success confirmation
  - Sources section with numbered references, external link icons, dates, snippets
  - Saved research grid: filterable cards with status badges (Published/Saved), category tags, author, citation count, view count
  - Detail sheet (slide-out): full research content, citations list, metadata
  - Search filter for saved research
- Graceful degradation: API call attempted first, falls back to demo simulation when no PERPLEXITY_API_KEY is set
- `renderInline()` helper: parses bold + markdown links into React elements

### Architecture Decisions
- **Three-tier API design:** Service layer (`perplexity.ts`) → API routes (`/api/ai/*`) → Client components. Clean separation of concerns.
- **Preset mapping:** Quick → `fast-search`, Research → `pro-search`, Deep → `deep-research`. Maps to Perplexity's official presets.
- **Demo simulation:** When API key isn't configured, the UI falls back to a simulated response explaining how to set up the API key. This lets the dashboard work in demo/development mode.
- **Save-to-KB flow:** Creates a `SavedResearch` object with auto-extracted tags (keyword matching against HVAC/plumbing/electrical vocabulary), preserved citations, and category assignment. Ready for Prisma persistence.
- **Service layer covers all three APIs:** Search, Agent, and Sonar — future-proofing for Module 16 (AI Agent Employees) which will use the Agent API as its backbone.

### Build Status
- `tsc --noEmit` — clean, zero errors
- `npm run build` — clean, all 15 dashboard routes render
- Visual QA via Playwright — all elements render correctly (search bar, mode selector, response card, saved research grid, detail sheet)

### Up Next
- Connect Perplexity API key via Vercel env var for live search
- Module 16: AI Agent Employees — leverage the Agent API service layer for autonomous agent workflows
- Prisma migration for SavedResearch table when DB is connected
- Import & Onboarding module (P4)

---

## Session 11 — Module 16: AI Agent Employees — Architecture & Agent Management UI
**Date:** March 19, 2026
**Focus:** Research and design the AI Agent Employees architecture, then build Phase 1A — the Agent Management dashboard with full admin configuration UI

### Goals
1. Research OpenAI Realtime API + Twilio Voice integration patterns for live voice pipeline
2. Design complete AI Agent architecture: voice pipeline, "tick" system, memory tiers, corrections/learning, helper agent pattern
3. Archive the original architecture spec; maintain a working copy for iterative amendments
4. Update MODULE-AI-AGENTS.md with Director of AR, corrections system, agent builder UI spec, graph visualization roadmap
5. Build the AI Agents dashboard page with three tabs: Agent Roster, Agent Builder, Experience & Learning
6. Visual QA + dark mode fix + commit

### Architecture Designed

**Voice Pipeline:** Twilio Voice + Media Streams → A1NT Gateway (Node.js WebSocket) → OpenAI Realtime API (G.711 µ-law, no transcoding). Starting model: `gpt-realtime-mini` with UI toggle to `gpt-realtime-1.5`.

**"Tick" System:** Maps to OpenAI Realtime's native function calling. Each "tick" (~400-800ms) represents a context enrichment cycle during live calls — the agent can query knowledge bases, look up customers, check schedules, and create work orders mid-conversation.

**Helper Agent Pattern:** A cheap text-only process (Perplexity Sonar) runs in parallel, pre-fetching context into the session buffer so the voice model can reference enriched data without latency spikes.

**4-Tier Memory:** Core (permanent company/role knowledge) → Working (current conversation context) → Recall (per-client/per-topic retrieved at call start) → Archival (compressed post-call summaries). Persona document stored as Markdown.

**Corrections System:** Auto-detection triggers (customer frustration, escalation after failure, tool call failure, long silence, repeated questions, contradictory statements). Each correction categorized as knowledge gap, factual error, tone issue, or protocol violation. Active → Resolved lifecycle with learned behaviors.

**Director of AR (Future Phase):** A meta-agent that continuously reviews all agent performance, proposes improvements, scouts new AI technologies, and provides a conversational interface for business owners to manage their AI workforce.

**Cost Estimate:** ~$0.37–$1.02 per 5-minute call.

### Work Produced

**New file: `docs/admin-kb/archives/MODULE-16-ARCHITECTURE-ORIGINAL-2026-03-19.md`**
- Archived, read-only copy of the original architecture specification
- Preserved as reference baseline before any build-phase modifications

**Updated: `docs/MODULE-16-ARCHITECTURE.md`** — Working copy, amended with:
- Director of AR/HR meta-agent concept and conversational configuration interface
- Corrections system specification (auto-detection, categorization, resolution workflow)
- Agent Builder UI specification (persona/role/company assembly, model config, context layer visualization)
- Graph visualization roadmap (React Flow/Xyflow for inter-agent connection mapping)
- Technology scouting pipeline for continuous improvement

**New file: `src/lib/sample-data-agents.ts`** — Agent types + realistic sample data
- `AgentEmployee` interface with full schema: persona, role, company info, model config (model, voice, temperature, maxTokens, vadMode), context layers (6-tier with token allocations), permissions (module R/W + tool toggles), learning config, corrections, interactions, learned behaviors
- 3 sample agents: Alex (Receptionist, active, 847 tasks), Jordan (Dispatcher, active, 423 tasks), Riley (Inside Sales, training, 12 tasks)
- 5 roles across departments (Front Office, Operations, Sales, Service, Finance)
- 4 personas with distinct greeting styles, personality traits, voice assignments
- Context layer definitions with type badges (static, template, dynamic, persona, runtime)
- 3 corrections with categories (knowledge gap, factual error, tone issue) and resolution tracking
- 7 interaction history entries with caller names, timestamps, durations, outcomes, satisfaction scores

**New file: `src/app/dashboard/ai-agents/page.tsx`** — Full AI Agents dashboard (1265 lines)

**Tab 1 — Agent Roster:**
- Summary cards: Total Agents, Tasks Today, Avg Accuracy, Avg Satisfaction
- Agent table with columns: Agent (avatar + name + status badge), Role + department, Channels (phone/email/chat/SMS icons), Autonomy level, Tasks count, Accuracy %, Satisfaction rating, Actions (view/configure/analytics)
- "+ New Agent" button in header

**Tab 2 — Agent Builder:**
- Left column — Identity Assembly:
  - Persona selector with preview (greeting, personality traits, voice, style badges)
  - Role selector with capabilities list, tool badges, and module access tags
  - Company profile card (auto-populated from org)
- Right column — Technical Configuration:
  - Model Configuration (collapsible): Model selector (gpt-realtime-mini / 1.5 / 4o-mini-realtime), Voice selector (alloy/ash/ballad/coral/echo/sage/shimmer/verse), Temperature slider with Precise↔Creative labels, Max Tokens input, VAD Mode selector (semantic/server_vad/disabled)
  - Context Layers visualization: 6-tier stack with numbered layers, type badges (static/template/dynamic/persona/runtime), token counts, colored progress bars, total token sum
  - Tools & Permissions (collapsible): Module-level R/W toggle grid (Clients, Scheduling, Work Orders, KB, Invoicing, Financial, Inventory, Workforce) + Tool toggles (Calendar, Transfer calls, Send notifications)
  - Learning Configuration (collapsible): Correction Frequency, Learning Depth, Retention Policy selectors + Auto-Correction Trigger toggles (6 categories)
- "Deploy Agent" sticky footer button

**Tab 3 — Experience & Learning:**
- Agent selector dropdown
- Learning metrics cards: Corrections this month, Active corrections, Resolved corrections, Learned behaviors
- Activity Log: Interaction history with caller name, timestamp, duration, satisfaction, outcome badges (resolved/transferred/escalated), expandable detail rows
- Corrections panel: Filterable by category and status, each entry shows category badge, status badge, description, date, trigger source, expandable resolution details
- Learned Behaviors list: Accumulated knowledge items with learned dates and source references

**Updated: `src/app/layout.tsx`**
- Added `className="dark"` to `<html>` tag — enables proper dark mode CSS variable resolution across all shadcn components (selects, inputs, buttons). Previously components were using light-mode foreground colors on the dark background.

### Architecture Decisions
- **Hybrid approach:** OpenAI Realtime (voice) + Perplexity Agent API (knowledge) + Custom memory system. Best-in-class for each responsibility.
- **Telephony:** Twilio Voice + Media Streams — industry standard, G.711 µ-law compatible with OpenAI Realtime (no transcoding needed).
- **Dark mode fix:** The dashboard has always been dark-themed (`bg-neutral-950`) but shadcn component CSS variables were resolving in light mode. Adding `dark` class to `<html>` ensures consistent rendering across all UI components.
- **Sample data approach:** Rich, realistic sample data (not lorem ipsum) that demonstrates real plumbing/HVAC business scenarios — makes the admin UI immediately understandable.

### Build Status
- `tsc --noEmit` — clean, zero errors
- Visual QA via Playwright — all 3 tabs render correctly at 1600×900
- Dark mode validated across AI Agents page and Command Center dashboard
- No regressions on existing pages

### Up Next
- **Phase 1B — Voice Pipeline:** Twilio webhook routes (`/api/voice/incoming`, `/api/voice/status`), OpenAI Realtime WebSocket relay, session management — pending Twilio API keys
- **Phase 2 — Tool System:** Calendar integration, customer lookup, KB search, work order creation — the "tick" function call implementations
- **Phase 3 — Memory System:** 4-tier memory with Prisma persistence, persona document generation
- **Phase 4 — Agent Graph:** React Flow/Xyflow visualization for inter-agent connections
- **Phase 5 — Director of AR:** Meta-agent for continuous review and improvement proposals

---

## Session 12 — March 19, 2026

### Context
Phase 1B — Voice Pipeline Foundation. Josh provided Twilio API credentials (Account SID, Auth Token, API Key SID `a1ntegral`, API Key Secret) and phone number. All five env vars saved in Vercel. This session builds the complete real-time voice infrastructure: Twilio ↔ OpenAI Realtime bidirectional audio proxy with function calling.

### Goals Established
1. **Configure Twilio credentials** — `.env` placeholders + Next.js config for server-side access
2. **Build complete voice pipeline** — types, prompts, tools, session manager, voice server, API routes
3. **Add live call monitoring** to AI Agents dashboard
4. **TypeScript build validation** — clean compile of entire codebase

### Work Produced

**New: `src/lib/voice/types.ts`**
- Voice pipeline type definitions: `RealtimeModel` (gpt-4o variants), `VoicePreset` (8 voices), `VadMode`, `VoiceSession` (full session state with timing, metrics, tool calls)
- Twilio stream event types: `TwilioStreamEvent` union for connected/start/media/stop/mark events
- OpenAI Realtime event types: session.created, response.audio.delta, response.function_call_arguments.done, input_audio_buffer.speech_started/stopped, error

**New: `src/lib/voice/prompts.ts`**
- 6-layer composable prompt system: Platform → Industry → Company → Role → Personality → Live Context
- `buildSystemPrompt()` assembles layers with clear section separators
- `buildDefaultPrompt()` provides sensible demo defaults (A1 Integrations, home services, receptionist role)
- Personality layer includes voice pacing, empathy guidelines, hold behavior, escalation rules
- Live context layer injects current date/time, active calls, business hours awareness

**New: `src/lib/voice/tools.ts`**
- 6 OpenAI Realtime function definitions with full JSON Schema parameters:
  - `lookup_customer` — search by name, phone, email, or account number
  - `check_schedule` — query technician availability by date range and service type
  - `create_work_order` — full work order creation with customer, service, priority, scheduling
  - `search_knowledge_base` — query company KB for pricing, policies, service info
  - `transfer_call` — route to department or specific extension with context
  - `send_confirmation` — trigger SMS/email confirmation to customer
- Stub handler implementations returning realistic demo data
- `handleToolCall()` dispatcher with unknown-tool fallback

**New: `src/lib/voice/session-manager.ts`**
- Full session lifecycle management: create → connect Twilio WS ↔ OpenAI Realtime WS → proxy → cleanup
- `VoiceSessionManager` class with session map, event handling, metrics tracking
- Bidirectional audio proxy: Twilio G.711 µ-law ↔ OpenAI Realtime (no transcoding needed)
- OpenAI Realtime function calling flow: `response.function_call_arguments.done` → execute tool → `conversation.item.create` with `function_call_output` → `response.create` to resume
- Interruption handling: `input_audio_buffer.speech_started` triggers `response.cancel` for barge-in support
- Usage tracking: token counts from `response.done` events
- Graceful cleanup on disconnect with session metrics logging

**New: `src/lib/voice/voice-server.ts`**
- Standalone Node.js WebSocket server on port 8081 (separate from Next.js — App Router doesn't support persistent WS)
- HTTP health check endpoint at `/health`
- TwiML generation at `/twiml` for Twilio webhook configuration
- WebSocket upgrade handling at `/media-stream` for Twilio Media Streams
- Auto-creates VoiceSessionManager instance, routes incoming connections to session creation
- Configurable via env vars: `VOICE_SERVER_PORT`, `OPENAI_API_KEY`

**New: `src/lib/voice/index.ts`**
- Barrel export for public API: types, prompts, tools, VoiceSessionManager

**New: `src/app/api/voice/incoming/route.ts`**
- Twilio webhook endpoint — returns TwiML with `<Connect><Stream>` pointing to voice server WebSocket
- Dynamic URL construction from request headers for WebSocket endpoint
- Configurable greeting message and voice preset

**New: `src/app/api/voice/status/route.ts`**
- Twilio call status callback endpoint
- Logs call lifecycle events (initiated, ringing, answered, completed) with duration and caller info

**New: `src/app/api/voice/sessions/route.ts`**
- Active sessions API endpoint returning current call data
- Demo data for development: simulated active call with metrics (duration, tool calls, sentiment)

**Updated: `src/app/dashboard/ai-agents/page.tsx`**
- Added `LiveCallsBanner` component to AI Agents dashboard
- Pulsing green indicator for active calls with real-time count
- Expandable call details: caller info, live timer (auto-updating), agent assignment, tool call count
- Monitor button for future live call listening
- Voice pipeline status section: pipeline state, latency, uptime metrics
- Graceful collapse when no active calls

**Updated: `package.json`**
- Added `voice-server` npm script: `tsx src/lib/voice/voice-server.ts`
- Added dependencies: `ws`, `twilio`, `tsx` (already installed)

**Updated: `.env`**
- Added placeholder env vars: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_SID_KEY`, `TWILIO_SECRET_KEY`, `TWILIO_PHONE_NUMBER`, `OPENAI_API_KEY`, `PERPLEXITY_API_KEY`, `VOICE_SERVER_PORT`

### Architecture Decisions
- **Standalone WebSocket server** (port 8081) — Next.js App Router does not support persistent WebSocket connections. The voice server runs as a separate Node.js process alongside Next.js, handling the long-lived Twilio Media Stream connections.
- **No transcoding** — Twilio's G.711 µ-law (`audio/pcmu`) is directly compatible with OpenAI Realtime API. Audio bytes pass through unmodified, minimizing latency.
- **6-layer prompt composition** — Enables per-tenant customization at every level (platform defaults → industry specifics → company branding → role behavior → personality tuning → live context injection). Each layer is independently configurable through the admin UI in future phases.
- **Tool stub pattern** — All 6 tools have complete OpenAI function schemas and return realistic demo data. Stub implementations will be replaced with real integrations (Prisma queries, external APIs) as modules are wired up.
- **Session manager pattern** — Centralized class manages all active sessions, enabling the dashboard to query real-time call status, and future features like live monitoring, call recording, and supervisor barge-in.

### Build Status
- `tsc --noEmit` — clean, zero errors
- `next build` — clean, all routes compiled (3 new dynamic voice API routes)
- No regressions on existing pages

### Twilio Configuration Reference
- **Account SID:** stored in Vercel as `TWILIO_ACCOUNT_SID`
- **API Key (a1ntegral) SID:** stored in Vercel as `TWILIO_SID_KEY`
- **Phone Number:** stored in Vercel as `TWILIO_PHONE_NUMBER`
- Auth Token and API Secret stored in Vercel as `TWILIO_AUTH_TOKEN` and `TWILIO_SECRET_KEY`
- Twilio webhook URL (configure in Twilio console): `https://a1ntegrel.vercel.app/api/voice/incoming`
- Status callback URL: `https://a1ntegrel.vercel.app/api/voice/status`

### Up Next
- **Phase 1C — Twilio Console Config:** Configure the phone number's webhook URLs in Twilio console to point to the deployed voice endpoints
- **Phase 2 — Live Testing:** End-to-end call test with real OpenAI Realtime connection, verify audio quality and latency
- **Phase 3 — Tool Implementations:** Replace stub handlers with real Prisma queries (customer lookup, schedule check, work order creation)
- **Phase 4 — Memory System:** 4-tier memory with Prisma persistence, persona document generation
- **Phase 5 — Agent Graph:** React Flow/Xyflow visualization for inter-agent connections
- **Phase 6 — Director of AR:** Meta-agent for continuous review and improvement proposals

---

## Session 13 — March 19, 2026

### Context
Continuation from Session 12. Twilio webhooks configured, Railway voice server deployed and active, Vercel build deployed. Focus this session: map draw tool bug fixes, Import 2D/3D system, and 3D object placement mode.

### Goals
1. Fix stale closure bug in draw tool — sliders/colors not reflecting on extruded shapes
2. Wire up opacity slider + color buttons for both default and selected shapes
3. Build "Import 2D/3D" dropdown menu with asset table view (10 rows, + buttons)
4. Add file import flow with local file picker + Knowledge Base reference option
5. Add 3D object placement mode with preview on map, rotate/move/scale tools
6. Support GLB/OBJ import via Mapbox custom layers
7. Add AI Agents to sidebar navigation + slide-out tab handle
8. Fix AI Agents page indentation to match other pages
9. TypeScript build check + commit & push

### Work Completed

**Sidebar Navigation Enhancement (committed `943bf3e`)**
- Added AI Agents entry to sidebar navigation menu
- Added slide-out tab handle on right edge of minimized sidebar using fixed positioning
- Tab handle triggers sidebar expand on click

**AI Agents Page Indentation Fix**
- Fixed padding/indentation to match the style of other dashboard pages

**Infrastructure & Geo Page**
- Confirmed it's currently a placeholder page (24 lines). Will be built out as a full module in a future session.

**Map Draw Tool — Stale Closure Bug Fix (`map-draw.tsx`)**
- Root cause: `handleDrawCreate`, `handleDrawUpdate`, `handleDrawDelete`, and `handleSelectionChange` were event handlers registered once during `initDraw()` but captured the initial `features` array via closure. When they called `updateExtrusionSource(features)`, they passed the stale empty array — not the current React state.
- Fix: Introduced `featuresRef` (a ref that always mirrors the latest `features` state) and `shapeColorRef`/`shapeHeightRef`/`shapeOpacityRef` for default shape properties. All event handlers now read from refs instead of stale closure variables.
- Extracted `syncExtrusions` as a `useCallback` that reads from refs for current defaults, eliminating the duplicate `updateExtrusionSource` function.
- `useEffect` now watches `[features, shapeColor, shapeHeight, shapeOpacity]` and calls `syncExtrusions` to keep the extrusion layer in sync.

**Map Draw Tool — Color Buttons Fixed**
- Default color buttons: already wired to `setShapeColor` — now properly reflected because `syncExtrusions` reads from `shapeColorRef`
- Selected shape color buttons: `updateSelectedFeature({ color: c.value })` now correctly passes the updated features array (not stale) to `syncExtrusions`

**Map Draw Tool — Opacity Slider Fixed**
- Same ref-based fix ensures opacity changes propagate immediately to the fill-extrusion layer

**Import 2D/3D Dropdown Menu**
- New "Import 2D/3D" button next to the Draw button
- Dropdown panel with:
  - "Add File" button — opens import source flow
  - "Place 3D Object" button — enters placement mode
  - Asset table: columns for Name (with 2D/3D icon), Type (format badge), Size, Visibility toggle, Remove button
  - Table shows up to 10 rows with overflow indicator for more
  - Rows have hover state with remove button appearing on hover

**File Import Flow**
- Two-option import source selector: Local File / Knowledge Base
- Local File: triggers native file picker accepting `.glb`, `.gltf`, `.obj`, `.fbx`, `.geojson`, `.json`, `.kml`, `.kmz`, `.gpx`, `.shp`, `.csv`, `.dxf`, `.svg`, `.png`, `.jpg`, `.jpeg`, `.tiff`, `.tif`
- Knowledge Base: placeholder with "coming soon" message
- GeoJSON files auto-load onto map with appropriate layer type (fill, line, or circle based on geometry)
- GLB/GLTF files auto-enter 3D placement mode

**3D Object Placement Mode**
- Placement overlay panel with violet accent (distinct from draw tool's emerald)
- Transform tool selector: Move / Rotate / Scale
- Move mode: longitude/latitude numeric inputs for precise positioning
- Rotate mode: rotation slider (0–360°) with degree readout
- Scale mode: scale slider (0.1x–10x)
- Altitude slider always visible (0–100m)
- Confirm/Cancel buttons
- On confirm: places a purple circle marker + label at the coordinates
- Architecture ready for Three.js GLTFLoader + Mapbox custom layer integration

**GLB/OBJ Import Support**
- File picker accepts 3D formats
- GLB/GLTF files create blob URLs and enter placement mode
- Placement marker system uses Mapbox GeoJSON sources + circle/symbol layers
- Full Three.js rendering pipeline architecture documented (custom layer + MercatorCoordinate) — marker placeholder used for now until Three.js integration is added

### Technical Details

**New interfaces:**
- `ImportedAsset` — tracks imported files (id, name, type, format, size, visible, source)
- `Placed3DObject` — tracks placed 3D objects (id, name, url, lng, lat, altitude, rotateX/Y/Z, scale)

**New functions:**
- `syncExtrusions(featuresMeta)` — unified extrusion GeoJSON sync (replaces old `updateExtrusionSource`)
- `handleFileImport(e)` — processes file input, routes to GeoJSON loader or 3D placement
- `addGeoJSONToMap(sourceId, geojson)` — adds GeoJSON source + auto-detected layer to map
- `enterPlacementMode(name, url)` — initializes placement state at map center
- `confirmPlacement()` / `cancelPlacement()` — finalize or abort 3D placement
- `addPlacementMarker(obj)` — adds circle marker + label layer for placed objects
- `toggleAssetVisibility(id)` / `removeAsset(id)` — manage imported assets

### Build Status
- `tsc --noEmit` — clean, zero errors
- `next build` — clean, all 27 routes compiled
- No regressions

### Up Next
- Full Three.js integration for GLB rendering in Mapbox custom layers
- Infrastructure & Geo module — build out from placeholder
- OBJ → GLB conversion pipeline for broader format support
- Knowledge Base file integration for import flow
- Live testing of draw tool on deployed site

---

## Session 14 — March 19, 2026

### Context
Critical bug-fixing session followed by major Command Center customization. User reported all dashboard subpages crashing when navigated from the Command Center via sidebar, and 3D extrusions never rendering.

### Bug Fixes
1. **Navigation crash fix** — MapDraw component had no cleanup in its useEffect. When navigating away from Command Center, Mapbox GL Draw event handlers fired against a destroyed map, crashing the React tree. Added proper cleanup: remove event listeners, remove draw control on unmount, wrap map operations in try-catch for teardown safety.
2. **3D extrusion rendering fix** — `fill-extrusion-opacity` does NOT support data-driven expressions (`["get", "opacity"]`). This silently broke the entire extrusion layer. Changed to static `0.85` opacity per-layer. Added `hexToRgba()` helper to bake per-feature opacity into the color.
3. **Error boundary** — Added `src/app/dashboard/error.tsx` so crashes show a "Try again" button instead of white screen.

### New Features

#### Map Settings (gear icon)
- **`map-settings.tsx`** — Gear icon button to the right of Map Objects dropdown
- Map style selector: Satellite Streets, Satellite, Outdoors/Topo, Streets, Light, Dark, Navigation Day, Navigation Night
- Label toggle (on/off) — filters Mapbox symbol layers by ID pattern
- Right-click context menu on map → "Set as Default View" saves lng/lat/zoom/pitch/bearing
- Reset to Default View button

#### Command Center Settings (in Settings page)
- **`command-center-store.ts`** — Settings store with localStorage persistence, type definitions for all options
- **`command-center-provider.tsx`** — React context provider wrapping the dashboard layout
- **`command-center-settings.tsx`** — Full settings panel in Settings page under "Command Center" section

#### Background Customization
- **Interactive Map** (default) — live Mapbox map
- **Static Image** — upload custom background image
- **Solid Color** — color picker with hex input + live preview
- **Gradient** — two-color gradient with angle slider (0°–360°) + live preview

#### Logo Overlay
- Upload company logo image
- 7-position selector (top-left through bottom-right)
- Scale slider (10%–200%)
- Opacity slider (5%–100%)
- Works on any background mode
- Enable/disable toggle

#### UI Polish
- Fixed KPI cards / quick actions overlap (adjusted top offset from `140px` to `155px`)
- Map search and draw tools only shown in interactive map mode
- Style changes trigger live map re-styling with source/layer re-creation

### Commits
- `89fb061` — Fix navigation crash: proper MapboxDraw cleanup + error boundary
- `6e4d318` — Fix 3D extrusions: fill-extrusion-opacity doesn't support data-driven expressions
- `73eabe0` — Map settings + Command Center background/logo customization

### Files Changed
- `src/lib/command-center-store.ts` (new) — Settings types, defaults, persistence, style catalogue
- `src/components/command-center-provider.tsx` (new) — React context provider
- `src/components/map-settings.tsx` (new) — Gear button with style selector, labels, right-click menu
- `src/components/command-center-settings.tsx` (new) — Settings page panel
- `src/components/command-map.tsx` — Reads settings from context, reacts to style/label changes
- `src/components/map-draw.tsx` — Proper cleanup, extrusion opacity fix
- `src/app/dashboard/page.tsx` — Background modes, logo overlay, spacing fix
- `src/app/dashboard/layout.tsx` — Wraps with CommandCenterProvider
- `src/app/dashboard/settings/page.tsx` — Expandable Command Center section
- `src/app/dashboard/error.tsx` (new) — Error boundary

### Next Up
- Test Twilio phone system end-to-end
- Three.js + Mapbox custom layer for GLB rendering (deferred)
- Explore additional Mapbox style options / custom styles

---

## Session 15 — March 19, 2026

### Context
Continuation of Session 14. The right-click "Set as Default View" context menu was conflicting with Mapbox's built-in right-click-drag pitch/bearing control — a quick right-click showed nothing because Mapbox was consuming the event.

### Work Completed

#### Right-Click Context Menu Fix
- **Problem:** Mapbox GL uses right-click-drag to adjust pitch/bearing. Our context menu listener was fighting with this — quick right-clicks produced no menu, while right-click-and-hold still triggered the angle adjustment.
- **Solution:** Track `mousedown` position and timestamp on the map canvas. On `contextmenu` event, calculate movement distance and duration. Only show the custom context menu if the gesture was a quick tap (< 4px movement AND < 400ms hold). If the user dragged or held longer, the event passes through to Mapbox for pitch/bearing adjustment.
- **Also added:** 50ms dismiss delay on the context menu so the triggering right-click event doesn't immediately close it via the global mousedown listener.

### Commits
- `8bd3559` — fix: right-click context menu no longer conflicts with Mapbox pitch/bearing drag

### Files Changed
- `src/components/map-settings.tsx` — Added mousedown tracking, distance/duration thresholds, dismiss delay

### Next Up
- Test Twilio phone system end-to-end (pending since Session 13)
- Three.js + Mapbox custom layer for GLB rendering (deferred)

---

## Session 16 — March 19, 2026

### Context
Direct continuation of Session 15. Primary goal: debug and fix the Twilio → Railway → OpenAI Realtime voice pipeline that was producing silence after the TwiML greeting. Also: ElevenLabs Conversational AI research completed, and initial discussion of multi-path voice architecture for A/B testing different engines.

### The Bug Hunt — Three Root Causes Found

The voice pipeline had been producing silence on every test call since Session 15. Railway logs showed OpenAI events flowing (session.created, session.updated, response.done, speech detection) but callers heard nothing after "Please hold while I connect you." Three separate issues were identified and fixed iteratively:

#### Root Cause 1: streamSid Timing Race Condition
- **Problem:** OpenAI WebSocket was opened immediately when Twilio's WebSocket connected, BEFORE the Twilio `start` event provided `streamSid`. When `response.create` triggered OpenAI to generate audio, the audio delta handler at line 192 silently dropped ALL frames because `streamSid` was still `null`.
- **Fix:** Restructured to match [OpenAI's official Twilio demo](https://github.com/openai/openai-realtime-twilio-demo) architecture — defer OpenAI connection until AFTER Twilio's `start` event sets `streamSid`. New flow: Twilio `start` → `streamSid` set → `connectToOpenAI()` → `session.update` → `response.create` → audio deltas arrive with `streamSid` guaranteed.
- **Commit:** `729ed38`

#### Root Cause 2: Wrong session.update Format (No Audio Deltas Generated)
- **Problem:** `session.update` was using a nested `audio.input.format.type: "audio/pcmu"` structure. The OpenAI Realtime API reference specifies FLAT fields: `input_audio_format: "g711_ulaw"`, `output_audio_format: "g711_ulaw"`, `modalities` (not `output_modalities`), `voice` at top level, `turn_detection` at top level. The nested format was accepted without error but OpenAI fell back to text-only responses — Railway logs confirmed `response.created` → `response.done` with ZERO `response.output_audio.delta` events.
- **Fix:** Rewrote session config to use flat format per API reference. Added diagnostic logging: full session.update payload on send, session.updated response showing effective config, audio delta events with type/size/streamSid.
- **Commit:** `87609cd`

#### Root Cause 3: Wrong Tools Format (session.update Rejected)
- **Problem:** Incorrectly wrapped tools in Chat Completions format: `{ type: "function", function: { name, description, parameters } }`. The Realtime API uses a FLAT tool format: `{ type: "function", name, description, parameters }`. Railway logs showed the smoking gun: `"Missing required parameter: 'session.tools[0].name'"` — OpenAI rejected the entire session.update, disconnected the WebSocket.
- **Fix:** Reverted to passing `AGENT_TOOLS` directly (they were correct all along in tools.ts).
- **Commit:** `c51c67c` — **This was the final fix that made it work.**

### Result
First successful AI receptionist call. "Alex" from TripleA Plumbing answered, stayed in character, responded quickly with no uncomfortable pauses, and handled free-form conversation naturally. Speech-to-speech latency was excellent — sub-second response times throughout the call.

### Key Learnings
1. **OpenAI Realtime API has TWO different format dialects** — Twilio's blog examples use a nested `audio.input.format` structure that may work with some model versions, but the official API reference uses flat fields (`input_audio_format`, `output_audio_format`). The flat format is authoritative.
2. **Realtime API tool format ≠ Chat Completions tool format.** Realtime uses `{ type, name, description, parameters }` (flat). Chat Completions uses `{ type, function: { name, description, parameters } }` (wrapped). Easy to confuse.
3. **Railway deploy logs are essential for debugging** — the OpenAI error message was only visible in stderr and was interleaved with stdout in Railway's log viewer.
4. **The `response.audio.delta` (beta) vs `response.output_audio.delta` (GA) event name difference is real** — we now handle both in the switch statement.

### ElevenLabs Research Completed
A comprehensive 762-line research report was produced covering ElevenLabs Conversational AI platform capabilities, pricing, latency characteristics, custom voice cloning, native Twilio integration, and function calling via client tools. Saved to `/workspace/elevenlabs-research.md`.

### Multi-Path Voice Architecture — Discussion Started
Josh wants to build parallel voice pipeline paths for A/B/C testing:
- **Path A:** OpenAI Realtime (speech-to-speech, lowest latency, current implementation)
- **Path B:** ElevenLabs Conversational AI (custom cloned voices, native Twilio, $0.10/min)
- **Path C:** Hybrid STT → LLM → TTS (most flexible, swap any component)
- **Path D:** OpenAI STT + reasoning → ElevenLabs TTS (custom voice + OpenAI intelligence)

The vision: a `VoiceEngine` interface abstraction where pipeline path is selectable per-agent, per-role, or per-call. Receptionist managers might want Path A for speed; premium customer-facing roles might want Path B for brand voice; complex reasoning roles might want Path C for accuracy. "The choice is yours."

### Commits
- `729ed38` — fix(voice): defer OpenAI connection until after Twilio start event
- `87609cd` — fix(voice): use flat session.update format per OpenAI API reference
- `c51c67c` — fix(voice): revert tools to flat format — Realtime API ≠ Chat Completions

### Files Changed
- `src/lib/voice/session-manager.ts` — Major rewrite: deferred OpenAI connection, flat session.update format, flat tools, diagnostic logging, dual audio delta event handling

### Architecture Note — Voice Pipeline (Working State)
```
Caller → Twilio PSTN → TwiML (<Say> + <Connect><Stream>)
  → Vercel /api/voice/incoming (returns TwiML)
  → Railway wss://a1nt-production.up.railway.app/api/voice/media-stream
    → Twilio "start" event → streamSid captured
    → connectToOpenAI() → wss://api.openai.com/v1/realtime?model=gpt-realtime-mini
    → session.update (flat format, g711_ulaw, server_vad, 6 tools)
    → response.create (triggers AI greeting)
    → Bidirectional audio proxy: Twilio ↔ OpenAI
    → Function calling: OpenAI → tools.ts → response back
    → Interruption handling: speech_started → truncate + clear
```

### Next Up
- Fine-tune Alex's personality/prompt for more natural conversation
- Multi-path voice engine abstraction layer
- ElevenLabs Path B implementation (parallel to OpenAI Path A)
- Three.js + Mapbox custom layer for GLB rendering (deferred)

---

## Session 17 — March 19, 2026 (Receptionist Module — Real Data Wiring)

### Context
With the AI receptionist making live calls (Session 16), this session wired the entire receptionist module to real PostgreSQL data. Previously, the dashboard displayed hardcoded sample data and voice tools returned static responses. Now every call record is persisted to the database, the dashboard reads from live API routes, and voice tools query real customer/schedule/work-order data.

### Goals
1. Wire all voice tools (`lookup_customer`, `check_schedule`, `create_work_order`) to query/write real DB data
2. Build API routes for the dashboard to read call records and stats from PostgreSQL
3. Replace all sample data imports in the receptionist UI with live API fetching
4. Seed the demo organization with ABC Carpenters client record
5. Fix Prisma 7.5 + Next.js 16 Turbopack build compatibility

### Database Architecture
- **PostgreSQL on Railway** — single instance serving both the voice server (internal URL) and Vercel dashboard (public TCP proxy)
- **Prisma 7.5** with `prisma-client` generator + `@prisma/adapter-pg` driver adapter
- **Migration:** `20260320023815_init_all_tables` — all 18 models from schema.prisma
- **Seed data:** Old Bishop Farm org, Josh user, 3 employees (Mike/Dave/Lisa), 4 clients (Johnson, ABC Carpenters, Oak Street, Sunset Senior), AI Receptionist module ACTIVE

### Work Produced

**New Files:**
- `src/lib/voice/call-store.ts` — Prisma-based persistence layer for call records. Provides `createCallRecord()`, `updateCallRecord()`, `getCallRecords()`, `getCallRecordById()`, `getPhoneStats()`. Clean abstraction over Prisma for voice server and dashboard API.
- `src/app/api/voice/call-records/route.ts` — GET endpoint with filtering (status, intent, date range, limit). Maps DB enums to UI display strings. Returns transformed records matching the dashboard's expected shape.
- `src/app/api/voice/stats/route.ts` — GET endpoint returning aggregate KPI stats (total calls today, avg duration, missed rate, AI handled rate, leads captured, work orders created, appointments booked).
- `prisma/seed.mts` — TypeScript seed script with PrismaPg adapter. Seeds demo org, user, employees, clients (including ABC Carpenters), and AI Receptionist module.
- `prisma/seed.sql` — SQL equivalent of seed data (executed directly against Railway DB).
- `prisma/migrations/20260320023815_init_all_tables/` — Initial migration for all 18 models.

**Modified Files:**
- `src/lib/db.ts` — Updated to use `PrismaPg` driver adapter (Prisma 7.5 requirement). Singleton pattern with connection string from `DATABASE_URL`.
- `src/lib/voice/session-manager.ts` — Updated imports to use `createCallRecord`/`CallRecordInput` from call-store. Enum values now UPPERCASE to match Prisma schema. Async persistence with `.then()/.catch()` to avoid blocking call flow.
- `src/lib/voice/tools.ts` — Fully rewritten. `lookup_customer` queries Client table by phone/name. `check_schedule` queries ScheduleEvent + Employee for availability. `create_work_order` writes to WorkOrder table with auto-generated order numbers. All tools have graceful DB error fallbacks.
- `src/app/api/voice/sessions/route.ts` — Rewritten to query ACTIVE CallRecords from DB instead of returning hardcoded demo data.
- `src/app/api/voice/status/route.ts` — Rewritten to update CallRecord status in DB on Twilio status webhooks.
- `src/app/dashboard/ai-receptionist/page.tsx` — Fully rewritten (836 lines). Removed all sample-data-p2 imports. Types defined locally. Fetches from `/api/voice/call-records` + `/api/voice/stats` with `useState`/`useEffect`. 30-second polling for real-time updates. Loading spinner and empty state messaging.
- `package.json` — Added `@prisma/adapter-pg`, `pg`, `@types/pg` dependencies.
- `prisma/schema.prisma` — Added `CallRecord` model with full Twilio metadata, conversation data (JSONB transcript, tool calls), linked items (work order, client), and usage tracking.

### Prisma 7.5 + Next.js 16 Turbopack Fix
Prisma 7.5's `prisma-client` generator does NOT create an `index.ts` barrel file — exports are split across `client.ts`, `enums.ts`, etc. This caused `Module not found: Can't resolve '@/generated/prisma'` errors with Turbopack.

**Fix applied:**
1. Changed all imports from `@/generated/prisma` → `@/generated/prisma/client` (db.ts, call-store.ts, call-records/route.ts)
2. Installed `@prisma/adapter-pg` + `pg` driver adapter (required by `prisma-client` generator — unlike deprecated `prisma-client-js`, the new generator requires an explicit adapter)
3. Updated `db.ts` to construct PrismaClient with `PrismaPg` adapter
4. Removed duplicate `prisma/seed.ts` (kept `seed.mts` with adapter)

### Build Result
Clean build: 29 routes compiled and generated successfully, including all 4 voice API routes.

### Environment Variables Needed
- **Vercel:** `DATABASE_URL` (public Railway URL) + `A1NT_ORG_ID=demo-org`
- **Railway voice server:** `DATABASE_URL=${{Postgres.DATABASE_URL}}` (internal) + `A1NT_ORG_ID=demo-org`

### Commits
- Session 17 commit — receptionist module wired to real PostgreSQL data

### Data Flow (Production Architecture)
```
Incoming Call → Twilio → Railway Voice Server
  → session-manager.ts creates CallRecord (status=ACTIVE)
  → tools.ts queries DB for customer/schedule data
  → tools.ts writes WorkOrder on create_work_order
  → session-manager.ts updates CallRecord (status=COMPLETED, transcript, summary)

Dashboard → Vercel Serverless
  → /api/voice/call-records → reads CallRecord from DB
  → /api/voice/stats → aggregates KPI stats from DB
  → /api/voice/sessions → reads ACTIVE CallRecords
  → 30s polling for real-time updates

Twilio Status Webhook → Vercel /api/voice/status
  → Updates CallRecord status on call completion
```

### Next Up
- Add `DATABASE_URL` + `A1NT_ORG_ID` to Vercel and Railway env vars
- Test end-to-end: live call → DB write → dashboard display
- Fine-tune Alex's personality/prompt
- Multi-path voice engine abstraction layer

---
