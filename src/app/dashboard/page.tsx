"use client";

import { useState, useCallback } from "react";
import { CommandMap } from "@/components/command-map";
import { MapSearch } from "@/components/map-search";
import { MapDraw } from "@/components/map-draw";
import { MapSettings } from "@/components/map-settings";
import { CameraWidget } from "@/components/camera-widget";
import { useCommandCenter } from "@/components/command-center-provider";
import {
  Plus,
  FileText,
  Users,
  ClipboardList,
  ArrowUpRight,
  Clock,
  DollarSign,
  Briefcase,
  UserCheck,
  Receipt,
  Video,
  ChevronDown,
  ChevronUp,
  Activity,
  MapPin,
} from "lucide-react";
import { MessagesIndicator } from "@/components/messages-indicator";

// ─── Sample data ────────────────────────────────────────────────

const kpis = [
  { label: "Revenue (MTD)", value: "$24,580", change: "+12.5%", trend: "up" as const, icon: DollarSign },
  { label: "Active Jobs", value: "18", change: "+3", trend: "up" as const, icon: Briefcase },
  { label: "Active Clients", value: "142", change: "+8", trend: "up" as const, icon: UserCheck },
  { label: "Open Invoices", value: "$8,340", sub: "6 pending", icon: Receipt },
];

const recentActivity = [
  { id: 1, type: "work-order", title: "Work order completed", detail: "WO-1084 — Water heater install at 742 Evergreen", time: "12 min ago", dot: "bg-emerald-500" },
  { id: 2, type: "client", title: "New client added", detail: "Riverside Property Management", time: "34 min ago", dot: "bg-blue-500" },
  { id: 3, type: "invoice", title: "Invoice sent", detail: "INV-2091 — $1,240.00 to Martinez Residence", time: "1 hr ago", dot: "bg-white/40" },
  { id: 4, type: "call", title: "Call received", detail: "AI receptionist captured lead — emergency drain repair", time: "1 hr ago", dot: "bg-white/40" },
  { id: 5, type: "payment", title: "Payment received", detail: "INV-2088 — $680.00 from Oak Street Apartments", time: "2 hr ago", dot: "bg-emerald-500" },
];

const schedule = [
  { time: "8:00 AM", title: "HVAC inspection", location: "12 Oak Lane", tech: "Mike R.", status: "Completed" },
  { time: "9:30 AM", title: "Furnace repair", location: "88 Pine St", tech: "Dave S.", status: "In Progress" },
  { time: "11:00 AM", title: "Water heater install", location: "742 Evergreen Ter", tech: "Mike R.", status: "Completed" },
  { time: "1:00 PM", title: "AC maintenance", location: "305 Cedar Ave", tech: "Lisa K.", status: "Scheduled" },
  { time: "2:30 PM", title: "Pipe leak fix", location: "19 Maple Dr", tech: "Dave S.", status: "Scheduled" },
];

type CamStatus = "online" | "offline" | "recording" | "motion";
const mockCameras: { id: string; name: string; location: string; status: CamStatus; isDoorbell?: boolean }[] = [
  { id: "cam-front", name: "Front Entrance", location: "Main Building — Door 1", status: "online", isDoorbell: true },
  { id: "cam-yard", name: "Equipment Yard", location: "South Lot", status: "recording" },
  { id: "cam-office", name: "Office", location: "Main Building — Interior", status: "online" },
];

// ─── Logo position → CSS helper ─────────────────────────────────

function logoPositionClasses(pos: string): string {
  switch (pos) {
    case "top-left":      return "top-[160px] left-3";
    case "top-center":    return "top-[160px] left-1/2 -translate-x-1/2";
    case "top-right":     return "top-[160px] right-[360px]";
    case "center":        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
    case "bottom-left":   return "bottom-3 left-3";
    case "bottom-center": return "bottom-3 left-1/2 -translate-x-1/2";
    case "bottom-right":  return "bottom-3 right-3";
    default:              return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
  }
}

// ─── Component ──────────────────────────────────────────────────

