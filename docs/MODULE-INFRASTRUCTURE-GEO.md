# Infrastructure & Geo Module — Full Specification

**Slug:** `infrastructure-geo` | **Category:** Operations & Intelligence | **Overlap:** Universal

The spatial brain of the platform. A layered map/GIS system that serves as both an operational tool and an intelligence layer. Two primary contexts — **In-House** (the client's own facilities) and **Client-Side** (their customers' locations) — built on a shared core map engine that other modules can layer onto.

---

## Architecture: Shared Core + Module Layers

The Geo module is not a silo — it's a **platform service**. The core map engine provides:

- Base map rendering (satellite, street, terrain) via Mapbox GL JS or Google Maps Platform
- Pin/marker system with customizable icons, colors, and popup content
- Drawing tools (polygons, lines, points, annotations, freehand notes)
- Layer management — each module registers its own layers, users toggle visibility
- Search, filter, geocoding, reverse geocoding
- Responsive — full desktop experience + mobile field view

**Module layer integration points:**
| Module | Layer Type | Example |
|--------|-----------|---------|
| Scheduling & Dispatching | Route overlay, tech locations | Live technician GPS, optimized route paths |
| Work Orders | Job pins | Active jobs color-coded by status |
| Client Intelligence | Client location pins | Revenue heat map, client density |
| Fleet & Equipment | Vehicle tracking | Real-time fleet positions, geofencing |
| Sales & Marketing | Territory boundaries | Sales regions, prospect clusters |
| AI Receptionist | Call origin pins | Where calls are coming from |
| Inventory | Warehouse/truck locations | Parts availability by location |

Modules can **read** other modules' layers (with permission) for cross-referencing — e.g., a dispatcher sees both route layer AND work order pins simultaneously.

---

## Section 1: Client-Side Geo (Customer Locations)

### Core Layer — Location Directory
- Pin every client location on the map — auto-geocoded from address
- Filter by: client status, tags, service type, region, revenue, last service date
- Cluster view for dense areas, zoom to individual pins
- Quick-view popup: client name, contact, last service, open jobs, revenue
- Click-through to full Client Intelligence detail

### Drill-Down — Individual Client Location
When you zoom into a single client location, a new level of detail opens up:

**Site Map / Campus View:**
- Satellite imagery base layer (toggle to street/terrain)
- Draw **zones and buildings** — outline building footprints, parking areas, restricted zones
- Place **sticky pins** with custom icons and popup notes:
  - Hazard warnings ("Watch out for dog in unit 34B")
  - Access instructions ("Enter through loading dock B, code 4477")
  - Equipment locations ("Main shut-off valve behind stairwell C")
  - Contact points ("Ask for Maria at front desk for key access")
- Freehand **drawing annotations** — sketch routes, mark boundaries, highlight areas
- **Geometry tools** — measure distances, mark utility runs, draw service areas
- Pin categories with custom colors/icons — access, hazard, equipment, contact, custom
- Photo attachments on pins — snap a photo and geo-tag it to a specific pin
- All annotations saved per-location, versioned, with author attribution

**Navigation & Directions:**
- "How to get to classroom A in the west campus" — step-by-step site navigation
- Printable/shareable site maps with annotations
- Link from work order → site map so technicians land on the right view
- Integration with vehicle navigation for last-mile directions

### Incident & Compliance Tracking (Client-Side)
- Log incidents with **precise geolocation** on the client site map
- Incident types: injury, property damage, near-miss, equipment failure, customer complaint
- Workers' comp injury reports with:
  - Exact location pin on site map
  - Photos, witness info, narrative
  - OSHA-required fields and filing compliance
  - Auto-archive with retention scheduling
- **Trend analysis:**
  - View all incidents across one client location — spot clusters
  - View across ALL client locations — identify patterns
  - Filter by: incident type, severity, time period, client type, region
  - Heat map overlay showing incident density
  - "3 slip-and-fall injuries in Building C parking lot over 6 months" → trigger preventative action
- Compliance audit trail — who reported, when, what actions taken, resolution
- Export for insurance, legal, or regulatory filing

---

## Section 2: In-House Geo (Own Facilities)

Everything available on the Client-Side is also available for managing your own properties — plus additional features specific to facility management and emergency preparedness.

