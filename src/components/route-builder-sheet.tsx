"use client";

import { useState, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronRight,
  ChevronLeft,
  Check,
  AlertTriangle,
  User,
  Users,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Package,
  Calendar,
  Search,
  X,
  Navigation,
} from "lucide-react";
import {
  sampleWorkOrders,
  sampleEmployees,
  routeEquipmentList,
  HQ_LOCATION,
} from "@/data/sample-routes";
import type { WorkOrderType, RouteBuilderState, RouteStop } from "@/types/routes";

// ─── Constants ────────────────────────────────────────────────────────────────

const WORK_ORDER_TYPES: { value: WorkOrderType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "estimate", label: "Estimates" },
  { value: "service", label: "Service Orders" },
  { value: "maintenance", label: "Maintenance" },
  { value: "emergency", label: "Emergency" },
  { value: "renovation", label: "Renovation" },
  { value: "inspection", label: "Inspection" },
];

const STEP_LABELS = [
  "Work Orders",
  "Driver & Team",
  "Stop Durations",
  "Custom Stops",
  "Equipment",
  "Start / End",
];

const priorityColor: Record<string, string> = {
  urgent: "bg-red-500/15 text-red-700 dark:text-red-400 border-0",
  high: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0",
  normal: "bg-foreground/10 text-muted-foreground border-0",
  low: "bg-foreground/5 text-muted-foreground border-0",
};

const woTypeColor: Record<string, string> = {
  emergency: "bg-red-500/15 text-red-700 dark:text-red-400 border-0",
  estimate: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-0",
  service: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0",
  maintenance: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0",
  inspection: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-0",
  renovation: "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-0",
};

// ─── Default state ────────────────────────────────────────────────────────────

function defaultState(): RouteBuilderState {
  return {
    step: 1,
    workOrderTypeFilter: "all",
    selectedWorkOrderIds: [],
    primaryDriverId: "",
    teamMemberIds: [],
    defaultStopDuration: 60,
    useAveragedDurations: false,
    customStops: [],
    equipmentIds: [],
    startLocation: HQ_LOCATION,
    endLocation: HQ_LOCATION,
    startTime: "07:30",
    endTime: "16:30",
  };
}

// ─── Step Progress Bar ────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-full transition-all duration-200 ${
            i < current
              ? "bg-foreground/80"
              : i === current - 1
              ? "bg-foreground/80"
              : "bg-foreground/15"
          }`}
        />
      ))}
    </div>
  );
}

// ─── Step 1: Work Order Filter ────────────────────────────────────────────────

function Step1WorkOrders({
  state,
  onUpdate,
}: {
  state: RouteBuilderState;
  onUpdate: (p: Partial<RouteBuilderState>) => void;
}) {
  const filtered = useMemo(() => {
    if (state.workOrderTypeFilter === "all") return sampleWorkOrders;
    return sampleWorkOrders.filter((wo) => wo.type === state.workOrderTypeFilter);
  }, [state.workOrderTypeFilter]);

  const toggle = (id: string) => {
    const sel = state.selectedWorkOrderIds;
    onUpdate({
      selectedWorkOrderIds: sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id],
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs text-muted-foreground mb-3">
          Select work orders to include in this route. Filter by type to narrow the list.
        </p>
        <Select
          value={state.workOrderTypeFilter}
          onValueChange={(v) =>
            onUpdate({ workOrderTypeFilter: (v ?? "all") as WorkOrderType | "all" })
          }
        >
          <SelectTrigger className="w-full" data-testid="select-wo-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {WORK_ORDER_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        {filtered.map((wo) => {
          const selected = state.selectedWorkOrderIds.includes(wo.id);
          return (
            <button
              key={wo.id}
              onClick={() => toggle(wo.id)}
              className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all text-sm ${
                selected
                  ? "border-foreground/30 bg-foreground/5"
                  : "border-border/40 bg-transparent hover:bg-foreground/3"
              }`}
              data-testid={`btn-wo-${wo.id}`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div
                    className={`mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                      selected
                        ? "bg-foreground border-foreground"
                        : "border-border/60 bg-transparent"
                    }`}
                  >
                    {selected && <Check className="w-2.5 h-2.5 text-background" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-xs font-mono text-muted-foreground">
                        {wo.number}
                      </span>
                      <Badge className={`text-[10px] ${woTypeColor[wo.type] ?? ""}`}>
                        {wo.type}
                      </Badge>
                      <Badge className={`text-[10px] ${priorityColor[wo.priority] ?? ""}`}>
                        {wo.priority}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium mt-0.5">{wo.clientName}</p>
                    <p className="text-xs text-muted-foreground truncate">{wo.address}</p>
                    {wo.notes && (
                      <p className="text-[11px] text-muted-foreground/70 truncate mt-0.5">
                        {wo.notes}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0 mt-0.5">
                  ~{wo.estimatedDuration}m
                </span>
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No work orders match this filter.
          </p>
        )}
      </div>

      {state.selectedWorkOrderIds.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-foreground/5 rounded-md px-3 py-2">
          <Check className="w-3 h-3 text-emerald-500" />
          {state.selectedWorkOrderIds.length} work order
          {state.selectedWorkOrderIds.length !== 1 ? "s" : ""} selected
        </div>
      )}
    </div>
  );
}

