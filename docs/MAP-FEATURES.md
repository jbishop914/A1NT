# Command Center Map — Feature Roadmap

Advanced map capabilities planned for the Infrastructure & Geo module, building on top of the current Mapbox GL JS satellite map.

---

## 1. Address Search Bar (Geocoder)

**Purpose:** Navigate instantly to any client site, prospect address, or point of interest directly from the Command Center.

**Implementation:**
- **Package:** `@mapbox/search-js-react` — official React component for Mapbox Geocoding API
- **Behavior:** Floating search bar overlaid on the map (glass aesthetic, consistent with existing overlays). Type an address → autocomplete suggestions → select → map flies to location with marker.
- **Integration points:**
  - Pre-populated with client addresses from Client Intelligence module
  - "Search or select a client" hybrid — fuzzy search across both Mapbox geocoder results AND internal client directory
  - Result selection can trigger client detail popup or slide-out
  - Proximity bias toward business service area (configurable radius from HQ)

**Effort:** Low — drop-in component, 1-2 days including styling and client directory integration.

---

## 2. 3D Object Editing (SketchUp-Style)

**Purpose:** Draw building footprints, property boundaries, and structures directly on the map, then extrude them into 3D — like a lightweight SketchUp on top of satellite imagery.

### 2A. Polygon Drawing (2D)

**Implementation:**
- **Package:** `@mapbox/mapbox-gl-draw` — official drawing plugin for Mapbox GL JS
- **Tools:** Draw rectangles, polygons, lines, freehand shapes, circles
- **Features:**
  - Snap-to-grid and vertex snapping for precise geometry
  - Edit existing shapes (move vertices, resize, rotate)
  - Measure area and perimeter in real-time
  - Save drawings as GeoJSON to database (per-client, per-site)
  - Layer management — toggle visibility of different annotation layers

### 2B. 3D Extrusion (Height)

**Implementation:**
- **Native Mapbox:** `fill-extrusion` layer type — built into Mapbox GL JS, no extra library needed
- **Properties per polygon:**
  - `fill-extrusion-height` — how tall (in meters) the shape extrudes upward
  - `fill-extrusion-base` — base height (for multi-story or stacked structures)
  - `fill-extrusion-color` — any color, including semi-transparent
  - `fill-extrusion-opacity` — control transparency
- **Interaction model:**
  - Draw a rectangle/polygon in 2D
  - Select it → height slider or numeric input appears in a floating panel
  - Drag slider or type value → shape extrudes in real-time (like SketchUp push/pull)
  - Click to confirm → saved to database with height metadata

### 2C. Colors & Materials

**What's possible today:**
- **Solid colors:** Any hex/rgb color, applied per-polygon via `fill-extrusion-color`
- **Opacity:** Per-polygon transparency (glass effect, etc.)
- **Patterns:** Mapbox supports `fill-pattern` for 2D fills (hatching, brick, concrete textures) — can be used for top-down view
- **Custom textures on 3D:** Not natively supported by Mapbox fill-extrusion. For textured 3D models, we bridge to Three.js.

**What requires Three.js / Threebox (future premium tier):**
- Full material system (metallic, roughness, emissive, normal maps)
- Texture-mapped 3D objects (brick walls, glass facades, metal roofing)
- Imported 3D models (glTF, FBX) placed on the map with correct geo-positioning
- Lighting and shadow simulation
- **Package:** `threebox-plugin` — bridges Three.js into Mapbox GL JS, keeps camera in sync

### Implementation Phases:

| Phase | Feature | Complexity | Dependencies |
|-------|---------|-----------|--------------|
| **Phase A** | Address search bar (geocoder) | Low | `@mapbox/search-js-react` |
| **Phase B** | 2D polygon drawing + annotation | Medium | `@mapbox/mapbox-gl-draw` |
| **Phase C** | 3D extrusion with height controls | Medium | Native `fill-extrusion` |
| **Phase D** | Color picker + opacity per shape | Low | UI controls only |
| **Phase E** | Texture/pattern fills (2D) | Low | Mapbox `fill-pattern` sprites |
| **Phase F** | 3D model import (glTF/FBX) | High | `threebox-plugin`, `three` |
| **Phase G** | Full material editor (textures, lighting) | High | Three.js material system |

---

## 3. Client Grouping & Visualization

**Purpose:** See all clients on the map, grouped and color-coded by meaningful business dimensions.

**Implementation:**
- **Cluster markers:** Mapbox GL JS native clustering — at zoomed-out view, group nearby clients into numbered cluster bubbles. Click to zoom into cluster.
- **Color coding by dimension:**
  - Status: Active (green), Lead (blue), Churned (gray)
  - Revenue tier: High/Medium/Low with graduated colors
  - Service type: Different icon per service category
  - Custom tags: User-defined groupings
- **Heat maps:** Density visualization showing where clients are concentrated
- **Service area polygons:** Draw/generate polygons showing coverage zones, territories, or service districts
- **Filters:** Toggle groups on/off, filter by any Client Intelligence dimension

