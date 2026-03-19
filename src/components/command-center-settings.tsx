"use client";

import { useState, useRef, useCallback } from "react";
import {
  Map,
  Image,
  Paintbrush,
  Blend,
  ImagePlus,
  Trash2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Check,
  Upload,
  Move,
  ZoomIn,
} from "lucide-react";
import { useCommandCenter } from "@/components/command-center-provider";
import {
  MAP_STYLES,
  DEFAULT_SETTINGS,
  type BackgroundMode,
  type LogoPosition,
  type MapStyleId,
} from "@/lib/command-center-store";

// ─── Shared slider class ────────────────────────────────────────

const SLIDER_CLS =
  "flex-1 h-1 appearance-none bg-white/10 rounded-full cursor-pointer [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:bg-white/70";

// ─── Background mode options ────────────────────────────────────

const BG_MODES: { id: BackgroundMode; label: string; icon: React.ElementType; description: string }[] = [
  { id: "interactive-map", label: "Interactive Map", icon: Map, description: "Live Mapbox satellite/terrain map" },
  { id: "static-image", label: "Static Image", icon: Image, description: "Upload a custom background image" },
  { id: "solid-color", label: "Solid Color", icon: Paintbrush, description: "Single solid background color" },
  { id: "gradient", label: "Gradient", icon: Blend, description: "Two-color gradient background" },
];

const LOGO_POSITIONS: { id: LogoPosition; label: string }[] = [
  { id: "top-left", label: "Top Left" },
  { id: "top-center", label: "Top Center" },
  { id: "top-right", label: "Top Right" },
  { id: "center", label: "Center" },
  { id: "bottom-left", label: "Bottom Left" },
  { id: "bottom-center", label: "Bottom Center" },
  { id: "bottom-right", label: "Bottom Right" },
];

// ─── Component ──────────────────────────────────────────────────

