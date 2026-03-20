"use client";

import { useState } from "react";
import {
  Play,
  Building2,
  Sparkles,
  Clock,
  ArrowRight,
  Wrench,
  Car,
  UtensilsCrossed,
  Leaf,
  Package,
  Factory,
  Hotel,
  Layers,
  CheckCircle2,
  Info,
} from "lucide-react";
import { DemoTourProvider } from "@/components/demo-tour/demo-tour-provider";
import { DemoTourOverlay } from "@/components/demo-tour/demo-tour-overlay";
import { useDemoTour } from "@/components/demo-tour/demo-tour-provider";

// ─── Industry Sandbox Data ────────────────────────────────────────────────

const industries = [
  { id: "plumbing", label: "Plumbing & HVAC", icon: Wrench, description: "Service calls, AC tune-ups, emergency dispatch" },
  { id: "auto", label: "Auto Repair", icon: Car, description: "Repair orders, parts inventory, fleet intake" },
  { id: "restaurant", label: "Restaurant", icon: UtensilsCrossed, description: "Reservations, staff, supplier orders, POS" },
  { id: "cleaning", label: "Cleaning Service", icon: Sparkles, description: "Route scheduling, recurring clients, supplies" },
  { id: "landscaping", label: "Landscaping", icon: Leaf, description: "Seasonal jobs, crew routing, equipment" },
  { id: "manufacturing", label: "Manufacturing", icon: Factory, description: "Work orders, BOM, quality control" },
  { id: "wholesale", label: "Wholesale", icon: Package, description: "PO management, inventory, client billing" },
  { id: "hospitality", label: "Hospitality", icon: Hotel, description: "Bookings, housekeeping, maintenance tickets" },
];

// ─── Tour Features list ─────────────────────────────────────────────────────

const tourFeatures = [
  "16 connected modules, one seamless story",
  "AI Receptionist, Scheduling, Invoicing & more",
  "Real-time updates with zero manual handoffs",
  "Interactive — pause, rewind, or skip ahead",
];

// ─── Inner component (needs context) ────────────────────────────────────────