**Data source:** Client Intelligence module → client records with geocoded addresses.

---

## 4. Geo Data Layers (Lead Generation & Marketing Intelligence)

**Purpose:** Overlay third-party demographic, economic, and property data to identify new business opportunities and inform marketing strategy.

### Available Data APIs:

**Mapbox Data Products:**
- **Mapbox Boundaries** — 4M+ global boundary polygons (admin, postal, legislative, statistical). Join with business data for territory planning, service area analysis, jurisdiction mapping.
- **Tilequery API** — Point-in-polygon: given a lat/lng, return which boundaries contain it (zip code, county, city, state, etc.)

**US Census Bureau (Free):**
- **American Community Survey (ACS)** — Demographics down to block-group level: income, age, housing type, homeownership rates, household size, education
- **County/ZIP Business Patterns (CBP/ZBP)** — Number of establishments, employment, payroll by industry and geography
- **TIGERweb GeoServices** — Census tract/block group boundaries as GeoJSON, overlayable on map
- **Geocoder** — Address → lat/lng → census geography FIPS codes

**Commercial / Premium (future):**
- **Property data APIs** (CoreLogic, ATTOM, Regrid) — Parcel boundaries, owner info, property value, lot size, building age, permits
- **Permit data** (BuildZoom, local municipality APIs) — Active building permits, renovation activity, new construction
- **Weather/environmental** (OpenWeather, Tomorrow.io) — Seasonal patterns, storm damage probability, temperature trends
- **Google Places / Yelp Fusion** — Competitor locations, business density, review data

### Use Cases by Industry Template:

| Industry | Geo Intelligence Layer | Business Value |
|----------|----------------------|----------------|
| **HVAC/Plumbing** | Housing age + homeownership + income by ZIP | Target neighborhoods with older homes and ability to pay |
| **Landscaping** | Lot size + property value + seasonal weather | Identify large-lot homeowners before spring season |
| **Pest Control** | Climate data + housing density + complaint history | Predict pest activity by region and season |
| **Electrical** | Building permits + renovation activity | Find active renovation projects needing electrical work |
| **Cleaning** | Commercial establishment count by ZIP | Density of potential commercial cleaning clients |
| **Auto Repair** | Vehicle registration density + income | High-vehicle-ownership areas with repair budget |
| **Pool Service** | Aerial imagery + property features | Identify properties with pools (computer vision on satellite) |
| **Roofing** | Storm history + housing age + recent permits | Target storm-damaged areas and aging roofs |
| **General Contractor** | All permit data + property value trends | Follow the money — go where investment is happening |

### Implementation Approach:

1. **Layer toggle panel** — floating UI on the map with checkboxes for each data layer
2. **Choropleth rendering** — shade ZIP codes / census tracts by any metric (income, density, age, etc.)
3. **Data aggregation** — roll up client data by geography, compare to demographic baselines
4. **Lead scoring overlay** — composite score per area based on multiple weighted factors → heat map of opportunity
5. **Marketing campaign targeting** — select areas on map → export address lists → feed to Sales & Marketing module

---

## 5. Summary: What We Can Build Today vs. Future

### Ready Now (Mapbox GL JS native):
- ✅ Address search/geocoder (fly to any address)
- ✅ 2D polygon drawing (rectangles, freeform shapes)
- ✅ 3D extrusion (push polygons up to any height)
- ✅ Solid color + opacity per shape
- ✅ Client markers with clustering
- ✅ Heat maps
- ✅ Choropleth data layers (census demographics)
- ✅ Boundary overlays (ZIP, county, state)
- ✅ Click-to-query (what ZIP/tract is this point in?)

### Requires Additional Libraries:
- 📦 `@mapbox/search-js-react` — geocoder search bar
- 📦 `@mapbox/mapbox-gl-draw` — drawing tools
- 📦 `threebox-plugin` + `three` — imported 3D models, textured materials, lighting

### Future Premium / Integration Work:
- 🔮 3D model import (glTF, FBX) — SketchUp-quality editing
- 🔮 Full material system (textures, reflections, lighting)
- 🔮 Property parcel data overlay (commercial API needed)
- 🔮 Permit activity feed (municipality API integrations)
- 🔮 Computer vision on satellite imagery (pool detection, etc.)
- 🔮 Photogrammetry / digital twin (Autodesk Reality Capture pipeline)

---

## Technical Notes

- All drawn geometries stored as GeoJSON in PostgreSQL (jsonb column)
- Layer visibility state persisted per-user in preferences
- `fill-extrusion` performance is excellent — Mapbox handles millions of extruded polygons natively via WebGL
- Three.js integration uses Mapbox `CustomLayerInterface` — camera sync is handled by threebox
- Census API is free, no key required for basic queries — rate limited to ~500 requests/day
- Mapbox Boundaries is a paid add-on ($) — evaluate during Infrastructure & Geo Phase 2
