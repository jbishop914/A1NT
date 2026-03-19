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
  Upload,
  FileUp,
  RotateCw,
  Move,
  Maximize2,
  Check,
  FolderOpen,
  Database,
  Plus,
  Eye,
  EyeOff,
  Cuboid,
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

interface ImportedAsset {
  id: string;
  name: string;
  type: "2d" | "3d";
  format: string;
  size: string;
  visible: boolean;
  source: "local" | "kb";
}

interface Placed3DObject {
  id: string;
  name: string;
  url: string;
  lng: number;
  lat: number;
  altitude: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  scale: number;
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

  // Use a ref to always have the latest features for event handlers
  const featuresRef = useRef<DrawnFeature[]>(features);
  featuresRef.current = features;

  // Current shape properties (defaults for next drawn shape)
  const [shapeColor, setShapeColor] = useState("#94a3b8");
  const [shapeHeight, setShapeHeight] = useState(8);
  const [shapeOpacity, setShapeOpacity] = useState(0.75);

  // Refs for shape defaults so event handlers always see latest
  const shapeColorRef = useRef(shapeColor);
  shapeColorRef.current = shapeColor;
  const shapeHeightRef = useRef(shapeHeight);
  shapeHeightRef.current = shapeHeight;
  const shapeOpacityRef = useRef(shapeOpacity);
  shapeOpacityRef.current = shapeOpacity;

  // ── Import state ──────────────────────────────────────────────
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [importedAssets, setImportedAssets] = useState<ImportedAsset[]>([]);
  const [showImportFlow, setShowImportFlow] = useState(false);
  const [importSource, setImportSource] = useState<"local" | "kb" | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── 3D placement state ────────────────────────────────────────
  const [placementMode, setPlacementMode] = useState(false);
  const [placingObject, setPlacingObject] = useState<Placed3DObject | null>(null);
  const [placementTool, setPlacementTool] = useState<"move" | "rotate" | "scale">("move");
  const [placed3DObjects, setPlaced3DObjects] = useState<Placed3DObject[]>([]);

  // ── Extrusion sync ────────────────────────────────────────────

