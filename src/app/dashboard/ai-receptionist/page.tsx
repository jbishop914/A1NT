"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
  Voicemail,
  Clock,
  Bot,
  AlertTriangle,
  Users,
  ClipboardList,
  Calendar,
  Zap,
  BarChart3,
  ExternalLink,
  MoreHorizontal,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Smile,
  Meh,
  Frown,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import {
  callRecords,
  phoneStats,
  callRouting,
  type CallRecord,
  type CallStatus,
  type CallIntent,
  type CallPriority,
  type CallRouting,
} from "@/lib/sample-data-p2";

// --- Helpers ---

const intentStyles: Record<CallIntent, string> = {
  Emergency: "bg-red-500/15 text-red-700 dark:text-red-400 border-0",
  "Service Request": "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-0",
  Appointment: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0",
  Billing: "",
  "Sales Inquiry": "bg-violet-500/15 text-violet-700 dark:text-violet-400 border-0",
  General: "",
};

function IntentBadge({ intent }: { intent: CallIntent }) {
  const style = intentStyles[intent];
  if (!style) {
    return <Badge variant="secondary" className="text-[10px]">{intent}</Badge>;
  }
  return <Badge variant="default" className={`text-[10px] ${style}`}>{intent}</Badge>;
}

const callStatusStyles: Record<CallStatus, string> = {
  Active: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0",
  Completed: "",
  Voicemail: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-0",
  Missed: "bg-red-500/15 text-red-700 dark:text-red-400 border-0",
  Transferred: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0",
};

function CallStatusBadge({ status }: { status: CallStatus }) {
  const style = callStatusStyles[status];
  if (!style) {
    return <Badge variant="secondary" className="text-[10px]">{status}</Badge>;
  }
  return <Badge variant="default" className={`text-[10px] ${style}`}>{status}</Badge>;
}

const priorityStyles: Record<CallPriority, string> = {
  Urgent: "bg-red-500/15 text-red-700 dark:text-red-400 border-0",
  High: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0",
  Normal: "",
  Low: "",
};

function PriorityBadge({ priority }: { priority: CallPriority }) {
  if (priority === "Normal" || priority === "Low") {
    return <Badge variant={priority === "Low" ? "outline" : "secondary"} className="text-[10px]">{priority}</Badge>;
  }
  return <Badge variant="default" className={`text-[10px] ${priorityStyles[priority]}`}>{priority}</Badge>;
}

function SentimentIcon({ sentiment }: { sentiment: CallRecord["sentiment"] }) {
  switch (sentiment) {
    case "Positive":
      return <Smile className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />;
    case "Neutral":
      return <Meh className="h-3.5 w-3.5 text-muted-foreground" />;
    case "Frustrated":
      return <Frown className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />;
  }
}

function DirectionIcon({ direction }: { direction: CallRecord["direction"] }) {
  if (direction === "Inbound") {
    return <PhoneIncoming className="h-3.5 w-3.5 text-muted-foreground" />;
  }
  return <PhoneOutgoing className="h-3.5 w-3.5 text-muted-foreground" />;
}

function StatusIcon({ status }: { status: CallStatus }) {
  switch (status) {
    case "Active":
      return <Phone className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />;
    case "Missed":
      return <PhoneMissed className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />;
    case "Voicemail":
      return <Voicemail className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />;
    default:
      return null;
  }
}

function parseTranscript(transcript: string): { speaker: "AI" | "Caller" | "System"; text: string }[] {
  if (!transcript) return [];
  const lines = transcript.split("\n").filter(Boolean);
  return lines.map((line) => {
    if (line.startsWith("AI:") || line.startsWith("AI ")) {
      return { speaker: "AI" as const, text: line.replace(/^AI:\s*/, "").replace(/^AI placed an automated follow-up call.*?\n?/g, "") };
    }
    if (line.startsWith("Caller:") || line.startsWith("Caller ")) {
      return { speaker: "Caller" as const, text: line.replace(/^Caller:\s*/, "") };
    }
    return { speaker: "System" as const, text: line };
  });
}

const ALL_INTENTS: CallIntent[] = ["Emergency", "Service Request", "Appointment", "Billing", "Sales Inquiry", "General"];
const ALL_STATUSES: CallStatus[] = ["Active", "Completed", "Voicemail", "Missed", "Transferred"];

