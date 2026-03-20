/* ─── Booking Widget Pre-Made Themes ──────────────────────────────
   6 starter themes: 3 light, 3 dark. Each theme defines a full
   color token set that the widget applies via CSS variables.
   ──────────────────────────────────────────────────────────────── */

export interface BookingTheme {
  id: string;
  name: string;
  mode: "light" | "dark";
  colors: {
    /* Surfaces */
    bg: string;           // Main background
    bgCard: string;       // Card/panel background
    bgMuted: string;      // Muted/secondary background
    border: string;       // Border color
    /* Text */
    text: string;         // Primary text
    textMuted: string;    // Secondary text
    textInverse: string;  // Text on accent backgrounds
    /* Accent */
    accent: string;       // Primary accent (buttons, active states)
    accentHover: string;  // Accent hover
    accentMuted: string;  // Accent at low opacity (badges, subtle highlights)
    /* Status */
    success: string;
    error: string;
    warning: string;
  };
}

export const BOOKING_THEMES: BookingTheme[] = [
  /* ── Light Themes ── */
  {
    id: "clean-light",
    name: "Clean Light",
    mode: "light",
    colors: {
      bg: "#ffffff",
      bgCard: "#f9fafb",
      bgMuted: "#f3f4f6",
      border: "#e5e7eb",
      text: "#111827",
      textMuted: "#6b7280",
      textInverse: "#ffffff",
      accent: "#2563eb",
      accentHover: "#1d4ed8",
      accentMuted: "rgba(37, 99, 235, 0.08)",
      success: "#059669",
      error: "#dc2626",
      warning: "#d97706",
    },
  },
  {
    id: "warm-light",
    name: "Warm Light",
    mode: "light",
    colors: {
      bg: "#fffbf5",
      bgCard: "#fef7ed",
      bgMuted: "#fdf2e2",
      border: "#e8ddd0",
      text: "#1c1917",
      textMuted: "#78716c",
      textInverse: "#ffffff",
      accent: "#ea580c",
      accentHover: "#c2410c",
      accentMuted: "rgba(234, 88, 12, 0.08)",
      success: "#059669",
      error: "#dc2626",
      warning: "#d97706",
    },
  },
  {
    id: "emerald-light",
    name: "Emerald Light",
    mode: "light",
    colors: {
      bg: "#f0fdf4",
      bgCard: "#f7fef9",
      bgMuted: "#ecfdf5",
      border: "#d1e7d8",
      text: "#14532d",
      textMuted: "#4d7c5f",
      textInverse: "#ffffff",
      accent: "#059669",
      accentHover: "#047857",
      accentMuted: "rgba(5, 150, 105, 0.08)",
      success: "#059669",
      error: "#dc2626",
      warning: "#d97706",
    },
  },

  /* ── Dark Themes ── */
  {
    id: "slate-dark",
    name: "Slate Dark",
    mode: "dark",
    colors: {
      bg: "#0f172a",
      bgCard: "#1e293b",
      bgMuted: "#334155",
      border: "#334155",
      text: "#f1f5f9",
      textMuted: "#94a3b8",
      textInverse: "#0f172a",
      accent: "#3b82f6",
      accentHover: "#60a5fa",
      accentMuted: "rgba(59, 130, 246, 0.12)",
      success: "#10b981",
      error: "#ef4444",
      warning: "#f59e0b",
    },
  },
  {
    id: "carbon-dark",
    name: "Carbon Dark",
    mode: "dark",
    colors: {
      bg: "#09090b",
      bgCard: "#18181b",
      bgMuted: "#27272a",
      border: "#27272a",
      text: "#fafafa",
      textMuted: "#71717a",
      textInverse: "#09090b",
      accent: "#a855f7",
      accentHover: "#c084fc",
      accentMuted: "rgba(168, 85, 247, 0.12)",
      success: "#10b981",
      error: "#ef4444",
      warning: "#f59e0b",
    },
  },
  {
    id: "midnight-dark",
    name: "Midnight",
    mode: "dark",
    colors: {
      bg: "#0c0a09",
      bgCard: "#1c1917",
      bgMuted: "#292524",
      border: "#292524",
      text: "#fafaf9",
      textMuted: "#a8a29e",
      textInverse: "#0c0a09",
      accent: "#10b981",
      accentHover: "#34d399",
      accentMuted: "rgba(16, 185, 129, 0.12)",
      success: "#10b981",
      error: "#ef4444",
      warning: "#f59e0b",
    },
  },
];

export function getTheme(id: string): BookingTheme {
  return BOOKING_THEMES.find((t) => t.id === id) || BOOKING_THEMES[0];
}

/**
 * Convert a BookingTheme to CSS custom properties
 */
export function themeToCSSVars(theme: BookingTheme): Record<string, string> {
  return {
    "--bw-bg": theme.colors.bg,
    "--bw-bg-card": theme.colors.bgCard,
    "--bw-bg-muted": theme.colors.bgMuted,
    "--bw-border": theme.colors.border,
    "--bw-text": theme.colors.text,
    "--bw-text-muted": theme.colors.textMuted,
    "--bw-text-inverse": theme.colors.textInverse,
    "--bw-accent": theme.colors.accent,
    "--bw-accent-hover": theme.colors.accentHover,
    "--bw-accent-muted": theme.colors.accentMuted,
    "--bw-success": theme.colors.success,
    "--bw-error": theme.colors.error,
    "--bw-warning": theme.colors.warning,
  };
}