export default function CommandCenter() {
  const { settings } = useCommandCenter();
  const [showCameras, setShowCameras] = useState(true);
  const [showActivity, setShowActivity] = useState(true);
  const [showSchedule, setShowSchedule] = useState(true);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);

  const handleMapReady = useCallback((map: mapboxgl.Map) => {
    setMapInstance(map);
  }, []);

  const isMapMode = settings.backgroundMode === "interactive-map";

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* ── Background layer ── */}
      {isMapMode ? (
        <CommandMap onMapReady={handleMapReady} />
      ) : (
        <div
          className="absolute inset-0 w-full h-full"
          style={
            settings.backgroundMode === "solid-color"
              ? { backgroundColor: settings.solidColor }
              : settings.backgroundMode === "gradient"
                ? { background: `linear-gradient(${settings.gradientAngle}deg, ${settings.gradientStart}, ${settings.gradientEnd})` }
                : settings.backgroundMode === "static-image" && settings.staticImageUrl
                  ? { backgroundImage: `url(${settings.staticImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                  : { backgroundColor: "#0a0a0a" }
          }
        />
      )}

      {/* ── Logo overlay (works on any background) ── */}
      {settings.logoEnabled && settings.logoUrl && (
        <div
          className={`absolute z-[5] pointer-events-none ${logoPositionClasses(settings.logoPosition)}`}
          style={{ opacity: settings.logoOpacity }}
        >
          <img
            src={settings.logoUrl}
            alt="Company logo"
            style={{
              maxWidth: `${settings.logoScale * 300}px`,
              maxHeight: `${settings.logoScale * 300}px`,
            }}
            className="object-contain"
          />
        </div>
      )}

      {/* ── Overlay layer ── */}
      <div className="relative z-10 w-full h-full pointer-events-none">

        {/* ── Top bar: Location badge + Search + KPIs ── */}
        <div className="pointer-events-auto absolute top-0 left-0 right-0 p-3">
          {/* Row 1: Location badge + Search bar + System status */}
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-2 bg-black/50 backdrop-blur-xl rounded-lg border border-white/[0.08] px-3 py-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-white/80">Old Bishop Farm</span>
              <span className="text-[10px] text-white/40">500 S Meriden Rd, Cheshire, CT</span>
            </div>

            {isMapMode && <MapSearch map={mapInstance} />}

            <div className="ml-auto flex items-center gap-2">
              <MessagesIndicator />
              <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-xl rounded-lg border border-white/[0.08] px-3 py-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-mono text-white/60">ALL SYSTEMS ONLINE</span>
              </div>
            </div>
          </div>

          {/* Row 2: KPI cards */}
          <div className="grid grid-cols-4 gap-2">
            {kpis.map((kpi) => {
              const Icon = kpi.icon;
              return (
                <div
                  key={kpi.label}
                  className="bg-black/50 backdrop-blur-xl rounded-lg border border-white/[0.08] p-3 hover:bg-black/60 transition-colors cursor-default"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-white/40">{kpi.label}</span>
                    <Icon className="w-3.5 h-3.5 text-white/20" />
                  </div>
                  <p className="text-xl font-semibold text-white font-mono">{kpi.value}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    {kpi.change && (
                      <>
                        <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] text-emerald-400">{kpi.change}</span>
                      </>
                    )}
                    {kpi.sub && <span className="text-[10px] text-white/40">{kpi.sub}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Left column: Quick actions + Drawing tools ── */}
        <div className="pointer-events-auto absolute top-[155px] left-3 flex flex-col gap-2">
          {/* Quick actions */}
          <div className="flex gap-1.5">
            {[
              { icon: ClipboardList, label: "New Work Order" },
              { icon: Users, label: "New Client" },
              { icon: FileText, label: "New Invoice" },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  className="flex items-center gap-1.5 bg-black/40 backdrop-blur-xl rounded-md border border-white/[0.08] px-2.5 py-1.5 text-xs text-white/60 hover:text-white hover:bg-black/60 transition-all"
                  data-testid={`action-${action.label.toLowerCase().replace(/\s/g, "-")}`}
                >
                  <Plus className="w-3 h-3" />
                  <Icon className="w-3 h-3" />
                  <span>{action.label}</span>
                </button>
              );
            })}
          </div>

          {/* Drawing toolbar + Map Settings gear */}
          {isMapMode && (
            <div className="flex items-start gap-1.5">
              <MapDraw map={mapInstance} />
              <MapSettings map={mapInstance} />
            </div>
          )}
        </div>

        {/* ── Right column: Activity + Schedule panels ── */}
        <div className="pointer-events-auto absolute top-[155px] right-3 bottom-3 w-[340px] flex flex-col gap-2 overflow-hidden">
          {/* Recent Activity */}
          <div className="bg-black/50 backdrop-blur-xl rounded-lg border border-white/[0.08] flex flex-col overflow-hidden">
            <button
              onClick={() => setShowActivity(!showActivity)}
              className="flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-white/40" />
                <span className="text-xs font-medium text-white/70">Recent Activity</span>
              </div>
              {showActivity ? <ChevronUp className="w-3.5 h-3.5 text-white/30" /> : <ChevronDown className="w-3.5 h-3.5 text-white/30" />}
            </button>
            {showActivity && (
              <div className="px-3 pb-3 space-y-2.5 max-h-[240px] overflow-y-auto scrollbar-none">
                {recentActivity.map((item) => (
                  <div key={item.id} className="flex items-start gap-2.5">
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${item.dot}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-white/80">{item.title}</p>
                      <p className="text-[10px] text-white/40 truncate">{item.detail}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Clock className="w-2.5 h-2.5 text-white/20" />
                      <span className="text-[10px] text-white/30 whitespace-nowrap">{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Today's Schedule */}
          <div className="bg-black/50 backdrop-blur-xl rounded-lg border border-white/[0.08] flex flex-col overflow-hidden flex-1">
            <button
              onClick={() => setShowSchedule(!showSchedule)}
              className="flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-white/40" />
                <span className="text-xs font-medium text-white/70">Today&apos;s Schedule</span>
              </div>
              {showSchedule ? <ChevronUp className="w-3.5 h-3.5 text-white/30" /> : <ChevronDown className="w-3.5 h-3.5 text-white/30" />}
            </button>
            {showSchedule && (
              <div className="px-3 pb-3 space-y-2 overflow-y-auto scrollbar-none flex-1">
                {schedule.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5 border-b border-white/[0.04] last:border-0">
                    <span className="text-[10px] font-mono text-white/40 w-14 shrink-0">{item.time}</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-white/80 truncate">{item.title} — {item.location}</p>
                      <p className="text-[10px] text-white/40">{item.tech}</p>
                    </div>
                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                      item.status === "Completed" ? "bg-white/10 text-white/50"
                        : item.status === "In Progress" ? "bg-emerald-500/20 text-emerald-400"
                        : "bg-white/[0.06] text-white/40"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom-left: Camera feeds ── */}
        <div className="pointer-events-auto absolute bottom-3 left-3">
          <button
            onClick={() => setShowCameras(!showCameras)}
            className="flex items-center gap-1.5 bg-black/50 backdrop-blur-xl rounded-md border border-white/[0.08] px-2.5 py-1.5 text-xs text-white/60 hover:text-white hover:bg-black/60 transition-all mb-2"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Cameras</span>
            <span className="text-[10px] text-emerald-400 ml-1">
              {mockCameras.filter((c) => c.status !== "offline").length}/{mockCameras.length}
            </span>
            {showCameras ? <ChevronDown className="w-3 h-3 text-white/30 ml-1" /> : <ChevronUp className="w-3 h-3 text-white/30 ml-1" />}
          </button>

          {showCameras && (
            <div className="flex gap-2">
              {mockCameras.map((cam) => (
                <CameraWidget key={cam.id} {...cam} compact onClose={() => {}} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