const routingPriorityStyle: Record<CallPriority, string> = {
  Urgent: "bg-red-500/15 text-red-700 dark:text-red-400 border-0",
  High: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0",
  Normal: "",
  Low: "",
};

// --- Component ---

export default function AIReceptionistPage() {
  const [viewTab, setViewTab] = useState<"calls" | "routing">("calls");
  const [selectedCall, setSelectedCall] = useState<CallRecord | null>(null);
  const [search, setSearch] = useState("");
  const [intentFilter, setIntentFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Active call
  const activeCall = callRecords.find((c) => c.status === "Active") ?? null;

  // Filtered calls
  const filtered = useMemo(() => {
    return callRecords.filter((call) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        call.callerName.toLowerCase().includes(q) ||
        call.callerPhone.includes(q);
      const matchesIntent = intentFilter === "all" || call.intent === intentFilter;
      const matchesStatus = statusFilter === "all" || call.status === statusFilter;
      return matchesSearch && matchesIntent && matchesStatus;
    });
  }, [search, intentFilter, statusFilter]);

  return (
    <div className="p-6 space-y-6 max-w-[1400px]" data-testid="ai-receptionist-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" data-testid="page-title">
            AI Receptionist & Phone System
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Never miss a call. Never lose a lead. 24/7 intelligent intake.
          </p>
        </div>
      </div>

      {/* Active Call Banner */}
      {activeCall && (
        <button
          onClick={() => setSelectedCall(activeCall)}
          className="w-full text-left rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 cursor-pointer hover:bg-emerald-500/10 transition-colors"
          data-testid="active-call-banner"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Live Call
              </span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{activeCall.callerName}</span>
                <span className="text-xs font-mono text-muted-foreground">{activeCall.callerPhone}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <IntentBadge intent={activeCall.intent} />
                <PriorityBadge priority={activeCall.priority} />
                <span className="text-xs text-muted-foreground">
                  Duration: <span className="font-mono">{activeCall.duration}</span>
                </span>
                {activeCall.assignedTo && (
                  <span className="text-xs text-muted-foreground">
                    Assigned: <span className="font-medium">{activeCall.assignedTo}</span>
                  </span>
                )}
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </div>
        </button>
      )}

      {/* KPI Cards — 2 rows of 4 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" data-testid="kpi-row">
        {[
          { label: "Calls Today", value: String(phoneStats.totalCallsToday), icon: Phone },
          { label: "Avg Wait", value: phoneStats.avgWaitTime, icon: Clock },
          { label: "AI Handled", value: `${phoneStats.aiHandledRate}%`, icon: Bot },
          { label: "Missed Rate", value: `${phoneStats.missedCallRate}%`, icon: PhoneMissed },
          { label: "Leads Captured", value: String(phoneStats.leadsCapture), icon: Users },
          { label: "WOs Created", value: String(phoneStats.workOrdersCreated), icon: ClipboardList },
          { label: "Appointments", value: String(phoneStats.appointmentsBooked), icon: Calendar },
          { label: "Avg Duration", value: phoneStats.avgCallDuration, icon: BarChart3 },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} data-testid={`kpi-${kpi.label.toLowerCase().replace(/\s+/g, "-")}`}>
              <CardContent className="pt-3 pb-2.5 px-4">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <p className="text-lg font-semibold tracking-tight mt-0.5 font-mono">{kpi.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap" data-testid="toolbar">
        <Tabs
          value={viewTab}
          onValueChange={(v) => setViewTab(v as "calls" | "routing")}
          data-testid="view-tabs"
        >
          <TabsList className="h-8">
            <TabsTrigger value="calls" className="text-xs px-3" data-testid="tab-calls">
              Call Log
            </TabsTrigger>
            <TabsTrigger value="routing" className="text-xs px-3" data-testid="tab-routing">
              Call Routing
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8"
            data-testid="input-search"
          />
        </div>

        <Select value={intentFilter} onValueChange={(v) => setIntentFilter(v ?? "all")}>
          <SelectTrigger className="w-[150px] h-8 text-xs" data-testid="select-intent-filter">
            <SelectValue placeholder="Intent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Intents</SelectItem>
            {ALL_INTENTS.map((i) => (
              <SelectItem key={i} value={i}>{i}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-[140px] h-8 text-xs" data-testid="select-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1" />
      </div>

      {/* Call Log Table */}
      {viewTab === "calls" && (
        <Card data-testid="call-log-table">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4 w-[80px]">Time</TableHead>
                  <TableHead className="w-8" />
                  <TableHead>Caller</TableHead>
                  <TableHead>Intent</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-right w-[70px]">Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-8" />
                  <TableHead>Actions Created</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((call) => (
                  <TableRow
                    key={call.id}
                    className={`cursor-pointer ${call.status === "Active" ? "bg-emerald-500/[0.03]" : ""}`}
                    onClick={() => setSelectedCall(call)}
                    data-testid={`row-call-${call.id}`}
                  >
                    <TableCell className="pl-4 font-mono text-xs text-muted-foreground">
                      {call.startTime}
                    </TableCell>
                    <TableCell>
                      <DirectionIcon direction={call.direction} />
                    </TableCell>
                    <TableCell>
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate max-w-[160px]">{call.callerName}</p>
                        <p className="text-[10px] font-mono text-muted-foreground">{call.callerPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell><IntentBadge intent={call.intent} /></TableCell>
                    <TableCell><PriorityBadge priority={call.priority} /></TableCell>
                    <TableCell className="text-right font-mono text-sm">{call.duration}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {call.status === "Active" && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                          </span>
                        )}
                        <CallStatusBadge status={call.status} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <SentimentIcon sentiment={call.sentiment} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {call.workOrderCreated && (
                          <Badge variant="outline" className="text-[10px] font-mono py-0 h-4">
                            {call.workOrderCreated}
                          </Badge>
                        )}
                        {call.appointmentBooked && (
                          <Badge variant="outline" className="text-[10px] py-0 h-4">
                            <Calendar className="h-2.5 w-2.5 mr-0.5" />
                            Apt
                          </Badge>
                        )}
                        {call.isNewLead && (
                          <Badge variant="outline" className="text-[10px] py-0 h-4">
                            <Zap className="h-2.5 w-2.5 mr-0.5" />
                            Lead
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted transition-colors"
                          data-testid={`actions-call-${call.id}`}
                        >
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedCall(call)} data-testid={`action-view-call-${call.id}`}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem data-testid={`action-callback-${call.id}`}>
                            Schedule Callback
                          </DropdownMenuItem>
                          <DropdownMenuItem data-testid={`action-create-wo-${call.id}`}>
                            Create Work Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12 text-muted-foreground">
                      No calls match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Call Routing Config Tab */}
      {viewTab === "routing" && (
        <Card data-testid="routing-config-table">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              Call Routing Rules
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Intent</TableHead>
                  <TableHead>Business Hours Routing</TableHead>
                  <TableHead>After Hours</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="text-center">Enabled</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {callRouting.map((rule) => (
                  <TableRow key={rule.id} data-testid={`row-routing-${rule.id}`}>
                    <TableCell className="pl-4">
                      <IntentBadge intent={rule.intent} />
                    </TableCell>
                    <TableCell className="text-sm max-w-[220px]">{rule.route}</TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[200px]">{rule.afterHours}</TableCell>
                    <TableCell>
                      <PriorityBadge priority={rule.priority} />
                    </TableCell>
                    <TableCell className="text-center">
                      {rule.enabled ? (
                        <ToggleRight className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-muted-foreground mx-auto" />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Call Detail Sheet */}
      <Sheet open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto" data-testid="sheet-call-detail">
          {selectedCall && (
            <CallDetail call={selectedCall} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// --- Call Detail Component ---

function CallDetail({ call }: { call: CallRecord }) {
  const transcript = parseTranscript(call.transcript);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-lg flex items-center gap-2">
          {call.status === "Active" && (
            <span className="relative flex h-3 w-3 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          )}
          {call.callerName}
        </SheetTitle>
        <SheetDescription className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <CallStatusBadge status={call.status} />
            <IntentBadge intent={call.intent} />
            <PriorityBadge priority={call.priority} />
            <SentimentIcon sentiment={call.sentiment} />
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-mono">{call.callerPhone}</span>
            <span>{call.direction}</span>
            <span className="font-mono">{call.startTime}</span>
            <span>{call.date}</span>
          </div>
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        {/* Call Info */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Duration</p>
            <p className="text-sm font-mono font-semibold mt-0.5">{call.duration}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Direction</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <DirectionIcon direction={call.direction} />
              <span className="text-sm">{call.direction}</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Sentiment</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <SentimentIcon sentiment={call.sentiment} />
              <span className="text-sm">{call.sentiment}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* AI Summary */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            AI Summary
          </h4>
          <p className="text-sm leading-relaxed">{call.summary}</p>
        </div>

        <Separator />

        {/* Transcript */}
        {transcript.length > 0 && (
          <>
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Transcript
              </h4>
              <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1" data-testid="transcript">
                {transcript.map((line, idx) => {
                  if (line.speaker === "System") {
                    return (
                      <p key={idx} className="text-[10px] text-muted-foreground/60 italic text-center py-1">
                        {line.text}
                      </p>
                    );
                  }
                  const isAI = line.speaker === "AI";
                  return (
                    <div
                      key={idx}
                      className={`flex ${isAI ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg p-2.5 ${
                          isAI
                            ? "bg-muted/80 rounded-tl-none"
                            : "bg-foreground/[0.06] rounded-tr-none"
                        }`}
                      >
                        <p className="text-[10px] font-semibold mb-0.5 text-muted-foreground">
                          {isAI ? (
                            <span className="flex items-center gap-1">
                              <Bot className="h-2.5 w-2.5" />
                              AI Receptionist
                            </span>
                          ) : (
                            call.callerName
                          )}
                        </p>
                        <p className="text-sm leading-relaxed">{line.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Actions Taken */}
        {call.actionsTaken.length > 0 && (
          <>
            <div className="space-y-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Actions Taken
              </h4>
              <div className="space-y-1.5">
                {call.actionsTaken.map((action, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Linked Items */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Linked Items
          </h4>
          <div className="space-y-2">
            {call.workOrderCreated && (
              <div className="flex items-center gap-2 text-sm">
                <ClipboardList className="h-3.5 w-3.5 text-muted-foreground" />
                <Link
                  href="/dashboard/work-orders"
                  className="hover:underline underline-offset-2"
                  data-testid="link-call-wo"
                >
                  <span className="font-mono">{call.workOrderCreated}</span>
                  <ExternalLink className="inline h-3 w-3 ml-1 -mt-0.5 text-muted-foreground" />
                </Link>
              </div>
            )}
            {call.appointmentBooked && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                <Link
                  href="/dashboard/scheduling"
                  className="hover:underline underline-offset-2"
                  data-testid="link-call-schedule"
                >
                  Appointment Scheduled
                  <ExternalLink className="inline h-3 w-3 ml-1 -mt-0.5 text-muted-foreground" />
                </Link>
              </div>
            )}
            {call.assignedTo && (
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Assigned to <span className="font-medium">{call.assignedTo}</span></span>
              </div>
            )}
            {call.isNewLead && (
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <Link
                  href="/dashboard/clients"
                  className="hover:underline underline-offset-2"
                  data-testid="link-call-lead"
                >
                  New Lead Captured
                  <ExternalLink className="inline h-3 w-3 ml-1 -mt-0.5 text-muted-foreground" />
                </Link>
              </div>
            )}
            {!call.workOrderCreated && !call.appointmentBooked && !call.assignedTo && !call.isNewLead && (
              <p className="text-xs text-muted-foreground/50 italic">No linked items</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2" data-testid="call-actions">
          <Button size="sm" variant="outline" data-testid="button-callback">
            <Phone className="h-3.5 w-3.5 mr-1.5" />
            Schedule Callback
          </Button>
          <Button size="sm" variant="outline" render={<Link href="/dashboard/work-orders" />} data-testid="button-create-wo">
            <ClipboardList className="h-3.5 w-3.5 mr-1.5" />
            Create Work Order
          </Button>
          <Button size="sm" variant="outline" render={<Link href="/dashboard/scheduling" />} data-testid="button-book-apt">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            Book Appointment
          </Button>
        </div>
      </div>
    </>
  );
}
