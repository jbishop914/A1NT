# Website Builder & Manager Module — Full Specification

**Slug:** `website-builder` | **Category:** Growth & Client-Facing | **Overlap:** Universal

An in-house website creation and management tool that gives every A1NT client a professional web presence — connected in real-time to their Command Center. Ranges from simple landing pages to full SaaS-style customer portals.

---

## Core Concept

Most SMBs in A1NT's target verticals (plumbing, HVAC, auto repair, landscaping, etc.) have one of three website situations:
1. **No website** — business card only
2. **Outdated website** — built 5 years ago, never updated, wrong phone number
3. **Third-party site** — managed by a freelancer who charges for every change

A1NT solves this by making the website a **living extension of the business platform**. When you update your hours, run a promotion, hire a new technician, or change your service area — the website updates automatically because it's fed by the same data.

---

## Tiers

### Tier 1: Static Marketing Site (Included)
A clean, mobile-responsive marketing website that pulls live data from A1NT modules.

**Pages:**
- Home (hero, services overview, CTA)
- About (team, story, certifications)
- Services (auto-populated from module configuration)
- Contact (form → leads into CRM, map from Geo module)
- Reviews/Testimonials (if review collection is enabled)

**Live Data Connections:**
- Business name, logo, hours, phone, email → from Organization settings
- Service list and descriptions → from module/template configuration
- Team/technician profiles → from Workforce module (opt-in per employee)
- Service area map → from Geo module
- Promotions/specials → from Sales & Marketing module
- "Now Hiring" banner → from Workforce module (if open positions flagged)

**Features:**
- Template selection — 3-5 clean, professional templates per industry
- Drag-and-drop section reordering (not full page builder — intentionally constrained)
- Custom domain support (CNAME setup guide)
- SSL included
- SEO basics — meta tags, sitemap, schema markup
- Mobile-responsive by default
- Analytics dashboard — page views, form submissions, top pages

### Tier 2: Interactive Customer Portal (Add-on)
Everything in Tier 1, plus a logged-in customer experience.

**Customer-Facing Features:**
- Customer login (magic link or password)
- View upcoming appointments → from Scheduling module
- View and pay invoices → from Invoicing module
- Request service / submit work order → creates draft in Work Orders module
- View service history → from Work Orders module
- Upload documents → feeds into Documents module
- Message/chat with business → feeds into AI Receptionist or direct contact

**Business Benefits:**
- Reduces inbound calls ("check your invoice online")
- Customers self-schedule where enabled
- Payment collection improves — "click to pay" on invoice email links to portal
- Professional impression — "they have an app-like experience"

### Tier 3: SaaS-Style Full Portal (Premium)
For businesses that want to run subscription services or ongoing client relationships.

**Additional Features:**
- Customer dashboard with real-time status updates
- Subscription/maintenance plan management
- Route/delivery tracking → from Geo module (e.g., shipping companies show live route maps)
- Knowledge base / FAQ section → from Documents module
- Multi-location support for franchise-style businesses
- API access for custom integrations
- White-label option — A1NT branding removed

---

## Architecture

### Site Generation
- Sites are **statically generated** with incremental rebuilds when source data changes
- Template engine renders pages from structured data (not WYSIWYG raw HTML)
- Each template is a themed component set — header, hero, services grid, contact form, footer
- Industry-specific templates include relevant imagery styles and copy patterns

### Data Flow
```
A1NT Modules → Site Data API → Static Site Generator → CDN
                                    ↑
                              Template Engine
                                    ↑
                            Client's Theme Selection
                            + Custom Content Overrides
```

### Real-Time Sync Points
| Source Module | Website Update | Trigger |
|---------------|---------------|---------|
| Organization Settings | Hours, phone, address, name | Any field change |
| Sales & Marketing | Active promotions, seasonal banners | Campaign start/end |
| Workforce | Team page, "hiring" banner | Employee profile update, job posting |
| Scheduling | Online booking availability | Schedule/availability change |
| Invoicing | Customer portal — invoice list | Invoice created/updated |
| Geo | Service area map, location pins | Territory/location update |
| Documents | Public downloads, forms | Document published to portal |
| Work Orders | Customer portal — service history | Work order status change |

### Hosting
- Managed hosting included — no client-side infrastructure to worry about
- CDN-distributed for performance
- Automatic SSL via Let's Encrypt
- Custom domain CNAME setup with guided walkthrough
- Subdomain fallback: `acme-plumbing.a1nt.app`

---

## Builder Interface (In A1NT Dashboard)

**Not a Wix/Squarespace competitor.** The builder is intentionally constrained to prevent ugly results. Think Carrd or Super (Notion sites) — choose a template, fill in your content, toggle sections on/off, done.

### Builder Features:
- Template gallery — filter by industry
- Section toggle — show/hide: hero, services, team, reviews, contact, map, promotions
- Section reorder — drag sections to rearrange
- Content editing — inline text editing, image upload, link management
- Color theme — auto-derived from business logo (with manual override)
- Preview — desktop/tablet/mobile preview before publish
- Publish — one-click deploy to production
- Version history — roll back to previous versions

### Content Management:
- Blog/news section (optional) — simple markdown editor
- Photo gallery — auto-populated from work order photos (opt-in)
- Announcements bar — "We're closed for the holiday" syncs with scheduling module

---

## Data Model Additions

```
Website
  - id, organizationId
  - templateId (references WebsiteTemplate)
  - customDomain?, subdomain
  - status: DRAFT | PUBLISHED | MAINTENANCE
  - tier: STATIC | PORTAL | PREMIUM
  - themeConfig (JSON — colors, fonts, layout overrides)
  - seoConfig (JSON — title, description, og tags)
  - publishedAt, lastBuildAt

WebsiteTemplate
  - id, name, slug, industry
  - previewImageUrl
  - sections (JSON — available sections and default order)
  - version

WebsiteSection
  - id, websiteId
  - sectionType: HERO | SERVICES | TEAM | REVIEWS | CONTACT | MAP | PROMOTIONS | BLOG | GALLERY | CUSTOM
  - isVisible, sortOrder
  - content (JSON — section-specific content)
  - sourceModule? (which module feeds this section)

WebsiteAnalytics
  - id, websiteId
  - date, pageViews, uniqueVisitors
  - topPages (JSON)
  - formSubmissions, bookingClicks
```

---

## Build Priority

| Phase | Scope | Effort |
|-------|-------|--------|
| Phase 1 | Template engine + 2 templates + static marketing site | High |
| Phase 2 | Builder interface in dashboard + live data sync | High |
| Phase 3 | Custom domain support + analytics | Medium |
| Phase 4 | Customer portal (Tier 2) — login, invoices, scheduling | Very High |
| Phase 5 | Blog/news, photo gallery, announcements | Medium |
| Phase 6 | Premium tier — subscriptions, white-label, API | Very High |

---

## Revenue Implications

This module has direct monetization potential:
- **Tier 1 (Static):** Included with platform subscription — reduces churn
- **Tier 2 (Portal):** +$XX/month add-on — high value, reduces support load
- **Tier 3 (Premium):** +$XXX/month — enterprise-level, custom work
- **Custom domain setup:** One-time $X fee or included at higher tiers
- **Managed updates:** "We'll keep your site fresh" — optional concierge service
