"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  ArrowUpDown,
  Clock,
  MapPin,
  User,
  Wrench,
  ExternalLink,
  MoreHorizontal,
  Receipt,
  Calendar,
  FileText,
  Pencil,
  ChevronRight,
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
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
  workOrders,
  employees,
  type WorkOrder,
  type WorkOrderStatus,
  type WorkOrderPriority,
} from "@/lib/sample-data";

// --- Helpers ---

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return "Unscheduled";
  const s = new Date(start);
  const formatted = s.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  if (end) {
    return `${formatted}, ${formatTime(start)} – ${formatTime(end)}`;
  }
  return `${formatted}, ${formatTime(start)}`;
}

// Status pipeline order
const statusOrder: WorkOrderStatus[] = ["New", "Assigned", "In Progress", "On Hold", "Completed", "Invoiced"];

const priorityStyles: Record<WorkOrderPriority, string> = {
  Emergency: "bg-red-500/15 text-red-700 dark:text-red-400 border-0",
  High: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0",
  Normal: "",
  Low: "",
};

function PriorityBadge({ priority }: { priority: WorkOrderPriority }) {
  if (priority === "Normal") {
    return <Badge variant="secondary" className="text-[10px]">{priority}</Badge>;
  }
  if (priority === "Low") {
    return <Badge variant="outline" className="text-[10px]">{priority}</Badge>;
  }
  return (
    <Badge variant="default" className={`text-[10px] ${priorityStyles[priority]}`}>
      {priority}
    </Badge>
  );
}

const statusBadgeVariant: Record<WorkOrderStatus, "default" | "secondary" | "outline" | "destructive"> = {
  New: "outline",
  Assigned: "secondary",
  "In Progress": "default",
  "On Hold": "secondary",
  Completed: "secondary",
  Invoiced: "secondary",
  Cancelled: "destructive",
};

function StatusBadge({ status }: { status: WorkOrderStatus }) {
  const baseStyles: Record<string, string> = {
    "In Progress": "bg-foreground text-background",
    Completed: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0",
    Invoiced: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-0",
  };
  return (
    <Badge
      variant={statusBadgeVariant[status] || "secondary"}
      className={`text-[10px] ${baseStyles[status] || ""}`}
    >
      {status}
    </Badge>
  );
}

