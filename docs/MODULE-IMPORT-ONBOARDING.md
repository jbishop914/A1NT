# Module 15: Import, Onboarding & Automated Reporting

**Slug:** `import-onboarding` | **Category:** Core Platform | **Overlap:** 10/10 templates

> Make switching painless. Get running fast. Stay informed automatically.

Three pillars in one module: (1) data migration from any source, (2) guided setup with AI verification, (3) automated reporting and alert configuration. The goal: a business owner signs up on Monday and is fully operational by Friday — with their entire history intact, alerts configured per role, and custom reports hitting their inbox on schedule.

---

## Pillar 1: Data Import & Migration

### Import Channels

| Channel | Source Types | Method |
|---------|-------------|--------|
| **File Upload** | CSV, XLSX, JSON, XML, QFX/OFX, IIF | Drag-and-drop with auto-detection |
| **QuickBooks** | QB Online, QB Desktop (via IIF/QBX) | OAuth connect (Online) or file export (Desktop) |
| **Spreadsheet** | Google Sheets, Excel Online | OAuth connect + sheet picker |
| **CRM/Software** | ServiceTitan, Jobber, Housecall Pro, FieldEdge, ServiceMax | API connectors (phased rollout) |
| **Accounting** | Xero, FreshBooks, Wave, Sage | OAuth API connectors |
| **Email Import** | Gmail, Outlook | Parse invoices, contacts, correspondence from inbox |
| **Photo/Doc Scan** | Camera, file upload | OCR extraction — scan paper invoices, receipts, handwritten records |
| **Manual Entry** | Web form | Bulk entry forms with templates, copy-paste grids |
| **API** | REST endpoint | Programmatic import for advanced/proprietary systems |

### Import Wizard Flow

```
1. SELECT SOURCE → file upload / connect service / manual
2. MAP FIELDS → AI auto-maps columns to A1NT fields, user confirms/adjusts
3. PREVIEW → show first 10 rows with validation indicators
4. VALIDATE → flag duplicates, missing required fields, format issues
5. RESOLVE → fix/skip/merge UI for each conflict
6. IMPORT → background job with progress bar
7. VERIFY → summary report: imported, skipped, warnings, suggested actions
```

### Smart Import Features

- **AI Field Mapping:** Automatically detect column types (name, email, phone, address, dollar amounts, dates) regardless of header names. "Service Address" maps to client location, "Amt Due" maps to invoice balance, etc.
- **Duplicate Detection:** Fuzzy matching on client names, addresses, phone numbers. Configurable merge/skip/create-new behavior.
- **Data Normalization:** Standardize phone formats, address formatting (USPS validation), date parsing (handles MM/DD/YYYY, DD-Mon-YY, etc.), currency cleanup.
- **Relationship Inference:** Auto-link imported invoices to imported clients by name/ID matching. Link work orders to clients. Build the relationship graph automatically.
- **Historical Preservation:** Import with original dates intact — don't timestamp everything as "today." Preserve the business's history.
- **Incremental Sync:** For connected services (QuickBooks, etc.), option for ongoing one-way or two-way sync on a schedule.
- **Rollback:** Every import creates a snapshot. Full undo within 30 days.

### Industry-Specific Import Templates

Pre-built mappings for common software in each vertical:
- **Plumbing/HVAC:** ServiceTitan export format, Housecall Pro CSV, FieldEdge backup
- **Pest Control:** PestPac, PestRoutes export formats
- **Landscaping:** Jobber, LMN export formats
- **Cleaning:** ZenMaid, Launch27 export formats
- **General:** QuickBooks (all editions), Excel client lists, Google Contacts CSV

---

## Pillar 2: Guided Onboarding & Tutorials

### AI Onboarding Assistant

A dedicated onboarding agent (see Module 16: AI Agents) that:
- Greets the new organization on first login
- Walks through a step-by-step setup checklist
- Asks questions to configure the platform for the specific business
- Pre-configures modules based on industry template selection
- Imports data (guides through the import wizard)
- Sets up user accounts and roles
- Configures alert preferences per role
- Runs a **verification sweep** at the end:
  - Are all required fields populated?
  - Are there clients without contact info?
  - Are employees assigned to the right departments?
  - Are tax rates configured?
  - Is the payment processor connected?
  - Are any imported records flagged for review?
- Produces an "Onboarding Report Card" — green/yellow/red per section

### Setup Checklist (configurable per template)

```
□ Organization Profile — name, address, logo, tax ID, business hours
□ Industry Selection — picks the template, pre-activates relevant modules
□ Users & Roles — invite team members, assign roles (Owner, Manager, Office, Tech, etc.)
□ Data Import — bring in clients, invoices, work history (or start fresh)
□ Payment Processing — connect Stripe / payment gateway
□ Tax Configuration — sales tax rates, exempt categories
□ Service Catalog — define your service types and pricing
□ Scheduling Setup — business hours, tech availability, booking rules
□ Communication — connect email, set up phone system, notification preferences
□ Branding — logo, colors, email templates, invoice header
□ AI Receptionist — connect phone line, configure greeting, set routing rules
□ Alert Preferences — per-role alert configuration (see below)
□ Reporting — set up automated reports (see below)
□ Test Drive — walk through creating a sample work order end-to-end
□ Go Live — flip the switch, archive test data
```

