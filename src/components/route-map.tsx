"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import type { RouteStop, VehicleRoute } from "@/types/routes";

// ─── Color coding by stop type / work order type ──────────────────────────────

function stopColor(stop: RouteStop): string {
  if (stop.type === "delay") return "#6b7280"; // gray
  if (stop.type === "custom") return "#8b5cf6"; // violet
  switch (stop.workOrderType) {
    case "emergency": return "#ef4444"; // red
    case "estimate": return "#3b82f6"; // blue
    case "maintenance": return "#f59e0b"; // amber
    case "inspection": return "#06b6d4"; // cyan
    case "renovation": return "#10b981"; // emerald
    case "service": return "#10b981"; // emerald
    default: return "#10b981";
  }
}

function formatTime(iso?: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return "";
  }
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface RouteMapProps {
  route?: VehicleRoute;
  stops?: RouteStop[];
  className?: string;
  centerLat?: number;
  centerLng?: number;
  zoom?: number;
  showAllRoutes?: boolean; // future: show multiple routes
}

// ─── Placeholder when Mapbox token is unavailable ─────────────────────────────

function MapPlaceholder({ stops }: { stops: RouteStop[] }) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Center content */}
      <div className="relative z-10 text-center space-y-4 max-w-sm px-6">
        <div className="w-14 h-14 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
          <Navigation className="w-6 h-6 text-white/40" />
        </div>
        <div>
          <p className="text-sm font-medium text-white/60">Map loads here</p>
          <p className="text-[11px] text-white/30 mt-1">
            Set NEXT_PUBLIC_MAPBOX_TOKEN and redeploy to enable satellite map with route visualization
          </p>
        </div>

        {/* Stop list preview */}
        {stops.length > 0 && (
          <div className="mt-4 space-y-1.5 text-left">
            <p className="text-[10px] uppercase tracking-wider text-white/30 mb-2">
              {stops.length} stop{stops.length !== 1 ? "s" : ""} on this route
            </p>
            {stops.map((stop, i) => (
              <div
                key={stop.id}
                className="flex items-start gap-2.5 bg-white/5 rounded-md px-3 py-2"
              >
                <span
                  className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
                  style={{ backgroundColor: stopColor(stop) }}
                >
                  {stop.type === "delay" ? "·" : i + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-xs text-white/70 truncate">
                    {stop.label ?? stop.address ?? "Stop"}
                  </p>
                  {stop.estimatedArrival && (
                    <p className="text-[10px] text-white/30">
                      {formatTime(stop.estimatedArrival)} — {stop.estimatedDuration} min
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function RouteMap({
  route,
  stops: stopsProp,
  className = "",
  centerLat = 41.4998,
  centerLng = -72.9017,
  zoom = 10,
}: RouteMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("mapbox-gl").Map | null>(null);
  const markersRef = useRef<import("mapbox-gl").Marker[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapboxglRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error" | "no-token">("loading");
  const [error, setError] = useState<string | null>(null);

  const stops = stopsProp ?? route?.stops ?? [];

  // ── Clean up markers ──────────────────────────────────────────────────────

  function clearMarkers() {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
  }

  // ── Draw route on map ─────────────────────────────────────────────────────

  function drawRoute(map: import("mapbox-gl").Map, routeStops: RouteStop[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mgl = mapboxglRef.current;
    // Remove old layers/sources
    try {
      if (map.getLayer("route-line")) map.removeLayer("route-line");
      if (map.getSource("route-line")) map.removeSource("route-line");
    } catch { /* ignore */ }

    clearMarkers();

    if (routeStops.length === 0) return;

    const { default: mapboxgl } = require("mapbox-gl");

    // Draw straight-line polyline
    const coordinates = routeStops.map((s) => [s.lng, s.lat]);

    map.addSource("route-line", {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates,
        },
      },
    });

    map.addLayer({
      id: "route-line",
      type: "line",
      source: "route-line",
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": "#10b981",
        "line-width": 3,
        "line-dasharray": [2, 1],
        "line-opacity": 0.8,
      },
    });

    if (!mgl) return;

    // Add numbered markers
    routeStops.forEach((stop, i) => {
      const color = stopColor(stop);
      const isDelay = stop.type === "delay";

      // Create custom marker element
      const el = document.createElement("div");
      el.style.cssText = `
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: ${color};
        border: 2px solid rgba(255,255,255,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        font-weight: 700;
        color: white;
        font-family: Geist, sans-serif;
        box-shadow: 0 2px 8px rgba(0,0,0,0.4);
        cursor: pointer;
        transition: transform 0.15s ease;
      `;
      el.textContent = isDelay ? "⏸" : String(i + 1);
      el.onmouseenter = () => { el.style.transform = "scale(1.15)"; };
      el.onmouseleave = () => { el.style.transform = "scale(1)"; };

      // Build popup content
      const timeStr = stop.estimatedArrival ? formatTime(stop.estimatedArrival) : "";
      const deptStr = stop.estimatedDeparture ? formatTime(stop.estimatedDeparture) : "";
      const typeLabel =
        stop.type === "delay" ? "Delay / Break" :
        stop.type === "custom" ? "Custom Stop" :
        (stop.workOrderType ?? "Work Order");

      const popupHtml = `
        <div style="font-family: Geist, sans-serif; padding: 4px; min-width: 200px;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
            <span style="width: 20px; height: 20px; border-radius: 50%; background: ${color}; display: inline-flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; color: white;">${isDelay ? "⏸" : i + 1}</span>
            <strong style="font-size: 13px;">${stop.label ?? stop.address ?? "Stop"}</strong>
          </div>
          <p style="font-size: 11px; color: #888; margin: 0 0 4px 0; text-transform: capitalize;">${typeLabel}</p>
          ${stop.address ? `<p style="font-size: 11px; color: #666; margin: 0 0 4px 0;">${stop.address}</p>` : ""}
          ${timeStr ? `<p style="font-size: 11px; color: #10b981; margin: 0 0 2px 0;">Arrive: ${timeStr}${deptStr ? ` → Depart: ${deptStr}` : ""}</p>` : ""}
          <p style="font-size: 11px; color: #888; margin: 0;">${stop.estimatedDuration} min</p>
          ${stop.notes ? `<p style="font-size: 11px; color: #666; margin: 4px 0 0 0; border-top: 1px solid #eee; padding-top: 4px;">${stop.notes}</p>` : ""}
        </div>
      `;

      const marker = new mgl.Marker({ element: el })
        .setLngLat([stop.lng, stop.lat])
        .setPopup(new mgl.Popup({ offset: 16, closeButton: false }).setHTML(popupHtml))
        .addTo(map);

      markersRef.current.push(marker);
    });

    // Fit map to route bounds
    if (routeStops.length > 1) {
      const lngs = routeStops.map((s) => s.lng);
      const lats = routeStops.map((s) => s.lat);
      map.fitBounds(
        [
          [Math.min(...lngs) - 0.05, Math.min(...lats) - 0.05],
          [Math.max(...lngs) + 0.05, Math.max(...lats) + 0.05],
        ],
        { padding: 48, maxZoom: 13, duration: 800 }
      );
    }
  }

  // ── Initialise Mapbox ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!mapContainer.current) return;

    const timer = setTimeout(() => initMapbox(), 150);
    return () => {
      clearTimeout(timer);
      clearMarkers();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── React to stop changes ─────────────────────────────────────────────────

  useEffect(() => {
    const map = mapRef.current;
    if (!map || status !== "ready") return;
    drawRoute(map, stops);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stops, status]);

  async function initMapbox() {
    try {
      const mapboxglMod = (await import("mapbox-gl")).default;
      mapboxglRef.current = mapboxglMod;
      const mapboxgl = mapboxglMod;
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

      if (!token || token.trim() === "") {
        setStatus("no-token");
        return;
      }

      mapboxgl.accessToken = token;

      const container = mapContainer.current;
      if (!container) {
        setStatus("no-token");
        return;
      }

      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        setTimeout(() => initMapbox(), 500);
        return;
      }

      const map = new mapboxgl.Map({
        container,
        style: "mapbox://styles/mapbox/satellite-streets-v12",
        center: [centerLng, centerLat],
        zoom,
        pitch: 0,
        antialias: true,
        interactive: true,
      });

      map.on("load", () => {
        setStatus("ready");
        drawRoute(map, stops);
      });

      map.on("error", (e) => {
        console.error("[RouteMap] Mapbox error:", e.error?.message || e);
        if (status !== "ready") {
          setError(`Map error: ${e.error?.message || "Unknown error"}`);
          setStatus("error");
        }
      });

      map.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: false }),
        "bottom-right"
      );

      mapRef.current = map as unknown as import("mapbox-gl").Map;
    } catch (err) {
      console.error("[RouteMap] init failed:", err);
      setStatus("no-token");
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (status === "no-token" || status === "error") {
    return (
      <div className={`relative w-full h-full overflow-hidden ${className}`}>
        <MapPlaceholder stops={stops} />
        {status === "error" && error && (
          <div className="absolute top-3 left-3 right-3 bg-red-900/80 backdrop-blur-sm text-red-200 text-xs px-3 py-2 rounded-md">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Mapbox CSS */}
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Loading overlay */}
      {status === "loading" && (
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-md px-3 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-white/50 animate-pulse" />
          <span className="text-xs text-white/50">Loading map...</span>
        </div>
      )}

      {/* Stop count badge */}
      {status === "ready" && stops.length > 0 && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-md px-2.5 py-1.5">
          <MapPin className="w-3 h-3 text-emerald-400" />
          <span className="text-xs text-white/70">
            {stops.filter((s) => s.type !== "delay").length} stop
            {stops.filter((s) => s.type !== "delay").length !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </div>
  );
}
