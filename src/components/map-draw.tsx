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
  Crosshair,
  Copy,
  List,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────

interface DrawnFeature {
  id: string;
  name: string;
  height: number;
  base: number;
  color: string;
  opacity: number;
  visible: boolean;
}

interface ImportedAsset {
  id: string;
  name: string;
  type: "2d" | "3d";
  format: string;
  size: string;
  visible: boolean;
  source: "local" | "kb";
  blobUrl?: string;
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
  visible: boolean;
}

/** Unified object for the "Map Objects" dropdown */
type MapObject =
  | { kind: "shape"; data: DrawnFeature }
  | { kind: "import"; data: ImportedAsset }
  | { kind: "placed"; data: Placed3DObject };

interface MapDrawProps {
  map: mapboxgl.Map | null;
}

// ─── Constants ───────────────────────────────────────────────────

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

const PREVIEW_SOURCE = "placement-preview";
const PREVIEW_MARKER = "placement-preview-marker";
const PREVIEW_RING = "placement-preview-ring";
const PREVIEW_LABEL = "placement-preview-label";

// ─── Shared slider class ─────────────────────────────────────────

const SLIDER_CLS =
  "flex-1 h-1 appearance-none bg-white/10 rounded-full cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer";

const EMERALD_SLIDER = `${SLIDER_CLS} accent-emerald-500 [&::-webkit-slider-thumb]:bg-emerald-400`;
const VIOLET_SLIDER = `${SLIDER_CLS} accent-violet-500 [&::-webkit-slider-thumb]:bg-violet-400`;

// ─── Component ───────────────────────────────────────────────────

