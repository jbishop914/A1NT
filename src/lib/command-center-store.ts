/**
 * Command Center settings store.
 *
 * Uses React state lifted through a context provider so that the
 * Command Center page AND the Settings page can read/write the same values.
 * Values are persisted to localStorage (if available) so they survive reloads.
 */

// ─── Types ──────────────────────────────────────────────────────

export type MapStyleId =
  | "satellite-streets"
  | "satellite"
  | "outdoors"
  | "streets"
  | "light"
  | "dark"
  | "nav-day"
  | "nav-night";

export interface MapStyleOption {
  id: MapStyleId;
  label: string;
  url: string;
  description: string;
}

export type BackgroundMode = "interactive-map" | "static-image" | "solid-color" | "gradient";

export type LogoPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "center"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface DefaultView {
  lng: number;
  lat: number;
  zoom: number;
  pitch: number;
  bearing: number;
}

export interface CommandCenterSettings {
  // ── Map ─────────────────────────────────────────────────────
  mapStyle: MapStyleId;
  showLabels: boolean;
  defaultView: DefaultView;

  // ── Background ──────────────────────────────────────────────
  backgroundMode: BackgroundMode;
  /** URL for uploaded static image */
  staticImageUrl: string | null;
  solidColor: string;
  gradientStart: string;
  gradientEnd: string;
  gradientAngle: number;

  // ── Logo overlay ────────────────────────────────────────────
  logoEnabled: boolean;
  logoUrl: string | null;
  logoPosition: LogoPosition;
  logoScale: number; // 0.1 – 2
  logoOpacity: number; // 0 – 1
}

// ─── Defaults ───────────────────────────────────────────────────

export const DEFAULT_VIEW: DefaultView = {
  lng: -72.8685,
  lat: 41.4989,
  zoom: 17,
  pitch: 60,
  bearing: -30,
};

export const DEFAULT_SETTINGS: CommandCenterSettings = {
  mapStyle: "satellite-streets",
  showLabels: true,
  defaultView: DEFAULT_VIEW,

  backgroundMode: "interactive-map",
  staticImageUrl: null,
  solidColor: "#0a0a0a",
  gradientStart: "#0a0a0a",
  gradientEnd: "#1e293b",
  gradientAngle: 180,

  logoEnabled: false,
  logoUrl: null,
  logoPosition: "center",
  logoScale: 0.5,
  logoOpacity: 0.15,
};

// ─── Map style catalogue ────────────────────────────────────────

export const MAP_STYLES: MapStyleOption[] = [
  {
    id: "satellite-streets",
    label: "Satellite Streets",
    url: "mapbox://styles/mapbox/satellite-streets-v12",
    description: "Satellite imagery with road & place labels",
  },
  {
    id: "satellite",
    label: "Satellite",
    url: "mapbox://styles/mapbox/satellite-v9",
    description: "Pure satellite imagery, no labels",
  },
  {
    id: "outdoors",
    label: "Outdoors / Topo",
    url: "mapbox://styles/mapbox/outdoors-v12",
    description: "Topographic contours, trails, terrain",
  },
  {
    id: "streets",
    label: "Streets",
    url: "mapbox://styles/mapbox/streets-v12",
    description: "General-purpose road & transit map",
  },
  {
    id: "light",
    label: "Light",
    url: "mapbox://styles/mapbox/light-v11",
    description: "Clean minimal light theme",
  },
  {
    id: "dark",
    label: "Dark",
    url: "mapbox://styles/mapbox/dark-v11",
    description: "Dark monochrome theme",
  },
  {
    id: "nav-day",
    label: "Navigation Day",
    url: "mapbox://styles/mapbox/navigation-day-v1",
    description: "Optimised for driving, daytime palette",
  },
  {
    id: "nav-night",
    label: "Navigation Night",
    url: "mapbox://styles/mapbox/navigation-night-v1",
    description: "Optimised for driving, night palette",
  },
];

// ─── Persistence helpers ────────────────────────────────────────

const STORAGE_KEY = "a1-cc-settings";

export function loadSettings(): CommandCenterSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: CommandCenterSettings) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage full or blocked — ignore
  }
}

export function getMapStyleUrl(id: MapStyleId): string {
  return MAP_STYLES.find((s) => s.id === id)?.url ?? MAP_STYLES[0].url;
}
