"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  MapPin,
  Circle,
  Pentagon,
  Save,
  Loader2,
  RotateCcw,
  Ruler,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";

/* ─── Types ─────────────────────────────────────────────────────── */

interface ServiceAreaConfig {
  type: "RADIUS" | "POLYGON" | null;
  radius: number | null;
  center: { lat: number; lng: number } | null;
  polygon: [number, number][] | null;
}

interface BusinessHours {
  [day: string]: { open: string; close: string; enabled: boolean };
}

const DEFAULT_HOURS: BusinessHours = {
  mon: { open: "08:00", close: "17:00", enabled: true },
  tue: { open: "08:00", close: "17:00", enabled: true },
  wed: { open: "08:00", close: "17:00", enabled: true },
  thu: { open: "08:00", close: "17:00", enabled: true },
  fri: { open: "08:00", close: "17:00", enabled: true },
  sat: { open: "09:00", close: "14:00", enabled: false },
  sun: { open: "00:00", close: "00:00", enabled: false },
};

const DAY_LABELS: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

const SLIDER_CLS =
  "flex-1 h-1 appearance-none bg-white/10 rounded-full cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:bg-white/70";

/* ─── Component ─────────────────────────────────────────────────── */

export function ServiceAreaSettings() {
  /* ── State ── */
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<"RADIUS" | "POLYGON">("RADIUS");
  const [radius, setRadius] = useState<number>(25);
  const [center, setCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [polygon, setPolygon] = useState<[number, number][] | null>(null);

  const [businessHours, setBusinessHours] = useState<BusinessHours>(DEFAULT_HOURS);
  const [hoursOpen, setHoursOpen] = useState(false);

  /* ── Refs ── */
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const drawRef = useRef<any>(null);
  const circleSourceAdded = useRef(false);
  const centerMarkerRef = useRef<any>(null);
  const mapboxglRef = useRef<any>(null);

  /* ── Load existing service area data ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/organization/service-area");
        if (!res.ok) throw new Error("Failed to load service area");
        const data = await res.json();

        if (data.serviceArea?.type) {
          setMode(data.serviceArea.type);
        }
        if (data.serviceArea?.radius) {
          setRadius(data.serviceArea.radius);
        }
        if (data.serviceArea?.center) {
          setCenter(data.serviceArea.center);
        }
        if (data.serviceArea?.polygon) {
          setPolygon(data.serviceArea.polygon);
        }
        if (data.businessHours) {
          setBusinessHours({ ...DEFAULT_HOURS, ...data.businessHours });
        }
      } catch {
        // First-time setup — use defaults
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── Initialize Mapbox ── */
  useEffect(() => {
    if (loading || !mapContainer.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      setError("Mapbox token not configured — set NEXT_PUBLIC_MAPBOX_TOKEN");
      return;
    }

    // Dynamic imports to avoid SSR issues
    let cancelled = false;

    (async () => {
      const mapboxgl = (await import("mapbox-gl")).default;
      mapboxglRef.current = mapboxgl;
      const MapboxDrawModule = await import("@mapbox/mapbox-gl-draw");
      const MapboxDraw = (MapboxDrawModule as any).default || MapboxDrawModule;

      if (cancelled || !mapContainer.current) return;

      (mapboxgl as any).accessToken = token;

      const initCenter = center || { lng: -73.935242, lat: 40.730610 }; // Default NYC

      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [initCenter.lng, initCenter.lat],
        zoom: center ? 10 : 4,
        pitch: 0,
        bearing: 0,
        attributionControl: false,
      });

      mapRef.current = map;

      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

      // Initialize Draw for polygon mode
      const draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {},
        defaultMode: "simple_select",
        styles: [
          // Polygon fill
          {
            id: "gl-draw-polygon-fill",
            type: "fill",
            filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
            paint: {
              "fill-color": "#10b981",
              "fill-outline-color": "#10b981",
              "fill-opacity": 0.12,
            },
          },
          // Polygon stroke (active)
          {
            id: "gl-draw-polygon-stroke-active",
            type: "line",
            filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
            layout: { "line-cap": "round", "line-join": "round" },
            paint: {
              "line-color": "#10b981",
              "line-dasharray": [0.2, 2],
              "line-width": 2,
            },
          },
          // Polygon fill (static)
          {
            id: "gl-draw-polygon-fill-static",
            type: "fill",
            filter: ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
            paint: {
              "fill-color": "#10b981",
              "fill-outline-color": "#10b981",
              "fill-opacity": 0.12,
            },
          },
          // Polygon stroke (static)
          {
            id: "gl-draw-polygon-stroke-static",
            type: "line",
            filter: ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
            layout: { "line-cap": "round", "line-join": "round" },
            paint: {
              "line-color": "#10b981",
              "line-width": 2,
            },
          },
          // Vertex points
          {
            id: "gl-draw-point-active",
            type: "circle",
            filter: ["all", ["==", "$type", "Point"], ["==", "meta", "vertex"]],
            paint: {
              "circle-radius": 5,
              "circle-color": "#10b981",
              "circle-stroke-width": 2,
              "circle-stroke-color": "#fff",
            },
          },
          // Midpoints
          {
            id: "gl-draw-point-mid",
            type: "circle",
            filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
            paint: {
              "circle-radius": 3,
              "circle-color": "#10b981",
              "circle-stroke-width": 1,
              "circle-stroke-color": "#fff",
            },
          },
          // Line (for drawing in progress)
          {
            id: "gl-draw-line",
            type: "line",
            filter: ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
            layout: { "line-cap": "round", "line-join": "round" },
            paint: {
              "line-color": "#10b981",
              "line-dasharray": [0.2, 2],
              "line-width": 2,
            },
          },
        ],
      });

      drawRef.current = draw;
      map.addControl(draw as any);

      map.on("load", () => {
        // Add radius circle source + layer
        map.addSource("service-radius", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });

        map.addLayer({
          id: "service-radius-fill",
          type: "fill",
          source: "service-radius",
          paint: {
            "fill-color": "#10b981",
            "fill-opacity": 0.1,
          },
        });

        map.addLayer({
          id: "service-radius-stroke",
          type: "line",
          source: "service-radius",
          paint: {
            "line-color": "#10b981",
            "line-width": 2,
            "line-dasharray": [2, 2],
          },
        });

        circleSourceAdded.current = true;

        // If we have existing polygon data, load it into Draw
        if (polygon && polygon.length >= 3) {
          const closed = [...polygon];
          // Ensure ring is closed
          if (
            closed[0][0] !== closed[closed.length - 1][0] ||
            closed[0][1] !== closed[closed.length - 1][1]
          ) {
            closed.push(closed[0]);
          }
          draw.add({
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              coordinates: [closed],
            },
          });
        }
      });

      // Handle draw events
      map.on("draw.create" as any, (e: any) => {
        const features = draw.getAll();
        if (features.features.length > 0) {
          const coords = (features.features[0].geometry as any).coordinates[0] as [number, number][];
          setPolygon(coords);
        }
      });

      map.on("draw.update" as any, (e: any) => {
        const features = draw.getAll();
        if (features.features.length > 0) {
          const coords = (features.features[0].geometry as any).coordinates[0] as [number, number][];
          setPolygon(coords);
        }
      });

      map.on("draw.delete" as any, () => {
        setPolygon(null);
      });

      // Click to set center in radius mode
      map.on("click", (e: mapboxgl.MapMouseEvent) => {
        // Only respond to clicks in RADIUS mode and when Draw is not active
        const drawMode = draw.getMode();
        if (drawMode === "draw_polygon") return;

        setCenter({ lat: e.lngLat.lat, lng: e.lngLat.lng });
      });
    })();

    return () => {
      cancelled = true;
      if (centerMarkerRef.current) {
        centerMarkerRef.current.remove();
        centerMarkerRef.current = null;
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  /* ── Update radius circle on map when center/radius changes ── */
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !circleSourceAdded.current) return;

    if (mode === "RADIUS" && center) {
      const circle = createGeoJSONCircle(center, radius);
      const source = map.getSource("service-radius") as mapboxgl.GeoJSONSource;
      if (source) source.setData(circle);

      // Update/create center marker
      if (centerMarkerRef.current) {
        centerMarkerRef.current.setLngLat([center.lng, center.lat]);
      } else if (mapboxglRef.current) {
        const el = document.createElement("div");
        el.className = "service-area-center-marker";
        el.innerHTML = `<div style="width:12px;height:12px;background:#10b981;border:2px solid #fff;border-radius:50%;box-shadow:0 0 0 4px rgba(16,185,129,0.25);"></div>`;
        centerMarkerRef.current = new mapboxglRef.current.Marker({ element: el })
          .setLngLat([center.lng, center.lat])
          .addTo(map);
      }

      // Show radius layers, hide draw
      map.setLayoutProperty("service-radius-fill", "visibility", "visible");
      map.setLayoutProperty("service-radius-stroke", "visibility", "visible");
    } else {
      // Hide radius layers
      if (map.getLayer("service-radius-fill")) {
        map.setLayoutProperty("service-radius-fill", "visibility", "none");
      }
      if (map.getLayer("service-radius-stroke")) {
        map.setLayoutProperty("service-radius-stroke", "visibility", "none");
      }
      if (centerMarkerRef.current) {
        centerMarkerRef.current.remove();
        centerMarkerRef.current = null;
      }
    }
  }, [mode, center, radius]);

  /* ── Toggle Draw mode based on mode switch ── */
  useEffect(() => {
    const draw = drawRef.current;
    if (!draw) return;

    if (mode === "POLYGON") {
      // Enable draw polygon mode
      draw.changeMode("simple_select");
    } else {
      // In RADIUS mode, clear any drawn polygons
      draw.deleteAll();
      draw.changeMode("simple_select");
    }
  }, [mode]);

  /* ── Save handler ── */
  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    setError(null);

    try {
      const serviceArea: ServiceAreaConfig = {
        type: mode,
        radius: mode === "RADIUS" ? radius : null,
        center: mode === "RADIUS" ? center : null,
        polygon: mode === "POLYGON" ? polygon : null,
      };

      const res = await fetch("/api/organization/service-area", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceArea, businessHours }),
      });

      if (!res.ok) throw new Error("Failed to save");

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError("Failed to save service area. Please try again.");
    } finally {
      setSaving(false);
    }
  }, [mode, radius, center, polygon, businessHours]);

  /* ── Clear service area ── */
  const handleClear = useCallback(() => {
    setCenter(null);
    setPolygon(null);
    setRadius(25);
    if (drawRef.current) drawRef.current.deleteAll();
    if (centerMarkerRef.current) {
      centerMarkerRef.current.remove();
      centerMarkerRef.current = null;
    }
    const map = mapRef.current;
    if (map && circleSourceAdded.current) {
      const source = map.getSource("service-radius") as mapboxgl.GeoJSONSource;
      if (source) source.setData({ type: "FeatureCollection", features: [] });
    }
  }, []);

  /* ── Start polygon drawing ── */
  const startDrawPolygon = useCallback(() => {
    const draw = drawRef.current;
    if (!draw) return;
    // Clear existing polygons first
    draw.deleteAll();
    setPolygon(null);
    draw.changeMode("draw_polygon");
  }, []);

  /* ── Business hours update ── */
  const updateHours = useCallback(
    (day: string, field: string, value: string | boolean) => {
      setBusinessHours((prev) => ({
        ...prev,
        [day]: { ...prev[day], [field]: value },
      }));
    },
    []
  );

  /* ── Derived state ── */
  const hasServiceArea = useMemo(() => {
    if (mode === "RADIUS") return !!center;
    if (mode === "POLYGON") return polygon && polygon.length >= 3;
    return false;
  }, [mode, center, polygon]);

  /* ── Render ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading service area...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">Service Area</h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Define where your business operates. Booking requests outside this area will be flagged.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> Saved
            </span>
          )}
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            data-testid="service-area-clear"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50"
            data-testid="service-area-save"
          >
            {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            Save
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2.5 rounded-md bg-destructive/10 border border-destructive/20 text-[11px] text-destructive">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Mode Toggle ── */}
      <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg">
        <button
          onClick={() => setMode("RADIUS")}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all ${
            mode === "RADIUS"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          data-testid="service-area-mode-radius"
        >
          <Circle className="w-3.5 h-3.5" />
          Radius
        </button>
        <button
          onClick={() => setMode("POLYGON")}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all ${
            mode === "POLYGON"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
          data-testid="service-area-mode-polygon"
        >
          <Pentagon className="w-3.5 h-3.5" />
          Draw Polygon
        </button>
      </div>

      {/* ── Map ── */}
      <div className="relative rounded-lg overflow-hidden border border-border">
        <div
          ref={mapContainer}
          className="w-full h-[360px]"
          data-testid="service-area-map"
        />
        {/* Map instructions overlay */}
        <div className="absolute bottom-3 left-3 right-3">
          <div className="bg-black/70 backdrop-blur-sm rounded-md px-3 py-2">
            <p className="text-[10px] text-white/80">
              {mode === "RADIUS" ? (
                <>
                  <MapPin className="w-3 h-3 inline-block mr-1 -mt-0.5" />
                  Click the map to set your business center point. Adjust the radius below.
                </>
              ) : (
                <>
                  <Pentagon className="w-3 h-3 inline-block mr-1 -mt-0.5" />
                  Click &quot;Start Drawing&quot; then click on the map to place polygon points. Double-click to finish.
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ── Radius Controls ── */}
      {mode === "RADIUS" && (
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Ruler className="w-3 h-3 text-muted-foreground" />
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Service Radius
                </span>
              </div>
              <span className="text-xs font-mono text-foreground">{radius} mi</span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className={SLIDER_CLS}
              data-testid="service-area-radius-slider"
            />
            <div className="flex justify-between mt-1">
              <span className="text-[9px] text-muted-foreground/60">1 mi</span>
              <span className="text-[9px] text-muted-foreground/60">100 mi</span>
            </div>
          </div>

          {center && (
            <div className="flex items-center gap-2 p-2.5 rounded-md bg-muted/20 border border-border">
              <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground">Center Point</p>
                <p className="text-xs font-mono text-foreground">
                  {center.lat.toFixed(5)}, {center.lng.toFixed(5)}
                </p>
              </div>
              <button
                onClick={() => setCenter(null)}
                className="p-1 rounded hover:bg-muted/50"
                data-testid="service-area-clear-center"
              >
                <Trash2 className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Polygon Controls ── */}
      {mode === "POLYGON" && (
        <div className="space-y-3">
          <button
            onClick={startDrawPolygon}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-md border border-emerald-500/30 bg-emerald-500/5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors"
            data-testid="service-area-start-draw"
          >
            <Pentagon className="w-3.5 h-3.5" />
            {polygon ? "Redraw Polygon" : "Start Drawing"}
          </button>

          {polygon && polygon.length >= 3 && (
            <div className="flex items-center gap-2 p-2.5 rounded-md bg-muted/20 border border-border">
              <Pentagon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-muted-foreground">Polygon Defined</p>
                <p className="text-xs font-mono text-foreground">
                  {polygon.length} vertices
                </p>
              </div>
              <button
                onClick={() => {
                  setPolygon(null);
                  drawRef.current?.deleteAll();
                }}
                className="p-1 rounded hover:bg-muted/50"
                data-testid="service-area-clear-polygon"
              >
                <Trash2 className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Business Hours ── */}
      <div className="border border-border rounded-lg overflow-hidden">
        <button
          onClick={() => setHoursOpen(!hoursOpen)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors"
          data-testid="service-area-hours-toggle"
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Business Hours</span>
            <span className="text-[10px] text-muted-foreground">
              ({Object.values(businessHours).filter((d) => d.enabled).length} days active)
            </span>
          </div>
          {hoursOpen ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        {hoursOpen && (
          <div className="border-t border-border divide-y divide-border">
            {Object.entries(DAY_LABELS).map(([key, label]) => {
              const day = businessHours[key];
              return (
                <div
                  key={key}
                  className={`flex items-center gap-3 px-4 py-2.5 ${
                    day.enabled ? "" : "opacity-40"
                  }`}
                >
                  {/* Enable toggle */}
                  <button
                    onClick={() => updateHours(key, "enabled", !day.enabled)}
                    className={`w-8 h-4 rounded-full transition-colors flex items-center px-0.5 shrink-0 ${
                      day.enabled ? "bg-emerald-500" : "bg-muted"
                    }`}
                    data-testid={`hours-toggle-${key}`}
                  >
                    <div
                      className={`w-3 h-3 rounded-full bg-white transition-transform shadow-sm ${
                        day.enabled ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>

                  {/* Day label */}
                  <span className="text-xs font-medium w-20">{label}</span>

                  {/* Time inputs */}
                  <div className="flex items-center gap-1.5 flex-1">
                    <input
                      type="time"
                      value={day.open}
                      onChange={(e) => updateHours(key, "open", e.target.value)}
                      disabled={!day.enabled}
                      className="px-2 py-1 rounded bg-muted/50 border border-border text-[11px] font-mono text-foreground disabled:opacity-30"
                      data-testid={`hours-open-${key}`}
                    />
                    <span className="text-[10px] text-muted-foreground">to</span>
                    <input
                      type="time"
                      value={day.close}
                      onChange={(e) => updateHours(key, "close", e.target.value)}
                      disabled={!day.enabled}
                      className="px-2 py-1 rounded bg-muted/50 border border-border text-[11px] font-mono text-foreground disabled:opacity-30"
                      data-testid={`hours-close-${key}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Status indicator ── */}
      {!hasServiceArea && (
        <div className="flex items-center gap-2 p-2.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          No service area defined. Online booking will be disabled until a boundary is set.
        </div>
      )}
    </div>
  );
}

/* ─── Helpers ───────────────────────────────────────────────────── */

/**
 * Create a GeoJSON circle polygon from a center point and radius in miles.
 * Uses 64-point approximation for smooth rendering.
 */
function createGeoJSONCircle(
  center: { lat: number; lng: number },
  radiusMiles: number,
  points = 64
): GeoJSON.FeatureCollection {
  const radiusKm = radiusMiles * 1.60934;
  const coords: [number, number][] = [];

  for (let i = 0; i < points; i++) {
    const angle = (i * 360) / points;
    const rad = (angle * Math.PI) / 180;

    const dx = radiusKm * Math.cos(rad);
    const dy = radiusKm * Math.sin(rad);

    const lat = center.lat + (dy / 111.32);
    const lng = center.lng + (dx / (111.32 * Math.cos((center.lat * Math.PI) / 180)));

    coords.push([lng, lat]);
  }

  // Close the ring
  coords.push(coords[0]);

  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [coords],
        },
      },
    ],
  };
}
