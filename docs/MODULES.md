# A1NT — Core Module Architecture

## Universal Modules (Core Framework)

These modules form the shared backbone of every industry template. Built once, used everywhere. Listed in recommended build order — dependencies flow top-down.

---

### 1. Command Center (Dashboard)
**Slug:** `command-center` | **Category:** Core | **Overlap:** 10/10 templates

The home base. Role-adaptive dashboard that serves as the entry point for every user. Not a standalone "module" in the toggle sense — this is the shell that everything else plugs into.

**Core Features:**
- Role-based default layouts (Owner, Manager, Receptionist, Technician, Admin)
- Pinnable widget system — users drag/pin/hide dashboard cards
- KPI summary bar (revenue, active jobs, open invoices, pending tasks)
- Activity feed — real-time stream of system events
- Quick actions bar (new work order, new client, new invoice)
- Mobile-responsive — technician view strips to essentials
- Notification center with priority filtering

**Why First:** Everything else renders inside this shell. Build it, and every subsequent module has a home.

---

### 2. Client Intelligence (CI)
**Slug:** `client-intelligence` | **Category:** CRM & Intelligence | **Overlap:** 10/10 templates

The client directory AND the AI showcase. At its core, it's where every client lives. At its ceiling, it's the smartest business analysis tool these owners have ever seen.

**Core Layer (Directory):**
- Client detail cards — name, contact, address, tags, status (Lead → Active → Churned)
- Document vault — upload forms, certifications, tax docs, site photos, contracts
- Contact management — multiple contacts per client with roles
- Quick-link hub — jump to any client's invoices, work orders, tasks, history
- Search, filter, sort by any field
- Bulk actions (tag, assign, export)

**Smart Layer (AI Analysis):**
- One-time scans: Basic (volume/ranking) or Advanced (full behavioral analysis)
- Recurring reports on configurable schedule
- Client benchmarking — rank against internal averages and industry benchmarks
- Opportunity detection — spot patterns in top clients, suggest replication
- Category/service type breakdown — what's selling, what's not, where
- Auto-queue actions → push campaigns to Sales & Marketing module
- Regional/climate intelligence (toggleable for outdoor industries)
- Industry news integration — background agents scan for actionable intel
- Preventative forecasting — flag declining trends before they become problems
- Exportable reports with executive summary

---

### 3. Scheduling & Dispatching
**Slug:** `scheduling` | **Category:** Operations | **Overlap:** 9/10 templates

The operational heartbeat. Where jobs get assigned, routes get optimized, and the day gets organized.