export function CommandCenterSettingsPanel() {
  const { settings, update, reset } = useCommandCenter();
  const [prefsOpen, setPrefsOpen] = useState(true);
  const [bgOpen, setBgOpen] = useState(true);
  const [logoOpen, setLogoOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // ── Image upload handlers ──────────────────────────────────

  const handleBgImageUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      update({ staticImageUrl: url, backgroundMode: "static-image" });
      e.target.value = "";
    },
    [update],
  );

  const handleLogoUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      update({ logoUrl: url, logoEnabled: true });
      e.target.value = "";
    },
    [update],
  );

  return (
    <div className="space-y-1">
      {/* ═══════════════════════════════════════════════════════════
          PREFERENCES
      ═══════════════════════════════════════════════════════════ */}
      <button
        onClick={() => setPrefsOpen(!prefsOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Map className="w-4 h-4 text-muted-foreground" />
          <div className="text-left">
            <p className="text-sm font-medium">Preferences</p>
            <p className="text-[10px] text-muted-foreground">Map style, labels, default view</p>
          </div>
        </div>
        {prefsOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {prefsOpen && (
        <div className="px-4 pb-4 space-y-4">
          {/* Map style selector */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Map Style</p>
            <div className="grid grid-cols-2 gap-1.5">
              {MAP_STYLES.map((style) => (
                <button
                  key={style.id}
                  onClick={() => update({ mapStyle: style.id })}
                  className={`px-2.5 py-2 rounded-md text-left text-xs transition-colors border ${
                    settings.mapStyle === style.id
                      ? "border-emerald-500/50 bg-emerald-500/10 text-foreground"
                      : "border-transparent bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  <p className="font-medium truncate">{style.label}</p>
                  <p className="text-[9px] text-muted-foreground truncate mt-0.5">{style.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Labels toggle */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Show Map Labels</p>
            <button
              onClick={() => update({ showLabels: !settings.showLabels })}
              className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                settings.showLabels ? "bg-emerald-500" : "bg-muted"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${
                  settings.showLabels ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Default view info */}
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Default View</p>
            <p className="text-[10px] font-mono text-muted-foreground">
              {settings.defaultView.lat.toFixed(4)}, {settings.defaultView.lng.toFixed(4)} · z{settings.defaultView.zoom.toFixed(1)} · p{settings.defaultView.pitch.toFixed(0)}° · b{settings.defaultView.bearing.toFixed(0)}°
            </p>
            <p className="text-[9px] text-muted-foreground/60 mt-1">Right-click on the map to set a new default view</p>
          </div>
        </div>
      )}

      <div className="h-px bg-border" />

      {/* ═══════════════════════════════════════════════════════════
          BACKGROUND
      ═══════════════════════════════════════════════════════════ */}
      <button
        onClick={() => setBgOpen(!bgOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Paintbrush className="w-4 h-4 text-muted-foreground" />
          <div className="text-left">
            <p className="text-sm font-medium">Background</p>
            <p className="text-[10px] text-muted-foreground">Map, image, color, or gradient</p>
          </div>
        </div>
        {bgOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {bgOpen && (
        <div className="px-4 pb-4 space-y-4">
          {/* Mode selector */}
          <div className="space-y-1">
            {BG_MODES.map((mode) => {
              const Icon = mode.icon;
              const active = settings.backgroundMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => update({ backgroundMode: mode.id })}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-left text-xs transition-colors border ${
                    active
                      ? "border-emerald-500/50 bg-emerald-500/10 text-foreground"
                      : "border-transparent text-muted-foreground hover:bg-muted/30"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{mode.label}</p>
                    <p className="text-[9px] text-muted-foreground">{mode.description}</p>
                  </div>
                  {active && <Check className="w-3 h-3 text-emerald-400 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* ── Static Image controls ── */}
          {settings.backgroundMode === "static-image" && (
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleBgImageUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-md border border-dashed border-muted-foreground/30 text-xs text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{settings.staticImageUrl ? "Replace Image" : "Upload Image"}</span>
              </button>
              {settings.staticImageUrl && (
                <div className="relative w-full h-20 rounded-md overflow-hidden border border-border">
                  <img src={settings.staticImageUrl} alt="Background preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => update({ staticImageUrl: null })}
                    className="absolute top-1 right-1 p-1 rounded bg-black/60 hover:bg-black/80 transition-colors"
                  >
                    <Trash2 className="w-3 h-3 text-white/70" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ── Solid Color controls ── */}
          {settings.backgroundMode === "solid-color" && (
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Color</p>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={settings.solidColor}
                  onChange={(e) => update({ solidColor: e.target.value })}
                  className="w-8 h-8 rounded border border-border cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  value={settings.solidColor}
                  onChange={(e) => update({ solidColor: e.target.value })}
                  className="flex-1 px-2 py-1 rounded-md bg-muted/50 border border-border text-xs font-mono text-foreground"
                />
              </div>
              {/* Preview */}
              <div
                className="w-full h-12 rounded-md border border-border"
                style={{ backgroundColor: settings.solidColor }}
              />
            </div>
          )}

          {/* ── Gradient controls ── */}
          {settings.backgroundMode === "gradient" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Start</p>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={settings.gradientStart}
                      onChange={(e) => update({ gradientStart: e.target.value })}
                      className="w-7 h-7 rounded border border-border cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.gradientStart}
                      onChange={(e) => update({ gradientStart: e.target.value })}
                      className="flex-1 px-1.5 py-1 rounded bg-muted/50 border border-border text-[10px] font-mono text-foreground min-w-0"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">End</p>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="color"
                      value={settings.gradientEnd}
                      onChange={(e) => update({ gradientEnd: e.target.value })}
                      className="w-7 h-7 rounded border border-border cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.gradientEnd}
                      onChange={(e) => update({ gradientEnd: e.target.value })}
                      className="flex-1 px-1.5 py-1 rounded bg-muted/50 border border-border text-[10px] font-mono text-foreground min-w-0"
                    />
                  </div>
                </div>
              </div>
              {/* Angle slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] text-muted-foreground">Angle</p>
                  <span className="text-[10px] font-mono text-muted-foreground">{settings.gradientAngle}°</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={settings.gradientAngle}
                  onChange={(e) => update({ gradientAngle: Number(e.target.value) })}
                  className={SLIDER_CLS}
                />
              </div>
              {/* Preview */}
              <div
                className="w-full h-12 rounded-md border border-border"
                style={{
                  background: `linear-gradient(${settings.gradientAngle}deg, ${settings.gradientStart}, ${settings.gradientEnd})`,
                }}
              />
            </div>
          )}
        </div>
      )}

      <div className="h-px bg-border" />

      {/* ═══════════════════════════════════════════════════════════
          LOGO OVERLAY
      ═══════════════════════════════════════════════════════════ */}
      <button
        onClick={() => setLogoOpen(!logoOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <ImagePlus className="w-4 h-4 text-muted-foreground" />
          <div className="text-left">
            <p className="text-sm font-medium">Logo Overlay</p>
            <p className="text-[10px] text-muted-foreground">Display company logo on background</p>
          </div>
        </div>
        {logoOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {logoOpen && (
        <div className="px-4 pb-4 space-y-3">
          {/* Enable toggle */}
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Show Logo</p>
            <button
              onClick={() => update({ logoEnabled: !settings.logoEnabled })}
              className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                settings.logoEnabled ? "bg-emerald-500" : "bg-muted"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${
                  settings.logoEnabled ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Upload */}
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoUpload}
          />
          <button
            onClick={() => logoInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-dashed border-muted-foreground/30 text-xs text-muted-foreground hover:border-muted-foreground/50 hover:text-foreground transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{settings.logoUrl ? "Replace Logo" : "Upload Logo"}</span>
          </button>

          {settings.logoUrl && (
            <div className="flex items-center gap-2 p-2 rounded-md bg-muted/30 border border-border">
              <img src={settings.logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded" />
              <span className="text-[10px] text-muted-foreground flex-1">Logo uploaded</span>
              <button onClick={() => update({ logoUrl: null, logoEnabled: false })} className="p-1 hover:bg-muted rounded">
                <Trash2 className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
          )}

          {/* Position */}
          <div>
            <p className="text-[10px] text-muted-foreground mb-1.5">Position</p>
            <div className="grid grid-cols-3 gap-1">
              {LOGO_POSITIONS.map((pos) => (
                <button
                  key={pos.id}
                  onClick={() => update({ logoPosition: pos.id })}
                  className={`px-2 py-1.5 rounded text-[10px] transition-colors border ${
                    settings.logoPosition === pos.id
                      ? "border-emerald-500/50 bg-emerald-500/10 text-foreground"
                      : "border-transparent bg-muted/30 text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scale */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] text-muted-foreground">Scale</p>
              <span className="text-[10px] font-mono text-muted-foreground">{Math.round(settings.logoScale * 100)}%</span>
            </div>
            <input
              type="range"
              min={10}
              max={200}
              value={Math.round(settings.logoScale * 100)}
              onChange={(e) => update({ logoScale: Number(e.target.value) / 100 })}
              className={SLIDER_CLS}
            />
          </div>

          {/* Opacity */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] text-muted-foreground">Opacity</p>
              <span className="text-[10px] font-mono text-muted-foreground">{Math.round(settings.logoOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              value={Math.round(settings.logoOpacity * 100)}
              onChange={(e) => update({ logoOpacity: Number(e.target.value) / 100 })}
              className={SLIDER_CLS}
            />
          </div>
        </div>
      )}

      <div className="h-px bg-border" />

      {/* Reset all */}
      <button
        onClick={reset}
        className="w-full flex items-center gap-2.5 px-4 py-3 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Reset All to Defaults</span>
      </button>
    </div>
  );
}