export default function WorkOrdersPage() {
  const [viewTab, setViewTab] = useState<"pipeline" | "table">("pipeline");
  const [selectedWO, setSelectedWO] = useState<WorkOrder | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");

  // --- Filtered data ---
  const filtered = useMemo(() => {
    return workOrders.filter((wo) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        wo.orderNumber.toLowerCase().includes(q) ||
        wo.title.toLowerCase().includes(q) ||
        wo.clientName.toLowerCase().includes(q) ||
        (wo.assignee && wo.assignee.toLowerCase().includes(q));
      const matchesStatus = statusFilter === "all" || wo.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || wo.priority === priorityFilter;
      const matchesAssignee =
        assigneeFilter === "all" ||
        (assigneeFilter === "unassigned" ? !wo.assigneeId : wo.assigneeId === assigneeFilter);
      return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    });
  }, [search, statusFilter, priorityFilter, assigneeFilter]);

  // --- KPI calculations ---
  const totalOrders = workOrders.length;
  const inProgressCount = workOrders.filter((wo) => wo.status === "In Progress").length;
  const completedCount = workOrders.filter(
    (wo) => wo.status === "Completed" || wo.status === "Invoiced"
  ).length;
  const revenue = workOrders
    .filter((wo) => wo.status === "Completed" || wo.status === "Invoiced")
    .reduce((sum, wo) => sum + (wo.totalCost || 0), 0);

  // --- Pipeline columns ---
  const pipelineColumns = useMemo(() => {
    return statusOrder.map((status) => ({
      status,
      orders: filtered.filter((wo) => wo.status === status),
    }));
  }, [filtered]);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]" data-testid="work-orders-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" data-testid="page-title">
            Work Orders & Job Tracking
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Every job from intake to completion to payment
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" data-testid="kpi-row">
        {[
          { label: "Total Orders", value: String(totalOrders), testId: "kpi-total" },
          { label: "In Progress", value: String(inProgressCount), testId: "kpi-in-progress" },
          { label: "Completed", value: String(completedCount), testId: "kpi-completed" },
          { label: "Revenue", value: formatCurrency(revenue), testId: "kpi-revenue" },
        ].map((kpi) => (
          <Card key={kpi.label} data-testid={kpi.testId}>
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="text-xl font-semibold tracking-tight mt-0.5 font-mono">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap" data-testid="toolbar">
        <Tabs
          value={viewTab}
          onValueChange={(v) => setViewTab(v as "pipeline" | "table")}
          data-testid="view-tabs"
        >
          <TabsList className="h-8">
            <TabsTrigger value="pipeline" className="text-xs px-3" data-testid="tab-pipeline">
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="table" className="text-xs px-3" data-testid="tab-table">
              Table
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search work orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8"
            data-testid="input-search-wo"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[130px] h-8 text-xs" data-testid="select-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {statusOrder.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-[130px] h-8 text-xs" data-testid="select-priority-filter">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            {(["Emergency", "High", "Normal", "Low"] as WorkOrderPriority[]).map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-[160px] h-8 text-xs" data-testid="select-assignee-filter">
            <SelectValue placeholder="Assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {employees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <Button size="sm" className="h-8" data-testid="button-new-wo">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          New Work Order
        </Button>
      </div>

      {/* Pipeline View */}
      {viewTab === "pipeline" && (
        <div className="overflow-x-auto pb-2" data-testid="pipeline-view">
          <div className="flex gap-4 min-w-max">
            {pipelineColumns.map((col) => (
              <div
                key={col.status}
                className="w-[240px] shrink-0"
                data-testid={`pipeline-col-${col.status.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {col.status}
                    </h3>
                    <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                      {col.orders.length}
                    </Badge>
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-2 min-h-[200px]">
                  {col.orders.map((wo) => (
                    <button
                      key={wo.id}
                      onClick={() => setSelectedWO(wo)}
                      className="w-full text-left rounded-lg border bg-card p-3 space-y-2 hover:border-foreground/20 transition-colors cursor-pointer"
                      data-testid={`pipeline-card-${wo.id}`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-muted-foreground">
                          {wo.orderNumber}
                        </span>
                        <PriorityBadge priority={wo.priority} />
                      </div>
                      <p className="text-sm font-medium leading-tight line-clamp-2">
                        {wo.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {wo.clientName}
                      </p>
                      <div className="flex items-center justify-between gap-2 pt-1">
                        {wo.assignee ? (
                          <div className="flex items-center gap-1.5">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[9px] bg-foreground/10">
                                {employees.find((e) => e.id === wo.assigneeId)?.initials || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                              {wo.assignee}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/60 italic">
                            Unassigned
                          </span>
                        )}
                        {wo.scheduledStart && (
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {new Date(wo.scheduledStart).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                  {col.orders.length === 0 && (
                    <div className="flex items-center justify-center h-[100px] border border-dashed rounded-lg">
                      <span className="text-xs text-muted-foreground/50">No orders</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table View */}
      {viewTab === "table" && (
        <Card data-testid="table-view">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">
                    <span className="inline-flex items-center gap-1">
                      Order # <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                    </span>
                  </TableHead>
                  <TableHead>
                    <span className="inline-flex items-center gap-1">
                      Title <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                    </span>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead className="text-right">Est. Hrs</TableHead>
                  <TableHead className="text-right">
                    <span className="inline-flex items-center gap-1 justify-end">
                      Cost <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((wo) => (
                  <TableRow
                    key={wo.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedWO(wo)}
                    data-testid={`row-wo-${wo.id}`}
                  >
                    <TableCell className="pl-4 font-mono text-sm">{wo.orderNumber}</TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{wo.title}</TableCell>
                    <TableCell><StatusBadge status={wo.status} /></TableCell>
                    <TableCell><PriorityBadge priority={wo.priority} /></TableCell>
                    <TableCell className="text-sm">{wo.clientName}</TableCell>
                    <TableCell className="text-sm">
                      {wo.assignee ? (
                        <div className="flex items-center gap-1.5">
                          <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[9px] bg-foreground/10">
                              {employees.find((e) => e.id === wo.assigneeId)?.initials || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate max-w-[100px]">{wo.assignee}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60 italic text-xs">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">
                      {wo.scheduledStart
                        ? new Date(wo.scheduledStart).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono">
                      {wo.estimatedHours}h
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono">
                      {wo.totalCost ? formatCurrency(wo.totalCost) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      No work orders match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Work Order Detail Slide-out */}
      <Sheet open={!!selectedWO} onOpenChange={() => setSelectedWO(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto" data-testid="sheet-wo-detail">
          {selectedWO && (
            <WorkOrderDetail wo={selectedWO} onClose={() => setSelectedWO(null)} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// --- Work Order Detail Component ---

function WorkOrderDetail({ wo, onClose }: { wo: WorkOrder; onClose: () => void }) {
  const emp = employees.find((e) => e.id === wo.assigneeId);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-lg flex items-center gap-2">
          <span className="font-mono">{wo.orderNumber}</span>
        </SheetTitle>
        <SheetDescription className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={wo.status} />
          <PriorityBadge priority={wo.priority} />
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        {/* Title & Description */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Job Details
          </h4>
          <div className="space-y-2">
            <p className="text-sm font-medium">{wo.title}</p>
            <p className="text-sm text-muted-foreground">{wo.description}</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">{wo.serviceType}</span>
          </div>
        </div>

        <Separator />

        {/* Client & Location */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Client & Location
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <Link
                href="/dashboard/clients"
                className="hover:underline underline-offset-2"
                data-testid="link-wo-client"
              >
                {wo.clientName}
                <ExternalLink className="inline h-3 w-3 ml-1 -mt-0.5" />
              </Link>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{wo.serviceAddress}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Assignee */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Assigned To
          </h4>
          {emp ? (
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-foreground/10">{emp.initials}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{emp.name}</p>
                <p className="text-xs text-muted-foreground">{emp.role}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground/60 italic">Unassigned</p>
          )}
        </div>

        <Separator />

        {/* Schedule */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Schedule
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-mono text-sm">
                {formatDateRange(wo.scheduledStart, wo.scheduledEnd)}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Hours & Cost */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Time & Cost
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Estimated Hours</p>
              <p className="text-sm font-mono">{wo.estimatedHours}h</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Actual Hours</p>
              <p className="text-sm font-mono">
                {wo.actualHours !== null ? `${wo.actualHours}h` : "—"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Cost</p>
              <p className="text-sm font-mono font-medium">
                {wo.totalCost !== null ? formatCurrency(wo.totalCost) : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        {wo.notes && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Notes
              </h4>
              <p className="text-sm text-muted-foreground">{wo.notes}</p>
            </div>
          </>
        )}

        {/* Timestamps */}
        <Separator />
        <div className="text-xs text-muted-foreground">
          <span>Created: {formatDate(wo.createdAt)}</span>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2" data-testid="wo-actions">
          {(wo.status === "Completed") && (
            <Button size="sm" asChild data-testid="button-create-invoice">
              <Link href="/dashboard/invoicing">
                <Receipt className="h-3.5 w-3.5 mr-1.5" />
                Create Invoice
              </Link>
            </Button>
          )}
          <Button size="sm" variant="outline" data-testid="button-edit-wo">
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
          <Button size="sm" variant="outline" data-testid="button-change-status">
            <ChevronRight className="h-3.5 w-3.5 mr-1.5" />
            Change Status
          </Button>
          <Button size="sm" variant="outline" asChild data-testid="button-view-schedule">
            <Link href="/dashboard/scheduling">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              View Schedule
            </Link>
          </Button>
        </div>
      </div>
    </>
  );
}