export function MapDraw({ map }: MapDrawProps) {
  // ── Draw state ────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<DrawnFeature | null>(null);
  const [features, setFeatures] = useState<DrawnFeature[]>([]);
  const [showExtrusion, setShowExtrusion] = useState(false);
  const drawRef = useRef<MapboxDraw | null>(null);
  const [drawLoaded, setDrawLoaded] = useState(false);

  const featuresRef = useRef<DrawnFeature[]>(features);
  featuresRef.current = features;

  // Defaults for next drawn shape
  const [shapeColor, setShapeColor] = useState("#94a3b8");
  const [shapeHeight, setShapeHeight] = useState(8);
  const [shapeOpacity, setShapeOpacity] = useState(0.75);

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
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── 3D placement state ────────────────────────────────────────
  const [placementMode, setPlacementMode] = useState(false);
  const [placingObject, setPlacingObject] = useState<Placed3DObject | null>(null);
  const [placementTool, setPlacementTool] = useState<"move" | "rotate" | "scale">("move");
  const [placed3DObjects, setPlaced3DObjects] = useState<Placed3DObject[]>([]);

  // ── Map Objects dropdown state ────────────────────────────────
  const [showMapObjects, setShowMapObjects] = useState(false);
  /** Which object is being edited from the Map Objects panel */
  const [editingObjectId, setEditingObjectId] = useState<string | null>(null);

  // ═══════════════════════════════════════════════════════════════
  // LOGIC
  // ═══════════════════════════════════════════════════════════════

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
            height: meta?.visible === false ? 0 : (meta?.height ?? shapeHeightRef.current),
            base: meta?.base ?? 0,
            color: meta?.color ?? shapeColorRef.current,
            opacity: meta?.visible === false ? 0 : (meta?.opacity ?? shapeOpacityRef.current),
          },
        };
      });

      source.setData({ type: "FeatureCollection", features: extrusionFeatures });
    },
    [map],
  );

  // ── Live preview marker for placement ─────────────────────────

  const updatePreviewMarker = useCallback(
    (obj: Placed3DObject | null) => {
      if (!map) return;
      if (!obj) {
        if (map.getLayer(PREVIEW_LABEL)) map.removeLayer(PREVIEW_LABEL);
        if (map.getLayer(PREVIEW_RING)) map.removeLayer(PREVIEW_RING);
        if (map.getLayer(PREVIEW_MARKER)) map.removeLayer(PREVIEW_MARKER);
        if (map.getSource(PREVIEW_SOURCE)) map.removeSource(PREVIEW_SOURCE);
        return;
      }

      const data: GeoJSON.Feature = {
        type: "Feature",
        geometry: { type: "Point", coordinates: [obj.lng, obj.lat] },
        properties: { name: obj.name },
      };

      if (map.getSource(PREVIEW_SOURCE)) {
        (map.getSource(PREVIEW_SOURCE) as mapboxgl.GeoJSONSource).setData(data);
      } else {
        map.addSource(PREVIEW_SOURCE, { type: "geojson", data });
        map.addLayer({ id: PREVIEW_RING, type: "circle", source: PREVIEW_SOURCE, paint: { "circle-radius": 18, "circle-color": "transparent", "circle-stroke-color": "#8b5cf6", "circle-stroke-width": 2, "circle-stroke-opacity": 0.5 } });
        map.addLayer({ id: PREVIEW_MARKER, type: "circle", source: PREVIEW_SOURCE, paint: { "circle-radius": 8, "circle-color": "#8b5cf6", "circle-stroke-color": "#fff", "circle-stroke-width": 2, "circle-opacity": 0.9 } });
        map.addLayer({ id: PREVIEW_LABEL, type: "symbol", source: PREVIEW_SOURCE, layout: { "text-field": ["get", "name"], "text-offset": [0, 2], "text-size": 11, "text-anchor": "top", "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"] }, paint: { "text-color": "#c4b5fd", "text-halo-color": "#000", "text-halo-width": 1 } });
      }
    },
    [map],
  );

  useEffect(() => {
    updatePreviewMarker(placingObject);
    return () => { if (!placingObject) updatePreviewMarker(null); };
  }, [placingObject, updatePreviewMarker]);

  // Click map to reposition during placement
  useEffect(() => {
    if (!map || !placementMode) return;
    function onMapClick(e: mapboxgl.MapMouseEvent) {
      setPlacingObject((prev) => prev ? { ...prev, lng: e.lngLat.lng, lat: e.lngLat.lat } : prev);
    }
    map.on("click", onMapClick);
    map.getCanvas().style.cursor = "crosshair";
    return () => { map.off("click", onMapClick); map.getCanvas().style.cursor = ""; };
  }, [map, placementMode]);

  // ── Initialize Mapbox GL Draw ─────────────────────────────────

  useEffect(() => {
    if (!map || drawLoaded) return;
    let cancelled = false;

    async function initDraw() {
      try {
        const MapboxDraw = (await import("@mapbox/mapbox-gl-draw")).default;
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
            { id: "gl-draw-polygon-fill-active", type: "fill", filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "true"]], paint: { "fill-color": "#10b981", "fill-opacity": 0.3 } },
            { id: "gl-draw-polygon-fill-inactive", type: "fill", filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "false"]], paint: { "fill-color": "#94a3b8", "fill-opacity": 0.2 } },
            { id: "gl-draw-polygon-stroke-active", type: "line", filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "true"]], paint: { "line-color": "#10b981", "line-width": 2 } },
            { id: "gl-draw-polygon-stroke-inactive", type: "line", filter: ["all", ["==", "$type", "Polygon"], ["==", "active", "false"]], paint: { "line-color": "#94a3b8", "line-width": 1.5, "line-dasharray": [2, 2] } },
            { id: "gl-draw-line-active", type: "line", filter: ["all", ["==", "$type", "LineString"], ["==", "active", "true"]], paint: { "line-color": "#10b981", "line-width": 2 } },
            { id: "gl-draw-line-inactive", type: "line", filter: ["all", ["==", "$type", "LineString"], ["==", "active", "false"]], paint: { "line-color": "#94a3b8", "line-width": 1.5 } },
            { id: "gl-draw-point", type: "circle", filter: ["all", ["==", "$type", "Point"], ["==", "meta", "vertex"]], paint: { "circle-radius": 4, "circle-color": "#fff", "circle-stroke-color": "#10b981", "circle-stroke-width": 2 } },
            { id: "gl-draw-point-midpoint", type: "circle", filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]], paint: { "circle-radius": 3, "circle-color": "#10b981", "circle-opacity": 0.5 } },
          ],
        });

        map.addControl(draw as unknown as mapboxgl.IControl);
        drawRef.current = draw;
        setDrawLoaded(true);
        map.on("draw.create", handleDrawCreate);
        map.on("draw.update", handleDrawUpdate);
        map.on("draw.delete", handleDrawDelete);
        map.on("draw.selectionchange", handleSelectionChange);
      } catch (err) {
        console.error("[MapDraw] Failed to initialize drawing tools:", err);
      }
    }

    initDraw();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  useEffect(() => { syncExtrusions(features); }, [features, shapeColor, shapeHeight, shapeOpacity, syncExtrusions]);

  // ── Draw event handlers ───────────────────────────────────────

  function handleDrawCreate(e: { features: GeoJSON.Feature[] }) {
    const cur = featuresRef.current;
    const newFeatures = e.features.map((f, i) => ({
      id: f.id as string,
      name: `Shape ${cur.length + i + 1}`,
      height: shapeHeightRef.current,
      base: 0,
      color: shapeColorRef.current,
      opacity: shapeOpacityRef.current,
      visible: true,
    }));
    const merged = [...cur, ...newFeatures];
    setFeatures(merged);
    setActiveTool(null);
    if (newFeatures.length > 0) { setSelectedFeature(newFeatures[0]); setShowExtrusion(true); }
    syncExtrusions(merged);
  }

  function handleDrawUpdate() { syncExtrusions(featuresRef.current); }

  function handleDrawDelete(e: { features: GeoJSON.Feature[] }) {
    const ids = new Set(e.features.map((f) => f.id as string));
    const updated = featuresRef.current.filter((f) => !ids.has(f.id));
    setFeatures(updated);
    setSelectedFeature((prev) => { if (prev && ids.has(prev.id)) { setShowExtrusion(false); return null; } return prev; });
    syncExtrusions(updated);
  }

  function handleSelectionChange(e: { features: GeoJSON.Feature[] }) {
    if (e.features.length > 0) {
      const id = e.features[0].id as string;
      const meta = featuresRef.current.find((f) => f.id === id);
      if (meta) { setSelectedFeature(meta); setShowExtrusion(true); }
    } else { setSelectedFeature(null); setShowExtrusion(false); }
  }

  // ── Feature helpers ───────────────────────────────────────────

  function updateSelectedFeature(updates: Partial<DrawnFeature>) {
    if (!selectedFeature) return;
    const updated = { ...selectedFeature, ...updates };
    setSelectedFeature(updated);
    const nf = featuresRef.current.map((f) => (f.id === updated.id ? updated : f));
    setFeatures(nf);
    syncExtrusions(nf);
  }

  function updateFeatureById(id: string, updates: Partial<DrawnFeature>) {
    const nf = featuresRef.current.map((f) => (f.id === id ? { ...f, ...updates } : f));
    setFeatures(nf);
    if (selectedFeature?.id === id) setSelectedFeature({ ...selectedFeature, ...updates });
    syncExtrusions(nf);
  }

  function selectTool(tool: string) {
    if (!drawRef.current) return;
    setActiveTool(tool);
    switch (tool) {
      case "rectangle": drawRef.current.changeMode("draw_polygon"); break;
      case "polygon": drawRef.current.changeMode("draw_polygon"); break;
      case "line": drawRef.current.changeMode("draw_line_string"); break;
      case "select": drawRef.current.changeMode("simple_select"); break;
    }
  }

  function deleteFeatureById(id: string) {
    if (drawRef.current) drawRef.current.delete(id);
    const updated = featuresRef.current.filter((f) => f.id !== id);
    setFeatures(updated);
    if (selectedFeature?.id === id) { setSelectedFeature(null); setShowExtrusion(false); }
    if (editingObjectId === id) setEditingObjectId(null);
    syncExtrusions(updated);
  }

  function deleteSelected() {
    if (!drawRef.current || !selectedFeature) return;
    deleteFeatureById(selectedFeature.id);
  }

  function deleteAll() {
    if (!drawRef.current) return;
    drawRef.current.deleteAll();
    setFeatures([]); setSelectedFeature(null); setShowExtrusion(false);
    if (map) {
      const source = map.getSource("user-extrusions") as mapboxgl.GeoJSONSource | undefined;
      if (source) source.setData({ type: "FeatureCollection", features: [] });
    }
  }

  function duplicateFeature(feat: DrawnFeature) {
    if (!drawRef.current || !map) return;
    // Get the geometry from the draw instance
    const allDrawn = drawRef.current.getAll();
    const original = allDrawn.features.find((f) => f.id === feat.id);
    if (!original) return;

    // Offset the geometry slightly so the copy is visible
    const offsetGeometry = JSON.parse(JSON.stringify(original.geometry));
    function offsetCoords(coords: number[]) { coords[0] += 0.0002; coords[1] += 0.0002; }
    if (offsetGeometry.type === "Polygon") {
      offsetGeometry.coordinates.forEach((ring: number[][]) => ring.forEach(offsetCoords));
    } else if (offsetGeometry.type === "LineString") {
      offsetGeometry.coordinates.forEach(offsetCoords);
    } else if (offsetGeometry.type === "Point") {
      offsetCoords(offsetGeometry.coordinates);
    }

    // Add the new feature to draw
    const ids = drawRef.current.add({ type: "Feature", geometry: offsetGeometry, properties: {} });
    const newId = Array.isArray(ids) ? ids[0] : ids;

    const cur = featuresRef.current;
    const newFeat: DrawnFeature = {
      id: newId as string,
      name: `${feat.name} copy`,
      height: feat.height,
      base: feat.base,
      color: feat.color,
      opacity: feat.opacity,
      visible: true,
    };
    const merged = [...cur, newFeat];
    setFeatures(merged);
    syncExtrusions(merged);
  }

  function selectFeatureOnMap(id: string) {
    if (!drawRef.current) return;
    try {
      drawRef.current.changeMode("simple_select", { featureIds: [id] });
    } catch {
      // If the feature can't be selected (e.g., already in a mode), just select in state
    }
    const meta = featuresRef.current.find((f) => f.id === id);
    if (meta) { setSelectedFeature(meta); setShowExtrusion(true); }
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

      const blobUrl = is3d ? URL.createObjectURL(file) : undefined;
      const asset: ImportedAsset = {
        id: `import-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: file.name, type: is3d ? "3d" : "2d", format: ext.toUpperCase(),
        size: formatFileSize(file.size), visible: true, source: "local", blobUrl,
      };

      setImportedAssets((prev) => [...prev, asset]);

      if (["glb", "gltf"].includes(ext) && blobUrl) {
        setShowImportMenu(false); setShowImportFlow(false); setImportSource(null);
        enterPlacementMode(asset.name, blobUrl);
      }

      if (["geojson", "json"].includes(ext)) {
        const reader = new FileReader();
        reader.onload = (ev) => { try { addGeoJSONToMap(asset.id, JSON.parse(ev.target?.result as string)); } catch {} };
        reader.readAsText(file);
      }
    });

    e.target.value = "";
    if (!Array.from(files).some((f) => ["glb", "gltf"].includes(f.name.split(".").pop()?.toLowerCase() ?? ""))) {
      setShowImportFlow(false); setImportSource(null);
    }
  }

  function addGeoJSONToMap(sourceId: string, geojson: GeoJSON.FeatureCollection | GeoJSON.Feature) {
    if (!map) return;
    const fc: GeoJSON.FeatureCollection = geojson.type === "FeatureCollection" ? geojson : { type: "FeatureCollection", features: [geojson as GeoJSON.Feature] };
    if (!map.getSource(sourceId)) {
      map.addSource(sourceId, { type: "geojson", data: fc });
      const g = fc.features[0]?.geometry?.type;
      if (g === "Polygon" || g === "MultiPolygon") {
        map.addLayer({ id: `${sourceId}-fill`, type: "fill", source: sourceId, paint: { "fill-color": "#10b981", "fill-opacity": 0.3 } });
        map.addLayer({ id: `${sourceId}-stroke`, type: "line", source: sourceId, paint: { "line-color": "#10b981", "line-width": 1.5 } });
      } else if (g === "LineString" || g === "MultiLineString") {
        map.addLayer({ id: `${sourceId}-line`, type: "line", source: sourceId, paint: { "line-color": "#10b981", "line-width": 2 } });
      } else if (g === "Point" || g === "MultiPoint") {
        map.addLayer({ id: `${sourceId}-circle`, type: "circle", source: sourceId, paint: { "circle-radius": 5, "circle-color": "#10b981", "circle-stroke-color": "#fff", "circle-stroke-width": 1 } });
      }
    }
  }

  // ── Placement ─────────────────────────────────────────────────

  function enterPlacementMode(name: string, url: string) {
    if (!map) return;
    const c = map.getCenter();
    setPlacingObject({ id: `3d-${Date.now()}`, name, url, lng: c.lng, lat: c.lat, altitude: 0, rotateX: Math.PI / 2, rotateY: 0, rotateZ: 0, scale: 1, visible: true });
    setPlacementMode(true); setPlacementTool("move");
  }

  function handlePlaceSelectedAsset() {
    const asset = selectedAssetId ? importedAssets.find((a) => a.id === selectedAssetId && a.type === "3d") : null;
    if (asset?.blobUrl) { setShowImportMenu(false); enterPlacementMode(asset.name, asset.blobUrl); return; }
    const first3d = importedAssets.find((a) => a.type === "3d" && a.blobUrl);
    if (first3d?.blobUrl) { setShowImportMenu(false); enterPlacementMode(first3d.name, first3d.blobUrl); }
  }

  function confirmPlacement() {
    if (!placingObject) return;
    setPlaced3DObjects((prev) => [...prev, placingObject]);
    updatePreviewMarker(null);
    addPlacementMarker(placingObject);
    setPlacingObject(null); setPlacementMode(false);
  }

  function cancelPlacement() {
    updatePreviewMarker(null); setPlacingObject(null); setPlacementMode(false);
  }

  function addPlacementMarker(obj: Placed3DObject) {
    if (!map) return;
    const sid = `placed-${obj.id}`;
    if (!map.getSource(sid)) {
      map.addSource(sid, { type: "geojson", data: { type: "Feature", geometry: { type: "Point", coordinates: [obj.lng, obj.lat] }, properties: { name: obj.name } } });
      map.addLayer({ id: `${sid}-marker`, type: "circle", source: sid, paint: { "circle-radius": 8, "circle-color": "#8b5cf6", "circle-stroke-color": "#fff", "circle-stroke-width": 2, "circle-opacity": 0.9 } });
      map.addLayer({ id: `${sid}-label`, type: "symbol", source: sid, layout: { "text-field": ["get", "name"], "text-offset": [0, 1.5], "text-size": 10, "text-anchor": "top" }, paint: { "text-color": "#fff", "text-halo-color": "#000", "text-halo-width": 1 } });
    }
  }

  function duplicatePlacedObject(obj: Placed3DObject) {
    const copy: Placed3DObject = { ...obj, id: `3d-${Date.now()}`, name: `${obj.name} copy`, lng: obj.lng + 0.0002, lat: obj.lat + 0.0002, visible: true };
    setPlaced3DObjects((prev) => [...prev, copy]);
    addPlacementMarker(copy);
  }

  function removePlacedObject(id: string) {
    setPlaced3DObjects((prev) => prev.filter((o) => o.id !== id));
    if (editingObjectId === id) setEditingObjectId(null);
    if (!map) return;
    const sid = `placed-${id}`;
    [`${sid}-label`, `${sid}-marker`].forEach((lid) => { if (map.getLayer(lid)) map.removeLayer(lid); });
    if (map.getSource(sid)) map.removeSource(sid);
  }

  function togglePlacedVisibility(id: string) {
    setPlaced3DObjects((prev) => prev.map((o) => o.id === id ? { ...o, visible: !o.visible } : o));
    if (!map) return;
    const sid = `placed-${id}`;
    const obj = placed3DObjects.find((o) => o.id === id);
    const vis = obj?.visible ? "none" : "visible";
    [`${sid}-marker`, `${sid}-label`].forEach((lid) => { if (map.getLayer(lid)) map.setLayoutProperty(lid, "visibility", vis); });
  }

  // ── Import asset helpers ──────────────────────────────────────

  function toggleAssetVisibility(id: string) {
    setImportedAssets((prev) => prev.map((a) => (a.id === id ? { ...a, visible: !a.visible } : a)));
    if (!map) return;
    const asset = importedAssets.find((a) => a.id === id);
    if (!asset) return;
    const vis = asset.visible ? "none" : "visible";
    (map.getStyle().layers?.filter((l) => (l as { source?: string }).source === id).map((l) => l.id) ?? []).forEach((lid) => map.setLayoutProperty(lid, "visibility", vis));
  }

  function removeAsset(id: string) {
    const asset = importedAssets.find((a) => a.id === id);
    if (asset?.blobUrl) URL.revokeObjectURL(asset.blobUrl);
    setImportedAssets((prev) => prev.filter((a) => a.id !== id));
    if (selectedAssetId === id) setSelectedAssetId(null);
    if (editingObjectId === id) setEditingObjectId(null);
    if (!map) return;
    (map.getStyle().layers?.filter((l) => (l as { source?: string }).source === id).map((l) => l.id) ?? []).forEach((lid) => { if (map.getLayer(lid)) map.removeLayer(lid); });
    if (map.getSource(id)) map.removeSource(id);
  }

  // ── Helpers ───────────────────────────────────────────────────

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  const has3dAssets = importedAssets.some((a) => a.type === "3d" && a.blobUrl);

  // Build unified map objects list
  const allMapObjects: MapObject[] = [
    ...features.map((f): MapObject => ({ kind: "shape", data: f })),
    ...importedAssets.map((a): MapObject => ({ kind: "import", data: a })),
    ...placed3DObjects.map((o): MapObject => ({ kind: "placed", data: o })),
  ];
  const totalObjectCount = allMapObjects.length;

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  return (
    <div className="flex flex-col gap-2" data-testid="map-draw">
      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept=".glb,.gltf,.obj,.fbx,.geojson,.json,.kml,.kmz,.gpx,.shp,.csv,.dxf,.svg,.png,.jpg,.jpeg,.tiff,.tif" multiple onChange={handleFileImport} className="hidden" />

      {/* ── 3D placement overlay ── */}
      {placementMode && placingObject && (
        <div className="bg-black/60 backdrop-blur-xl rounded-lg border border-violet-500/30 p-3 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cuboid className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs font-medium text-white/80">Place 3D Object</span>
            </div>
            <span className="text-[10px] text-white/40 truncate max-w-[140px]">{placingObject.name}</span>
          </div>

          <div className="flex items-center gap-2 bg-violet-500/10 rounded-md px-2.5 py-1.5 border border-violet-500/15">
            <Crosshair className="w-3.5 h-3.5 text-violet-400 shrink-0" />
            <span className="text-[10px] text-violet-300/80">Click on the map to position, or adjust below</span>
          </div>

          {/* Transform tools */}
          <div className="flex items-center gap-1">
            {([{ id: "move" as const, icon: Move, label: "Move" }, { id: "rotate" as const, icon: RotateCw, label: "Rotate" }, { id: "scale" as const, icon: Maximize2, label: "Scale" }]).map((t) => {
              const Icon = t.icon;
              return (<button key={t.id} onClick={() => setPlacementTool(t.id)} title={t.label} className={`flex-1 h-8 rounded-md flex items-center justify-center gap-1.5 text-[10px] transition-all ${placementTool === t.id ? "bg-violet-500/20 text-violet-400 border border-violet-500/30" : "text-white/50 hover:text-white hover:bg-white/[0.06] border border-transparent"}`}><Icon className="w-3 h-3" />{t.label}</button>);
            })}
          </div>

          {/* Coords */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-white/30">Longitude</label>
              <input type="number" step={0.0001} value={placingObject.lng.toFixed(4)} onChange={(e) => setPlacingObject({ ...placingObject, lng: Number(e.target.value) })} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-md px-2 py-1 text-[10px] font-mono text-white/70 focus:outline-none focus:border-violet-500/40" />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase tracking-widest text-white/30">Latitude</label>
              <input type="number" step={0.0001} value={placingObject.lat.toFixed(4)} onChange={(e) => setPlacingObject({ ...placingObject, lat: Number(e.target.value) })} className="w-full bg-white/[0.06] border border-white/[0.08] rounded-md px-2 py-1 text-[10px] font-mono text-white/70 focus:outline-none focus:border-violet-500/40" />
            </div>
          </div>

          {placementTool === "rotate" && (
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase tracking-widest text-white/30">Rotation Z</span>
              <div className="flex items-center gap-2">
                <input type="range" min={0} max={360} step={1} value={Math.round((placingObject.rotateZ * 180) / Math.PI)} onChange={(e) => setPlacingObject({ ...placingObject, rotateZ: (Number(e.target.value) * Math.PI) / 180 })} className={VIOLET_SLIDER} />
                <span className="text-[10px] font-mono text-white/40 w-10 text-right">{Math.round((placingObject.rotateZ * 180) / Math.PI)}°</span>
              </div>
            </div>
          )}

          {placementTool === "scale" && (
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase tracking-widest text-white/30">Scale</span>
              <div className="flex items-center gap-2">
                <input type="range" min={0.1} max={10} step={0.1} value={placingObject.scale} onChange={(e) => setPlacingObject({ ...placingObject, scale: Number(e.target.value) })} className={VIOLET_SLIDER} />
                <span className="text-[10px] font-mono text-white/40 w-10 text-right">{placingObject.scale.toFixed(1)}x</span>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <span className="text-[9px] uppercase tracking-widest text-white/30">Altitude</span>
            <div className="flex items-center gap-2">
              <input type="range" min={0} max={100} step={1} value={placingObject.altitude} onChange={(e) => setPlacingObject({ ...placingObject, altitude: Number(e.target.value) })} className={VIOLET_SLIDER} />
              <span className="text-[10px] font-mono text-white/40 w-10 text-right">{placingObject.altitude}m</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={confirmPlacement} className="flex-1 flex items-center justify-center gap-1.5 bg-violet-500/20 text-violet-400 rounded-md py-1.5 text-[10px] font-medium hover:bg-violet-500/30 transition-all border border-violet-500/30"><Check className="w-3 h-3" />Place</button>
            <button onClick={cancelPlacement} className="flex-1 flex items-center justify-center gap-1.5 bg-white/[0.06] text-white/50 rounded-md py-1.5 text-[10px] font-medium hover:bg-white/[0.1] transition-all border border-white/[0.08]"><X className="w-3 h-3" />Cancel</button>
          </div>
        </div>
      )}

      {/* ── Inline edit panel (when editing from Map Objects) ── */}
      {editingObjectId && (() => {
        const editFeat = features.find((f) => f.id === editingObjectId);
        if (!editFeat) return null;
        return (
          <div className="bg-black/60 backdrop-blur-xl rounded-lg border border-emerald-500/30 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Box className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] text-white/60 font-medium">{editFeat.name}</span>
              </div>
              <button onClick={() => setEditingObjectId(null)} className="text-white/30 hover:text-white/60"><X className="w-3 h-3" /></button>
            </div>
            <div className="flex items-center gap-1.5">
              <Palette className="w-3 h-3 text-white/30 shrink-0" />
              <div className="flex gap-1">
                {COLOR_PRESETS.map((c) => (
                  <button key={c.value} onClick={() => updateFeatureById(editFeat.id, { color: c.value })} title={c.label}
                    className={`w-5 h-5 rounded-sm border transition-all ${editFeat.color === c.value ? "border-white/40 scale-110" : "border-white/[0.08] hover:border-white/20"}`}
                    style={{ backgroundColor: c.value }} />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ArrowUp className="w-3 h-3 text-white/30 shrink-0" />
              <input type="range" min={0} max={50} step={1} value={editFeat.height} onChange={(e) => updateFeatureById(editFeat.id, { height: Number(e.target.value) })} className={EMERALD_SLIDER} />
              <span className="text-[10px] font-mono text-white/40 w-10 text-right">{editFeat.height}m</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="w-3 h-3 text-white/30 shrink-0" />
              <input type="range" min={0.1} max={1} step={0.05} value={editFeat.opacity} onChange={(e) => updateFeatureById(editFeat.id, { opacity: Number(e.target.value) })} className={EMERALD_SLIDER} />
              <span className="text-[10px] font-mono text-white/40 w-10 text-right">{Math.round(editFeat.opacity * 100)}%</span>
            </div>
          </div>
        );
      })()}

      {/* ── Button row: Draw | Import 2D/3D | Map Objects ── */}
      <div className="flex items-center gap-1.5">
        {/* Draw toggle */}
        <button onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 bg-black/50 backdrop-blur-xl rounded-lg border px-2.5 py-1.5 text-xs transition-all ${isOpen ? "border-emerald-500/30 text-emerald-400 bg-black/60" : "border-white/[0.08] text-white/60 hover:text-white hover:bg-black/60"}`}
          data-testid="draw-toggle">
          <Pencil className="w-3.5 h-3.5" /><span>Draw</span>
          {features.length > 0 && <span className="text-[9px] bg-white/10 rounded-full px-1.5 py-0.5 ml-0.5">{features.length}</span>}
          {isOpen ? <ChevronUp className="w-3 h-3 text-white/30 ml-0.5" /> : <ChevronDown className="w-3 h-3 text-white/30 ml-0.5" />}
        </button>

        {/* Import 2D/3D */}
        <div className="relative">
          <button onClick={() => { setShowImportMenu(!showImportMenu); if (showImportMenu) { setShowImportFlow(false); setImportSource(null); } }}
            className={`flex items-center gap-1.5 bg-black/50 backdrop-blur-xl rounded-lg border px-2.5 py-1.5 text-xs transition-all ${showImportMenu ? "border-violet-500/30 text-violet-400 bg-black/60" : "border-white/[0.08] text-white/60 hover:text-white hover:bg-black/60"}`}
            data-testid="import-toggle">
            <Upload className="w-3.5 h-3.5" /><span>Import 2D/3D</span>
            {importedAssets.length > 0 && <span className="text-[9px] bg-white/10 rounded-full px-1.5 py-0.5 ml-0.5">{importedAssets.length}</span>}
            {showImportMenu ? <ChevronUp className="w-3 h-3 text-white/30 ml-0.5" /> : <ChevronDown className="w-3 h-3 text-white/30 ml-0.5" />}
          </button>

          {showImportMenu && (
            <div className="absolute top-full left-0 mt-1 w-[340px] bg-black/70 backdrop-blur-xl rounded-lg border border-white/[0.08] p-2 space-y-2 z-50">
              <div className="flex items-center gap-1.5">
                <button onClick={() => { setShowImportFlow(true); setImportSource(null); }} className="flex items-center gap-1.5 bg-violet-500/10 text-violet-400 rounded-md px-2.5 py-1.5 text-[10px] font-medium hover:bg-violet-500/20 transition-all border border-violet-500/20"><Plus className="w-3 h-3" />Add File</button>
                <button onClick={handlePlaceSelectedAsset} disabled={!has3dAssets}
                  className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[10px] font-medium transition-all border ${has3dAssets ? "bg-white/[0.06] text-white/60 hover:bg-violet-500/15 hover:text-violet-400 hover:border-violet-500/20 border-white/[0.08]" : "bg-white/[0.03] text-white/20 border-white/[0.05] cursor-not-allowed"}`}
                  title={has3dAssets ? "Place selected 3D asset on map" : "Import a GLB/GLTF first"}><Cuboid className="w-3 h-3" />Place on Map</button>
              </div>

              {showImportFlow && (
                <div className="space-y-2 p-2 bg-white/[0.03] rounded-md border border-white/[0.06]">
                  <span className="text-[9px] uppercase tracking-widest text-white/30">Import Source</span>
                  <div className="flex gap-2">
                    <button onClick={() => { setImportSource("local"); fileInputRef.current?.click(); }} className={`flex-1 flex flex-col items-center gap-1.5 rounded-md p-3 text-[10px] transition-all border ${importSource === "local" ? "bg-violet-500/10 border-violet-500/30 text-violet-400" : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70 hover:bg-white/[0.06]"}`}><FolderOpen className="w-4 h-4" />Local File</button>
                    <button onClick={() => setImportSource("kb")} className={`flex-1 flex flex-col items-center gap-1.5 rounded-md p-3 text-[10px] transition-all border ${importSource === "kb" ? "bg-violet-500/10 border-violet-500/30 text-violet-400" : "bg-white/[0.04] border-white/[0.08] text-white/50 hover:text-white/70 hover:bg-white/[0.06]"}`}><Database className="w-4 h-4" />Knowledge Base</button>
                  </div>
                  {importSource === "kb" && <div className="text-[10px] text-white/40 text-center py-2 bg-white/[0.02] rounded-md border border-white/[0.04]">Knowledge Base integration coming soon.</div>}
                </div>
              )}

              {/* Import asset table */}
              <div className="space-y-1">
                <span className="text-[9px] uppercase tracking-widest text-white/30 px-1">Imported Assets ({importedAssets.length})</span>
                <div className="max-h-[200px] overflow-y-auto scrollbar-none space-y-0.5">
                  {importedAssets.length === 0 ? (
                    <div className="text-[10px] text-white/25 text-center py-4">No assets imported yet</div>
                  ) : importedAssets.slice(0, 10).map((asset) => (
                    <div key={asset.id} onClick={() => setSelectedAssetId(asset.id === selectedAssetId ? null : asset.id)}
                      className={`flex items-center gap-1.5 px-1.5 py-1.5 rounded-md transition-colors group cursor-pointer ${selectedAssetId === asset.id ? "bg-violet-500/10 border border-violet-500/20" : "hover:bg-white/[0.04] border border-transparent"}`}>
                      {asset.type === "3d" ? <Cuboid className="w-3 h-3 text-violet-400 shrink-0" /> : <Layers className="w-3 h-3 text-emerald-400 shrink-0" />}
                      <span className="text-[10px] text-white/60 truncate flex-1 min-w-0">{asset.name}</span>
                      <span className="text-[9px] font-mono text-white/25 shrink-0">{asset.format}</span>
                      <span className="text-[9px] font-mono text-white/25 shrink-0 w-12 text-right">{asset.size}</span>
                      <button onClick={(e) => { e.stopPropagation(); toggleAssetVisibility(asset.id); }} className="w-5 h-5 rounded flex items-center justify-center text-white/20 hover:text-white/50 shrink-0">
                        {asset.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); removeAsset(asset.id); }} className="w-5 h-5 rounded flex items-center justify-center text-white/20 hover:text-red-400 shrink-0 opacity-0 group-hover:opacity-100">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
                {importedAssets.length > 10 && <div className="text-[9px] text-white/25 text-center py-1">+{importedAssets.length - 10} more</div>}
              </div>
            </div>
          )}
        </div>

        {/* ── Map Objects dropdown ── */}
        <div className="relative">
          <button onClick={() => setShowMapObjects(!showMapObjects)}
            className={`flex items-center gap-1.5 bg-black/50 backdrop-blur-xl rounded-lg border px-2.5 py-1.5 text-xs transition-all ${showMapObjects ? "border-cyan-500/30 text-cyan-400 bg-black/60" : "border-white/[0.08] text-white/60 hover:text-white hover:bg-black/60"}`}
            data-testid="map-objects-toggle">
            <List className="w-3.5 h-3.5" /><span>Map Objects</span>
            {totalObjectCount > 0 && <span className="text-[9px] bg-white/10 rounded-full px-1.5 py-0.5 ml-0.5">{totalObjectCount}</span>}
            {showMapObjects ? <ChevronUp className="w-3 h-3 text-white/30 ml-0.5" /> : <ChevronDown className="w-3 h-3 text-white/30 ml-0.5" />}
          </button>

          {showMapObjects && (
            <div className="absolute top-full left-0 mt-1 w-[380px] bg-black/70 backdrop-blur-xl rounded-lg border border-white/[0.08] p-2 space-y-2 z-50">
              {/* Section header */}
              <div className="flex items-center justify-between px-1">
                <span className="text-[9px] uppercase tracking-widest text-white/30">All Map Objects ({totalObjectCount})</span>
              </div>

              {/* Table header */}
              <div className="grid grid-cols-[16px_1fr_48px_24px_24px_24px] gap-1.5 px-1.5 py-1 text-[9px] uppercase tracking-wider text-white/20">
                <span></span><span>Name</span><span>Type</span><span></span><span></span><span></span>
              </div>

              <div className="max-h-[300px] overflow-y-auto scrollbar-none space-y-0.5">
                {totalObjectCount === 0 ? (
                  <div className="text-[10px] text-white/25 text-center py-6">No objects on map yet</div>
                ) : (
                  <>
                    {/* ── Drawn shapes ── */}
                    {features.length > 0 && (
                      <div className="text-[9px] uppercase tracking-widest text-white/20 px-1.5 pt-1">Shapes</div>
                    )}
                    {features.map((feat) => (
                      <div key={feat.id}
                        onClick={() => { selectFeatureOnMap(feat.id); setEditingObjectId(feat.id); }}
                        className={`grid grid-cols-[16px_1fr_48px_24px_24px_24px] gap-1.5 items-center px-1.5 py-1.5 rounded-md transition-colors cursor-pointer group ${editingObjectId === feat.id ? "bg-emerald-500/10 border border-emerald-500/20" : "hover:bg-white/[0.04] border border-transparent"}`}>
                        <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: feat.color, opacity: feat.visible ? 1 : 0.3 }} />
                        <span className="text-[10px] text-white/60 truncate">{feat.name}</span>
                        <span className="text-[9px] font-mono text-white/25">{feat.height}m</span>
                        <button onClick={(e) => { e.stopPropagation(); duplicateFeature(feat); }} title="Duplicate" className="w-5 h-5 rounded flex items-center justify-center text-white/15 hover:text-emerald-400 transition-colors"><Copy className="w-2.5 h-2.5" /></button>
                        <button onClick={(e) => { e.stopPropagation(); updateFeatureById(feat.id, { visible: !feat.visible }); }} title={feat.visible ? "Hide" : "Show"} className="w-5 h-5 rounded flex items-center justify-center text-white/20 hover:text-white/50 transition-colors">
                          {feat.visible ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); deleteFeatureById(feat.id); }} title="Delete" className="w-5 h-5 rounded flex items-center justify-center text-white/15 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><X className="w-2.5 h-2.5" /></button>
                      </div>
                    ))}

                    {/* ── Imported assets ── */}
                    {importedAssets.length > 0 && (
                      <div className="text-[9px] uppercase tracking-widest text-white/20 px-1.5 pt-2">Imports</div>
                    )}
                    {importedAssets.map((asset) => (
                      <div key={asset.id}
                        className="grid grid-cols-[16px_1fr_48px_24px_24px_24px] gap-1.5 items-center px-1.5 py-1.5 rounded-md hover:bg-white/[0.04] transition-colors group border border-transparent">
                        {asset.type === "3d" ? <Cuboid className="w-3 h-3 text-violet-400" /> : <Layers className="w-3 h-3 text-emerald-400" />}
                        <span className="text-[10px] text-white/60 truncate">{asset.name}</span>
                        <span className="text-[9px] font-mono text-white/25">{asset.format}</span>
                        <div className="w-5 h-5" /> {/* No duplicate for imports */}
                        <button onClick={() => toggleAssetVisibility(asset.id)} title={asset.visible ? "Hide" : "Show"} className="w-5 h-5 rounded flex items-center justify-center text-white/20 hover:text-white/50 transition-colors">
                          {asset.visible ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                        </button>
                        <button onClick={() => removeAsset(asset.id)} title="Delete" className="w-5 h-5 rounded flex items-center justify-center text-white/15 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><X className="w-2.5 h-2.5" /></button>
                      </div>
                    ))}

                    {/* ── Placed 3D objects ── */}
                    {placed3DObjects.length > 0 && (
                      <div className="text-[9px] uppercase tracking-widest text-white/20 px-1.5 pt-2">Placed 3D</div>
                    )}
                    {placed3DObjects.map((obj) => (
                      <div key={obj.id}
                        className="grid grid-cols-[16px_1fr_48px_24px_24px_24px] gap-1.5 items-center px-1.5 py-1.5 rounded-md hover:bg-white/[0.04] transition-colors group border border-transparent">
                        <Cuboid className="w-3 h-3 text-violet-400" />
                        <span className="text-[10px] text-white/60 truncate">{obj.name}</span>
                        <span className="text-[9px] font-mono text-white/25">3D</span>
                        <button onClick={() => duplicatePlacedObject(obj)} title="Duplicate" className="w-5 h-5 rounded flex items-center justify-center text-white/15 hover:text-violet-400 transition-colors"><Copy className="w-2.5 h-2.5" /></button>
                        <button onClick={() => togglePlacedVisibility(obj.id)} title={obj.visible ? "Hide" : "Show"} className="w-5 h-5 rounded flex items-center justify-center text-white/20 hover:text-white/50 transition-colors">
                          {obj.visible ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                        </button>
                        <button onClick={() => removePlacedObject(obj.id)} title="Delete" className="w-5 h-5 rounded flex items-center justify-center text-white/15 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><X className="w-2.5 h-2.5" /></button>
                      </div>
                    ))}
                  </>
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
            {[{ id: "select", icon: MousePointer2, label: "Select" }, { id: "rectangle", icon: Square, label: "Rectangle" }, { id: "polygon", icon: Pentagon, label: "Polygon" }, { id: "line", icon: Minus, label: "Line" }].map((tool) => {
              const Icon = tool.icon;
              return (<button key={tool.id} onClick={() => selectTool(tool.id)} title={tool.label}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${activeTool === tool.id ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-white/50 hover:text-white hover:bg-white/[0.06] border border-transparent"}`}
                data-testid={`draw-tool-${tool.id}`}><Icon className="w-3.5 h-3.5" /></button>);
            })}
            <div className="w-px h-5 bg-white/[0.08] mx-0.5" />
            <button onClick={deleteSelected} disabled={!selectedFeature} title="Delete selected" className="w-8 h-8 rounded-md flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-transparent"><Trash2 className="w-3.5 h-3.5" /></button>
            {features.length > 0 && <button onClick={deleteAll} title="Clear all" className="w-8 h-8 rounded-md flex items-center justify-center text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent"><X className="w-3.5 h-3.5" /></button>}
          </div>

          {/* Default shape properties */}
          {!selectedFeature && (
            <div className="space-y-2 pt-1 border-t border-white/[0.06]">
              <span className="text-[9px] uppercase tracking-widest text-white/30">Next Shape</span>
              <div className="flex items-center gap-1.5">
                <Palette className="w-3 h-3 text-white/30 shrink-0" />
                <div className="flex gap-1">{COLOR_PRESETS.map((c) => (<button key={c.value} onClick={() => setShapeColor(c.value)} title={c.label} className={`w-5 h-5 rounded-sm border transition-all ${shapeColor === c.value ? "border-white/40 scale-110" : "border-white/[0.08] hover:border-white/20"}`} style={{ backgroundColor: c.value }} />))}</div>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUp className="w-3 h-3 text-white/30 shrink-0" />
                <input type="range" min={0} max={50} step={1} value={shapeHeight} onChange={(e) => setShapeHeight(Number(e.target.value))} className={EMERALD_SLIDER} data-testid="draw-height-default" />
                <span className="text-[10px] font-mono text-white/40 w-10 text-right">{shapeHeight}m</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-3 h-3 text-white/30 shrink-0" />
                <input type="range" min={0.1} max={1} step={0.05} value={shapeOpacity} onChange={(e) => setShapeOpacity(Number(e.target.value))} className={EMERALD_SLIDER} data-testid="draw-opacity-default" />
                <span className="text-[10px] font-mono text-white/40 w-10 text-right">{Math.round(shapeOpacity * 100)}%</span>
              </div>
            </div>
          )}

          {/* Selected shape properties */}
          {selectedFeature && showExtrusion && (
            <div className="space-y-2 pt-1 border-t border-white/[0.06]">
              <div className="flex items-center gap-1.5">
                <Box className="w-3 h-3 text-emerald-400" />
                <span className="text-[10px] text-white/60 font-medium">{selectedFeature.name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Palette className="w-3 h-3 text-white/30 shrink-0" />
                <div className="flex gap-1">{COLOR_PRESETS.map((c) => (<button key={c.value} onClick={() => updateSelectedFeature({ color: c.value })} title={c.label} className={`w-5 h-5 rounded-sm border transition-all ${selectedFeature.color === c.value ? "border-white/40 scale-110" : "border-white/[0.08] hover:border-white/20"}`} style={{ backgroundColor: c.value }} />))}</div>
              </div>
              <div className="flex items-center gap-2">
                <ArrowUp className="w-3 h-3 text-white/30 shrink-0" />
                <input type="range" min={0} max={50} step={1} value={selectedFeature.height} onChange={(e) => updateSelectedFeature({ height: Number(e.target.value) })} className={EMERALD_SLIDER} data-testid="draw-height-selected" />
                <span className="text-[10px] font-mono text-white/40 w-10 text-right">{selectedFeature.height}m</span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-3 h-3 text-white/30 shrink-0" />
                <input type="range" min={0.1} max={1} step={0.05} value={selectedFeature.opacity} onChange={(e) => updateSelectedFeature({ opacity: Number(e.target.value) })} className={EMERALD_SLIDER} data-testid="draw-opacity-selected" />
                <span className="text-[10px] font-mono text-white/40 w-10 text-right">{Math.round(selectedFeature.opacity * 100)}%</span>
              </div>
            </div>
          )}

          {/* Drawn shapes table */}
          {features.length > 0 && (
            <div className="pt-1 border-t border-white/[0.06] space-y-1">
              <span className="text-[9px] uppercase tracking-widest text-white/30">{features.length} shape{features.length !== 1 ? "s" : ""}</span>
              <div className="max-h-[150px] overflow-y-auto scrollbar-none space-y-0.5">
                {features.map((feat) => (
                  <div key={feat.id}
                    onClick={() => selectFeatureOnMap(feat.id)}
                    className={`flex items-center gap-1.5 px-1.5 py-1 rounded-md transition-colors cursor-pointer group ${selectedFeature?.id === feat.id ? "bg-emerald-500/10 border border-emerald-500/20" : "hover:bg-white/[0.04] border border-transparent"}`}>
                    <div className="w-3 h-3 rounded-sm shrink-0" style={{ backgroundColor: feat.color, opacity: feat.visible ? 1 : 0.3 }} />
                    <span className="text-[10px] text-white/60 truncate flex-1 min-w-0">{feat.name}</span>
                    <span className="text-[9px] font-mono text-white/25 shrink-0">{feat.height}m</span>
                    <button onClick={(e) => { e.stopPropagation(); duplicateFeature(feat); }} title="Duplicate" className="w-5 h-5 rounded flex items-center justify-center text-white/15 hover:text-emerald-400 shrink-0"><Copy className="w-2.5 h-2.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); updateFeatureById(feat.id, { visible: !feat.visible }); }} title={feat.visible ? "Hide" : "Show"} className="w-5 h-5 rounded flex items-center justify-center text-white/20 hover:text-white/50 shrink-0">
                      {feat.visible ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); deleteFeatureById(feat.id); }} title="Delete" className="w-5 h-5 rounded flex items-center justify-center text-white/15 hover:text-red-400 shrink-0 opacity-0 group-hover:opacity-100"><X className="w-2.5 h-2.5" /></button>
                  </div>
                ))}
              </div>
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
  changeMode: (mode: string, options?: Record<string, unknown>) => void;
  delete: (id: string) => void;
  deleteAll: () => void;
  add: (geojson: GeoJSON.Feature | GeoJSON.FeatureCollection) => string[] | string;
};