### Core Facility Management
- Map your own office, warehouse, shop, parking, storage, yard
- Pin utilities and services — electrical panels, water mains, gas shutoffs, HVAC units
- Track routine maintenance — sprinkler inspections, fire alarm tests, elevator service
- Checklist-based inspections with location pins (fire extinguisher monthly check at pin #14)
- Assign maintenance tasks with location context
- Contractor access instructions — "Share this annotated map with the electrician"

### Emergency Preparedness
- **Fire drill routes and assembly points** — draw evacuation paths per floor/zone
- **Emergency protocol by situation type:**
  - Fire: evacuation route, fire suppression locations, 911 integration
  - Flood: critical equipment elevation, sandbag staging, utility shutoff sequence
  - Earthquake: drop/cover/hold zones, structural risk areas, gas shutoff locations
  - Severe weather: shelter-in-place zones, storm shelter locations
  - Active threat: lockdown zones, safe rooms, communication protocols
- **Evacuation details:** assembly points, headcount zones, rejoining instructions
- Distribute emergency maps to all employees — mobile-accessible
- Drill scheduling and tracking — log drill dates, times, participation, response times
- Customizable per-facility — different buildings get different protocols

### 3D Digital Twin (Premium Tier)

**Basic (included):**
- 2D floor plans with interactive overlays
- Pin-based everything — same as outdoor but indoor
- Room/space labeling with metadata (capacity, equipment, department)

**Advanced (upsell — "Have us build one for you"):**
- Full 3D Three.js model of headquarters/facilities
- New employee onboarding — virtual walkthrough, "here's your desk, here's the break room"
- Interactive exploration — click rooms for info, equipment details, department contacts
- Maintenance department tool — locate systems in 3D space
- Utility infrastructure visualization — pipe runs, electrical conduits, HVAC ducts
- Integration with separate photogrammetry project (Autodesk Reality Capture API):
  - Client submits photos → automated 3D reconstruction
  - AI-generated PBR materials for realistic rendering
  - Ongoing maintenance of model as building changes
  - Pricing: $XX/month subscription for model hosting and updates
- Import option: clients can bring their own BIM/3D models (FBX, glTF, IFC)

---

## Data Model Implications

New models to add to Prisma schema:

```
Location (client location + own facilities)
  - id, organizationId, clientId?, name, address, lat, lng
  - locationType: CLIENT_SITE | OWN_FACILITY | WAREHOUSE | OTHER
  - metadata (JSON)

MapAnnotation (pins, drawings, geometry)
  - id, locationId, createdById
  - annotationType: PIN | POLYGON | LINE | FREEHAND | TEXT
  - geometry (GeoJSON)
  - category: HAZARD | ACCESS | EQUIPMENT | CONTACT | NOTE | CUSTOM
  - title, description, photos[]
  - isActive, version

Incident
  - id, locationId, organizationId, reportedById
  - incidentType: INJURY | PROPERTY_DAMAGE | NEAR_MISS | EQUIPMENT_FAILURE | COMPLAINT
  - severity: LOW | MEDIUM | HIGH | CRITICAL
  - lat, lng (precise location within site)
  - description, photos[], witnesses
  - workersCompClaim? (boolean + linked report)
  - status: REPORTED | INVESTIGATING | RESOLVED | ARCHIVED
  - resolutionNotes, resolvedAt

EmergencyPlan
  - id, locationId, organizationId
  - planType: FIRE | FLOOD | EARTHQUAKE | WEATHER | EVACUATION | LOCKDOWN
  - routes (GeoJSON paths)
  - assemblyPoints (GeoJSON points)
  - instructions (structured text)
  - lastDrillDate, nextDrillDate

FacilityAsset (for maintenance tracking)
  - id, locationId
  - assetType: FIRE_ALARM | SPRINKLER | ELEVATOR | HVAC_UNIT | ELECTRICAL_PANEL | etc.
  - lat, lng, floor
  - lastInspection, nextInspection
  - status, notes
```

---

## Build Priority

| Phase | Scope | Effort |
|-------|-------|--------|
| Phase 1 | Core map engine + client location directory + basic pins | Medium |
| Phase 2 | Drill-down site maps, sticky pins, drawing tools, annotations | High |
| Phase 3 | Incident tracking, compliance, workers comp reports | Medium |
| Phase 4 | In-house facility management, emergency preparedness | Medium |
| Phase 5 | Dispatch/route layer integration | Medium |
| Phase 6 | 3D Digital Twin (Three.js basic) | High |
| Phase 7 | Advanced 3D (photogrammetry integration, premium tier) | Very High |

---

## Map Provider Considerations

| Provider | Strengths | Considerations |
|----------|-----------|----------------|
| **Mapbox GL JS** | Best developer experience, beautiful styling, 3D terrain, free tier generous | Cost scales with MAU |
| **Google Maps Platform** | Satellite imagery quality, Street View, Places API | Per-load pricing, familiar to users |
| **ArcGIS** | Enterprise GIS features, spatial analysis | More complex, enterprise pricing |

**Recommendation:** Start with Mapbox GL JS for the core engine — best balance of developer experience, customization (monochrome map style matches A1NT aesthetic), and 3D capability for future digital twin. Google Maps as secondary for satellite imagery and Street View integration where needed.
