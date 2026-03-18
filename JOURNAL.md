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
