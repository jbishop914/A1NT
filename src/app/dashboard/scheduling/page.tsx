"use client";

import { useState, useMemo } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Plus,
  Search,
  User,
  Wrench,
  ExternalLink,
  ChevronDown,
  ChevronUp,
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
  scheduleEvents,
  employees,
  workOrders,
  type ScheduleEvent,
} from "@/lib/sample-data";

// --- Constants ---
const WEEK_DAYS = [
  { date: "2026-03-16", label: "Mon", full: "Mon Mar 16" },
  { date: "2026-03-17", label: "Tue", full: "Tue Mar 17" },
  { date: "2026-03-18", label: "Wed", full: "Wed Mar 18" },
  { date: "2026-03-19", label: "Thu", full: "Thu Mar 19" },
  { date: "2026-03-20", label: "Fri", full: "Fri Mar 20" },
];

const TODAY = "2026-03-18";
const HOUR_START = 7;
const HOUR_END = 18;
const HOURS = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i);

// --- Helpers ---
function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

function formatTimeRange(start: string, end: string): string {
  return `${formatTime(start)} – ${formatTime(end)}`;
}

function getDateKey(iso: string): string {
  return iso.slice(0, 10);
}

function getHourDecimal(iso: string): number {
  const d = new Date(iso);
  return d.getHours() + d.getMinutes() / 60;
}

function getDurationHours(start: string, end: string): number {
  return (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60);
}

function getEventTypeStyles(eventType: ScheduleEvent["eventType"]): string {
  switch (eventType) {
    case "Job":
      return "bg-foreground/8 border-foreground/20 hover:border-foreground/30";
    case "Appointment":
      return "bg-transparent border-foreground/25 border-dashed hover:border-foreground/40";
    case "Block":
      return "bg-muted border-muted-foreground/15 hover:border-muted-foreground/25";
    case "Recurring":
      return "bg-foreground/5 border-dashed border-foreground/20 hover:border-foreground/30";
    default:
      return "bg-foreground/5 border-foreground/15";
  }
}

function getEventTypeBadge(eventType: ScheduleEvent["eventType"]): string {
  switch (eventType) {
    case "Job":
      return "default";
    case "Appointment":
      return "outline";
    case "Block":
      return "secondary";
    case "Recurring":
      return "outline";
    default:
      return "secondary";
  }
}

