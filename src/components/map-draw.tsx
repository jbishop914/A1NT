"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Pencil,
  Square,
  Pentagon,
  Minus,
  Trash2,
  MousePointer2,
  ArrowUp,
  Palette,
  X,
  ChevronDown,
  ChevronUp,
  Layers,
  Box,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────

interface DrawnFeature {
  id: string;
  name: string;
  height: number;
  base: number;
  color: string;
  opacity: number;
}

interface MapDrawProps {
  map: mapboxgl.Map | null;
}

// ─── Color presets ───────────────────────────────────────────────

const COLOR_PRESETS = [
  { label: "Steel", value: "#94a3b8" },
  { label: "Concrete", value: "#a8a29e" },
  { label: "Brick", value: "#dc6843" },
  { label: "Wood", value: "#b8860b" },
  { label: "Glass", value: "#67e8f9" },
  { label: "Forest", value: "#22c55e" },
  { label: "Navy", value: "#1e40af" },
  { label: "White", value: "#f1f5f9" },
];

// ─── Component ───────────────────────────────────────────────────

export function MapDraw({ map }: MapDrawProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<DrawnFeature | null>(null);
  const [features, setFeatures] = useState<DrawnFeature[]>([]);
  const [showExtrusion, setShowExtrusion] = useState(false);
  const drawRef = useRef<MapboxDraw | null>(null);
  const [drawLoaded, setDrawLoaded] = useState(false);

  // Current shape properties
  const [shapeColor, setShapeColor] = useState("#94a3b8");
  const [shapeHeight, setShapeHeight] = useState(8);
  const [shapeOpacity, setShapeOpacity] = useState(0.75);

  // Initialize Mapbox GL Draw
  useEffect(() => {
    if (!map || drawLoaded) return;

    let cancelled = false;

    async function initDraw() {
      try {
        const MapboxDraw = (await import("@mapbox/mapbox-gl-draw")).default;

        // Load draw CSS dynamically
        if (!document.getElementById("mapbox-gl-draw-css")) {
          const link = document.createElement("link");
          link.id = "mapbox-gl-draw-css";
          link.rel = "stylesheet";
          link.href = "https://api.mapbox.com/mapbox-gl-js/plugins/v1.5.1/mapbox-gl-draw.css";
          document.head.appendChild(link);
        }

        if (cancelled || !map) return;

        const draw = new MapboxDraw({
          displayControlsDefault: false,
          controls: {},
          defaultMode: "simple_select",
          styles: [
            // Polygon fill — active
            {
              id: "gl-draw-polygon-fill-active",
              type: "fill",
              filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "true"]],
              paint: {
                "fill-color": "#10b981",
                "fill-opacity": 0.3,
              },
            },
            // Polygon fill — inactive
            {
              id: "gl-draw-polygon-fill-inactive",
              type: "fill",
              filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "false"]],
              paint: {
                "fill-color": "#94a3b8",
                "fill-opacity": 0.2,
              },
            },
            // Polygon stroke — active
            {
              id: "gl-draw-polygon-stroke-active",
              type: "line",
              filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "true"]],
              paint: {
                "line-color": "#10b981",
                "line-width": 2,
              },
            },
            // Polygon stroke — inactive
            {
              id: "gl-draw-polygon-stroke-inactive",
              type: "line",
              filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "false"]],
              paint: {
                "line-color": "#94a3b8",
                "line-width": 1.5,
                "line-dasharray": [2, 2],
              },
            },
            // Line — active
            {
              id: "gl-draw-line-active",
              type: "line",
              filter: ["all", ["==", "$type", "LineString"], ["==", "active", "true"]],
              paint: {
                "line-color": "#10b981",
                "line-width": 2,
              },
            },
            // Line — inactive
            {
              id: "gl-draw-line-inactive",
              type: "line",
              filter: ["all", ["==", "$type", "LineString"], ["==", "active", "false"]],
              paint: {
                "line-color": "#94a3b8",
                "line-width": 1.5,
              },
            },
            // Vertex points
            {
              id: "gl-draw-point",
              type: "circle",
              filter: ["all", ["==", "$type", "Point"], ["==", "meta", "vertex"]],
              paint: {
                "circle-radius": 4,
                "circle-color": "#fff",
                "circle-stroke-color": "#10b981",
                "circle-stroke-width": 2,
              },
            },
            // Midpoints
            {
              id: "gl-draw-point-midpoint",
              type: "circle",
              filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
              paint: {
                "circle-radius": 3,
                "circle-color": "#10b981",
                "circle-opacity": 0.5,
              },
            },
          ],
        });

        map.addControl(draw as unknown as mapboxgl.IControl);
        drawRef.current = draw;
        setDrawLoaded(true);

        // Listen for draw events
        map.on("draw.create", handleDrawCreate);
        map.on("draw.update", handleDrawUpdate);
        map.on("draw.delete", handleDrawDelete);
        map.on("draw.selectionchange", handleSelectionChange);
      } catch (err) {
        console.error("[MapDraw] Failed to initialize drawing tools:", err);
      }
    }

    initDraw();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  // Update extrusion layer when features change
  useEffect(() => {
    if (!map) return;
    const source = map.getSource("user-extrusions") as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;

    const draw = drawRef.current;
    if (!draw) return;

    // Build GeoJSON from draw features + our metadata
    const allDrawn = draw.getAll();
    const extrusionFeatures = allDrawn.features.map((f) => {
      const meta = features.find((m) => m.id === f.id);
      return {
        ...f,
        properties: {
          ...f.properties,
          height: meta?.height ?? shapeHeight,
          base: meta?.base ?? 0,
          color: meta?.color ?? shapeColor,
          opacity: meta?.opacity ?? shapeOpacity,
        },
      };
    });

    source.setData({
      type: "FeatureCollection",
      features: extrusionFeatures,
    });
  }, [features, map, shapeColor, shapeHeight, shapeOpacity]);

  function handleDrawCreate(e: { features: GeoJSON.Feature[] }) {
    const newFeatures = e.features.map((f) => ({
      id: f.id as string,
      name: `Shape ${features.length + 1}`,
      height: shapeHeight,
      base: 0,
      color: shapeColor,
      opacity: shapeOpacity,
    }));
    setFeatures((prev) => [...prev, ...newFeatures]);
    setActiveTool(null);

    // Immediately show extrusion panel for the new shape
    if (newFeatures.length > 0) {
      setSelectedFeature(newFeatures[0]);
      setShowExtrusion(true);
    }

    // Update extrusion source
    updateExtrusionSource([...features, ...newFeatures]);
  }

  function handleDrawUpdate(e: { features: GeoJSON.Feature[] }) {
    // Geometry changed — re-render extrusions
    updateExtrusionSource(features);
  }

  function handleDrawDelete(e: { features: GeoJSON.Feature[] }) {
    const deletedIds = new Set(e.features.map((f) => f.id as string));
    setFeatures((prev) => prev.filter((f) => !deletedIds.has(f.id)));
    if (selectedFeature && deletedIds.has(selectedFeature.id)) {
      setSelectedFeature(null);
      setShowExtrusion(false);
    }
  }

  function handleSelectionChange(e: { features: GeoJSON.Feature[] }) {
    if (e.features.length > 0) {
      const id = e.features[0].id as string;
      const meta = features.find((f) => f.id === id);
      if (meta) {
        setSelectedFeature(meta);
        setShowExtrusion(true);
      }
    } else {
      setSelectedFeature(null);
      setShowExtrusion(false);
    }
  }

  function updateExtrusionSource(featuresMeta: DrawnFeature[]) {
    if (!map || !drawRef.current) return;
    const source = map.getSource("user-extrusions") as mapboxgl.GeoJSONSource | undefined;
    if (!source) return;

    const allDrawn = drawRef.current.getAll();
    const extrusionFeatures = allDrawn.features.map((f) => {
      const meta = featuresMeta.find((m) => m.id === f.id);
      return {
        ...f,
        properties: {
          ...f.properties,
          height: meta?.height ?? shapeHeight,
          base: meta?.base ?? 0,
          color: meta?.color ?? shapeColor,
          opacity: meta?.opacity ?? shapeOpacity,
        },
      };
    });

    source.setData({
      type: "FeatureCollection",
      features: extrusionFeatures,
    });
  }

  function updateSelectedFeature(updates: Partial<DrawnFeature>) {
    if (!selectedFeature) return;
    const updated = { ...selectedFeature, ...updates };
    setSelectedFeature(updated);
    setFeatures((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    updateExtrusionSource(features.map((f) => (f.id === updated.id ? updated : f)));
  }

  function selectTool(tool: string) {
    if (!drawRef.current) return;
    setActiveTool(tool);
    switch (tool) {
      case "rectangle":
        drawRef.current.changeMode("draw_polygon");
        break;
      case "polygon":
        drawRef.current.changeMode("draw_polygon");
        break;
      case "line":
        drawRef.current.changeMode("draw_line_string");
        break;
      case "select":
        drawRef.current.changeMode("simple_select");
        break;
    }
  }

  function deleteSelected() {
    if (!drawRef.current || !selectedFeature) return;
    drawRef.current.delete(selectedFeature.id);
    setFeatures((prev) => prev.filter((f) => f.id !== selectedFeature.id));
    setSelectedFeature(null);
    setShowExtrusion(false);
    updateExtrusionSource(features.filter((f) => f.id !== selectedFeature.id));
  }

  function deleteAll() {
    if (!drawRef.current) return;
    drawRef.current.deleteAll();
    setFeatures([]);
    setSelectedFeature(null);
    setShowExtrusion(false);
    if (map) {
      const source = map.getSource("user-extrusions") as mapboxgl.GeoJSONSource | undefined;
      if (source) {
        source.setData({ type: "FeatureCollection", features: [] });
      }
    }
  }

  return (
    <div className="flex flex-col gap-2" data-testid="map-draw">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-1.5 bg-black/50 backdrop-blur-xl rounded-lg border px-2.5 py-1.5 text-xs transition-all
          ${isOpen ? "border-emerald-500/30 text-emerald-400 bg-black/60" : "border-white/[0.08] text-white/60 hover:text-white hover:bg-black/60"}
        `}
        data-testid="draw-toggle"
      >
        <Pencil className="w-3.5 h-3.5" />
        <span>Draw</span>
        {features.length > 0 && (
          <span className="text-[9px] bg-white/10 rounded-full px-1.5 py-0.5 ml-0.5">
            {features.length}
          </span>
        )}
        {isOpen ? (
          <ChevronUp className="w-3 h-3 text-white/30 ml-0.5" />
        ) : (
          <ChevronDown className="w-3 h-3 text-white/30 ml-0.5" />
        )}
      </button>

      {/* Drawing toolbar */}
      {isOpen && (
        <div className="bg-black/50 backdrop-blur-xl rounded-lg border border-white/[0.08] p-2 space-y-2">
          {/* Tools row */}
          <div className="flex items-center gap-1">
            {[
              { id: "select", icon: MousePointer2, label: "Select" },
              { id: "rectangle", icon: Square, label: "Rectangle" },
              { id: "polygon", icon: Pentagon, label: "Polygon" },
              { id: "line", icon: Minus, label: "Line" },
            ].map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.id}
                  onClick={() => selectTool(tool.id)}
                  title={tool.label}
                  className={`
                    w-8 h-8 rounded-md flex items-center justify-center transition-all
                    ${activeTool === tool.id
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "text-white/50 hover:text-white hover:bg-white/[0.06] border border-transparent"}
                  `}
                  data-testid={`draw-tool-${tool.id}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              );
            })}

            <div className="w-px h-5 bg-white/[0.08] mx-0.5" />

            {/* Delete selected */}
            <button
              onClick={deleteSelected}
              disabled={!selectedFeature}
              title="Delete selected"
              className="w-8 h-8 rounded-md flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-transparent"
              data-testid="draw-delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>

            {/* Clear all */}
            {features.length > 0 && (
              <button
                onClick={deleteAll}
                title="Clear all"
                className="w-8 h-8 rounded-md flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent"
                data-testid="draw-clear"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Default shape properties (when nothing selected) */}
          {!selectedFeature && (
            <div className="space-y-2 pt-1 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-widest text-white/30">
                  Next Shape
                </span>
              </div>

              {/* Color row */}
              <div className="flex items-center gap-1.5">
                <Palette className="w-3 h-3 text-white/30 shrink-0" />
                <div className="flex gap-1">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setShapeColor(c.value)}
                      title={c.label}
                      className={`w-5 h-5 rounded-sm border transition-all ${
                        shapeColor === c.value
                          ? "border-white/40 scale-110"
                          : "border-white/[0.08] hover:border-white/20"
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>

              {/* Height slider */}
              <div className="flex items-center gap-2">
                <ArrowUp className="w-3 h-3 text-white/30 shrink-0" />
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={1}
                  value={shapeHeight}
                  onChange={(e) => setShapeHeight(Number(e.target.value))}
                  className="flex-1 h-1 appearance-none bg-white/10 rounded-full accent-emerald-500 cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                  data-testid="draw-height-default"
                />
                <span className="text-[10px] font-mono text-white/40 w-10 text-right">
                  {shapeHeight}m
                </span>
              </div>

              {/* Opacity slider */}
              <div className="flex items-center gap-2">
                <Layers className="w-3 h-3 text-white/30 shrink-0" />
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={shapeOpacity}
                  onChange={(e) => setShapeOpacity(Number(e.target.value))}
                  className="flex-1 h-1 appearance-none bg-white/10 rounded-full accent-emerald-500 cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                  data-testid="draw-opacity-default"
                />
                <span className="text-[10px] font-mono text-white/40 w-10 text-right">
                  {Math.round(shapeOpacity * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* Selected shape properties */}
          {selectedFeature && showExtrusion && (
            <div className="space-y-2 pt-1 border-t border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Box className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] text-white/60 font-medium">
                    {selectedFeature.name}
                  </span>
                </div>
              </div>

              {/* Color row */}
              <div className="flex items-center gap-1.5">
                <Palette className="w-3 h-3 text-white/30 shrink-0" />
                <div className="flex gap-1">
                  {COLOR_PRESETS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => updateSelectedFeature({ color: c.value })}
                      title={c.label}
                      className={`w-5 h-5 rounded-sm border transition-all ${
                        selectedFeature.color === c.value
                          ? "border-white/40 scale-110"
                          : "border-white/[0.08] hover:border-white/20"
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>

              {/* Height slider */}
              <div className="flex items-center gap-2">
                <ArrowUp className="w-3 h-3 text-white/30 shrink-0" />
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={1}
                  value={selectedFeature.height}
                  onChange={(e) => updateSelectedFeature({ height: Number(e.target.value) })}
                  className="flex-1 h-1 appearance-none bg-white/10 rounded-full accent-emerald-500 cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                  data-testid="draw-height-selected"
                />
                <span className="text-[10px] font-mono text-white/40 w-10 text-right">
                  {selectedFeature.height}m
                </span>
              </div>

              {/* Opacity slider */}
              <div className="flex items-center gap-2">
                <Layers className="w-3 h-3 text-white/30 shrink-0" />
                <input
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={selectedFeature.opacity}
                  onChange={(e) => updateSelectedFeature({ opacity: Number(e.target.value) })}
                  className="flex-1 h-1 appearance-none bg-white/10 rounded-full accent-emerald-500 cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-emerald-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                  data-testid="draw-opacity-selected"
                />
                <span className="text-[10px] font-mono text-white/40 w-10 text-right">
                  {Math.round(selectedFeature.opacity * 100)}%
                </span>
              </div>
            </div>
          )}

          {/* Feature count */}
          {features.length > 0 && (
            <div className="flex items-center justify-between pt-1 border-t border-white/[0.06]">
              <span className="text-[9px] text-white/30">
                {features.length} shape{features.length !== 1 ? "s" : ""} drawn
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Mapbox GL Draw type shim
type MapboxDraw = {
  getAll: () => GeoJSON.FeatureCollection;
  changeMode: (mode: string) => void;
  delete: (id: string) => void;
  deleteAll: () => void;
};
