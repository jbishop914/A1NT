# Online Booking System — Full Specification
## P0 Item #1 from Feature Gap Analysis

**Date:** March 20, 2026
**Status:** Spec Draft — Awaiting Josh Review

---

## Overview

Two paths for clients to accept online bookings:

### Path 1: No Existing Website → A1NT Website Builder
- Client uses A1NT's Website Builder to generate a starter site
- Self-serve: click through template options, launch website
- Auto-pulls existing data: company description (from receptionist config context), contact info, address, services
- Landing page has prominent CTA: "Schedule a Free Estimate Now — We're Available!"
- CTA links to booking tab which embeds the booking widget
- Contact/About Us tab with company info
- Service area map (Mapbox) with outlined service area boundary
- Option to add more pages/sections or edit content after launch

### Path 2: Existing Website → Embeddable Widget Snippet
- Pre-packaged widget code snippet (JS embed)
- Instructions on how to add to any website (WordPress, Squarespace, Wix, custom HTML, etc.)
- If client needs help: "Ask for Help" button → routes to a Website Helper AI Agent trained to assess the situation and guide implementation

---

## Booking Widget — Core Functionality

### Appointment Classification
Each booking is classified by type, which determines:
- Time slot duration
- Who to assign (which tech/team)

**Booking Types:**
| Type | Purpose | Expected Duration |
|------|---------|-------------------|
| Estimate | Free estimate for new work | TBD (configurable) |
| Follow Up | Follow-up on previous work/estimate | TBD (configurable) |
| Product Demonstration | Demo of product/equipment | TBD (configurable) |
| Service Call | Active service/repair work | TBD (configurable) |
| Warranty | Warranty-related service | TBD (configurable) |

### Information Capture (Pre-Booking Form)
Goal: Get as much info up front as possible to categorize the work

**Required Fields:**
- Full name
- Phone number
- Email
- Service address (street, city, state, zip)
- Appointment type (Estimate, Follow Up, Product Demo, Service Call, Warranty)
- Description of work needed (free text)

**Auto-Categorization:**
- Based on description + appointment type, system attempts to categorize the desired work
- Maps to service catalog / pricebook when available (P1 feature)
- Determines estimated duration and appropriate assignee

### Calendar Integration
- Syncs with A1NT Scheduling module
- Shows available time slots based on:
  - Existing schedule (occupied slots blocked)
  - Business hours configuration
  - Appointment type duration requirements
  - Tech/team availability
- Real-time availability — no double-booking

### Service Area Validation
**Hard requirement: Service Area must be defined in the main system settings**

Flow:
1. Client enters service address in booking form
2. System checks address against defined service area boundary (geo-fence)
3. **Inside service area** → proceed to time slot selection
4. **Outside service area** → display message:
   > "The address you entered is outside of our normal service area. Please call the office if you need further assistance. Thank you."
   - Provides office phone number (which routes to AI Receptionist)

### AI Receptionist Integration (Service Area Edge Case)
When a customer whose address was flagged as outside service area calls:

**Receptionist behavior:**
- System prompt includes service area awareness
- Receptionist should confirm the address with the caller
- Has access to check if address is within service area (API call)
- **If too complex for real-time geo-check:** Receptionist compares caller's stated address against the address entered on the website booking form (we have that record, flagged)
- If addresses match → Receptionist acknowledges it's correctly flagged due to proximity and politely explains: "I'm sorry, but we don't currently service that area. Thank you for calling."
- If addresses differ → Receptionist can check the new address or escalate

**Flagging system:**
- Booking attempts outside service area are logged
- Flagged in the system for office review
- If a pattern emerges (many requests from an area), surfaces as opportunity in Client Intelligence

---

## Path 1 Detail: Website Builder Starter Template

### Data Auto-Population
Pulls from existing A1NT system data:
- **Company name** — from Organization record
- **Company description** — from AI Receptionist config context (the business description used in system prompts)
- **Contact info** — phone, email from Organization
- **Address** — from Organization
- **Services offered** — from Organization/template config
- **Service area** — from new Service Area system setting
- **Business hours** — from Organization settings

### Starter Template Structure
**Landing Page:**
- Hero section with company name + tagline
- Prominent CTA button: "Schedule a Free Estimate Now — We're Available!"
- Brief company description
- List of services offered

**Booking Tab/Page:**
- Embedded booking widget (the same widget from Path 2)
- Full booking flow integrated into the site

