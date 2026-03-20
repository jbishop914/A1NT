"use client";

import { useState, useMemo } from "react";
import {
  Search,
  MapPin,
  Calendar,
  Truck,
  Route,
  Plus,
  Wand2,
  ArrowLeftRight,
  Save,
  Send,
  ChevronDown,
  ChevronRight,
  Clock,
  User,
  Users,
  Filter,
  Check,
  AlertTriangle,
  Package,
  Navigation,
  ChevronLeft,
  MoreHorizontal,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

import { RouteMap } from "@/components/route-map";
import { RouteBuilderSheet } from "@/components/route-builder-sheet";
import {
  sampleRoutes,
  sampleCalendarEvents,
  sampleWorkOrders,
} from "@/data/sample-routes";
import { sampleVehicles } from "@/lib/sample-data-p3";
import type { VehicleRoute, RouteCalendarEvent } from "@/types/routes";
import type { Vehicle } from "@/lib/sample-data-p3";

// ─── Types ─────────────────────────────────────────────────────────────────────

type CalendarDayRange = 1 | 3 | 5 | 10;
type VehicleTypeFilter = "all" | "Van" | "Truck" | "Trailer" | "Car";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function routeStatusStyle(status: VehicleRoute["status"]): string {
  switch (status) {
    case "DRAFT": return "bg-foreground/10 text-muted-foreground border-0";
    case "OPTIMIZED": return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-0";
    case "PUBLISHED": return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0";
    case "IN_PROGRESS": return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0";
    case "COMPLETED": return "bg-foreground/10 text-muted-foreground border-0";
    case "CANCELLED": return "bg-red-500/15 text-red-700 dark:text-red-400 border-0";
    default: return "bg-foreground/10 text-muted-foreground border-0";
  }
}

function calEventTypeStyle(type: RouteCalendarEvent["type"]): string {
  switch (type) {
    case "route": return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0";
    case "work_order": return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-0";
    case "maintenance": return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0";
    case "other": return "bg-foreground/10 text-muted-foreground border-0";
    default: return "bg-foreground/10 text-muted-foreground border-0";
  }
}

function formatTime12(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function formatDate(isoDate: string): string {
  try {
    const d = new Date(isoDate + "T00:00:00");
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  } catch {
    return isoDate;
  }
}

/** Get an array of the next N business days from a base date */
function getBusinessDays(from: Date, count: number): Date[] {
  const days: Date[] = [];
  const cur = new Date(from);
  cur.setHours(0, 0, 0, 0);
  while (days.length < count) {
    const dow = cur.getDay();
    if (dow !== 0 && dow !== 6) days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

/** Convert Date to YYYY-MM-DD */
function toDateString(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// ─── Left Panel: Fleet Vehicles ───────────────────────────────────────────────

function FleetVehiclePanel({
  selectedVehicleId,
  onSelect,
}: {
  selectedVehicleId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const [typeFilter, setTypeFilter] = useState<VehicleTypeFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return sampleVehicles.filter((v) => {
      const matchType = typeFilter === "all" || v.type === typeFilter;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.assignedTo.toLowerCase().includes(q) ||
        v.plate.toLowerCase().includes(q);
      return matchType && matchSearch;
    });
  }, [typeFilter, search]);

  const routeByVehicle = useMemo(() => {
    const map: Record<string, VehicleRoute[]> = {};
    sampleRoutes.forEach((r) => {
      if (r.vehicleId) {
        if (!map[r.vehicleId]) map[r.vehicleId] = [];
        map[r.vehicleId].push(r);
      }
    });
    return map;
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex-shrink-0 px-3 pt-3 pb-2 space-y-2 border-b border-border/30">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Fleet Vehicles
          </p>
          <Badge className="bg-foreground/10 text-muted-foreground border-0 text-[10px]">
            {filtered.length}
          </Badge>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
          <Input
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-6 h-7 text-xs"
            data-testid="input-vehicle-search"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as VehicleTypeFilter)}>
          <SelectTrigger className="h-7 text-xs" data-testid="select-vehicle-type">
            <Filter className="w-3 h-3 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Van">Vans</SelectItem>
            <SelectItem value="Truck">Trucks</SelectItem>
            <SelectItem value="Trailer">Trailers</SelectItem>
            <SelectItem value="Car">Cars</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vehicle list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.map((v) => {
          const isSelected = selectedVehicleId === v.id;
          const routes = routeByVehicle[v.id] ?? [];
          const activeRoute = routes.find(
            (r) => r.status === "PUBLISHED" || r.status === "IN_PROGRESS"
          );
          return (
            <button
              key={v.id}
              onClick={() => onSelect(isSelected ? null : v.id)}
              className={`w-full text-left px-3 py-2.5 border-b border-border/20 transition-colors ${
                isSelected ? "bg-foreground/6" : "hover:bg-foreground/3"
              }`}
              data-testid={`btn-fleet-vehicle-${v.id}`}
            >
              <div className="flex items-start justify-between gap-1.5">
                <div className="flex items-start gap-2 min-w-0">
                  <Truck className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium truncate">{v.name}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {v.year} {v.make} {v.model}
                    </p>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <User className="w-2.5 h-2.5" />
                      {v.assignedTo}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <Badge
                    className={`text-[9px] ${
                      v.status === "Active"
                        ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0"
                        : v.status === "In Shop"
                        ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0"
                        : "bg-red-500/15 text-red-700 dark:text-red-400 border-0"
                    }`}
                  >
                    {v.status}
                  </Badge>
                  {activeRoute && (
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0 text-[9px]">
                      <Route className="w-2 h-2 mr-0.5" />
                      On Route
                    </Badge>
                  )}
                </div>
              </div>

              {/* Active route preview */}
              {isSelected && activeRoute && (
                <div className="mt-2 pt-2 border-t border-border/20">
                  <p className="text-[11px] text-muted-foreground mb-1">Current Route</p>
                  <p className="text-xs font-medium text-foreground">{activeRoute.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {activeRoute.stops.length} stops ·{" "}
                    {activeRoute.totalDistance?.toFixed(1)} mi
                  </p>
                </div>
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6 px-3">
            No vehicles match your filter.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Right Panel: Calendar ────────────────────────────────────────────────────

function CalendarPanel({
  selectedRouteId,
  onSelectRoute,
}: {
  selectedRouteId: string | null;
  onSelectRoute: (id: string | null) => void;
}) {
  const [dayRange, setDayRange] = useState<CalendarDayRange>(3);
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week

  const baseDate = useMemo(() => {
    // Start from today (Mar 20, 2026)
    const d = new Date("2026-03-20T00:00:00");
    d.setDate(d.getDate() + weekOffset * dayRange);
    return d;
  }, [weekOffset, dayRange]);

  const businessDays = useMemo(() => getBusinessDays(baseDate, dayRange), [baseDate, dayRange]);

  const eventsByDay = useMemo(() => {
    const map: Record<string, RouteCalendarEvent[]> = {};
    sampleCalendarEvents.forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex-shrink-0 px-3 pt-3 pb-2 border-b border-border/30 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Calendar
          </p>
          {/* Day range selector */}
          <div className="flex items-center gap-0.5 bg-foreground/5 rounded-md p-0.5">
            {([1, 3, 5, 10] as CalendarDayRange[]).map((n) => (
              <button
                key={n}
                onClick={() => setDayRange(n)}
                className={`px-2 py-0.5 text-[11px] rounded transition-colors ${
                  dayRange === n
                    ? "bg-background text-foreground shadow-sm font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                data-testid={`btn-day-range-${n}`}
              >
                {n}d
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            className="p-1 rounded hover:bg-foreground/8 text-muted-foreground hover:text-foreground transition-colors"
            data-testid="btn-cal-prev"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs text-muted-foreground">
            {formatDate(toDateString(businessDays[0]))}
            {businessDays.length > 1 &&
              ` – ${formatDate(toDateString(businessDays[businessDays.length - 1]))}`}
          </span>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="p-1 rounded hover:bg-foreground/8 text-muted-foreground hover:text-foreground transition-colors"
            data-testid="btn-cal-next"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Calendar days */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/20">
        {businessDays.map((day) => {
          const dateStr = toDateString(day);
          const events = eventsByDay[dateStr] ?? [];
          const isToday = dateStr === "2026-03-20";
          return (
            <div key={dateStr} className="px-3 py-2.5">
              <div className="flex items-center gap-1.5 mb-2">
                <span
                  className={`text-[11px] font-semibold ${
                    isToday ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </span>
                <span
                  className={`text-[11px] font-mono ${
                    isToday
                      ? "text-foreground bg-foreground/10 rounded-sm px-1"
                      : "text-muted-foreground"
                  }`}
                >
                  {day.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
                {events.length > 0 && (
                  <Badge className="bg-foreground/8 text-muted-foreground border-0 text-[9px] ml-auto">
                    {events.length}
                  </Badge>
                )}
              </div>

              {events.length === 0 ? (
                <p className="text-[11px] text-muted-foreground/50 pl-1">No scheduled events</p>
              ) : (
                <div className="space-y-1">
                  {events.map((ev) => {
                    const isSelectedRoute =
                      ev.type === "route" && ev.routeId === selectedRouteId;
                    return (
                      <button
                        key={ev.id}
                        onClick={() => {
                          if (ev.type === "route" && ev.routeId) {
                            onSelectRoute(
                              isSelectedRoute ? null : ev.routeId
                            );
                          }
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded-md border transition-colors ${
                          isSelectedRoute
                            ? "border-foreground/25 bg-foreground/6"
                            : "border-border/25 hover:bg-foreground/3"
                        } ${ev.type !== "route" ? "cursor-default" : "cursor-pointer"}`}
                        data-testid={`btn-cal-event-${ev.id}`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div className="min-w-0">
                            <p className="text-[11px] font-medium truncate">{ev.title}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {formatTime12(ev.startTime)} – {formatTime12(ev.endTime)}
                            </p>
                            {ev.assignedTo && (
                              <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                <User className="w-2.5 h-2.5" />
                                {ev.assignedTo}
                              </p>
                            )}
                          </div>
                          <Badge
                            className={`text-[9px] flex-shrink-0 ${calEventTypeStyle(ev.type)}`}
                          >
                            {ev.type === "work_order" ? "WO" : ev.type}
                          </Badge>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Center: Map + Route Details ──────────────────────────────────────────────

function RouteListPanel({
  selectedRouteId,
  onSelectRoute,
}: {
  selectedRouteId: string | null;
  onSelectRoute: (id: string | null) => void;
}) {
  const selectedRoute = sampleRoutes.find((r) => r.id === selectedRouteId);

  if (!selectedRoute) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-6 space-y-3">
        <div className="w-12 h-12 rounded-full bg-foreground/5 border border-border/30 flex items-center justify-center">
          <Route className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">Select a route</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click a route from the calendar, or create a new one below
          </p>
        </div>
        <div className="space-y-1.5 w-full max-w-xs">
          {sampleRoutes.map((r) => (
            <button
              key={r.id}
              onClick={() => onSelectRoute(r.id)}
              className="w-full text-left px-3 py-2 rounded-lg border border-border/40 hover:bg-foreground/3 transition-colors"
              data-testid={`btn-select-route-${r.id}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">{r.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {r.stops.length} stops · {r.primaryDriverName}
                  </p>
                </div>
                <Badge className={`text-[10px] ${routeStatusStyle(r.status)}`}>
                  {r.status}
                </Badge>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Route header */}
      <div className="flex-shrink-0 px-3 pt-3 pb-2 border-b border-border/30">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onSelectRoute(null)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid="btn-deselect-route"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <p className="text-xs font-semibold">{selectedRoute.name}</p>
            </div>
            <div className="flex items-center gap-1.5 mt-1 pl-5">
              <Badge className={`text-[10px] ${routeStatusStyle(selectedRoute.status)}`}>
                {selectedRoute.status}
              </Badge>
              {selectedRoute.vehicleName && (
                <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                  <Truck className="w-2.5 h-2.5" />
                  {selectedRoute.vehicleName}
                </span>
              )}
              {selectedRoute.primaryDriverName && (
                <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                  <User className="w-2.5 h-2.5" />
                  {selectedRoute.primaryDriverName}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {selectedRoute.totalDistance && (
              <span className="text-[11px] font-mono text-muted-foreground">
                {selectedRoute.totalDistance} mi
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stops list */}
      <div className="flex-1 overflow-y-auto divide-y divide-border/15">
        {selectedRoute.stops.map((stop, i) => {
          const isDelay = stop.type === "delay";
          const isCustom = stop.type === "custom";
          const stopNum = isDelay ? null : i + 1;

          const typeColor =
            isDelay ? "bg-foreground/8 text-muted-foreground border-0" :
            isCustom ? "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-0" :
            stop.workOrderType === "emergency" ? "bg-red-500/15 text-red-700 dark:text-red-400 border-0" :
            stop.workOrderType === "estimate" ? "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-0" :
            stop.workOrderType === "maintenance" ? "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0" :
            "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0";

          return (
            <div
              key={stop.id}
              className="px-3 py-2.5 hover:bg-foreground/2 transition-colors"
              data-testid={`stop-item-${stop.id}`}
            >
              <div className="flex items-start gap-2.5">
                {/* Stop number / indicator */}
                <div className="flex-shrink-0 mt-0.5">
                  {isDelay ? (
                    <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center">
                      <Clock className="w-2.5 h-2.5 text-muted-foreground" />
                    </div>
                  ) : (
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white`}
                      style={{
                        backgroundColor:
                          stop.workOrderType === "emergency" ? "#ef4444" :
                          stop.workOrderType === "estimate" ? "#3b82f6" :
                          stop.workOrderType === "maintenance" ? "#f59e0b" :
                          isCustom ? "#8b5cf6" : "#10b981",
                      }}
                    >
                      {stopNum}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <p className="text-xs font-medium">{stop.label ?? stop.address}</p>
                    <Badge className={`text-[9px] ${typeColor}`}>
                      {isDelay ? "delay" : isCustom ? "custom" : (stop.workOrderType ?? "service")}
                    </Badge>
                  </div>
                  {stop.address && (
                    <p className="text-[11px] text-muted-foreground flex items-center gap-0.5 mt-0.5">
                      <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                      {stop.address}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-0.5">
                    {stop.estimatedArrival && (
                      <p className="text-[11px] text-muted-foreground font-mono">
                        {new Date(stop.estimatedArrival).toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    )}
                    <p className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {stop.estimatedDuration}m
                    </p>
                  </div>
                  {stop.notes && (
                    <p className="text-[11px] text-muted-foreground/70 mt-0.5 truncate">
                      {stop.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Route meta footer */}
      <div className="flex-shrink-0 px-3 py-2 border-t border-border/30 bg-foreground/2">
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-3">
            {selectedRoute.config.startTime && (
              <span className="flex items-center gap-1">
                <Navigation className="w-2.5 h-2.5" />
                {new Date(selectedRoute.config.startTime).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
            )}
            {selectedRoute.totalDuration && (
              <span className="flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {Math.floor(selectedRoute.totalDuration / 60)}h{" "}
                {selectedRoute.totalDuration % 60}m
              </span>
            )}
            {selectedRoute.teamMemberNames.length > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-2.5 h-2.5" />+{selectedRoute.teamMemberNames.length}
              </span>
            )}
          </div>
          {selectedRoute.equipmentNames.length > 0 && (
            <span className="flex items-center gap-1">
              <Package className="w-2.5 h-2.5" />
              {selectedRoute.equipmentNames.length} items
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Routes Tab Component ────────────────────────────────────────────────

export function RoutesTab() {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>("route-1");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [savedRoutes, setSavedRoutes] = useState(sampleRoutes);

  const selectedRoute = savedRoutes.find((r) => r.id === selectedRouteId) ?? null;

  // ── Toolbar actions ──────────────────────────────────────────────────────

  const handleOptimize = () => {
    if (!selectedRouteId) return;
    setSavedRoutes((prev) =>
      prev.map((r) =>
        r.id === selectedRouteId ? { ...r, status: "OPTIMIZED" as const } : r
      )
    );
  };

  const handleReverse = () => {
    if (!selectedRouteId) return;
    setSavedRoutes((prev) =>
      prev.map((r) =>
        r.id === selectedRouteId
          ? { ...r, stops: [...r.stops].reverse() }
          : r
      )
    );
  };

  const handleSave = () => {
    // No-op for demo
  };

  const handlePublish = () => {
    if (!selectedRouteId) return;
    setSavedRoutes((prev) =>
      prev.map((r) =>
        r.id === selectedRouteId ? { ...r, status: "PUBLISHED" as const, publishedAt: new Date().toISOString() } : r
      )
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Three-panel layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden gap-0 border border-border/30 rounded-xl">
        {/* Left: Fleet Vehicle Table */}
        <div className="w-52 flex-shrink-0 border-r border-border/30 bg-background overflow-hidden flex flex-col">
          <FleetVehiclePanel
            selectedVehicleId={selectedVehicleId}
            onSelect={setSelectedVehicleId}
          />
        </div>

        {/* Center: Map (majority of space) */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
          {/* Map area */}
          <div className="flex-1 relative bg-slate-950" style={{ minHeight: 400 }}>
            <RouteMap
              route={selectedRoute ?? undefined}
              className="absolute inset-0"
            />

            {/* Floating route selector (when no route selected) */}
            {!selectedRoute && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-center">
                <p className="text-xs text-white/60">
                  Select a route from the calendar or list to view on map
                </p>
              </div>
            )}
          </div>

          {/* Below map: route stop details panel */}
          <div
            className="flex-shrink-0 border-t border-border/30 bg-background"
            style={{ height: 240 }}
          >
            <RouteListPanel
              selectedRouteId={selectedRouteId}
              onSelectRoute={setSelectedRouteId}
            />
          </div>
        </div>

        {/* Right: Calendar */}
        <div className="w-60 flex-shrink-0 border-l border-border/30 bg-background overflow-hidden flex flex-col">
          <CalendarPanel
            selectedRouteId={selectedRouteId}
            onSelectRoute={setSelectedRouteId}
          />
        </div>
      </div>

      {/* Route Builder Toolbar */}
      <div className="flex-shrink-0 mt-3 flex items-center gap-2 flex-wrap" data-testid="route-toolbar">
        <Button
          size="sm"
          onClick={() => setBuilderOpen(true)}
          data-testid="btn-new-route"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          New Route
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleOptimize}
          disabled={!selectedRouteId}
          data-testid="btn-optimize"
        >
          <Wand2 className="w-3.5 h-3.5 mr-1.5" />
          Optimize
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleReverse}
          disabled={!selectedRouteId}
          data-testid="btn-reverse"
        >
          <ArrowLeftRight className="w-3.5 h-3.5 mr-1.5" />
          Reverse
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleSave}
          disabled={!selectedRouteId}
          data-testid="btn-save-route"
        >
          <Save className="w-3.5 h-3.5 mr-1.5" />
          Save
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handlePublish}
          disabled={!selectedRouteId}
          data-testid="btn-publish-route"
        >
          <Send className="w-3.5 h-3.5 mr-1.5" />
          Publish
        </Button>

        <div className="flex-1" />

        {/* Route selector dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger data-testid="btn-route-selector" className="inline-flex items-center gap-1.5 px-3 h-8 text-xs rounded-md border border-border/60 bg-background hover:bg-foreground/5 transition-colors">
            <Route className="w-3.5 h-3.5" />
            {selectedRoute
              ? (selectedRoute.name.length > 28
                ? selectedRoute.name.slice(0, 28) + "…"
                : selectedRoute.name)
              : "Select Route"}
            <ChevronDown className="w-3.5 h-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            {savedRoutes.map((r) => (
              <DropdownMenuItem
                key={r.id}
                onClick={() => setSelectedRouteId(r.id)}
                className="flex items-center justify-between gap-2"
                data-testid={`menu-route-${r.id}`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {r.stops.length} stops · {r.primaryDriverName}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Badge className={`text-[10px] ${routeStatusStyle(r.status)}`}>
                    {r.status}
                  </Badge>
                  {selectedRouteId === r.id && (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setBuilderOpen(true)} data-testid="menu-new-route">
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              New Route…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Route Builder Sheet */}
      <RouteBuilderSheet
        open={builderOpen}
        onOpenChange={setBuilderOpen}
        onSave={(state, publish) => {
          // In real app: POST to /api/routes
          console.log("[RouteBuilder] Saved:", { state, publish });
        }}
      />
    </div>
  );
}
