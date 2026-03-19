"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Settings2,
  ChevronDown,
  MapPin,
  Tag,
  EyeOff,
  Check,
  RotateCcw,
} from "lucide-react";
import { useCommandCenter } from "@/components/command-center-provider";
import {
  MAP_STYLES,
  type MapStyleId,
  DEFAULT_VIEW,
} from "@/lib/command-center-store";

interface MapSettingsProps {
  map: mapboxgl.Map | null;
}

export function MapSettings({ map }: MapSettingsProps) {
  const { settings, update } = useCommandCenter();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // ── Right-click context menu state ──────────────────────────
  const [ctxMenu, setCtxMenu] = useState<{ x: number; y: number; lng: number; lat: number } | null>(null);

  // Close panel on outside click
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  // ── Right-click handler on map ──────────────────────────────
  // Mapbox uses right-click-drag to adjust pitch/bearing, so we
  // only show the context menu when the user right-clicks WITHOUT
  // dragging (< 4px movement, < 300ms hold).
  const rightDownRef = useRef<{ x: number; y: number; t: number } | null>(null);

  useEffect(() => {
    if (!map) return;
    const canvas = map.getCanvas();

    function onMouseDown(e: MouseEvent) {
      if (e.button === 2) {
        rightDownRef.current = { x: e.clientX, y: e.clientY, t: Date.now() };
      }
    }

    function onContextMenu(e: mapboxgl.MapMouseEvent & { originalEvent: MouseEvent }) {
      const down = rightDownRef.current;
      rightDownRef.current = null;
      if (!down) return;

      const dx = e.originalEvent.clientX - down.x;
      const dy = e.originalEvent.clientY - down.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const duration = Date.now() - down.t;

      // If user dragged or held too long, it's a pitch/bearing gesture — skip menu
      if (dist > 4 || duration > 400) return;

      e.originalEvent.preventDefault();
      setCtxMenu({
        x: e.originalEvent.clientX,
        y: e.originalEvent.clientY,
        lng: e.lngLat.lng,
        lat: e.lngLat.lat,
      });
    }

    canvas.addEventListener("mousedown", onMouseDown);
    map.on("contextmenu", onContextMenu);
    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      map.off("contextmenu", onContextMenu);
    };
  }, [map]);

  // Close context menu on any click or scroll
  useEffect(() => {
    if (!ctxMenu) return;
    function close() { setCtxMenu(null); }
    // Small delay so the context menu doesn't close from the same right-click
    const timer = setTimeout(() => {
      window.addEventListener("mousedown", close);
      window.addEventListener("contextmenu", close);
      window.addEventListener("wheel", close);
    }, 50);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("mousedown", close);
      window.removeEventListener("contextmenu", close);
      window.removeEventListener("wheel", close);
    };
  }, [ctxMenu]);

  const setDefaultView = useCallback(() => {
    if (!map) return;
    const center = map.getCenter();
    update({
      defaultView: {
        lng: center.lng,
        lat: center.lat,
        zoom: map.getZoom(),
        pitch: map.getPitch(),
        bearing: map.getBearing(),
      },
    });
    setCtxMenu(null);
  }, [map, update]);

  const resetView = useCallback(() => {
    update({ defaultView: DEFAULT_VIEW });
    if (map) {
      map.flyTo({
        center: [DEFAULT_VIEW.lng, DEFAULT_VIEW.lat],
        zoom: DEFAULT_VIEW.zoom,
        pitch: DEFAULT_VIEW.pitch,
        bearing: DEFAULT_VIEW.bearing,
        duration: 1500,
      });
    }
  }, [map, update]);

  const changeStyle = useCallback(
    (id: MapStyleId) => {
      update({ mapStyle: id });
      // Style change handled by command-map via prop
    },
    [update],
  );

  const toggleLabels = useCallback(() => {
    update({ showLabels: !settings.showLabels });
  }, [settings.showLabels, update]);

  return (
    <>
      {/* ── Gear button ── */}
      <div ref={panelRef} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className={`
            flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs transition-all
            ${
              open
                ? "bg-white/15 border-white/20 text-white"
                : "bg-black/40 backdrop-blur-xl border-white/[0.08] text-white/60 hover:text-white hover:bg-black/60"
            }
          `}
          data-testid="map-settings-btn"
        >
          <Settings2 className="w-3.5 h-3.5" />
          {open && <span>Map Settings</span>}
        </button>

        {/* ── Dropdown panel ── */}
        {open && (
          <div className="absolute top-full left-0 mt-1.5 w-[260px] bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl shadow-black/50 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Map Style selector */}
            <div className="px-3 pt-3 pb-2">
              <p className="text-[10px] uppercase tracking-wider text-white/30 mb-2">Map Style</p>
              <div className="space-y-0.5 max-h-[200px] overflow-y-auto scrollbar-none">
                {MAP_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => changeStyle(style.id)}
                    className={`
                      w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors
                      ${settings.mapStyle === style.id
                        ? "bg-white/10 text-white"
                        : "text-white/50 hover:text-white/80 hover:bg-white/[0.05]"
                      }
                    `}
                    data-testid={`map-style-${style.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{style.label}</p>
                      <p className="text-[10px] text-white/30 truncate">{style.description}</p>
                    </div>
                    {settings.mapStyle === style.id && (
                      <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px bg-white/[0.06] mx-3" />

            {/* Toggle labels */}
            <button
              onClick={toggleLabels}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-white/60 hover:text-white/80 hover:bg-white/[0.03] transition-colors"
              data-testid="map-toggle-labels"
            >
              {settings.showLabels ? (
                <Tag className="w-3.5 h-3.5" />
              ) : (
                <EyeOff className="w-3.5 h-3.5" />
              )}
              <span className="text-xs flex-1">
                Labels {settings.showLabels ? "On" : "Off"}
              </span>
              <div
                className={`w-7 h-4 rounded-full transition-colors flex items-center px-0.5 ${
                  settings.showLabels ? "bg-emerald-500" : "bg-white/20"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full bg-white transition-transform ${
                    settings.showLabels ? "translate-x-3" : "translate-x-0"
                  }`}
                />
              </div>
            </button>

            <div className="h-px bg-white/[0.06] mx-3" />

            {/* Reset view */}
            <button
              onClick={resetView}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-white/60 hover:text-white/80 hover:bg-white/[0.03] transition-colors"
              data-testid="map-reset-view"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="text-xs">Reset to Default View</span>
            </button>

            {/* Current default coords */}
            <div className="px-3 pb-3 pt-1">
              <p className="text-[9px] font-mono text-white/20 leading-relaxed">
                Default: {settings.defaultView.lat.toFixed(4)}, {settings.defaultView.lng.toFixed(4)}
                &nbsp;z{settings.defaultView.zoom.toFixed(1)} p{settings.defaultView.pitch.toFixed(0)}° b{settings.defaultView.bearing.toFixed(0)}°
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Right-click context menu ── */}
      {ctxMenu && (
        <div
          className="fixed z-[100] bg-black/85 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl shadow-black/50 py-1 min-w-[200px] animate-in fade-in zoom-in-95 duration-100"
          style={{ left: ctxMenu.x, top: ctxMenu.y }}
        >
          <button
            onClick={setDefaultView}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
            data-testid="ctx-set-default-view"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs">Set as Default View</span>
          </button>
          <div className="h-px bg-white/[0.06] mx-2" />
          <div className="px-3 py-1.5">
            <p className="text-[9px] font-mono text-white/25">
              {ctxMenu.lat.toFixed(5)}, {ctxMenu.lng.toFixed(5)}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
