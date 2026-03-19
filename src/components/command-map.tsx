"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import { useCommandCenter } from "@/components/command-center-provider";
import { getMapStyleUrl } from "@/lib/command-center-store";

type MapProvider = "mapbox" | "google";

interface CommandMapProps {
  provider?: MapProvider;
  className?: string;
  onMapReady?: (map: mapboxgl.Map) => void;
}

export function CommandMap({
  provider = "mapbox",
  className = "",
  onMapReady,
}: CommandMapProps) {
  const { settings } = useCommandCenter();
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const onMapReadyRef = useRef(onMapReady);
  onMapReadyRef.current = onMapReady;

  // Track current style to detect changes
  const currentStyleRef = useRef(settings.mapStyle);

  // ── Initialise map on mount ─────────────────────────────────

  useEffect(() => {
    if (!mapContainer.current) return;

    const timer = setTimeout(() => {
      if (provider === "mapbox") {
        initMapbox();
      } else {
        initGoogle();
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider]);

  // ── React to style changes ──────────────────────────────────

  useEffect(() => {
    if (!mapRef.current || currentStyleRef.current === settings.mapStyle) return;
    currentStyleRef.current = settings.mapStyle;
    const map = mapRef.current;
    const styleUrl = getMapStyleUrl(settings.mapStyle);

    map.once("style.load", () => {
      // Re-add user-extrusion source + layer after style swap
      try {
        if (!map.getSource("user-extrusions")) {
          map.addSource("user-extrusions", {
            type: "geojson",
            data: { type: "FeatureCollection", features: [] },
          });
          map.addLayer({
            id: "user-extrusions-3d",
            type: "fill-extrusion",
            source: "user-extrusions",
            paint: {
              "fill-extrusion-color": ["get", "color"],
              "fill-extrusion-height": ["get", "height"],
              "fill-extrusion-base": ["get", "base"],
              "fill-extrusion-opacity": 0.85,
            },
          });
        }
        // Re-add terrain
        if (!map.getSource("mapbox-dem")) {
          map.addSource("mapbox-dem", {
            type: "raster-dem",
            url: "mapbox://mapbox.mapbox-terrain-dem-v1",
            tileSize: 512,
            maxzoom: 14,
          });
          map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
        }
      } catch {
        // Non-fatal — style may not support all features
      }
    });

    map.setStyle(styleUrl);
  }, [settings.mapStyle]);

  // ── React to label visibility toggle ────────────────────────

  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    try {
      const style = map.getStyle();
      if (!style?.layers) return;
      for (const layer of style.layers) {
        if (
          layer.type === "symbol" &&
          (layer.id.includes("label") ||
            layer.id.includes("place") ||
            layer.id.includes("poi") ||
            layer.id.includes("road-") ||
            layer.id.includes("transit"))
        ) {
          map.setLayoutProperty(layer.id, "visibility", settings.showLabels ? "visible" : "none");
        }
      }
    } catch {
      // Style may not be fully loaded yet
    }
  }, [settings.showLabels]);

  // ── Mapbox init ─────────────────────────────────────────────

  async function initMapbox() {
    try {
      const mapboxgl = (await import("mapbox-gl")).default;
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

      if (!token || token.trim() === "") {
        setError("Mapbox token not available — redeploy after setting NEXT_PUBLIC_MAPBOX_TOKEN");
        setStatus("error");
        return;
      }

      mapboxgl.accessToken = token;

      const container = mapContainer.current;
      if (!container) { setError("Map container not found"); setStatus("error"); return; }

      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        setTimeout(() => initMapbox(), 500);
        return;
      }

      const dv = settings.defaultView;
      const styleUrl = getMapStyleUrl(settings.mapStyle);

      const map = new mapboxgl.Map({
        container,
        style: styleUrl,
        center: [dv.lng, dv.lat],
        zoom: dv.zoom,
        pitch: dv.pitch,
        bearing: dv.bearing,
        antialias: true,
        interactive: true,
      });

      map.on("load", () => {
        // 3D terrain
        map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
        map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

        // Atmosphere / sky
        map.setFog({
          color: "rgb(186, 210, 235)",
          "high-color": "rgb(36, 92, 223)",
          "horizon-blend": 0.02,
          "space-color": "rgb(11, 11, 25)",
          "star-intensity": 0.6,
        });

        // HQ marker
        new mapboxgl.Marker({ color: "#10b981" })
          .setLngLat([dv.lng, dv.lat])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
              `<div style="font-family: Geist, sans-serif; padding: 4px;">
                <strong style="font-size: 14px;">Old Bishop Farm</strong><br/>
                <span style="font-size: 12px; color: #666;">500 S Meriden Rd, Cheshire, CT</span><br/>
                <span style="font-size: 11px; color: #10b981;">● HQ — Online</span>
              </div>`
            )
          )
          .addTo(map);

        // Extrusion source + layer
        map.addSource("user-extrusions", {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: "user-extrusions-3d",
          type: "fill-extrusion",
          source: "user-extrusions",
          paint: {
            "fill-extrusion-color": ["get", "color"],
            "fill-extrusion-height": ["get", "height"],
            "fill-extrusion-base": ["get", "base"],
            "fill-extrusion-opacity": 0.85,
          },
        });

        // Apply label visibility
        if (!settings.showLabels) {
          const style = map.getStyle();
          if (style?.layers) {
            for (const layer of style.layers) {
              if (
                layer.type === "symbol" &&
                (layer.id.includes("label") ||
                  layer.id.includes("place") ||
                  layer.id.includes("poi") ||
                  layer.id.includes("road-") ||
                  layer.id.includes("transit"))
              ) {
                map.setLayoutProperty(layer.id, "visibility", "none");
              }
            }
          }
        }

        setStatus("ready");
        if (onMapReadyRef.current) onMapReadyRef.current(map);
      });

      map.on("error", (e) => {
        console.error("[CommandMap] Mapbox error:", e.error?.message || e);
        if (status !== "ready") {
          setError(`Map error: ${e.error?.message || "Unknown error"}`);
          setStatus("error");
        }
      });

      map.addControl(
        new mapboxgl.NavigationControl({ visualizePitch: true }),
        "bottom-right"
      );

      mapRef.current = map as unknown as mapboxgl.Map;
    } catch (err) {
      console.error("[CommandMap] Mapbox init failed:", err);
      setError(`Failed to initialize map: ${err instanceof Error ? err.message : "Unknown error"}`);
      setStatus("error");
    }
  }

  async function initGoogle() {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
      if (!apiKey || apiKey.trim() === "") {
        setError("Google Maps key not available");
        setStatus("error");
        return;
      }

      if (!(window as unknown as Record<string, unknown>).google) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement("script");
          script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&v=weekly&libraries=marker`;
          script.async = true;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error("Failed to load Google Maps script"));
          document.head.appendChild(script);
        });
      }

      const g = (window as unknown as Record<string, unknown>).google as typeof google;
      const dv = settings.defaultView;
      new g.maps.Map(mapContainer.current!, {
        center: { lat: dv.lat, lng: dv.lng },
        zoom: dv.zoom,
        tilt: dv.pitch,
        heading: dv.bearing + 360,
        mapTypeId: "satellite",
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        mapId: "command-center-map",
      });
      setStatus("ready");
    } catch (err) {
      console.error("[CommandMap] Google Maps init failed:", err);
      setError(`Failed to load Google Maps: ${err instanceof Error ? err.message : "Unknown error"}`);
      setStatus("error");
    }
  }

  return (
    <div
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ zIndex: 0 }}
    >
      <div ref={mapContainer} className="w-full h-full" />

      {status === "error" && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <p className="text-sm text-white/50 max-w-xs">{error}</p>
            <p className="text-[10px] text-white/30 max-w-xs">
              NEXT_PUBLIC_ environment variables are embedded at build time.
              After setting them on Vercel, trigger a new deployment.
            </p>
          </div>
        </div>
      )}

      {status === "loading" && (
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-md px-3 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
          <span className="text-xs text-white/40">Loading map...</span>
        </div>
      )}
    </div>
  );
}