function DemoTrainingContent() {
  const { startTour } = useDemoTour();
  const [launchHovered, setLaunchHovered] = useState<string | null>(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const showComingSoon = (label: string) => {
    setToastMessage(`${label} sandbox — coming soon`);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3000);
  };

  return (
    <div
      className="min-h-screen bg-background relative"
      data-tour="demo-summary"
    >
      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="px-8 pt-8 pb-0">
        <div className="max-w-5xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-5">
            <Layers className="w-3 h-3" />
            <span>Platform</span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-foreground/70">Demo & Training</span>
          </div>

          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
            Experience A1 Integrations
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-lg">
            See the platform in action. Choose your demo experience.
          </p>
        </div>
      </div>

      {/* ── Divider ──────────────────────────────────────────────────── */}
      <div className="mx-8 mt-6 mb-6 h-px bg-border" />

      {/* ── Three-card grid ──────────────────────────────────────────── */}
      <div className="px-8 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-5 max-w-5xl">

        {/* ────────────────────────────────────────────────────────────
            Card 1: Guided Story Tour
        ──────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-1 flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          {/* Top accent strip */}
          <div className="h-0.5 bg-foreground/80" />

          <div className="p-5 flex flex-col flex-1">
            {/* Header row */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-9 h-9 rounded-lg bg-foreground/[0.06] flex items-center justify-center">
                <Play className="w-4 h-4 text-foreground/70" />
              </div>
              <span
                className="
                  text-[10px] font-semibold uppercase tracking-widest
                  px-2 py-0.5 rounded-full
                  bg-foreground/[0.06] text-foreground/60
                  border border-border
                "
              >
                Recommended
              </span>
            </div>

            {/* Title + description */}
            <h2 className="text-[15px] font-semibold text-foreground mb-2">
              Guided Platform Tour
            </h2>
            <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
              Watch a complete business workflow unfold — from the first
              customer call through final payment. Interactive, narrated, and
              hands-on.
            </p>

            {/* Feature list */}
            <ul className="space-y-1.5 mb-5">
              {tourFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-foreground/30 shrink-0 mt-0.5" />
                  <span className="text-[12px] text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>

            {/* Duration indicator */}
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/60 mb-5">
              <Clock className="w-3 h-3" />
              <span>~8 minutes</span>
            </div>

            {/* Spacer push to bottom */}
            <div className="flex-1" />

            {/* CTA */}
            <button
              onClick={startTour}
              className="
                w-full flex items-center justify-center gap-2
                bg-foreground text-background
                text-[13px] font-medium
                py-2.5 rounded-lg
                hover:bg-foreground/90 active:scale-[0.98]
                transition-all duration-150
              "
              data-testid="btn-start-tour"
            >
              <Play className="w-3.5 h-3.5" />
              Start Tour
            </button>
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────────
            Card 2: Industry Sandbox
        ──────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-1 flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="h-0.5 bg-border" />

          <div className="p-5 flex flex-col flex-1" id="sandbox">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-9 h-9 rounded-lg bg-foreground/[0.06] flex items-center justify-center">
                <Building2 className="w-4 h-4 text-foreground/70" />
              </div>
              <span
                className="
                  text-[10px] font-semibold uppercase tracking-widest
                  px-2 py-0.5 rounded-full
                  bg-muted text-muted-foreground/60
                  border border-border
                "
              >
                Coming Soon
              </span>
            </div>

            <h2 className="text-[15px] font-semibold text-foreground mb-2">
              Industry Sandbox
            </h2>
            <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
              Explore a fully populated demo environment for your industry. Real
              data, active AI agents, and full module access — pre-loaded for
              your vertical.
            </p>

            {/* Industry grid */}
            <div className="grid grid-cols-2 gap-1.5 mb-5">
              {industries.map((ind) => {
                const Icon = ind.icon;
                return (
                  <button
                    key={ind.id}
                    onClick={() => showComingSoon(ind.label)}
                    onMouseEnter={() => setLaunchHovered(ind.id)}
                    onMouseLeave={() => setLaunchHovered(null)}
                    className="
                      relative flex items-center gap-2 p-2.5 rounded-lg
                      border border-border bg-background
                      hover:border-border hover:bg-accent/40
                      text-left transition-all duration-150
                      group overflow-hidden
                    "
                    data-testid={`btn-sandbox-${ind.id}`}
                    aria-label={`${ind.label} sandbox — coming soon`}
                  >
                    {/* Coming soon overlay on hover */}
                    {launchHovered === ind.id && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-lg z-10">
                        <span className="text-[10px] font-medium text-muted-foreground">
                          Coming Soon
                        </span>
                      </div>
                    )}
                    <Icon className="w-3.5 h-3.5 text-foreground/40 shrink-0" />
                    <span className="text-[11px] text-foreground/70 truncate">
                      {ind.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex-1" />

            {/* Disabled CTA */}
            <button
              disabled
              className="
                w-full flex items-center justify-center gap-2
                bg-muted text-muted-foreground/40
                text-[13px] font-medium
                py-2.5 rounded-lg
                cursor-not-allowed
                border border-border
              "
              data-testid="btn-sandbox-launch"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              Select an Industry
            </button>
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────────
            Card 3: Personal Preview
        ──────────────────────────────────────────────────────────── */}
        <div className="lg:col-span-1 flex flex-col bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          <div className="h-0.5 bg-border" />

          <div className="p-5 flex flex-col flex-1" id="preview">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="w-9 h-9 rounded-lg bg-foreground/[0.06] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-foreground/70" />
              </div>
              <span
                className="
                  text-[10px] font-semibold uppercase tracking-widest
                  px-2 py-0.5 rounded-full
                  bg-muted text-muted-foreground/60
                  border border-border
                "
              >
                Coming Soon
              </span>
            </div>

            <h2 className="text-[15px] font-semibold text-foreground mb-2">
              See Your Business on A1
            </h2>
            <p className="text-[13px] text-muted-foreground leading-relaxed mb-5">
              Enter your company details and see a personalized preview of how
              A1 Integrations would work for your business — including AI agent
              suggestions and ROI projections.
            </p>

            {/* Form fields (disabled) */}
            <div className="space-y-2.5 mb-5">
              <div>
                <label className="block text-[11px] text-muted-foreground/60 mb-1">
                  Company Name
                </label>
                <input
                  disabled
                  placeholder="e.g. TripleA Plumbing"
                  className="
                    w-full px-3 py-2 rounded-lg text-[13px]
                    bg-muted/40 border border-border
                    text-muted-foreground/40 placeholder:text-muted-foreground/25
                    cursor-not-allowed
                    focus:outline-none
                  "
                  data-testid="input-company-name"
                />
              </div>

              <div>
                <label className="block text-[11px] text-muted-foreground/60 mb-1">
                  Industry
                </label>
                <select
                  disabled
                  className="
                    w-full px-3 py-2 rounded-lg text-[13px]
                    bg-muted/40 border border-border
                    text-muted-foreground/40
                    cursor-not-allowed
                    focus:outline-none appearance-none
                  "
                  data-testid="select-industry"
                >
                  <option>Select industry…</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-muted-foreground/60 mb-1">
                    Employee Count
                  </label>
                  <input
                    disabled
                    placeholder="e.g. 12"
                    className="
                      w-full px-3 py-2 rounded-lg text-[13px]
                      bg-muted/40 border border-border
                      text-muted-foreground/40 placeholder:text-muted-foreground/25
                      cursor-not-allowed focus:outline-none
                    "
                    data-testid="input-employee-count"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-muted-foreground/60 mb-1">
                    Primary Services
                  </label>
                  <input
                    disabled
                    placeholder="e.g. HVAC, Plumbing"
                    className="
                      w-full px-3 py-2 rounded-lg text-[13px]
                      bg-muted/40 border border-border
                      text-muted-foreground/40 placeholder:text-muted-foreground/25
                      cursor-not-allowed focus:outline-none
                    "
                    data-testid="input-services"
                  />
                </div>
              </div>
            </div>

            <div className="flex-1" />

            {/* Disabled CTA */}
            <button
              disabled
              onClick={() => showComingSoon("Personal Preview")}
              className="
                w-full flex items-center justify-center gap-2
                bg-muted text-muted-foreground/40
                text-[13px] font-medium
                py-2.5 rounded-lg
                cursor-not-allowed
                border border-border
              "
              data-testid="btn-generate-preview"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Generate Preview
            </button>

            {/* Coming soon note */}
            <p className="mt-2.5 flex items-center gap-1.5 text-[11px] text-muted-foreground/40">
              <Info className="w-3 h-3 shrink-0" />
              Personalized preview generation coming in a future release.
            </p>
          </div>
        </div>
      </div>

      {/* ── Toast notification ─────────────────────────────────────── */}
      <div
        className={`
          fixed bottom-6 left-1/2 -translate-x-1/2 z-50
          flex items-center gap-2
          bg-foreground text-background text-[12px] font-medium
          px-4 py-2.5 rounded-full shadow-xl
          transition-all duration-300 ease-out
          ${toastVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"}
        `}
        role="status"
        aria-live="polite"
      >
        <Clock className="w-3.5 h-3.5 opacity-70" />
        {toastMessage}
      </div>

      {/* ── Demo Tour Overlay ──────────────────────────────────────── */}
      <DemoTourOverlay />
    </div>
  );
}

// ─── Page wrapper with Provider ─────────────────────────────────────────────

export default function DemoTrainingPage() {
  return (
    <DemoTourProvider>
      <DemoTrainingContent />
    </DemoTourProvider>
  );
}
