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
