"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Truck,
  Wrench,
  DollarSign,
  AlertTriangle,
  ArrowUpDown,
  Fuel,
  Calendar,
  MapPin,
  Shield,
  FileText,
  ChevronRight,
  Package,
  CircleDot,
  MoreHorizontal,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  sampleVehicles,
  sampleMaintenanceRecords,
  sampleEquipment,
  type Vehicle,
  type VehicleStatus,
  type MaintenanceRecord,
  type MaintenanceStatus,
  type Equipment,
  type EquipmentStatus,
} from "@/lib/sample-data-p3";

// --- Helpers ---

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

// --- Status badge helpers ---

function vehicleStatusStyle(status: VehicleStatus): string {
  switch (status) {
    case "Active":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0";
    case "In Shop":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0";
    case "Out of Service":
      return "bg-red-500/15 text-red-700 dark:text-red-400 border-0";
  }
}

function maintenanceStatusStyle(status: MaintenanceStatus): { className: string; variant?: "secondary" | "outline" } {
  switch (status) {
    case "Completed":
      return { className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0" };
    case "Scheduled":
      return { className: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-0" };
    case "In Progress":
      return { className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0" };
    case "Overdue":
      return { className: "bg-red-500/15 text-red-700 dark:text-red-400 border-0" };
  }
}

function equipmentStatusStyle(status: EquipmentStatus): string {
  switch (status) {
    case "Available":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0";
    case "Checked Out":
      return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-0";
    case "Maintenance":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0";
    case "Retired":
      return "bg-foreground/10 text-muted-foreground border-0";
  }
}

function conditionStyle(condition: Equipment["condition"]): string {
  switch (condition) {
    case "Excellent":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0";
    case "Good":
      return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-0";
    case "Fair":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0";
    case "Poor":
      return "bg-red-500/15 text-red-700 dark:text-red-400 border-0";
  }
}

function isExpiringSoon(dateStr: string): boolean {
  const expiry = new Date(dateStr + "T00:00:00");
  const now = new Date("2026-03-18T00:00:00");
  const diffDays = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 30 && diffDays >= 0;
}

function isExpired(dateStr: string): boolean {
  const expiry = new Date(dateStr + "T00:00:00");
  const now = new Date("2026-03-18T00:00:00");
  return expiry < now;
}

// --- Badge Components ---

function VehicleStatusBadge({ status }: { status: VehicleStatus }) {
  return (
    <Badge variant="default" className={`text-[10px] ${vehicleStatusStyle(status)}`}>
      {status}
    </Badge>
  );
}

function MaintenanceStatusBadge({ status }: { status: MaintenanceStatus }) {
  const style = maintenanceStatusStyle(status);
  return (
    <Badge variant={style.variant ?? "default"} className={`text-[10px] ${style.className}`}>
      {status}
    </Badge>
  );
}

function EquipmentStatusBadge({ status }: { status: EquipmentStatus }) {
  return (
    <Badge variant="default" className={`text-[10px] ${equipmentStatusStyle(status)}`}>
      {status}
    </Badge>
  );
}

function ConditionBadge({ condition }: { condition: Equipment["condition"] }) {
  return (
    <Badge variant="default" className={`text-[10px] ${conditionStyle(condition)}`}>
      {condition}
    </Badge>
  );
}

// --- Tab types ---
type TabValue = "vehicles" | "maintenance" | "equipment";

const allVehicleStatuses: VehicleStatus[] = ["Active", "In Shop", "Out of Service"];
const allMaintenanceStatuses: MaintenanceStatus[] = ["Scheduled", "In Progress", "Completed", "Overdue"];
const allEquipmentStatuses: EquipmentStatus[] = ["Available", "Checked Out", "Maintenance", "Retired"];

export default function FleetEquipmentPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("vehicles");
  const [search, setSearch] = useState("");
  const [vehicleStatusFilter, setVehicleStatusFilter] = useState("all");
  const [maintenanceStatusFilter, setMaintenanceStatusFilter] = useState("all");
  const [equipmentStatusFilter, setEquipmentStatusFilter] = useState("all");

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedMaintenance, setSelectedMaintenance] = useState<MaintenanceRecord | null>(null);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // --- Computed ---

  const filteredVehicles = useMemo(() => {
    return sampleVehicles.filter((v) => {
      const matchesStatus = vehicleStatusFilter === "all" || v.status === vehicleStatusFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        v.name.toLowerCase().includes(q) ||
        v.make.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.plate.toLowerCase().includes(q) ||
        v.assignedTo.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [search, vehicleStatusFilter]);

  const filteredMaintenance = useMemo(() => {
    return sampleMaintenanceRecords.filter((m) => {
      const matchesStatus = maintenanceStatusFilter === "all" || m.status === maintenanceStatusFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        m.vehicleName.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q) ||
        m.vendor.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [search, maintenanceStatusFilter]);

  const filteredEquipment = useMemo(() => {
    return sampleEquipment.filter((e) => {
      const matchesStatus = equipmentStatusFilter === "all" || e.status === equipmentStatusFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.serialNumber.toLowerCase().includes(q) ||
        e.assignedTo.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [search, equipmentStatusFilter]);

  // --- KPIs ---

  const activeVehicles = sampleVehicles.filter((v) => v.status === "Active").length;
  const totalVehicles = sampleVehicles.length;

  const overdueCount = sampleMaintenanceRecords.filter((m) => m.status === "Overdue").length;
  const inProgressCount = sampleMaintenanceRecords.filter((m) => m.status === "In Progress").length;

  const totalMonthlyFleetCost = sampleVehicles.reduce(
    (sum, v) => sum + v.monthlyFuel + v.monthlyMaintenance,
    0
  );

  const checkedOutEquipment = sampleEquipment.filter((e) => e.status === "Checked Out").length;
  const totalEquipment = sampleEquipment.length;

  const kpis = [
    {
      label: "Active Fleet",
      value: `${activeVehicles}/${totalVehicles}`,
      icon: Truck,
      detail: `${sampleVehicles.filter((v) => v.status === "In Shop").length} in shop`,
    },
    {
      label: "Maintenance",
      value: `${overdueCount + inProgressCount}`,
      icon: Wrench,
      detail: overdueCount > 0 ? `${overdueCount} overdue` : "All on schedule",
      alert: overdueCount > 0,
    },
    {
      label: "Monthly Fleet Cost",
      value: formatCurrency(totalMonthlyFleetCost),
      icon: DollarSign,
      detail: `Fuel + maintenance`,
    },
    {
      label: "Equipment Out",
      value: `${checkedOutEquipment}/${totalEquipment}`,
      icon: Package,
      detail: `${sampleEquipment.filter((e) => e.status === "Available").length} available`,
    },
  ];

  // --- Determine which sheet is open ---
  const sheetOpen = !!selectedVehicle || !!selectedMaintenance || !!selectedEquipment;
  const closeSheet = () => {
    setSelectedVehicle(null);
    setSelectedMaintenance(null);
    setSelectedEquipment(null);
  };

  // Current filter + statuses for the active tab
  const currentStatusFilter =
    activeTab === "vehicles" ? vehicleStatusFilter :
    activeTab === "maintenance" ? maintenanceStatusFilter :
    equipmentStatusFilter;

  const setCurrentStatusFilter = (v: string) => {
    if (activeTab === "vehicles") setVehicleStatusFilter(v);
    else if (activeTab === "maintenance") setMaintenanceStatusFilter(v);
    else setEquipmentStatusFilter(v);
  };

  const currentStatuses =
    activeTab === "vehicles" ? allVehicleStatuses :
    activeTab === "maintenance" ? allMaintenanceStatuses :
    allEquipmentStatuses;

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" data-testid="kpi-row">
        {kpis.map((kpi) => (
          <Card key={kpi.label} data-testid={`card-kpi-${kpi.label.toLowerCase().replace(/\s+/g, "-")}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
              <kpi.icon className={`h-4 w-4 ${kpi.alert ? "text-red-500" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold tracking-tight font-mono">{kpi.value}</div>
              <p className={`text-xs mt-1 ${kpi.alert ? "text-red-600 dark:text-red-400" : "text-muted-foreground"}`}>
                {kpi.detail}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as TabValue);
          setSearch("");
        }}
        data-testid="fleet-tabs"
      >
        <TabsList>
          <TabsTrigger value="vehicles" data-testid="tab-vehicles">
            <Truck className="h-3.5 w-3.5 mr-1.5" />
            Vehicles
          </TabsTrigger>
          <TabsTrigger value="maintenance" data-testid="tab-maintenance">
            <Wrench className="h-3.5 w-3.5 mr-1.5" />
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="equipment" data-testid="tab-equipment">
            <Package className="h-3.5 w-3.5 mr-1.5" />
            Equipment
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap" data-testid="toolbar">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={
              activeTab === "vehicles" ? "Search vehicles..." :
              activeTab === "maintenance" ? "Search maintenance..." :
              "Search equipment..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
            data-testid="input-search"
          />
        </div>
        <Select
          value={currentStatusFilter}
          onValueChange={(v) => setCurrentStatusFilter(v ?? "all")}
        >
          <SelectTrigger className="w-[160px]" data-testid="select-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {currentStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-1" />
      </div>

      {/* Tab Content */}
      {activeTab === "vehicles" && (
        <VehiclesTable
          vehicles={filteredVehicles}
          onSelect={setSelectedVehicle}
        />
      )}
      {activeTab === "maintenance" && (
        <MaintenanceTable
          records={filteredMaintenance}
          onSelect={setSelectedMaintenance}
        />
      )}
      {activeTab === "equipment" && (
        <EquipmentTable
          equipment={filteredEquipment}
          onSelect={setSelectedEquipment}
        />
      )}

      {/* Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={closeSheet}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto" data-testid="sheet-detail">
          {selectedVehicle && <VehicleDetail vehicle={selectedVehicle} />}
          {selectedMaintenance && <MaintenanceDetail record={selectedMaintenance} />}
          {selectedEquipment && <EquipmentDetail item={selectedEquipment} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Vehicles Table ─────────────────────────────────────────────────

function VehiclesTable({
  vehicles,
  onSelect,
}: {
  vehicles: Vehicle[];
  onSelect: (v: Vehicle) => void;
}) {
  return (
    <Card data-testid="card-vehicles-table">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">
                <span className="inline-flex items-center gap-1">
                  Vehicle <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                </span>
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead className="text-right">
                <span className="inline-flex items-center gap-1 justify-end">
                  Mileage <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                </span>
              </TableHead>
              <TableHead>Next Service</TableHead>
              <TableHead className="text-right">Monthly Cost</TableHead>
              <TableHead className="w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.map((v) => {
              const monthlyCost = v.monthlyFuel + v.monthlyMaintenance;
              return (
                <TableRow
                  key={v.id}
                  className="cursor-pointer"
                  onClick={() => onSelect(v)}
                  data-testid={`row-vehicle-${v.id}`}
                >
                  <TableCell className="pl-4">
                    <div>
                      <span className="text-sm font-medium">{v.name}</span>
                      <span className="block text-xs text-muted-foreground">
                        {v.year} {v.make} {v.model}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{v.type}</TableCell>
                  <TableCell>
                    <VehicleStatusBadge status={v.status} />
                  </TableCell>
                  <TableCell className="text-sm">{v.assignedTo}</TableCell>
                  <TableCell className="text-right text-sm font-mono text-muted-foreground">
                    {formatNumber(v.mileage)} mi
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-mono text-muted-foreground">
                      {formatDate(v.nextService)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right text-sm font-mono">
                    {formatCurrency(monthlyCost)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger data-testid={`menu-vehicle-${v.id}`}>
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onSelect(v); }}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          Schedule Service
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          Edit Vehicle
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
            {vehicles.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  No vehicles match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ─── Maintenance Table ──────────────────────────────────────────────

function MaintenanceTable({
  records,
  onSelect,
}: {
  records: MaintenanceRecord[];
  onSelect: (r: MaintenanceRecord) => void;
}) {
  return (
    <Card data-testid="card-maintenance-table">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Vehicle</TableHead>
              <TableHead>
                <span className="inline-flex items-center gap-1">
                  Service Type <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                </span>
              </TableHead>
              <TableHead>Status</TableHead>
              <TableHead>
                <span className="inline-flex items-center gap-1">
                  Scheduled <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                </span>
              </TableHead>
              <TableHead>Completed</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead>Vendor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.map((r) => (
              <TableRow
                key={r.id}
                className="cursor-pointer"
                onClick={() => onSelect(r)}
                data-testid={`row-maintenance-${r.id}`}
              >
                <TableCell className="pl-4 text-sm">{r.vehicleName}</TableCell>
                <TableCell className="text-sm font-medium">{r.type}</TableCell>
                <TableCell>
                  <MaintenanceStatusBadge status={r.status} />
                </TableCell>
                <TableCell className="text-sm font-mono text-muted-foreground">
                  {formatDate(r.scheduledDate)}
                </TableCell>
                <TableCell className="text-sm font-mono text-muted-foreground">
                  {r.completedDate ? formatDate(r.completedDate) : "—"}
                </TableCell>
                <TableCell className="text-right text-sm font-mono">
                  {formatCurrency(r.cost)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{r.vendor}</TableCell>
              </TableRow>
            ))}
            {records.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No maintenance records match your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ─── Equipment Table ────────────────────────────────────────────────

function EquipmentTable({
  equipment,
  onSelect,
}: {
  equipment: Equipment[];
  onSelect: (e: Equipment) => void;
}) {
  return (
    <Card data-testid="card-equipment-table">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">
                <span className="inline-flex items-center gap-1">
                  Equipment <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                </span>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Location</TableHead>
              <TableHead className="text-right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {equipment.map((e) => (
              <TableRow
                key={e.id}
                className="cursor-pointer"
                onClick={() => onSelect(e)}
                data-testid={`row-equipment-${e.id}`}
              >
                <TableCell className="pl-4">
                  <div>
                    <span className="text-sm font-medium">{e.name}</span>
                    <span className="block text-xs text-muted-foreground font-mono">
                      {e.serialNumber}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{e.category}</TableCell>
                <TableCell>
                  <EquipmentStatusBadge status={e.status} />
                </TableCell>
                <TableCell>
                  <ConditionBadge condition={e.condition} />
                </TableCell>
                <TableCell className="text-sm">
                  {e.assignedTo || <span className="text-muted-foreground">—</span>}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{e.location}</TableCell>
                <TableCell className="text-right text-sm font-mono">
                  {formatCurrency(e.purchaseCost)}
                </TableCell>
              </TableRow>
            ))}
            {equipment.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  No equipment matches your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ─── Vehicle Detail Sheet ───────────────────────────────────────────

function VehicleDetail({ vehicle }: { vehicle: Vehicle }) {
  const relatedMaintenance = sampleMaintenanceRecords.filter(
    (m) => m.vehicleId === vehicle.id
  );
  const totalMaintenanceCost = relatedMaintenance.reduce((sum, m) => sum + m.cost, 0);
  const assignedEquipment = sampleEquipment.filter(
    (e) => e.assignedTo === vehicle.assignedTo && e.status === "Checked Out"
  );

  const insuranceExpiring = isExpiringSoon(vehicle.insuranceExpiry);
  const insuranceExpired = isExpired(vehicle.insuranceExpiry);
  const registrationExpiring = isExpiringSoon(vehicle.registrationExpiry);
  const registrationExpired = isExpired(vehicle.registrationExpiry);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-lg flex items-center gap-2">
          <span>{vehicle.name}</span>
          <VehicleStatusBadge status={vehicle.status} />
        </SheetTitle>
        <SheetDescription className="text-sm">
          {vehicle.year} {vehicle.make} {vehicle.model} — {vehicle.type}
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        {/* Vehicle Info */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Vehicle Info
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">VIN</p>
              <p className="text-sm font-mono">{vehicle.vin}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">License Plate</p>
              <p className="text-sm font-mono">{vehicle.plate}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Mileage</p>
              <p className="text-sm font-mono">{formatNumber(vehicle.mileage)} mi</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Fuel Type</p>
              <p className="text-sm">{vehicle.fuelType}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Assignment */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Assignment
          </h4>
          <div>
            <p className="text-xs text-muted-foreground">Assigned To</p>
            {vehicle.assignedTo === "Shared" ? (
              <p className="text-sm text-muted-foreground">Shared — No primary driver</p>
            ) : (
              <Link
                href="/dashboard/workforce"
                className="text-sm hover:underline"
                data-testid="link-vehicle-employee"
              >
                {vehicle.assignedTo}
                <ExternalLink className="inline h-3 w-3 ml-1 -mt-0.5" />
              </Link>
            )}
          </div>
          {assignedEquipment.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1">Equipment on Vehicle</p>
              <div className="space-y-1">
                {assignedEquipment.map((eq) => (
                  <p key={eq.id} className="text-sm text-muted-foreground">
                    {eq.name}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Service Schedule */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Service Schedule
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Last Service</p>
              <p className="text-sm font-mono">{formatDate(vehicle.lastService)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Next Service</p>
              <p className="text-sm font-mono">{formatDate(vehicle.nextService)}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Compliance & Expiries */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Compliance
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Insurance Expiry</p>
              <div className="flex items-center gap-1.5">
                <p className={`text-sm font-mono ${
                  insuranceExpired ? "text-red-600 dark:text-red-400 font-medium" :
                  insuranceExpiring ? "text-amber-600 dark:text-amber-400 font-medium" : ""
                }`}>
                  {formatDate(vehicle.insuranceExpiry)}
                </p>
                {insuranceExpiring && !insuranceExpired && (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                )}
                {insuranceExpired && (
                  <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Registration Expiry</p>
              <div className="flex items-center gap-1.5">
                <p className={`text-sm font-mono ${
                  registrationExpired ? "text-red-600 dark:text-red-400 font-medium" :
                  registrationExpiring ? "text-amber-600 dark:text-amber-400 font-medium" : ""
                }`}>
                  {formatDate(vehicle.registrationExpiry)}
                </p>
                {registrationExpiring && !registrationExpired && (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                )}
                {registrationExpired && (
                  <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Cost Summary */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Cost Summary
          </h4>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monthly Fuel</span>
              <span className="font-mono">{formatCurrency(vehicle.monthlyFuel)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monthly Maintenance</span>
              <span className="font-mono">{formatCurrency(vehicle.monthlyMaintenance)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm font-medium">
              <span>Monthly Total</span>
              <span className="font-mono">
                {formatCurrency(vehicle.monthlyFuel + vehicle.monthlyMaintenance)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Maintenance (History)</span>
              <span className="font-mono text-muted-foreground">
                {formatCurrency(totalMaintenanceCost)}
              </span>
            </div>
          </div>
        </div>

        {/* Maintenance History */}
        {relatedMaintenance.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Maintenance History
              </h4>
              <div className="space-y-2">
                {relatedMaintenance.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between py-1.5 border-b last:border-0"
                  >
                    <div>
                      <p className="text-sm">{m.type}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {formatDate(m.scheduledDate)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">{formatCurrency(m.cost)}</span>
                      <MaintenanceStatusBadge status={m.status} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2" data-testid="vehicle-actions">
          <Button size="sm" data-testid="button-schedule-service">
            <Wrench className="h-3.5 w-3.5 mr-1.5" />
            Schedule Service
          </Button>
          <Button size="sm" variant="outline" data-testid="button-edit-vehicle">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Edit Vehicle
          </Button>
        </div>
      </div>
    </>
  );
}

// ─── Maintenance Detail Sheet ───────────────────────────────────────

function MaintenanceDetail({ record }: { record: MaintenanceRecord }) {
  const vehicle = sampleVehicles.find((v) => v.id === record.vehicleId);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-lg flex items-center gap-2">
          <span>{record.type}</span>
          <MaintenanceStatusBadge status={record.status} />
        </SheetTitle>
        <SheetDescription className="text-sm">
          {record.vehicleName}
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        {/* Service Details */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Service Details
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Scheduled Date</p>
              <p className={`text-sm font-mono ${
                record.status === "Overdue" ? "text-red-600 dark:text-red-400 font-medium" : ""
              }`}>
                {formatDate(record.scheduledDate)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Completed Date</p>
              <p className="text-sm font-mono">
                {record.completedDate ? formatDate(record.completedDate) : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Vendor</p>
              <p className="text-sm">{record.vendor}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cost</p>
              <p className="text-sm font-mono font-medium">{formatCurrency(record.cost)}</p>
            </div>
            {record.mileageAtService && (
              <div>
                <p className="text-xs text-muted-foreground">Mileage at Service</p>
                <p className="text-sm font-mono">{formatNumber(record.mileageAtService)} mi</p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Vehicle Info */}
        {vehicle && (
          <>
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Vehicle
              </h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Vehicle</p>
                  <p className="text-sm font-medium">{vehicle.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Mileage</p>
                  <p className="text-sm font-mono">{formatNumber(vehicle.mileage)} mi</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Assigned To</p>
                  {vehicle.assignedTo === "Shared" ? (
                    <p className="text-sm text-muted-foreground">Shared</p>
                  ) : (
                    <Link
                      href="/dashboard/workforce"
                      className="text-sm hover:underline"
                      data-testid="link-maintenance-employee"
                    >
                      {vehicle.assignedTo}
                      <ExternalLink className="inline h-3 w-3 ml-1 -mt-0.5" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Notes */}
        {record.notes && (
          <>
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Notes
              </h4>
              <p className="text-sm text-muted-foreground">{record.notes}</p>
            </div>
            <Separator />
          </>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-2" data-testid="maintenance-actions">
          {record.status === "Scheduled" && (
            <Button size="sm" data-testid="button-start-service">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              Start Service
            </Button>
          )}
          {record.status === "In Progress" && (
            <Button size="sm" data-testid="button-complete-service">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              Mark Complete
            </Button>
          )}
          {record.status === "Overdue" && (
            <Button size="sm" data-testid="button-reschedule">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              Reschedule
            </Button>
          )}
          <Button size="sm" variant="outline" data-testid="button-edit-maintenance">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Edit Record
          </Button>
        </div>
      </div>
    </>
  );
}

// ─── Equipment Detail Sheet ─────────────────────────────────────────

function EquipmentDetail({ item }: { item: Equipment }) {
  const inspectionExpiring = isExpiringSoon(item.nextInspection);
  const inspectionExpired = isExpired(item.nextInspection);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-lg flex items-center gap-2">
          <span>{item.name}</span>
          <EquipmentStatusBadge status={item.status} />
        </SheetTitle>
        <SheetDescription className="text-sm font-mono">
          {item.serialNumber}
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        {/* Equipment Info */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Equipment Info
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="text-sm">{item.category}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Condition</p>
              <ConditionBadge condition={item.condition} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="text-sm">{item.location}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Purchase Cost</p>
              <p className="text-sm font-mono">{formatCurrency(item.purchaseCost)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Purchase Date</p>
              <p className="text-sm font-mono">{formatDate(item.purchaseDate)}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Assignment */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Assignment
          </h4>
          {item.assignedTo ? (
            <div>
              <p className="text-xs text-muted-foreground">Assigned To</p>
              <Link
                href="/dashboard/workforce"
                className="text-sm hover:underline"
                data-testid="link-equipment-employee"
              >
                {item.assignedTo}
                <ExternalLink className="inline h-3 w-3 ml-1 -mt-0.5" />
              </Link>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Not currently assigned</p>
          )}
        </div>

        <Separator />

        {/* Inspections */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Inspections
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Last Inspection</p>
              <p className="text-sm font-mono">{formatDate(item.lastInspection)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Next Inspection</p>
              <div className="flex items-center gap-1.5">
                <p className={`text-sm font-mono ${
                  inspectionExpired ? "text-red-600 dark:text-red-400 font-medium" :
                  inspectionExpiring ? "text-amber-600 dark:text-amber-400 font-medium" : ""
                }`}>
                  {formatDate(item.nextInspection)}
                </p>
                {inspectionExpiring && !inspectionExpired && (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                )}
                {inspectionExpired && (
                  <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2" data-testid="equipment-actions">
          {item.status === "Available" && (
            <Button size="sm" data-testid="button-check-out">
              <ChevronRight className="h-3.5 w-3.5 mr-1.5" />
              Check Out
            </Button>
          )}
          {item.status === "Checked Out" && (
            <Button size="sm" data-testid="button-check-in">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              Check In
            </Button>
          )}
          <Button size="sm" variant="outline" data-testid="button-schedule-inspection">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            Schedule Inspection
          </Button>
          <Button size="sm" variant="outline" data-testid="button-edit-equipment">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
        </div>
      </div>
    </>
  );
}