### Interactive Tutorials

- **Quick Start Guides:** 2-minute video or step-by-step walkthrough per module
- **Role-Based Paths:** Different tutorial paths for Owner, Office Manager, Technician
- **Contextual Help:** "?" button on every screen opens relevant guide
- **Practice Mode:** Sandbox environment with sample data for training without affecting live data
- **Certification Tracks:** Employees complete module training and get marked "certified" in the Workforce module

### Alert Configuration System

Per-role, per-channel alert setup:

| Alert Type | Example | Channels |
|------------|---------|----------|
| **Operational** | New work order assigned, schedule change, emergency dispatch | Push, SMS, Email, In-App |
| **Financial** | Invoice overdue 30+ days, payment received, daily revenue summary | Email, In-App, SMS |
| **Inventory** | Part below minimum stock, PO received, reorder triggered | Push, Email, In-App |
| **HR** | Certification expiring, time-off request, overtime alert | Email, In-App |
| **Client** | New lead, client complaint, review received, NPS drop | Push, Email, In-App |
| **System** | Import completed, backup status, integration error | Email, In-App |
| **AI Agent** | Agent escalation, agent error rate spike, agent task completion | Push, Email, In-App |

Configuration UI:
- Matrix view: Alert types × roles × channels
- Toggle on/off per cell
- Frequency controls: Instant, Digest (hourly/daily/weekly), Quiet hours
- Priority override: Critical alerts always push through regardless of quiet hours

---

## Pillar 3: Automated Reporting

### Report Builder

- **Template Library:** Pre-built reports per module (Revenue Summary, AR Aging, Job Profitability, Technician Utilization, Inventory Usage, Campaign ROI, etc.)
- **Custom Report Builder:**
  - Drag-and-drop field selector from any module's data
  - Filter conditions (date range, status, client, employee, category)
  - Grouping and subtotals
  - Chart type selection (table, bar, line, pie)
  - Save as template for reuse
- **Scheduled Delivery:**
  - Frequency: Daily, Weekly (pick day), Bi-weekly, Monthly (pick date), Quarterly, Custom cron
  - Delivery: Email (PDF attachment), SMS (summary text), In-App notification
  - Recipients: Any user, any email address, distribution lists
  - Time: Configurable delivery time per recipient's timezone
- **AI Summary:** Each report includes an AI-generated executive summary paragraph highlighting key changes, anomalies, and recommended actions

### Pre-Built Report Templates

| Report | Module Source | Default Frequency |
|--------|-------------|-------------------|
| Daily Revenue Summary | Invoicing | Daily 6pm |
| Weekly P&L | Financial | Monday 8am |
| Open Work Orders | Work Orders | Daily 7am |
| Technician Utilization | Workforce + Scheduling | Weekly |
| Inventory Reorder Alert | Inventory | When triggered |
| Campaign Performance | Sales & Marketing | Weekly |
| AR Aging Report | Financial | Weekly |
| Client Activity Summary | Client Intelligence | Monthly |
| Fleet Maintenance Due | Fleet | Weekly |
| Employee Certification Status | Workforce | Monthly |
| AI Agent Performance | Agents | Weekly |
| New Lead Pipeline | Sales & Marketing | Daily |

---

## Data Model (Prisma additions)

```
ImportJob — id, orgId, source, status, totalRows, importedRows, skippedRows, errorRows, mappingConfig, snapshotId, createdAt, completedAt
ImportMapping — id, jobId, sourceField, targetModel, targetField, transformRule
OnboardingProgress — id, orgId, checklistItems (JSON), completedSteps, currentStep, verificationResults (JSON), completedAt
AlertRule — id, orgId, userId, roleId, alertType, channel, frequency, enabled, quietHoursStart, quietHoursEnd
ReportTemplate — id, orgId, name, type, config (JSON — fields, filters, grouping, chart type), moduleSource
ScheduledReport — id, templateId, frequency, deliveryChannel, recipients (JSON), nextRunAt, lastRunAt, timezone
ReportDelivery — id, scheduledReportId, sentAt, recipients, format, aiSummary
```

---

## Build Priority

| Phase | Scope |
|-------|-------|
| Phase 1 | File upload (CSV/XLSX) import wizard with AI field mapping, basic onboarding checklist, alert matrix UI |
| Phase 2 | QuickBooks/Xero OAuth connectors, scheduled reports with email delivery |
| Phase 3 | OCR document scanning, incremental sync, custom report builder |
| Phase 4 | Full industry-specific connectors (ServiceTitan, Jobber, etc.), certification tracking integration |