**Core Features:**
- Calendar view (day/week/month) with drag-and-drop scheduling
- Job assignment — match employees by skill, availability, location
- Route optimization — map view with suggested routing for field crews
- Dispatch board — real-time view of who's where, doing what
- Recurring job scheduling (weekly lawn care, monthly maintenance, etc.)
- Time slot management with configurable service durations
- Conflict detection — flag double-bookings, overtime, capacity issues
- Customer-facing booking widget (embeddable on client's website)
- Mobile: technician sees today's schedule, tap to navigate, tap to start/complete
- Integration points: feeds work orders, syncs with employee availability

---

### 4. Work Orders & Job Tracking
**Slug:** `work-orders` | **Category:** Operations | **Overlap:** 9/10 templates

The digital replacement for the paper work order. Every job from intake to completion to payment.

**Core Features:**
- Work order creation — from phone call, booking widget, or manual entry
- Status pipeline: New → Assigned → In Progress → Completed → Invoiced
- Job details: service type, description, materials used, time logged
- Photo attachments — before/after, in-progress documentation (camera quick-access on mobile)
- Technician notes and internal comments
- Material/parts tracking per job
- Customer signature capture (mobile)
- Automatic invoice generation from completed work orders
- Template-specific fields (e.g., vehicle VIN for auto repair, unit model for HVAC)
- History — full audit trail per work order

---

### 5. Invoicing & Payments
**Slug:** `invoicing` | **Category:** Finance | **Overlap:** 9/10 templates

Get paid. Cleanly. Automatically when possible.

**Core Features:**
- Invoice creation — manual or auto-generated from work orders
- Line items with quantity, rate, tax, discounts
- Invoice templates — branded with client's business info
- Status tracking: Draft → Sent → Viewed → Paid → Overdue
- Payment processing — Stripe integration for card payments
- Payment recording — cash, check, bank transfer
- Recurring invoices for subscription/maintenance clients
- Automated reminders — overdue notifications on configurable schedule
- Client payment portal — customer-facing link to view and pay
- Batch invoicing — generate invoices for multiple completed jobs
- Credit notes and refund tracking
- Export to CSV/PDF for accountant handoff

---

### 6. Employee & Workforce Management
**Slug:** `workforce` | **Category:** People | **Overlap:** 8/10 templates

Know your team. Manage their time. Track their certifications.

**Core Features:**
- Employee directory with profiles — role, department, skills, certifications
- Availability management — working hours, PTO, sick days
- Time tracking — clock in/out, hours per job, timesheet approval
- Skill/certification tracking with expiration alerts
- Performance metrics — jobs completed, avg completion time, customer ratings
- Payroll data export (hours, overtime, per-job breakdown)
- Mobile: technicians clock in/out, log hours to specific work orders
- Organizational chart / team structure
- Onboarding checklists for new hires

---

### 7. Inventory & Parts Management
**Slug:** `inventory` | **Category:** Operations | **Overlap:** 8/10 templates

Track what you have, what you need, and what you're using.

**Core Features:**
- Item catalog — SKUs, descriptions, categories, unit costs
- Stock levels with low-stock alerts
- Warehouse/truck/van inventory tracking (multi-location)
- Usage tracking — materials consumed per work order
- Purchase orders — create, send to suppliers, track delivery
- Vendor management — supplier directory with contact info, pricing
- Cost tracking — material costs per job for profitability analysis
- Barcode/QR scanning (mobile) for quick lookup
- Reorder automation — trigger POs at configurable thresholds
- Integration: feeds cost data to invoicing and financial reporting

---

### 8. AI Receptionist & Phone System
**Slug:** `ai-receptionist` | **Category:** Communication | **Overlap:** 8/10 templates

Never miss a call. Never lose a lead. 24/7 intelligent intake.

**Core Features:**
- AI voice agent — answers calls, captures caller info, classifies intent
- Call routing — direct to right person/department based on intent
- Work order creation from phone calls — AI extracts details, creates draft
- Appointment booking via phone — checks availability, confirms slot
- After-hours handling — capture message, schedule callback, or handle directly
- Call transcription and summary — every call logged with searchable transcript
- Welcome messaging and call tree configuration
- Live call dashboard — active calls, queue, wait times
- Voicemail-to-text with priority flagging
- Integration: creates clients, work orders, and appointments in respective modules

---

### 9. Sales & Marketing Automation
**Slug:** `sales-marketing` | **Category:** Growth | **Overlap:** 9/10 templates

Fill the pipeline. Keep clients coming back.

**Core Features:**
- Campaign builder — email, SMS, automated call sequences
- Campaign queue — receives suggested campaigns from CI module
- Email templates — branded, customizable, with merge fields
- Client segmentation — target by location, service history, spend, status
- Lead pipeline — track prospects from first contact to conversion
- Automated follow-ups — post-service review requests, seasonal reminders
- Referral tracking — who's sending you business
- Estimate/quote management — create, send, track, convert to work order
- Win/loss tracking on estimates
- ROI tracking per campaign — spend vs. revenue generated
- Integration: pulls client data from CI, pushes won estimates to Work Orders

---

### 10. Financial Reporting & Analytics
**Slug:** `financial-reports` | **Category:** Finance | **Overlap:** 10/10 templates

See the whole picture. Know where every dollar goes.

**Core Features:**
- Revenue dashboard — daily/weekly/monthly/quarterly/annual views
- Expense tracking and categorization
- Profit & loss reporting
- Cash flow forecasting
- Revenue by service type, technician, region, client
- Labor cost analysis — cost per job, per technician, per department
- Accounts receivable aging — who owes what, how long
- Tax summary reports — quarterly/annual, exportable for accountant
- Comparison views — this month vs. last month, this quarter vs. last year
- Customizable report builder — drag fields, set filters, save templates
- Scheduled report delivery — email PDF summaries on cadence
- Integration: aggregates data from invoicing, work orders, payroll, inventory

---

### 11. Fleet & Equipment Management
**Slug:** `fleet-equipment` | **Category:** Operations | **Overlap:** 7/10 templates

Track your trucks, tools, and equipment. Know when things need service.

**Core Features:**
- Vehicle/equipment registry — make, model, year, VIN, assigned employee
- Maintenance scheduling — mileage-based or time-based triggers
- Fuel tracking and cost analysis (fleet)
- GPS integration — vehicle location tracking
- Equipment checkout — who has what, when it's due back
- Maintenance history and cost tracking per asset
- Insurance and registration tracking with expiration alerts
- Depreciation tracking
- Mobile: technicians report equipment issues from the field

---

### 12. Documents & Knowledge Base
**Slug:** `documents` | **Category:** Core | **Overlap:** 10/10 templates

The filing cabinet, training manual, and compliance library in one place.

**Core Features:**
- Document storage with folder structure and tagging
- Template library — contracts, agreements, compliance forms, checklists
- Knowledge base — how-to articles, SOPs, training materials
- Version control — track document revisions
- Digital signatures — send documents for e-signature
- Form builder — create custom intake forms, checklists, inspection sheets
- Searchable — full-text search across all documents
- Permission controls — who can view, edit, share
- Client-facing document sharing — send docs via client portal
- Integration: work order checklists, employee onboarding docs, compliance tracking

---

### 13. Infrastructure & Geo
**Slug:** `infrastructure-geo` | **Category:** Operations & Intelligence | **Overlap:** Universal

The spatial brain of the platform. A layered map/GIS system that serves as both an operational tool and an intelligence layer — two contexts built on a shared core map engine.

**Core Map Engine (shared platform service):**
- Base map rendering (satellite, street, terrain) via Mapbox GL JS
- Pin/marker system, drawing tools (polygons, lines, freehand), annotations
- Layer management — each module registers its own layers, users toggle visibility
- Search, filter, geocode
- Cross-module layer reading (dispatcher sees routes + work order pins simultaneously)

**Client-Side Geo (Customer Locations):**
- Client location directory on map — filtered by status, tags, revenue, region
- Drill-down into individual client sites — campus/building-level detail
- Sticky pins with popups (hazard warnings, access instructions, equipment locations)
- Freehand drawing, geometry tools, photo-tagged annotations
- Incident tracking with precise geolocation — injuries, property damage, near-misses
- Workers' comp injury reports with OSHA compliance, auto-archiving
- Trend analysis — heat maps across locations, filter by type/severity/time
- Compliance audit trail

**In-House Geo (Own Facilities):**
- Map own properties — office, warehouse, shop, parking, yard
- Pin utilities/services — electrical panels, water mains, gas shutoffs, HVAC
- Routine inspection tracking — fire alarms, sprinklers, elevators
- Emergency preparedness — evacuation routes, assembly points, protocol by situation type
- Drill scheduling and tracking

**3D Digital Twin (Premium Tier):**
- Three.js-based 3D building model for HQ/facilities
- Virtual onboarding walkthroughs, maintenance department tool
- Import your own model (FBX, glTF, IFC) or have A1 build one ($XX/month)
- Integration with separate photogrammetry project (Autodesk Reality Capture API)

> Full specification: `docs/MODULE-INFRASTRUCTURE-GEO.md`

---

### 14. Website Builder & Manager
**Slug:** `website-builder` | **Category:** Growth & Client-Facing | **Overlap:** Universal

An in-house website creator that gives every client a professional web presence connected in real-time to their Command Center.

**Tier 1 — Static Marketing Site (Included):**
- Clean, mobile-responsive site — home, about, services, contact, reviews
- Live data from A1NT: hours, services, team profiles, service area map, promotions
- Industry-specific templates (constrained builder — prevents ugly results)
- Custom domain + SSL, SEO basics, analytics dashboard

**Tier 2 — Customer Portal (Add-on):**
- Customer login — view appointments, pay invoices, request service, message business
- Service history, document uploads, self-scheduling
- Reduces inbound calls, improves payment collection

**Tier 3 — Premium SaaS Portal:**
- Real-time status dashboards, subscription management
- Route/delivery tracking via Geo module (shipping companies)
- Knowledge base, multi-location, API access, white-label option

**Real-time sync:** Organization settings, Sales & Marketing promotions, Workforce team page, Scheduling availability, Invoicing portal, Geo service area map, Work Order customer history — all feed the website automatically.

> Full specification: `docs/MODULE-WEBSITE-BUILDER.md`

---

### 15. Import, Onboarding & Automated Reporting
**Slug:** `import-onboarding` | **Category:** Core Platform | **Overlap:** 10/10 templates

Make switching painless. Get running fast. Stay informed automatically.

**Three Pillars:**
- **Data Import:** Multi-channel migration (CSV/XLSX, QuickBooks, Xero, ServiceTitan, Jobber, OCR scanning, email parsing, API) with AI field mapping, duplicate detection, relationship inference, and full rollback
- **Guided Onboarding:** AI-powered setup wizard with step-by-step checklist, role-based tutorials, verification sweeps, practice mode, and certification tracking
- **Automated Reporting:** Custom report builder with scheduled delivery (email/SMS/in-app), AI executive summaries, pre-built templates per module, and per-role alert matrix configuration
- Integration: Touches every module — imports data into all, reporting aggregates from all, onboarding configures all

> Full specification: `docs/MODULE-IMPORT-ONBOARDING.md`

---

### 16. AI Agents
**Slug:** `ai-agents` | **Category:** Core Platform | **Overlap:** 10/10 templates

The defining feature of A1 Integrations. Agents aren't tools — they're employees.

**Tier 1 — Assistant Agents:**
- Web App Helper: context-aware chat on every page, can answer questions, perform actions, navigate, help with data entry
- Onboarding Agent: guided setup for new organizations
- Training Agent: interactive tutorials, certification, best practice coaching

**Tier 2 — Agent Employees:**
- Literal line items on the employee roster alongside humans
- Assignable roles: Receptionist, Dispatcher, Inside Sales, Customer Service, Follow-Up Manager, Clerical, Financial Analyst, Tax Prep, Social Media Manager, Content Creator, Lead Generator, Troubleshooting Tech, Systems Planner, MEP Draftsman, Building Code Reviewer, Continuing Ed Instructor, Legal Reviewer, Risk Analyst, Customer Satisfaction Manager, and more
- Full lifecycle: provision → configure → onboard → deploy → learn → review → tune
- Performance reviews with automated metrics + supervisor ratings + client feedback
- Multi-channel communication: phone (VoIP), email, chat, SMS, web forms, voice
- Real-time data access with role-based permissions, live event stream subscription
- Layered system prompt architecture: platform → industry → organization → role → personality → live context
- Agent Marketplace (future): pre-built templates, community sharing, custom builder

> Full specification: `docs/MODULE-AI-AGENTS.md`

---

## Build Priority

| Priority | Module | Rationale | Status |
|----------|--------|-----------|--------|
| P0 | Command Center | The shell — everything else lives inside it | ✅ Built |
| P0 | Client Intelligence | The client directory is foundational; smart features layer on later | ✅ Built |
| P1 | Scheduling & Dispatching | Core operational need for every service business | ✅ Built |
| P1 | Work Orders & Job Tracking | The paper replacement — this is what clients came for | ✅ Built |
| P1 | Invoicing & Payments | Get paid — immediate ROI for clients | ✅ Built |
| P2 | Employee & Workforce | People management, time tracking | ✅ Built |
| P2 | Inventory & Parts | Material tracking, cost awareness | ✅ Built |
| P2 | AI Receptionist | The wow factor — but needs scheduling + work orders built first | ✅ Built |
| P2 | Infrastructure & Geo (Phase 1-2) | Core map engine + client location pins + site drill-down | ⚡ Partial (search + draw + extrusion) |
| P3 | Sales & Marketing | Growth engine — feeds from CI | ✅ Built |
| P3 | Financial Reporting | Aggregates data from everything else | ✅ Built |
| P3 | Fleet & Equipment | Valuable but not day-one essential | ✅ Built |
| P3 | Documents & Knowledge Base | Important for onboarding and compliance, builds over time | ✅ Built |
| P3 | Website Builder (Tier 1) | Static marketing sites — builds on existing module data | Planned |
| P4 | Import & Onboarding (Phase 1-2) | Data migration + guided setup — critical for customer acquisition | Planned |
| P4 | AI Agents (Phase 1-2) | Helper agent + basic agent employees — the core differentiator | Planned |
| P4 | Infrastructure & Geo (Phase 3-5) | Incident/compliance tracking, in-house facilities, dispatch layer | Planned |
| P4 | Website Builder (Tier 2-3) | Customer portal + premium SaaS features | Planned |
| P5 | AI Agents (Phase 3-6) | Advanced roles, marketplace, full agent employee ecosystem | Planned |
| P5 | Infrastructure & Geo (Phase 6-7) | 3D Digital Twin + photogrammetry integration | Planned |