**About Us / Contact Tab:**
- Company description (longer form)
- Contact information (phone, email, address)
- Business hours
- Service area map (Mapbox) with boundary outline
- Contact form (routes to AI Receptionist or creates lead)

### Post-Launch Editing
- Client can add more pages/sections
- Edit text, images, layout
- Change template styling
- All through the existing Website Builder module UI

---

## Path 2 Detail: Embeddable Widget for Existing Websites

### Widget Distribution
- Pre-generated JS snippet unique to each organization
- Example: `<script src="https://a1ntegrel.vercel.app/widget/booking/{org-id}.js"></script>`
- Plus a container div: `<div id="a1nt-booking"></div>`

### Implementation Guide
Prepared instructions covering:
- WordPress (plugin or custom HTML block)
- Squarespace (code injection)
- Wix (HTML embed)
- Shopify (theme code)
- Generic HTML (copy-paste)
- Step-by-step with screenshots

### Help Path
If client can't implement:
1. "Need Help?" button in the A1NT dashboard next to the widget code
2. Opens chat/form with Website Helper AI Agent
3. Agent is trained to:
   - Ask what platform the client's website runs on
   - Provide platform-specific instructions
   - Troubleshoot common issues (CORS, styling conflicts, etc.)
   - Offer to review the client's site and suggest placement
   - Escalate to human support if needed

---

## System Requirements (New)

### New System Setting: Service Area
- **Location:** Settings → Organization (or dedicated section)
- **UI:** Mapbox map with drawing tools (polygon/radius)
- **Storage:** GeoJSON polygon in Organization record
- **Used by:** Booking widget, AI Receptionist, Website Builder, future dispatch optimization
- **Required:** Yes — must be defined before booking widget can be activated

### New Prisma Models Needed
```
ServiceArea — org-level geo boundary (GeoJSON polygon)
Booking — online booking submissions
BookingType — configurable appointment types with durations
BookingFlag — out-of-service-area attempts and other flags
```

### API Routes Needed
```
GET  /api/booking/availability?date=X&type=Y — available time slots
POST /api/booking — create booking (public, no auth)
GET  /api/booking/widget/{orgId} — widget config (public)
POST /api/booking/validate-address — service area check
GET  /api/organization/service-area — get service area boundary
POST /api/organization/service-area — save service area boundary
```

### Widget Route
```
GET /widget/booking/{orgId}.js — embeddable widget script
```

---

## Build Plan

### Step 1: Service Area Foundation
- Add ServiceArea to Prisma schema
- Build service area drawing UI in Settings (reuse existing Mapbox drawing tools from Command Center)
- API routes for save/retrieve
- Point-in-polygon validation utility

### Step 2: Booking Data Model + API
- Add Booking, BookingType, BookingFlag to Prisma schema
- Build availability engine (query Scheduling module for open slots)
- Build public booking API (no auth required — public-facing)
- Address validation against service area

### Step 3: Booking Widget (React component)
- Standalone React component that renders the booking flow
- Appointment type selection → info capture → address validation → time slot selection → confirmation
- Responsive (mobile-first — customers will use this on phones)
- Styled to match org branding (pulls colors/logo from org config)

### Step 4: Embeddable Widget Script
- Build the JS bundle that mounts the React widget on any page
- Org-specific config endpoint
- CORS setup for cross-origin embedding
- Implementation guide documentation

### Step 5: Website Builder Integration
- Starter template with auto-populated content
- Booking page with embedded widget
- Service area map display
- CTA on landing page

### Step 6: AI Receptionist Updates
- Update system prompt builder to include service area awareness
- Add booking flag checking capability
- Handle the "outside service area" call scenario

### Step 7: Website Helper Agent
- New AI Agent type: Website Helper
- Trained on widget implementation for major platforms
- Available via chat in the A1NT dashboard

---

## Decisions (Josh — March 20, 2026)

1. **Appointment durations (defaults, configurable later):**
   - Estimate: 30 min
   - Follow Up: 30 min
   - Product Demo: 60 min
   - Service Call: 60 min
   - Warranty: 60 min

2. **Booking window:** 30 days out

3. **Service area:** Both options — radius from address AND draw polygon on map

4. **Widget styling:** Client branding via themed presets + customization
   - Pre-made color themes to start (light, dark, neutral variations)
   - Color picker for background/border/icon styling (future expansion)
   - Dark mode / light mode
   - Neutral black to gray to white spectrum
   - Transparency options, glassmorphism (future expansion)
   - **For now:** Ship with ~6 pre-made themes. Expand to full customizer later.
