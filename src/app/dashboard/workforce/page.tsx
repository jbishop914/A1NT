"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Users,
  UserCheck,
  ShieldAlert,
  Clock,
  Star,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Briefcase,
  Award,
  ExternalLink,
  Wrench,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import {
  employeesP2,
  timeEntries,
  type Employee,
  type Certification,
  type TimeEntry,
} from "@/lib/sample-data-p2";

// --- Helpers ---

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function certStatusStyle(status: Certification["status"]): string {
  switch (status) {
    case "Valid":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0";
    case "Expiring":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0";
    case "Expired":
      return "bg-red-500/15 text-red-700 dark:text-red-400 border-0";
  }
}

function empStatusStyle(status: Employee["status"]): string {
  switch (status) {
    case "Active":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0";
    case "On Leave":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0";
    case "Inactive":
      return "bg-foreground/10 text-muted-foreground border-0";
  }
}

function timeEntryStatusStyle(status: TimeEntry["status"]): string {
  switch (status) {
    case "Clocked In":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0";
    case "Completed":
      return "";
    case "Approved":
      return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-0";
    case "Pending":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0";
  }
}

function timeEntryTypeStyle(type: TimeEntry["type"]): string {
  switch (type) {
    case "Overtime":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0";
    case "PTO":
      return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-0";
    case "Sick":
      return "bg-red-500/15 text-red-700 dark:text-red-400 border-0";
    default:
      return "";
  }
}

function renderStars(rating: number) {
  if (rating === 0) return <span className="text-xs text-muted-foreground/50 italic">N/A</span>;
  return (
    <div className="flex items-center gap-0.5">
      <Star className="h-3 w-3 fill-foreground/60 text-foreground/60" />
      <span className="text-sm font-mono">{rating.toFixed(1)}</span>
    </div>
  );
}

// --- Component ---