// ─── Step 2: Driver & Team ────────────────────────────────────────────────────

function Step2DriverTeam({
  state,
  onUpdate,
}: {
  state: RouteBuilderState;
  onUpdate: (p: Partial<RouteBuilderState>) => void;
}) {
  const driver = sampleEmployees.find((e) => e.id === state.primaryDriverId);

  const isDoubleBooked = (empId: string): boolean => {
    const emp = sampleEmployees.find((e) => e.id === empId);
    return (emp?.bookedRouteIds?.length ?? 0) > 0;
  };

  const toggleTeamMember = (empId: string) => {
    const members = state.teamMemberIds;
    onUpdate({
      teamMemberIds: members.includes(empId)
        ? members.filter((x) => x !== empId)
        : [...members, empId],
    });
  };

  return (
    <div className="space-y-5">
      {/* Primary Driver */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
          Primary Driver
        </label>
        <Select
          value={state.primaryDriverId}
          onValueChange={(v) => onUpdate({ primaryDriverId: v ?? undefined })}
        >
          <SelectTrigger data-testid="select-driver">
            <SelectValue placeholder="Select driver…" />
          </SelectTrigger>
          <SelectContent>
            {sampleEmployees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3 text-muted-foreground" />
                  <span>{emp.name}</span>
                  <span className="text-muted-foreground text-xs">— {emp.role}</span>
                  {isDoubleBooked(emp.id) && (
                    <AlertTriangle className="w-3 h-3 text-amber-500 ml-1" />
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {driver && isDoubleBooked(driver.id) && (
          <div className="mt-2 flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-md px-3 py-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              <strong>{driver.name}</strong> is already assigned to another route on this date.
              Double-booking will create a scheduling conflict.
            </p>
          </div>
        )}
      </div>

      <Separator />

      {/* Team Members */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
          Team Members{" "}
          <span className="font-normal normal-case text-[11px]">(optional)</span>
        </label>
        <div className="space-y-1.5">
          {sampleEmployees
            .filter((e) => e.id !== state.primaryDriverId)
            .map((emp) => {
              const selected = state.teamMemberIds.includes(emp.id);
              const booked = isDoubleBooked(emp.id);
              return (
                <button
                  key={emp.id}
                  onClick={() => toggleTeamMember(emp.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg border transition-all text-sm ${
                    selected
                      ? "border-foreground/30 bg-foreground/5"
                      : "border-border/40 hover:bg-foreground/3"
                  }`}
                  data-testid={`btn-team-${emp.id}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                          selected
                            ? "bg-foreground border-foreground"
                            : "border-border/60 bg-transparent"
                        }`}
                      >
                        {selected && <Check className="w-2.5 h-2.5 text-background" />}
                      </div>
                      <div>
                        <span className="text-sm font-medium">{emp.name}</span>
                        <span className="text-xs text-muted-foreground ml-1.5">
                          {emp.role}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {booked && (
                        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0 text-[10px]">
                          <AlertTriangle className="w-2.5 h-2.5 mr-1" />
                          Booked
                        </Badge>
                      )}
                      {!booked && (
                        <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0 text-[10px]">
                          Available
                        </Badge>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Stop Durations ───────────────────────────────────────────────────

function Step3Durations({
  state,
  onUpdate,
}: {
  state: RouteBuilderState;
  onUpdate: (p: Partial<RouteBuilderState>) => void;
}) {
  const selectedWOs = sampleWorkOrders.filter((wo) =>
    state.selectedWorkOrderIds.includes(wo.id)
  );

  const [durations, setDurations] = useState<Record<string, number>>(() =>
    Object.fromEntries(selectedWOs.map((wo) => [wo.id, wo.estimatedDuration]))
  );

  const avgDuration = useMemo(() => {
    if (selectedWOs.length === 0) return state.defaultStopDuration;
    return Math.round(
      selectedWOs.reduce((sum, wo) => sum + (durations[wo.id] ?? wo.estimatedDuration), 0) /
        selectedWOs.length
    );
  }, [durations, selectedWOs, state.defaultStopDuration]);

  return (
    <div className="space-y-4">
      {/* Averaged toggle */}
      <div className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-border/40 bg-foreground/3">
        <div>
          <p className="text-sm font-medium">Use averaged duration</p>
          <p className="text-xs text-muted-foreground">
            Apply the same duration to all stops
          </p>
        </div>
        <button
          onClick={() => onUpdate({ useAveragedDurations: !state.useAveragedDurations })}
          className={`w-10 h-5.5 rounded-full transition-colors relative ${
            state.useAveragedDurations ? "bg-foreground/80" : "bg-foreground/20"
          }`}
          data-testid="toggle-averaged-durations"
        >
          <div
            className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background transition-transform ${
              state.useAveragedDurations ? "translate-x-4.5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {state.useAveragedDurations ? (
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
            Duration per stop (minutes)
          </label>
          <Input
            type="number"
            value={state.defaultStopDuration}
            onChange={(e) =>
              onUpdate({ defaultStopDuration: Math.max(1, parseInt(e.target.value) || 60) })
            }
            min={1}
            max={480}
            className="font-mono"
            data-testid="input-default-duration"
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            Applied to all {selectedWOs.length} work order
            {selectedWOs.length !== 1 ? "s" : ""} uniformly
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
            Per-stop durations (minutes)
          </label>
          {selectedWOs.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No work orders selected — go back to Step 1
            </p>
          )}
          {selectedWOs.map((wo) => (
            <div
              key={wo.id}
              className="flex items-center gap-3 px-3 py-2 rounded-lg border border-border/40"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{wo.clientName}</p>
                <p className="text-xs text-muted-foreground truncate">{wo.address}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  type="number"
                  value={durations[wo.id] ?? wo.estimatedDuration}
                  onChange={(e) => {
                    const val = Math.max(1, parseInt(e.target.value) || wo.estimatedDuration);
                    setDurations((prev) => ({ ...prev, [wo.id]: val }));
                  }}
                  min={1}
                  max={480}
                  className="w-20 text-right font-mono text-sm h-8"
                  data-testid={`input-duration-${wo.id}`}
                />
                <span className="text-xs text-muted-foreground w-6">min</span>
              </div>
            </div>
          ))}
          {selectedWOs.length > 0 && (
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-foreground/5 text-xs text-muted-foreground">
              <span>Average</span>
              <span className="font-mono font-medium text-foreground">{avgDuration} min/stop</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Step 4: Custom Stops & Delays ───────────────────────────────────────────

function Step4CustomStops({
  state,
  onUpdate,
}: {
  state: RouteBuilderState;
  onUpdate: (p: Partial<RouteBuilderState>) => void;
}) {
  const [newType, setNewType] = useState<"custom" | "delay">("custom");
  const [newAddress, setNewAddress] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newDuration, setNewDuration] = useState("30");
  const [newReason, setNewReason] = useState("");

  const addStop = () => {
    if (newType === "custom" && !newAddress.trim()) return;
    if (newType === "delay" && !newLabel.trim()) return;

    const stop: Omit<RouteStop, "id"> = {
      type: newType,
      address: newType === "custom" ? newAddress : undefined,
      label: newLabel || (newType === "delay" ? newReason : newAddress),
      lat: 41.4998, // placeholder — geocode in Phase 2
      lng: -72.9017,
      estimatedDuration: parseInt(newDuration) || 30,
      delayReason: newType === "delay" ? newReason : undefined,
    };

    onUpdate({ customStops: [...state.customStops, stop] });
    setNewAddress("");
    setNewLabel("");
    setNewDuration("30");
    setNewReason("");
  };

  const removeStop = (i: number) => {
    onUpdate({ customStops: state.customStops.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Add custom stops (supply pickup, office visit) or time delays (lunch break, admin time).
      </p>

      {/* Existing custom stops */}
      {state.customStops.length > 0 && (
        <div className="space-y-1.5">
          {state.customStops.map((stop, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border/40 bg-foreground/3"
            >
              <Badge
                className={`text-[10px] flex-shrink-0 ${
                  stop.type === "delay"
                    ? "bg-foreground/10 text-muted-foreground border-0"
                    : "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-0"
                }`}
              >
                {stop.type === "delay" ? "Delay" : "Custom"}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="text-sm truncate">{stop.label ?? stop.address}</p>
                {stop.address && stop.type === "custom" && (
                  <p className="text-xs text-muted-foreground truncate">{stop.address}</p>
                )}
              </div>
              <span className="text-xs font-mono text-muted-foreground flex-shrink-0">
                {stop.estimatedDuration}m
              </span>
              <button
                onClick={() => removeStop(i)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                data-testid={`btn-remove-stop-${i}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new stop form */}
      <div className="border border-border/40 rounded-lg p-3 space-y-3">
        <div className="flex gap-2">
          <button
            onClick={() => setNewType("custom")}
            className={`flex-1 text-xs py-1.5 rounded-md border transition-colors ${
              newType === "custom"
                ? "border-foreground/30 bg-foreground/8 font-medium"
                : "border-border/40 text-muted-foreground"
            }`}
          >
            <MapPin className="w-3 h-3 inline mr-1" />
            Custom Stop
          </button>
          <button
            onClick={() => setNewType("delay")}
            className={`flex-1 text-xs py-1.5 rounded-md border transition-colors ${
              newType === "delay"
                ? "border-foreground/30 bg-foreground/8 font-medium"
                : "border-border/40 text-muted-foreground"
            }`}
          >
            <Clock className="w-3 h-3 inline mr-1" />
            Time Delay
          </button>
        </div>

        {newType === "custom" ? (
          <>
            <Input
              placeholder="Address or location name"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              data-testid="input-custom-address"
            />
            <Input
              placeholder="Label (optional)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              data-testid="input-custom-label"
            />
          </>
        ) : (
          <>
            <Input
              placeholder="Reason (e.g. Lunch break, Admin time)"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              data-testid="input-delay-reason"
            />
          </>
        )}

        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <Input
            type="number"
            placeholder="Duration (min)"
            value={newDuration}
            onChange={(e) => setNewDuration(e.target.value)}
            min={1}
            max={480}
            className="font-mono"
            data-testid="input-stop-duration"
          />
          <span className="text-xs text-muted-foreground">min</span>
        </div>

        <Button
          size="sm"
          onClick={addStop}
          className="w-full"
          disabled={
            newType === "custom" ? !newAddress.trim() : !newReason.trim()
          }
          data-testid="btn-add-stop"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add {newType === "delay" ? "Delay" : "Stop"}
        </Button>
      </div>
    </div>
  );
}

// ─── Step 5: Equipment Checkout ───────────────────────────────────────────────

function Step5Equipment({
  state,
  onUpdate,
}: {
  state: RouteBuilderState;
  onUpdate: (p: Partial<RouteBuilderState>) => void;
}) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return routeEquipmentList;
    const q = search.toLowerCase();
    return routeEquipmentList.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
    );
  }, [search]);

  const toggle = (id: string) => {
    const ids = state.equipmentIds;
    onUpdate({
      equipmentIds: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
    });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Check out equipment needed for this route. Unavailable items are already assigned.
      </p>

      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Search equipment…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
          data-testid="input-equipment-search"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="space-y-1">
        {filtered.map((eq) => {
          const selected = state.equipmentIds.includes(eq.id);
          const unavailable = !eq.available && !selected;
          return (
            <button
              key={eq.id}
              onClick={() => !unavailable && toggle(eq.id)}
              disabled={unavailable}
              className={`w-full text-left px-3 py-2 rounded-lg border transition-all ${
                unavailable
                  ? "border-border/20 opacity-40 cursor-not-allowed"
                  : selected
                  ? "border-foreground/30 bg-foreground/5"
                  : "border-border/40 hover:bg-foreground/3"
              }`}
              data-testid={`btn-eq-${eq.id}`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                    selected
                      ? "bg-foreground border-foreground"
                      : "border-border/60 bg-transparent"
                  }`}
                >
                  {selected && <Check className="w-2.5 h-2.5 text-background" />}
                </div>
                <Package className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm">{eq.name}</span>
                  <span className="text-xs text-muted-foreground ml-1.5">{eq.category}</span>
                </div>
                {!eq.available && !selected && (
                  <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0 text-[10px]">
                    Out
                  </Badge>
                )}
                {eq.available && !selected && (
                  <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0 text-[10px]">
                    Avail
                  </Badge>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {state.equipmentIds.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-foreground/5 rounded-md px-3 py-2">
          <Package className="w-3 h-3 text-emerald-500" />
          {state.equipmentIds.length} item
          {state.equipmentIds.length !== 1 ? "s" : ""} checked out for this route
        </div>
      )}
    </div>
  );
}

// ─── Step 6: Start / End / Time ───────────────────────────────────────────────

function Step6StartEnd({
  state,
  onUpdate,
}: {
  state: RouteBuilderState;
  onUpdate: (p: Partial<RouteBuilderState>) => void;
}) {
  return (
    <div className="space-y-5">
      {/* Start */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
          Start Location
        </label>
        <div className="relative">
          <Navigation className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Start address"
            value={state.startLocation.address}
            onChange={(e) =>
              onUpdate({
                startLocation: { ...state.startLocation, address: e.target.value },
              })
            }
            className="pl-8"
            data-testid="input-start-address"
          />
        </div>
        <p className="text-[11px] text-muted-foreground mt-1">
          Default: HQ — 500 S Meriden Rd, Cheshire, CT
        </p>
      </div>

      {/* End */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
          End Location
        </label>
        <div className="relative">
          <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="End / return address"
            value={state.endLocation.address}
            onChange={(e) =>
              onUpdate({
                endLocation: { ...state.endLocation, address: e.target.value },
              })
            }
            className="pl-8"
            data-testid="input-end-address"
          />
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          <button
            onClick={() =>
              onUpdate({ endLocation: { ...state.startLocation } })
            }
            className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors"
            data-testid="btn-same-as-start"
          >
            Same as start location
          </button>
        </div>
      </div>

      <Separator />

      {/* Times */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
            Start Time
          </label>
          <Input
            type="time"
            value={state.startTime}
            onChange={(e) => onUpdate({ startTime: e.target.value })}
            className="font-mono"
            data-testid="input-start-time"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
            Target Return
          </label>
          <Input
            type="time"
            value={state.endTime}
            onChange={(e) => onUpdate({ endTime: e.target.value })}
            className="font-mono"
            data-testid="input-end-time"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-foreground/5 rounded-lg p-3 space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Route Summary
        </p>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Work orders</span>
          <span className="font-mono">{state.selectedWorkOrderIds.length}</span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Custom stops</span>
          <span className="font-mono">
            {state.customStops.filter((s) => s.type === "custom").length}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Delays</span>
          <span className="font-mono">
            {state.customStops.filter((s) => s.type === "delay").length}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Equipment</span>
          <span className="font-mono">{state.equipmentIds.length} items</span>
        </div>
        {state.primaryDriverId && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Driver</span>
            <span className="font-medium">
              {sampleEmployees.find((e) => e.id === state.primaryDriverId)?.name ?? "—"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Sheet Component ─────────────────────────────────────────────────────

interface RouteBuilderSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (state: RouteBuilderState, publish: boolean) => void;
}

export function RouteBuilderSheet({ open, onOpenChange, onSave }: RouteBuilderSheetProps) {
  const [state, setState] = useState<RouteBuilderState>(defaultState());

  const update = (partial: Partial<RouteBuilderState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  };

  const step = state.step;
  const totalSteps = 6;
  const canProceed = useMemo(() => {
    if (step === 1) return state.selectedWorkOrderIds.length > 0;
    if (step === 2) return !!state.primaryDriverId;
    return true;
  }, [step, state.selectedWorkOrderIds.length, state.primaryDriverId]);

  const goNext = () => {
    if (step < totalSteps) update({ step: (step + 1) as RouteBuilderState["step"] });
  };

  const goPrev = () => {
    if (step > 1) update({ step: (step - 1) as RouteBuilderState["step"] });
  };

  const handleSave = (publish: boolean) => {
    onSave?.(state, publish);
    onOpenChange(false);
    setState(defaultState());
  };

  const handleClose = () => {
    onOpenChange(false);
    setState(defaultState());
  };

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent
        className="w-full sm:max-w-md flex flex-col h-full overflow-hidden"
        data-testid="sheet-route-builder"
      >
        <SheetHeader className="flex-shrink-0 pb-2">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base">New Route</SheetTitle>
            <span className="text-xs text-muted-foreground">
              Step {step} of {totalSteps} — {STEP_LABELS[step - 1]}
            </span>
          </div>
          <StepIndicator current={step} total={totalSteps} />
          <SheetDescription className="sr-only">
            Route builder — {STEP_LABELS[step - 1]}
          </SheetDescription>
        </SheetHeader>

        {/* Step label */}
        <div className="flex-shrink-0 py-2">
          <p className="text-sm font-semibold">{STEP_LABELS[step - 1]}</p>
        </div>

        <Separator className="flex-shrink-0" />

        {/* Step content */}
        <div className="flex-1 overflow-y-auto py-4 min-h-0">
          {step === 1 && <Step1WorkOrders state={state} onUpdate={update} />}
          {step === 2 && <Step2DriverTeam state={state} onUpdate={update} />}
          {step === 3 && <Step3Durations state={state} onUpdate={update} />}
          {step === 4 && <Step4CustomStops state={state} onUpdate={update} />}
          {step === 5 && <Step5Equipment state={state} onUpdate={update} />}
          {step === 6 && <Step6StartEnd state={state} onUpdate={update} />}
        </div>

        <Separator className="flex-shrink-0" />

        {/* Navigation */}
        <div className="flex-shrink-0 pt-3 flex items-center gap-2">
          {step > 1 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={goPrev}
              data-testid="btn-step-prev"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
              data-testid="btn-cancel"
            >
              Cancel
            </Button>
          )}

          <div className="flex-1" />

          {step < totalSteps ? (
            <Button
              size="sm"
              onClick={goNext}
              disabled={!canProceed}
              data-testid="btn-step-next"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleSave(false)}
                data-testid="btn-save-draft"
              >
                Save Draft
              </Button>
              <Button
                size="sm"
                onClick={() => handleSave(true)}
                data-testid="btn-publish"
              >
                <Check className="w-3.5 h-3.5 mr-1.5" />
                Publish
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