export default function SchedulingPage() {
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [viewTab, setViewTab] = useState<"week" | "day">("week");
  const [techFilter, setTechFilter] = useState<string>("all");
  const [upcomingOpen, setUpcomingOpen] = useState(true);

  // --- KPI calculations ---
  const todaysEvents = scheduleEvents.filter((e) => getDateKey(e.startTime) === TODAY);
  const weekEvents = scheduleEvents.filter((e) =>
    WEEK_DAYS.some((d) => d.date === getDateKey(e.startTime))
  );
  const unassignedJobs = workOrders.filter(
    (wo) => wo.status === "New" && !wo.assigneeId
  );
  const teamCount = employees.length;

  // --- Filtered events ---
  const filteredEvents = useMemo(() => {
    if (techFilter === "all") return scheduleEvents;
    return scheduleEvents.filter((e) => e.assigneeId === techFilter);
  }, [techFilter]);

  // --- Employee utilization ---
  const employeeUtilization = useMemo(() => {
    return employees.map((emp) => {
      const empTodayEvents = scheduleEvents.filter(
        (e) => e.assigneeId === emp.id && getDateKey(e.startTime) === TODAY
      );
      const busyHours = empTodayEvents.reduce(
        (acc, e) => acc + getDurationHours(e.startTime, e.endTime),
        0
      );
      const totalHours = HOUR_END - HOUR_START;
      return { ...emp, busyHours, totalHours, utilization: busyHours / totalHours };
    });
  }, []);

  // --- Events grouped by day+employee for grid ---
  const eventsByDayEmployee = useMemo(() => {
    const map: Record<string, Record<string, ScheduleEvent[]>> = {};
    for (const day of WEEK_DAYS) {
      map[day.date] = {};
      for (const emp of employees) {
        map[day.date][emp.id] = filteredEvents.filter(
          (e) => getDateKey(e.startTime) === day.date && e.assigneeId === emp.id
        );
      }
    }
    return map;
  }, [filteredEvents]);

  // --- Upcoming events (next 5 from "today") ---
  const upcomingEvents = useMemo(() => {
    const now = new Date(`${TODAY}T08:00:00`);
    return scheduleEvents
      .filter((e) => new Date(e.startTime) >= now)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 5);
  }, []);

  // --- Filtered employees for grid ---
  const filteredEmployees = useMemo(() => {
    if (techFilter === "all") return [...employees];
    return employees.filter((e) => e.id === techFilter);
  }, [techFilter]);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]" data-testid="scheduling-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" data-testid="page-title">
            Scheduling & Dispatching
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage crew schedules and dispatch jobs
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" data-testid="kpi-row">
        {[
          { label: "Today's Jobs", value: todaysEvents.length, testId: "kpi-todays-jobs" },
          { label: "This Week", value: weekEvents.length, testId: "kpi-this-week" },
          { label: "Unassigned", value: unassignedJobs.length, testId: "kpi-unassigned" },
          { label: "Team Available", value: teamCount, testId: "kpi-team-available" },
        ].map((kpi) => (
          <Card key={kpi.label} data-testid={kpi.testId}>
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="text-xl font-semibold tracking-tight mt-0.5 font-mono">
                {kpi.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap" data-testid="toolbar">
        <Tabs
          value={viewTab}
          onValueChange={(v) => setViewTab(v as "week" | "day")}
          data-testid="view-tabs"
        >
          <TabsList className="h-8">
            <TabsTrigger value="day" className="text-xs px-3" data-testid="tab-day">
              Day
            </TabsTrigger>
            <TabsTrigger value="week" className="text-xs px-3" data-testid="tab-week">
              Week
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" className="h-8 w-8" data-testid="nav-prev">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" data-testid="nav-today">
            Today
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" data-testid="nav-next">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <span className="text-sm font-medium text-muted-foreground">
          Mar 16 – 20, 2026
        </span>

        <div className="flex-1" />

        <Select
          value={techFilter}
          onValueChange={(v) => setTechFilter(v ?? "all")}
          data-testid="filter-technician"
        >
          <SelectTrigger className="w-[180px] h-8 text-xs" data-testid="select-technician">
            <SelectValue placeholder="All Technicians" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Technicians</SelectItem>
            {employees.map((emp) => (
              <SelectItem key={emp.id} value={emp.id}>
                {emp.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button size="sm" className="h-8" data-testid="button-new-event">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          New Event
        </Button>
      </div>

      {/* Main Content: Calendar + Resource Panel */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-6">
        {/* Week View Calendar */}
        <Card className="overflow-hidden" data-testid="calendar-card">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {/* Column Headers: Employee names on left, days across top */}
              <div
                className="grid min-w-[800px]"
                style={{
                  gridTemplateColumns: `120px repeat(${WEEK_DAYS.length}, 1fr)`,
                }}
              >
                {/* Top-left corner cell */}
                <div className="border-b border-r p-2 bg-muted/50">
                  <span className="text-xs font-medium text-muted-foreground">Technician</span>
                </div>
                {/* Day headers */}
                {WEEK_DAYS.map((day) => (
                  <div
                    key={day.date}
                    className={`border-b border-r last:border-r-0 p-2 text-center ${
                      day.date === TODAY ? "bg-foreground/5" : "bg-muted/50"
                    }`}
                    data-testid={`day-header-${day.date}`}
                  >
                    <span className="text-xs font-medium">
                      {day.full}
                    </span>
                    {day.date === TODAY && (
                      <Badge variant="secondary" className="text-[10px] ml-1.5">
                        Today
                      </Badge>
                    )}
                  </div>
                ))}

                {/* Employee rows */}
                {filteredEmployees.map((emp, empIdx) => (
                  <>
                    {/* Employee name cell */}
                    <div
                      key={`name-${emp.id}`}
                      className={`border-b border-r p-2 flex items-start gap-2 ${
                        empIdx === filteredEmployees.length - 1 ? "border-b-0" : ""
                      }`}
                      data-testid={`employee-row-${emp.id}`}
                    >
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarFallback className="text-[10px] bg-foreground/10">
                          {emp.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{emp.name}</p>
                        <p className="text-[10px] text-muted-foreground">{emp.role}</p>
                      </div>
                    </div>

                    {/* Day cells for this employee */}
                    {WEEK_DAYS.map((day, dayIdx) => {
                      const dayEvents = eventsByDayEmployee[day.date]?.[emp.id] || [];
                      return (
                        <div
                          key={`${emp.id}-${day.date}`}
                          className={`border-b border-r last:border-r-0 p-1.5 min-h-[90px] relative ${
                            day.date === TODAY ? "bg-foreground/[0.02]" : ""
                          } ${empIdx === filteredEmployees.length - 1 ? "border-b-0" : ""}`}
                          data-testid={`cell-${emp.id}-${day.date}`}
                        >
                          <div className="space-y-1">
                            {dayEvents.map((event) => (
                              <button
                                key={event.id}
                                onClick={() => setSelectedEvent(event)}
                                className={`w-full text-left rounded-md border p-1.5 transition-colors cursor-pointer ${getEventTypeStyles(
                                  event.eventType
                                )}`}
                                data-testid={`event-block-${event.id}`}
                              >
                                <p className="text-[10px] font-mono text-muted-foreground">
                                  {formatTimeRange(event.startTime, event.endTime)}
                                </p>
                                <p className="text-xs font-medium leading-tight truncate mt-0.5">
                                  {event.title}
                                </p>
                                {event.clientName && (
                                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                    {event.clientName}
                                  </p>
                                )}
                              </button>
                            ))}
                            {dayEvents.length === 0 && (
                              <div className="h-full flex items-center justify-center min-h-[60px]">
                                <span className="text-[10px] text-muted-foreground/50">—</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resource Sidebar */}
        <div className="space-y-4" data-testid="resource-panel">
          <Card data-testid="team-panel">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Team Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {employeeUtilization.map((emp) => (
                <div key={emp.id} className="space-y-1.5" data-testid={`team-member-${emp.id}`}>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 shrink-0">
                      <AvatarFallback className="text-[10px] bg-foreground/10">
                        {emp.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{emp.name}</p>
                      <p className="text-[10px] text-muted-foreground">{emp.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-foreground/30 transition-all"
                        style={{ width: `${Math.min(emp.utilization * 100, 100)}%` }}
                        data-testid={`utilization-bar-${emp.id}`}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground w-16 text-right">
                      {emp.busyHours.toFixed(1)}h / {emp.totalHours}h
                    </span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {emp.skills.map((skill) => (
                      <Badge key={skill} variant="outline" className="text-[10px] font-normal py-0 h-4">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Unassigned Jobs Quick View */}
          {unassignedJobs.length > 0 && (
            <Card data-testid="unassigned-panel">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  Unassigned
                  <Badge variant="secondary" className="text-[10px]">
                    {unassignedJobs.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {unassignedJobs.map((wo) => (
                  <Link
                    key={wo.id}
                    href="/dashboard/work-orders"
                    className="block rounded-md border p-2 hover:border-foreground/20 transition-colors"
                    data-testid={`unassigned-wo-${wo.id}`}
                  >
                    <p className="text-[10px] font-mono text-muted-foreground">{wo.orderNumber}</p>
                    <p className="text-xs font-medium truncate mt-0.5">{wo.title}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{wo.clientName}</p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Upcoming Events Collapsible */}
      <Card data-testid="upcoming-events">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold">Upcoming Events</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setUpcomingOpen(!upcomingOpen)}
              data-testid="toggle-upcoming"
            >
              {upcomingOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        {upcomingOpen && (
          <CardContent className="space-y-0 pt-0">
            {upcomingEvents.map((event, idx) => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className={`w-full text-left flex items-center gap-3 py-2.5 ${
                  idx < upcomingEvents.length - 1 ? "border-b" : ""
                } hover:bg-muted/50 transition-colors -mx-1 px-1 rounded-sm cursor-pointer`}
                data-testid={`upcoming-event-${event.id}`}
              >
                <span className="text-xs font-mono text-muted-foreground w-20 shrink-0">
                  {formatTime(event.startTime)}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-tight truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {event.clientName || "Internal"}
                  </p>
                </div>
                <Avatar className="h-6 w-6 shrink-0">
                  <AvatarFallback className="text-[10px] bg-foreground/10">
                    {employees.find((e) => e.id === event.assigneeId)?.initials || "?"}
                  </AvatarFallback>
                </Avatar>
                {event.workOrderNumber && (
                  <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                    {event.workOrderNumber}
                  </Badge>
                )}
              </button>
            ))}
            {upcomingEvents.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-6">
                No upcoming events.
              </p>
            )}
          </CardContent>
        )}
      </Card>

      {/* Event Detail Slide-out */}
      <Sheet open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto" data-testid="sheet-event-detail">
          {selectedEvent && (
            <>
              <SheetHeader>
                <SheetTitle className="text-lg">{selectedEvent.title}</SheetTitle>
                <SheetDescription className="flex items-center gap-2">
                  <Badge
                    variant={getEventTypeBadge(selectedEvent.eventType) as "default" | "outline" | "secondary"}
                    className="text-[10px]"
                  >
                    {selectedEvent.eventType}
                  </Badge>
                  <Badge variant="secondary" className="text-[10px]">
                    {selectedEvent.status}
                  </Badge>
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Time */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Schedule
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-mono">
                        {formatTimeRange(selectedEvent.startTime, selectedEvent.endTime)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>
                        {new Date(selectedEvent.startTime).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="ml-5.5 font-mono text-xs">
                        {getDurationHours(selectedEvent.startTime, selectedEvent.endTime).toFixed(1)} hours
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Assignee */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Assigned To
                  </h4>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-foreground/10">
                        {employees.find((e) => e.id === selectedEvent.assigneeId)?.initials || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{selectedEvent.assignee}</p>
                      <p className="text-xs text-muted-foreground">
                        {employees.find((e) => e.id === selectedEvent.assigneeId)?.role || ""}
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Client & Location */}
                {selectedEvent.clientName && (
                  <>
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
                            data-testid="link-client"
                          >
                            {selectedEvent.clientName}
                          </Link>
                        </div>
                        {selectedEvent.location && (
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{selectedEvent.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Linked Work Order */}
                {selectedEvent.workOrderId && (
                  <>
                    <div className="space-y-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Linked Work Order
                      </h4>
                      <Link
                        href="/dashboard/work-orders"
                        className="flex items-center gap-2 text-sm hover:underline underline-offset-2"
                        data-testid="link-work-order"
                      >
                        <Wrench className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="font-mono">{selectedEvent.workOrderNumber}</span>
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      </Link>
                    </div>
                    <Separator />
                  </>
                )}

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" data-testid="button-edit-event">
                    Edit Event
                  </Button>
                  <Button size="sm" variant="outline" data-testid="button-reassign">
                    Reassign
                  </Button>
                  {selectedEvent.workOrderId && (
                    <Button size="sm" variant="outline" render={<Link href="/dashboard/work-orders" />} data-testid="button-view-wo">
                      View Work Order
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