  const syncExtrusions = useCallback(
    (featuresMeta: DrawnFeature[]) => {
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
            height: meta?.height ?? shapeHeightRef.current,
            base: meta?.base ?? 0,
            color: meta?.color ?? shapeColorRef.current,
            opacity: meta?.opacity ?? shapeOpacityRef.current,
          },
        };
      });

      source.setData({
        type: "FeatureCollection",
        features: extrusionFeatures,
      });
    },
    [map],
  );

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

  // Sync extrusion layer whenever features, defaults, or map change
  useEffect(() => {
    syncExtrusions(features);
  }, [features, shapeColor, shapeHeight, shapeOpacity, syncExtrusions]);

  // ── Draw event handlers (use refs to avoid stale closures) ────

  function handleDrawCreate(e: { features: GeoJSON.Feature[] }) {
    const currentFeatures = featuresRef.current;
    const newFeatures = e.features.map((f, i) => ({
      id: f.id as string,
      name: `Shape ${currentFeatures.length + i + 1}`,
      height: shapeHeightRef.current,
      base: 0,
      color: shapeColorRef.current,
      opacity: shapeOpacityRef.current,
    }));

    const merged = [...currentFeatures, ...newFeatures];
    setFeatures(merged);
    setActiveTool(null);

    // Immediately show extrusion panel for the new shape
    if (newFeatures.length > 0) {
      setSelectedFeature(newFeatures[0]);
      setShowExtrusion(true);
    }

    syncExtrusions(merged);
  }

  function handleDrawUpdate() {
    // Geometry changed — re-render extrusions
    syncExtrusions(featuresRef.current);
  }

  function handleDrawDelete(e: { features: GeoJSON.Feature[] }) {
    const deletedIds = new Set(e.features.map((f) => f.id as string));
    const updated = featuresRef.current.filter((f) => !deletedIds.has(f.id));
    setFeatures(updated);
    setSelectedFeature((prev) => {
      if (prev && deletedIds.has(prev.id)) {
        setShowExtrusion(false);
        return null;
      }
      return prev;
    });
    syncExtrusions(updated);
  }

  function handleSelectionChange(e: { features: GeoJSON.Feature[] }) {
    if (e.features.length > 0) {
      const id = e.features[0].id as string;
      const meta = featuresRef.current.find((f) => f.id === id);
      if (meta) {
        setSelectedFeature(meta);
        setShowExtrusion(true);
      }
    } else {
      setSelectedFeature(null);
      setShowExtrusion(false);
    }
  }

  // ── Feature update helper ─────────────────────────────────────

  function updateSelectedFeature(updates: Partial<DrawnFeature>) {
    if (!selectedFeature) return;
    const updated = { ...selectedFeature, ...updates };
    setSelectedFeature(updated);
    const newFeatures = featuresRef.current.map((f) => (f.id === updated.id ? updated : f));
    setFeatures(newFeatures);
    syncExtrusions(newFeatures);
  }

  // ── Tool selection ────────────────────────────────────────────

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

  // ── Delete ────────────────────────────────────────────────────

  function deleteSelected() {
    if (!drawRef.current || !selectedFeature) return;
    drawRef.current.delete(selectedFeature.id);
    const updated = featuresRef.current.filter((f) => f.id !== selectedFeature.id);
    setFeatures(updated);
    setSelectedFeature(null);
    setShowExtrusion(false);
    syncExtrusions(updated);
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

  // ── Import handlers ───────────────────────────────────────────

  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
      const is3d = ["glb", "gltf", "obj", "fbx"].includes(ext);
      const is2d = ["geojson", "json", "kml", "kmz", "gpx", "shp", "csv", "dxf", "svg", "png", "jpg", "jpeg", "tiff", "tif"].includes(ext);

      if (!is3d && !is2d) return;

      const asset: ImportedAsset = {
        id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: file.name,
        type: is3d ? "3d" : "2d",
        format: ext.toUpperCase(),
        size: formatFileSize(file.size),
        visible: true,
        source: "local",
      };

      setImportedAssets((prev) => [...prev, asset]);

      // If it's a GLB/GLTF, enter placement mode
      if (["glb", "gltf"].includes(ext)) {
        const url = URL.createObjectURL(file);
        enterPlacementMode(asset.name, url);
      }

      // If it's GeoJSON, load it onto the map
      if (["geojson", "json"].includes(ext)) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          try {
            const geojson = JSON.parse(ev.target?.result as string);
            addGeoJSONToMap(asset.id, geojson);
          } catch {
            console.error("[MapDraw] Invalid GeoJSON file");
          }
        };
        reader.readAsText(file);
      }
    });

    // Reset input so the same file can be re-selected
    e.target.value = "";
    setShowImportFlow(false);
    setImportSource(null);
  }

  function addGeoJSONToMap(sourceId: string, geojson: GeoJSON.FeatureCollection | GeoJSON.Feature) {
    if (!map) return;

    // Wrap single feature in a collection
    const fc: GeoJSON.FeatureCollection =
      geojson.type === "FeatureCollection"
        ? geojson
        : { type: "FeatureCollection", features: [geojson as GeoJSON.Feature] };

    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, { type: "geojson", data: fc });

      // Auto-detect geometry type and add appropriate layer
      const firstGeom = fc.features[0]?.geometry?.type;
      if (firstGeom === "Polygon" || firstGeom === "MultiPolygon") {
        map.addLayer({
          id: `${sourceId}-fill`,
          type: "fill",
          source: sourceId,
          paint: {
            "fill-color": "#10b981",
            "fill-opacity": 0.3,
          },
        });
        map.addLayer({
          id: `${sourceId}-stroke`,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": "#10b981",
            "line-width": 1.5,
          },
        });
      } else if (firstGeom === "LineString" || firstGeom === "MultiLineString") {
        map.addLayer({
          id: `${sourceId}-line`,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": "#10b981",
            "line-width": 2,
          },
        });
      } else if (firstGeom === "Point" || firstGeom === "MultiPoint") {
        map.addLayer({
          id: `${sourceId}-circle`,
          type: "circle",
          source: sourceId,
          paint: {
            "circle-radius": 5,
            "circle-color": "#10b981",
            "circle-stroke-color": "#fff",
            "circle-stroke-width": 1,
          },
        });
      }
    }
  }

  function enterPlacementMode(name: string, url: string) {
    if (!map) return;
    const center = map.getCenter();
    const obj: Placed3DObject = {
      id: `3d-${Date.now()}`,
      name,
      url,
      lng: center.lng,
      lat: center.lat,
      altitude: 0,
      rotateX: Math.PI / 2, // upright
      rotateY: 0,
      rotateZ: 0,
      scale: 1,
    };
    setPlacingObject(obj);
    setPlacementMode(true);
    setPlacementTool("move");
  }

  function confirmPlacement() {
    if (!placingObject) return;
    setPlaced3DObjects((prev) => [...prev, placingObject]);
    // In production, this would add a Three.js custom layer to Mapbox
    // For now, add a marker at the placement location
    addPlacementMarker(placingObject);
    setPlacingObject(null);
    setPlacementMode(false);
  }

  function cancelPlacement() {
    if (placingObject?.url.startsWith("blob:")) {
      URL.revokeObjectURL(placingObject.url);
    }
    setPlacingObject(null);
    setPlacementMode(false);
  }

  function addPlacementMarker(obj: Placed3DObject) {
    if (!map) return;
    // Add a source + symbol for the 3D object location
    const sourceId = `placed-${obj.id}`;
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: { type: "Point", coordinates: [obj.lng, obj.lat] },
          properties: { name: obj.name },
        },
      });
      map.addLayer({
        id: `${sourceId}-marker`,
        type: "circle",
        source: sourceId,
        paint: {
          "circle-radius": 8,
          "circle-color": "#8b5cf6",
          "circle-stroke-color": "#fff",
          "circle-stroke-width": 2,
          "circle-opacity": 0.9,
        },
      });
      map.addLayer({
        id: `${sourceId}-label`,
        type: "symbol",
        source: sourceId,
        layout: {
          "text-field": ["get", "name"],
          "text-offset": [0, 1.5],
          "text-size": 10,
          "text-anchor": "top",
        },
        paint: {
          "text-color": "#fff",
          "text-halo-color": "#000",
          "text-halo-width": 1,
        },
      });
    }
  }

  function toggleAssetVisibility(id: string) {
    setImportedAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, visible: !a.visible } : a)),
    );
    // Toggle associated map layers
    if (!map) return;
    const asset = importedAssets.find((a) => a.id === id);
    if (!asset) return;
    const vis = asset.visible ? "none" : "visible"; // toggling, so invert current
    const layerIds = map.getStyle().layers
      ?.filter((l) => (l as { source?: string }).source === id)
      .map((l) => l.id) ?? [];
    layerIds.forEach((lid) => {
      map.setLayoutProperty(lid, "visibility", vis);
    });
  }

  function removeAsset(id: string) {
    setImportedAssets((prev) => prev.filter((a) => a.id !== id));
    // Remove associated map layers + source
    if (!map) return;
    const layerIds = map.getStyle().layers
      ?.filter((l) => (l as { source?: string }).source === id)
      .map((l) => l.id) ?? [];
    layerIds.forEach((lid) => {
      if (map.getLayer(lid)) map.removeLayer(lid);
    });
    if (map.getSource(id)) map.removeSource(id);
  }

  // ── Helpers ───────────────────────────────────────────────────

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-2" data-testid="map-draw">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".glb,.gltf,.obj,.fbx,.geojson,.json,.kml,.kmz,.gpx,.shp,.csv,.dxf,.svg,.png,.jpg,.jpeg,.tiff,.tif"
        multiple
        onChange={handleFileImport}
        className="hidden"
        data-testid="draw-file-input"
      />

      {/* ── 3D placement overlay ── */}
      {placementMode && placingObject && (
        <div className="bg-black/60 backdrop-blur-xl rounded-lg border border-violet-500/30 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cuboid className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs font-medium text-white/80">Place 3D Object</span>
            </div>
            <span className="text-[10px] text-white/40 truncate max-w-[120px]">{placingObject.name}</span>
          </div>

          {/* Transform tools */}
          <div className="flex items-center gap-1">
            {([
              { id: "move" as const, icon: Move, label: "Move" },
              { id: "rotate" as const, icon: RotateCw, label: "Rotate" },
              { id: "scale" as const, icon: Maximize2, label: "Scale" },
            ]).map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setPlacementTool(t.id)}
                  title={t.label}
                  className={`
                    flex-1 h-8 rounded-md flex items-center justify-center gap-1.5 text-[10px] transition-all
                    ${placementTool === t.id
                      ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                      : "text-white/50 hover:text-white hover:bg-white/[0.06] border border-transparent"}
                  `}
                  data-testid={`placement-tool-${t.id}`}
                >
                  <Icon className="w-3 h-3" />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Position readout */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-white/30">Longitude</label>
              <input
                type="number"
                step={0.0001}
                value={placingObject.lng.toFixed(4)}
                onChange={(e) => setPlacingObject({ ...placingObject, lng: Number(e.target.value) })}
                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-md px-2 py-1 text-[10px] font-mono text-white/70 focus:outline-none focus:border-violet-500/40"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-white/30">Latitude</label>
              <input
                type="number"
                step={0.0001}
                value={placingObject.lat.toFixed(4)}
                onChange={(e) => setPlacingObject({ ...placingObject, lat: Number(e.target.value) })}
                className="w-full bg-white/[0.06] border border-white/[0.08] rounded-md px-2 py-1 text-[10px] font-mono text-white/70 focus:outline-none focus:border-violet-500/40"
              />
            </div>
          </div>

          {/* Rotation (when rotate tool active) */}
          {placementTool === "rotate" && (
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase tracking-widest text-white/30">Rotation Z</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={1}
                  value={Math.round((placingObject.rotateZ * 180) / Math.PI)}
                  onChange={(e) =>
                    setPlacingObject({ ...placingObject, rotateZ: (Number(e.target.value) * Math.PI) / 180 })
                  }
                  className="flex-1 h-1 appearance-none bg-white/10 rounded-full accent-violet-500 cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-violet-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <span className="text-[10px] font-mono text-white/40 w-10 text-right">
                  {Math.round((placingObject.rotateZ * 180) / Math.PI)}°
                </span>
              </div>
            </div>
          )}

          {/* Scale (when scale tool active) */}
          {placementTool === "scale" && (
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase tracking-widest text-white/30">Scale</span>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0.1}
                  max={10}
                  step={0.1}
                  value={placingObject.scale}
                  onChange={(e) => setPlacingObject({ ...placingObject, scale: Number(e.target.value) })}
                  className="flex-1 h-1 appearance-none bg-white/10 rounded-full accent-violet-500 cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-violet-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <span className="text-[10px] font-mono text-white/40 w-10 text-right">
                  {placingObject.scale.toFixed(1)}x
                </span>
              </div>
            </div>
          )}

          {/* Altitude */}
          <div className="space-y-1.5">
            <span className="text-[9px] uppercase tracking-widest text-white/30">Altitude</span>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={100}
                step={1}
                value={placingObject.altitude}
                onChange={(e) => setPlacingObject({ ...placingObject, altitude: Number(e.target.value) })}
                className="flex-1 h-1 appearance-none bg-white/10 rounded-full accent-violet-500 cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-violet-400 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <span className="text-[10px] font-mono text-white/40 w-10 text-right">
                {placingObject.altitude}m
              </span>
            </div>
          </div>

          {/* Confirm / Cancel */}
          <div className="flex gap-2">
            <button
              onClick={confirmPlacement}
              className="flex-1 flex items-center justify-center gap-1.5 bg-violet-500/20 text-violet-400 rounded-md py-1.5 text-[10px] font-medium hover:bg-violet-500/30 transition-all border border-violet-500/30"
              data-testid="placement-confirm"
            >
              <Check className="w-3 h-3" />
              Place
            </button>
            <button
              onClick={cancelPlacement}
              className="flex-1 flex items-center justify-center gap-1.5 bg-white/[0.06] text-white/50 rounded-md py-1.5 text-[10px] font-medium hover:bg-white/[0.1] transition-all border border-white/[0.08]"
              data-testid="placement-cancel"
            >
              <X className="w-3 h-3" />
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Draw toggle button ── */}
      <div className="flex items-center gap-1.5">
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

        {/* ── Import 2D/3D dropdown ── */}
        <div className="relative">
          <button
            onClick={() => setShowImportMenu(!showImportMenu)}
            className={`
              flex items-center gap-1.5 bg-black/50 backdrop-blur-xl rounded-lg border px-2.5 py-1.5 text-xs transition-all
              ${showImportMenu ? "border-violet-500/30 text-violet-400 bg-black/60" : "border-white/[0.08] text-white/60 hover:text-white hover:bg-black/60"}
            `}
            data-testid="import-toggle"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import 2D/3D</span>
            {importedAssets.length > 0 && (
              <span className="text-[9px] bg-white/10 rounded-full px-1.5 py-0.5 ml-0.5">
                {importedAssets.length}
              </span>
            )}
            {showImportMenu ? (
              <ChevronUp className="w-3 h-3 text-white/30 ml-0.5" />
            ) : (
              <ChevronDown className="w-3 h-3 text-white/30 ml-0.5" />
            )}
          </button>

          {showImportMenu && (
            <div className="absolute top-full left-0 mt-1 w-[320px] bg-black/70 backdrop-blur-xl rounded-lg border border-white/[0.08] p-2 space-y-2 z-50">
              {/* Import actions */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setShowImportFlow(true);
                    setImportSource(null);
                  }}
                  className="flex items-center gap-1.5 bg-violet-500/10 text-violet-400 rounded-md px-2.5 py-1.5 text-[10px] font-medium hover:bg-violet-500/20 transition-all border border-violet-500/20"
                  data-testid="import-add"
                >
                  <Plus className="w-3 h-3" />
                  Add File
                </button>
                <button
                  onClick={() => enterPlacementMode("Custom Object", "")}
                  disabled={!map}
                  className="flex items-center gap-1.5 bg-white/[0.06] text-white/50 rounded-md px-2.5 py-1.5 text-[10px] font-medium hover:bg-white/[0.1] hover:text-white/70 transition-all border border-white/[0.08] disabled:opacity-30"
                  data-testid="import-place-3d"
                >
                  <Cuboid className="w-3 h-3" />
                  Place 3D Object
                </button>
              </div>

              {/* Import source flow */}
              {showImportFlow && (
                <div className="space-y-2 p-2 bg-white/[0.03] rounded-md border border-white/[0.06]">
                  <span className="text-[9px] uppercase tracking-widest text-white/30">Import Source</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setImportSource("local");
                        fileInputRef.current?.click();
                      }}
                      className={`
                        flex-1 flex flex-col items-center gap-1.5 rounded-md p-3 text-[10px] transition-all border
                        ${importSource === "local" ? "bg-violet-500/10 border-violet-500/30 text-violet-400" : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70 hover:bg-white/[0.06]"}
                      `}
                      data-testid="import-local"
                    >
                      <FolderOpen className="w-4 h-4" />
                      Local File
                    </button>
                    <button
                      onClick={() => setImportSource("kb")}
                      className={`
                        flex-1 flex flex-col items-center gap-1.5 rounded-md p-3 text-[10px] transition-all border
                        ${importSource === "kb" ? "bg-violet-500/10 border-violet-500/30 text-violet-400" : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70 hover:bg-white/[0.06]"}
                      `}
                      data-testid="import-kb"
                    >
                      <Database className="w-4 h-4" />
                      Knowledge Base
                    </button>
                  </div>
                  {importSource === "kb" && (
                    <div className="text-[10px] text-white/40 text-center py-2 bg-white/[0.02] rounded-md border border-white/[0.04]">
                      Knowledge Base integration coming soon. Use local file import for now.
                    </div>
                  )}
                </div>
              )}

              {/* Asset table */}
              <div className="space-y-1">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[9px] uppercase tracking-widest text-white/30">
                    Imported Assets ({importedAssets.length})
                  </span>
                </div>

                {/* Table header */}
                <div className="grid grid-cols-[1fr_50px_50px_28px_28px] gap-1 px-1.5 py-1 text-[9px] uppercase tracking-wider text-white/25">
                  <span>Name</span>
                  <span>Type</span>
                  <span>Size</span>
                  <span></span>
                  <span></span>
                </div>

                {/* Rows — up to 10 visible */}
                <div className="max-h-[200px] overflow-y-auto scrollbar-none space-y-0.5">
                  {importedAssets.length === 0 ? (
                    <div className="text-[10px] text-white/25 text-center py-4">
                      No assets imported yet
                    </div>
                  ) : (
                    importedAssets.slice(0, 10).map((asset) => (
                      <div
                        key={asset.id}
                        className="grid grid-cols-[1fr_50px_50px_28px_28px] gap-1 items-center px-1.5 py-1 rounded-md hover:bg-white/[0.04] transition-colors group"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          {asset.type === "3d" ? (
                            <Cuboid className="w-3 h-3 text-violet-400 shrink-0" />
                          ) : (
                            <Layers className="w-3 h-3 text-emerald-400 shrink-0" />
                          )}
                          <span className="text-[10px] text-white/60 truncate">{asset.name}</span>
                        </div>
                        <span className="text-[9px] font-mono text-white/30">{asset.format}</span>
                        <span className="text-[9px] font-mono text-white/30">{asset.size}</span>
                        <button
                          onClick={() => toggleAssetVisibility(asset.id)}
                          className="w-6 h-6 rounded flex items-center justify-center text-white/20 hover:text-white/50 transition-colors"
                          title={asset.visible ? "Hide" : "Show"}
                        >
                          {asset.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        </button>
                        <button
                          onClick={() => removeAsset(asset.id)}
                          className="w-6 h-6 rounded flex items-center justify-center text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {/* Show more indicator */}
                {importedAssets.length > 10 && (
                  <div className="text-[9px] text-white/25 text-center py-1">
                    +{importedAssets.length - 10} more assets
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Drawing toolbar ── */}
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