export default function WorkforcePage() {
  const [viewTab, setViewTab] = useState<"directory" | "time">("directory");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // --- Filtered employees ---
  const filtered = useMemo(() => {
    return employeesP2.filter((emp) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        emp.name.toLowerCase().includes(q) ||
        emp.role.toLowerCase().includes(q) ||
        emp.skills.some((s) => s.toLowerCase().includes(q));
      const matchesDept = deptFilter === "all" || emp.department === deptFilter;
      const matchesStatus = statusFilter === "all" || emp.status === statusFilter;
      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [search, deptFilter, statusFilter]);

  // --- KPI calculations ---
  const totalEmployees = employeesP2.length;
  const activeToday = employeesP2.filter((e) => e.status === "Active").length;
  const certsExpiring = employeesP2.reduce(
    (sum, e) => sum + e.certifications.filter((c) => c.status === "Expiring" || c.status === "Expired").length,
    0
  );
  const hoursThisWeek = employeesP2.reduce((sum, e) => sum + e.hoursThisWeek, 0);

  // --- Today's time entries ---
  const todaysEntries = useMemo(() => {
    return timeEntries.filter((te) => te.date === "2026-03-18");
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]" data-testid="workforce-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" data-testid="page-title">
            Employee & Workforce Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Know your team. Manage their time. Track their certifications.
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" data-testid="kpi-row">
        {[
          { label: "Total Employees", value: String(totalEmployees), icon: Users, testId: "kpi-total-employees" },
          { label: "Active Today", value: String(activeToday), icon: UserCheck, testId: "kpi-active-today" },
          { label: "Certs Expiring", value: String(certsExpiring), icon: ShieldAlert, testId: "kpi-certs-expiring" },
          { label: "Hours This Week", value: String(hoursThisWeek), icon: Clock, testId: "kpi-hours-week" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} data-testid={kpi.testId}>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xl font-semibold tracking-tight mt-0.5 font-mono">{kpi.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap" data-testid="toolbar">
        <Tabs
          value={viewTab}
          onValueChange={(v) => setViewTab(v as "directory" | "time")}
          data-testid="view-tabs"
        >
          <TabsList className="h-8">
            <TabsTrigger value="directory" className="text-xs px-3" data-testid="tab-directory">
              Directory
            </TabsTrigger>
            <TabsTrigger value="time" className="text-xs px-3" data-testid="tab-time">
              Time Tracking
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, role, skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8"
            data-testid="input-search"
          />
        </div>

        <Select value={deptFilter} onValueChange={(v) => setDeptFilter(v ?? "all")}>
          <SelectTrigger className="w-[160px] h-8 text-xs" data-testid="select-dept-filter">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            <SelectItem value="Field Operations">Field Operations</SelectItem>
            <SelectItem value="Administration">Administration</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-[130px] h-8 text-xs" data-testid="select-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="On Leave">On Leave</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <Button size="sm" className="h-8" data-testid="button-add-employee">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Employee
        </Button>
      </div>

      {/* Directory View */}
      {viewTab === "directory" && (
        <Card data-testid="directory-table">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Certifications</TableHead>
                  <TableHead className="text-right">Hrs/Week</TableHead>
                  <TableHead className="text-right">Rating</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((emp) => {
                  const expiringCerts = emp.certifications.filter(
                    (c) => c.status === "Expiring" || c.status === "Expired"
                  ).length;
                  return (
                    <TableRow
                      key={emp.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedEmployee(emp)}
                      data-testid={`row-emp-${emp.id}`}
                    >
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarFallback className="text-xs bg-foreground/10">
                              {emp.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{emp.name}</p>
                            <p className="text-xs text-muted-foreground">{emp.role}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{emp.department}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={`text-[10px] ${empStatusStyle(emp.status)}`}>
                          {emp.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap max-w-[200px]">
                          {emp.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="outline" className="text-[10px] font-normal py-0 h-4">
                              {skill}
                            </Badge>
                          ))}
                          {emp.skills.length > 3 && (
                            <Badge variant="outline" className="text-[10px] font-normal py-0 h-4">
                              +{emp.skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-mono">{emp.certifications.length}</span>
                          {expiringCerts > 0 && (
                            <Badge variant="secondary" className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0">
                              {expiringCerts} alert
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right text-sm font-mono">
                        {emp.hoursThisWeek}h
                      </TableCell>
                      <TableCell className="text-right">
                        {renderStars(emp.avgRating)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted transition-colors"
                            data-testid={`actions-${emp.id}`}
                          >
                            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedEmployee(emp)} data-testid={`action-view-${emp.id}`}>
                              View Profile
                            </DropdownMenuItem>
                            <DropdownMenuItem data-testid={`action-edit-${emp.id}`}>
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem data-testid={`action-schedule-${emp.id}`}>
                              View Schedule
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      No employees match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Time Tracking View */}
      {viewTab === "time" && (
        <Card data-testid="time-tracking-table">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Today&apos;s Time Entries — Mar 18, 2026</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Employee</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead className="text-right">Hours</TableHead>
                  <TableHead>Work Order</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todaysEntries.map((te) => {
                  const isClockedIn = te.status === "Clocked In";
                  return (
                    <TableRow key={te.id} data-testid={`row-te-${te.id}`}>
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-2">
                          {isClockedIn && (
                            <div className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
                          )}
                          <span className="text-sm font-medium">{te.employeeName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-mono">{te.clockIn || "—"}</TableCell>
                      <TableCell className="text-sm font-mono">{te.clockOut || "—"}</TableCell>
                      <TableCell className="text-right text-sm font-mono">
                        {te.totalHours > 0 ? `${te.totalHours}h` : "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {te.workOrderId ? (
                          <Link
                            href="/dashboard/work-orders"
                            className="hover:underline underline-offset-2 text-sm"
                            data-testid={`link-wo-${te.id}`}
                          >
                            <span className="font-mono text-muted-foreground">{te.workOrderId}</span>
                            <ExternalLink className="inline h-3 w-3 ml-1 -mt-0.5 text-muted-foreground" />
                          </Link>
                        ) : (
                          <span className="text-muted-foreground/50 text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={te.type === "Regular" ? "secondary" : "default"}
                          className={`text-[10px] ${timeEntryTypeStyle(te.type)}`}
                        >
                          {te.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={te.status === "Completed" ? "secondary" : "default"}
                          className={`text-[10px] ${timeEntryStatusStyle(te.status)}`}
                        >
                          {te.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Employee Detail Sheet */}
      <Sheet open={!!selectedEmployee} onOpenChange={() => setSelectedEmployee(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto" data-testid="sheet-employee-detail">
          {selectedEmployee && (
            <EmployeeDetail emp={selectedEmployee} onClose={() => setSelectedEmployee(null)} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// --- Employee Detail Component ---

function EmployeeDetail({ emp, onClose }: { emp: Employee; onClose: () => void }) {
  const empTimeEntries = timeEntries
    .filter((te) => te.employeeId === emp.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-lg flex items-center gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="text-sm bg-foreground/10">{emp.initials}</AvatarFallback>
          </Avatar>
          <div>
            <span>{emp.name}</span>
            <p className="text-xs text-muted-foreground font-normal mt-0.5">{emp.role}</p>
          </div>
        </SheetTitle>
        <SheetDescription className="flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className={`text-[10px] ${empStatusStyle(emp.status)}`}>
            {emp.status}
          </Badge>
          <Badge variant="outline" className="text-[10px]">{emp.department}</Badge>
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        {/* Contact Info */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Contact
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{emp.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-mono">{emp.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Hired {formatDate(emp.hireDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-mono">{formatCurrency(emp.hourlyRate)}/hr</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Skills */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Skills
          </h4>
          <div className="flex gap-1.5 flex-wrap">
            {emp.skills.map((skill) => (
              <Badge key={skill} variant="outline" className="text-[10px]">
                {skill}
              </Badge>
            ))}
            {emp.skills.length === 0 && (
              <span className="text-xs text-muted-foreground/50 italic">No skills listed</span>
            )}
          </div>
        </div>

        <Separator />

        {/* Certifications */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Award className="h-3 w-3" />
            Certifications
          </h4>
          {emp.certifications.length > 0 ? (
            <div className="space-y-2">
              {emp.certifications.map((cert, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border p-3 space-y-1"
                  data-testid={`cert-${idx}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">{cert.name}</p>
                    <Badge variant="secondary" className={`text-[10px] ${certStatusStyle(cert.status)}`}>
                      {cert.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{cert.issuer}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                    <span>Issued: {formatDate(cert.issued)}</span>
                    <span>Expires: {formatDate(cert.expires)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/50 italic">No certifications</p>
          )}
        </div>

        <Separator />

        {/* Performance Stats */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Performance
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Jobs Completed</p>
              <p className="text-sm font-mono font-semibold mt-0.5">{emp.jobsCompleted}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Avg Rating</p>
              <div className="mt-0.5">{renderStars(emp.avgRating)}</div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hours/Month</p>
              <p className="text-sm font-mono font-semibold mt-0.5">{emp.hoursThisMonth}h</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Recent Time Entries */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            Recent Time Entries
          </h4>
          {empTimeEntries.length > 0 ? (
            <div className="space-y-2">
              {empTimeEntries.map((te) => (
                <div
                  key={te.id}
                  className="flex items-center gap-3 py-2 border-b last:border-0"
                  data-testid={`emp-te-${te.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">{te.date}</span>
                      <Badge
                        variant={te.type === "Regular" ? "secondary" : "default"}
                        className={`text-[10px] ${timeEntryTypeStyle(te.type)}`}
                      >
                        {te.type}
                      </Badge>
                    </div>
                    {te.workOrderTitle ? (
                      <Link
                        href="/dashboard/work-orders"
                        className="text-xs hover:underline underline-offset-2 truncate block mt-0.5"
                        data-testid={`emp-te-wo-${te.id}`}
                      >
                        {te.workOrderTitle}
                        <ExternalLink className="inline h-2.5 w-2.5 ml-1 -mt-0.5 text-muted-foreground" />
                      </Link>
                    ) : (
                      <p className="text-xs text-muted-foreground/50 mt-0.5">Office / Admin</p>
                    )}
                  </div>
                  <span className="text-sm font-mono shrink-0">
                    {te.totalHours > 0 ? `${te.totalHours}h` : "—"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground/50 italic">No time entries</p>
          )}
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2" data-testid="emp-actions">
          <Button size="sm" variant="outline" data-testid="button-edit-employee">
            Edit Profile
          </Button>
          <Button size="sm" variant="outline" render={<Link href="/dashboard/scheduling" />} data-testid="button-view-schedule">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            View Schedule
          </Button>
        </div>
      </div>
    </>
  );
}
