"use client";

import * as React from "react";
import {
  Phone,
  PhoneOutgoing,
  Play,
  RotateCcw,
  X,
  Plus,
  ChevronDown,
  ChevronUp,
  Clock,
  User,
  Bot,
  CheckCircle2,
  ArrowRight,
  FileText,
  Wrench,
  UserPlus,
  Calendar,
  Send,
  AlertTriangle,
  Headset,
  CircleDot,
  Loader2,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";

import {
  sampleAgentPool,
  sampleCompletedCalls,
  campaignLabels,
  priorityLabels,
  statusLabels,
} from "@/data/sample-operator";
import type {
  CampaignType,
  CallPriority,
  OutboundCallStatus,
  OutboundQueueItem,
  LiveCall,
  QueueStats,
  AgentPoolEntry,
  SuggestedAction,
  ActionKicked,
  TranscriptTurn,
  CompletedCallDetail,
} from "@/types/operator";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QueueApiResponse {
  queue: OutboundQueueItem[];
  stats: QueueStats;
  live: LiveCall[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function formatScheduledTime(isoString: string): string {
  const date = new Date(isoString);
  const diff = date.getTime() - Date.now();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `in ${mins}m`;
  const hrs = Math.floor(mins / 60);
  return `in ${hrs}h`;
}

const sentimentEmoji: Record<string, string> = {
  positive: "😊",
  neutral: "😐",
  negative: "😟",
};

// Map suggested action types to icons
function SuggestedActionIcon({ type }: { type: SuggestedAction["type"] }) {
  const size = "size-3.5";
  switch (type) {
    case "work-order":
      return <Wrench className={size} />;
    case "estimate":
      return <FileText className={size} />;
    case "lead":
      return <UserPlus className={size} />;
    case "follow-up-call":
      return <Phone className={size} />;
    case "send-to-tech":
      return <Send className={size} />;
    case "appointment":
      return <Calendar className={size} />;
    case "reschedule":
      return <RotateCcw className={size} />;
    default:
      return <ArrowRight className={size} />;
  }
}

function ActionKickedIcon({ type }: { type: ActionKicked["type"] }) {
  const size = "size-3.5";
  switch (type) {
    case "work-order":
      return <Wrench className={size} />;
    case "estimate":
      return <FileText className={size} />;
    case "lead":
      return <UserPlus className={size} />;
    case "follow-up-call":
      return <Phone className={size} />;
    case "appointment":
      return <Calendar className={size} />;
    case "invoice":
      return <FileText className={size} />;
    default:
      return <CheckCircle2 className={size} />;
  }
}

// ─── Campaign Badge ───────────────────────────────────────────────────────────

function CampaignBadge({ type }: { type: CampaignType }) {
  const info = campaignLabels[type] ?? { label: type, color: "bg-zinc-500/15 text-zinc-400" };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${info.color}`}
    >
      {info.label}
    </span>
  );
}

// ─── Skeleton helpers ─────────────────────────────────────────────────────────

function SkeletonBox({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-zinc-800 ${className ?? ""}`} />
  );
}

// ─── 1. KPI Strip ─────────────────────────────────────────────────────────────

interface KpiStripProps {
  stats: QueueStats | null;
  loading: boolean;
}

function KpiStrip({ stats, loading }: KpiStripProps) {
  const successRate = stats?.successRate ?? 0;
  const successColor =
    successRate >= 85
      ? "text-emerald-400"
      : successRate >= 70
      ? "text-amber-400"
      : "text-rose-400";

  if (loading) {
    return (
      <div className="grid grid-cols-4 gap-3" data-testid="kpi-strip">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3"
          >
            <SkeletonBox className="size-2 shrink-0 rounded-full" />
            <div className="flex flex-col gap-1.5">
              <SkeletonBox className="h-3 w-16" />
              <SkeletonBox className="h-6 w-8" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3" data-testid="kpi-strip">
      {/* Queued */}
      <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
        <div className="flex size-2 shrink-0 rounded-full bg-zinc-400" />
        <div>
          <p className="text-xs text-zinc-500">Queued</p>
          <p className="text-xl font-semibold text-zinc-100">{stats?.totalQueued ?? 0}</p>
        </div>
      </div>

      {/* In Progress */}
      <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
        <div className="flex size-2 shrink-0 animate-pulse rounded-full bg-emerald-400" />
        <div>
          <p className="text-xs text-zinc-500">In Progress</p>
          <p className="text-xl font-semibold text-zinc-100">{stats?.inProgress ?? 0}</p>
        </div>
      </div>

      {/* Completed Today */}
      <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
        <CircleDot className="size-4 shrink-0 text-zinc-500" />
        <div>
          <p className="text-xs text-zinc-500">Completed Today</p>
          <p className="text-xl font-semibold text-zinc-100">{stats?.completedToday ?? 0}</p>
        </div>
      </div>

      {/* Success Rate */}
      <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
        <CircleDot className={`size-4 shrink-0 ${successColor}`} />
        <div>
          <p className="text-xs text-zinc-500">Success Rate</p>
          <p className={`text-xl font-semibold ${successColor}`}>{successRate}%</p>
        </div>
      </div>
    </div>
  );
}

// ─── 2. Agent Pool Strip ──────────────────────────────────────────────────────

const agentStatusDot: Record<string, string> = {
  "on-call": "bg-emerald-400",
  idle: "bg-zinc-500",
  "post-processing": "bg-amber-400",
  offline: "bg-zinc-700",
};

interface AgentPoolStripProps {
  liveCalls: LiveCall[];
}

function AgentPoolStrip({ liveCalls }: AgentPoolStripProps) {
  // Use the sample agent pool (configuration data), but override status based on live calls
  const liveCallAgentNames = new Set(liveCalls.map((c) => c.agentName));
  const agents: AgentPoolEntry[] = sampleAgentPool.map((agent) => ({
    ...agent,
    status: liveCallAgentNames.has(agent.name.split(" ")[0])
      ? ("on-call" as const)
      : ("idle" as const),
    currentCallId: null,
  }));

  return (
    <div
      className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-2.5"
      data-testid="agent-pool-strip"
    >
      <span className="mr-1 text-xs font-medium text-zinc-500">Agents</span>
      <div className="flex flex-1 items-center gap-2 overflow-x-auto">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-800 bg-zinc-900 px-2.5 py-1"
            data-testid={`agent-chip-${agent.id}`}
          >
            {/* Avatar circle */}
            <div className="flex size-5 items-center justify-center rounded-full bg-zinc-700 text-[10px] font-semibold text-zinc-300">
              {agent.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-zinc-300">{agent.name}</span>
            {/* Status dot */}
            <div
              className={`size-1.5 rounded-full ${agentStatusDot[agent.status] ?? "bg-zinc-600"}`}
              title={agent.status}
            />
          </div>
        ))}
      </div>
      <Button variant="ghost" size="sm" className="ml-2 shrink-0 gap-1 text-zinc-400" data-testid="scale-up-btn">
        <Plus className="size-3.5" />
        <span className="text-xs">Scale Up</span>
      </Button>
    </div>
  );
}

// ─── 3. Quick Dial Sheet ──────────────────────────────────────────────────────

const campaignTypes: CampaignType[] = [
  "appointment-confirm",
  "appointment-reschedule",
  "pre-service-info",
  "post-service-followup",
  "invoice-followup",
  "seasonal-promo",
  "sales-prospecting",
  "custom",
];

interface QuickDialSheetProps {
  onSuccess: () => void;
}

/* ── Campaign context field definitions ───────────────────────────── */

interface CampaignField {
  key: string;
  label: string;
  placeholder: string;
  type?: "text" | "number" | "date" | "time";
}

const campaignFields: Record<CampaignType, CampaignField[]> = {
  "appointment-confirm": [
    { key: "date", label: "Appointment Date", placeholder: "e.g. March 25, 2026", type: "text" },
    { key: "time", label: "Appointment Time", placeholder: "e.g. 10:00 AM", type: "text" },
    { key: "serviceType", label: "Service Type", placeholder: "e.g. Drain cleaning" },
    { key: "technicianName", label: "Technician", placeholder: "e.g. Mike" },
    { key: "address", label: "Service Address", placeholder: "e.g. 123 Main St" },
  ],
  "appointment-reschedule": [
    { key: "originalDate", label: "Original Date", placeholder: "e.g. March 20, 2026" },
    { key: "reason", label: "Reason for Reschedule", placeholder: "e.g. Technician unavailable" },
  ],
  "pre-service-info": [
    { key: "serviceType", label: "Service Type", placeholder: "e.g. Water heater install" },
    { key: "date", label: "Scheduled Date", placeholder: "e.g. March 25, 2026" },
  ],
  "post-service-followup": [
    { key: "serviceType", label: "Service Performed", placeholder: "e.g. Pipe repair" },
    { key: "technicianName", label: "Technician Name", placeholder: "e.g. Mike" },
    { key: "completedDate", label: "Completed Date", placeholder: "e.g. March 18, 2026" },
  ],
  "invoice-followup": [
    { key: "invoiceNumber", label: "Invoice #", placeholder: "e.g. INV-1042" },
    { key: "amount", label: "Amount Due", placeholder: "e.g. 450.00", type: "number" },
    { key: "daysOverdue", label: "Days Overdue", placeholder: "e.g. 14", type: "number" },
    { key: "dueDate", label: "Due Date", placeholder: "e.g. March 5, 2026" },
    { key: "serviceDescription", label: "Service Description", placeholder: "e.g. Kitchen faucet replacement" },
  ],
  "seasonal-promo": [
    { key: "promotionName", label: "Promotion Name", placeholder: "e.g. Spring AC Tune-Up" },
    { key: "discount", label: "Discount / Offer", placeholder: "e.g. 20% off" },
    { key: "validUntil", label: "Valid Until", placeholder: "e.g. April 30, 2026" },
    { key: "description", label: "Description", placeholder: "e.g. Full system inspection + cleaning" },
  ],
  "sales-prospecting": [],
  custom: [],
};

function QuickDialSheet({ onSuccess }: QuickDialSheetProps) {
  const [open, setOpen] = React.useState(false);
  const [contactName, setContactName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [campaign, setCampaign] = React.useState<CampaignType>("appointment-confirm");
  const [agentId, setAgentId] = React.useState<string>("unassigned");
  const [priority, setPriority] = React.useState<CallPriority>("normal");
  const [notes, setNotes] = React.useState("");
  const [contextData, setContextData] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; message: string } | null>(null);

  // Reset context fields when campaign type changes
  React.useEffect(() => {
    setContextData({});
  }, [campaign]);

  function updateContextField(key: string, value: string) {
    setContextData((prev) => ({ ...prev, [key]: value }));
  }

  function resetForm() {
    setContactName("");
    setPhone("");
    setCampaign("appointment-confirm");
    setAgentId("unassigned");
    setPriority("normal");
    setNotes("");
    setContextData({});
    setFeedback(null);
  }

  async function handleSubmit(dialNow: boolean) {
    if (!contactName.trim() || !phone.trim()) {
      setFeedback({ type: "error", message: "Contact name and phone number are required." });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    // Resolve agent name from pool
    const selectedAgent = sampleAgentPool.find((a) => a.id === agentId);

    try {
      const res = await fetch("/api/operator/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contactName: contactName.trim(),
          contactPhone: phone.trim(),
          campaignType: campaign,
          assignedAgentId: agentId === "unassigned" ? null : agentId,
          assignedAgentName: selectedAgent ? selectedAgent.name : null,
          priority,
          notes: notes.trim(),
          contextData: Object.keys(contextData).length > 0 ? contextData : undefined,
          dialNow,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setFeedback({ type: "error", message: data.error ?? "Failed to submit. Please try again." });
        return;
      }

      setFeedback({
        type: "success",
        message: dialNow
          ? `Calling ${contactName}…`
          : `${contactName} added to queue.`,
      });

      // Brief success flash, then close and refresh
      setTimeout(() => {
        setOpen(false);
        resetForm();
        onSuccess();
      }, 1200);
    } catch {
      setFeedback({ type: "error", message: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <SheetTrigger
        render={
          <Button className="gap-2" data-testid="new-call-btn">
            <Phone className="size-4" />
            New Call
          </Button>
        }
      />
      <SheetContent side="right" className="w-full sm:max-w-md bg-zinc-950 border-zinc-800">
        <SheetHeader className="border-b border-zinc-800 pb-4">
          <SheetTitle className="flex items-center gap-2 text-zinc-100">
            <PhoneOutgoing className="size-4 text-zinc-400" />
            Quick Dial
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 overflow-y-auto px-4 py-4">
          {/* Feedback banner */}
          {feedback && (
            <div
              className={`rounded-lg px-3 py-2.5 text-xs font-medium ${
                feedback.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
              }`}
              data-testid="qdial-feedback"
            >
              {feedback.message}
            </div>
          )}

          {/* Contact Name */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="qdial-contact" className="text-xs text-zinc-400">
              Contact Name
            </Label>
            <Input
              id="qdial-contact"
              placeholder="e.g. John Smith"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
              data-testid="qdial-contact-input"
              disabled={submitting}
            />
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="qdial-phone" className="text-xs text-zinc-400">
              Phone Number
            </Label>
            <Input
              id="qdial-phone"
              placeholder="+1 (203) 555-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600"
              data-testid="qdial-phone-input"
              disabled={submitting}
            />
          </div>

          {/* Campaign Type */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-zinc-400">Campaign Type</Label>
            <Select
              value={campaign}
              onValueChange={(v) => setCampaign((v ?? "appointment-confirm") as CampaignType)}
            >
              <SelectTrigger
                className="w-full bg-zinc-900 border-zinc-800 text-zinc-100"
                data-testid="qdial-campaign-select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                {campaignTypes.map((ct) => (
                  <SelectItem key={ct} value={ct} className="text-zinc-200 focus:bg-zinc-800">
                    {campaignLabels[ct]?.label ?? ct}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Campaign Context Fields (dynamic based on campaign type) */}
          {campaignFields[campaign]?.length > 0 && (
            <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-3">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                Campaign Details
              </p>
              <div className="flex flex-col gap-3">
                {campaignFields[campaign].map((field) => (
                  <div key={field.key} className="flex flex-col gap-1">
                    <Label htmlFor={`ctx-${field.key}`} className="text-xs text-zinc-500">
                      {field.label}
                    </Label>
                    <Input
                      id={`ctx-${field.key}`}
                      type={field.type ?? "text"}
                      placeholder={field.placeholder}
                      value={contextData[field.key] ?? ""}
                      onChange={(e) => updateContextField(field.key, e.target.value)}
                      className="h-8 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-700 text-sm"
                      data-testid={`qdial-ctx-${field.key}`}
                      disabled={submitting}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agent Assignment */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-zinc-400">Assign Agent</Label>
            <Select
              value={agentId}
              onValueChange={(v) => setAgentId(v ?? "unassigned")}
            >
              <SelectTrigger
                className="w-full bg-zinc-900 border-zinc-800 text-zinc-100"
                data-testid="qdial-agent-select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="unassigned" className="text-zinc-400 focus:bg-zinc-800">
                  Auto-assign
                </SelectItem>
                {sampleAgentPool.map((agent) => (
                  <SelectItem
                    key={agent.id}
                    value={agent.id}
                    className="text-zinc-200 focus:bg-zinc-800"
                  >
                    <span>{agent.name}</span>
                    <span
                      className={`ml-1.5 size-1.5 inline-block rounded-full ${agentStatusDot[agent.status]}`}
                    />
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-zinc-400">Priority</Label>
            <Select
              value={priority}
              onValueChange={(v) => setPriority((v ?? "normal") as CallPriority)}
            >
              <SelectTrigger
                className="w-full bg-zinc-900 border-zinc-800 text-zinc-100"
                data-testid="qdial-priority-select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800">
                <SelectItem value="normal" className="text-zinc-400 focus:bg-zinc-800">
                  Normal
                </SelectItem>
                <SelectItem value="high" className="text-amber-400 focus:bg-zinc-800">
                  High
                </SelectItem>
                <SelectItem value="urgent" className="text-rose-400 focus:bg-zinc-800">
                  Urgent
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="qdial-notes" className="text-xs text-zinc-400">
              Notes
            </Label>
            <textarea
              id="qdial-notes"
              rows={3}
              placeholder="Any context for the agent..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting}
              className="w-full resize-none rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none disabled:opacity-60"
              data-testid="qdial-notes-textarea"
            />
          </div>
        </div>

        <SheetFooter className="border-t border-zinc-800 pt-4 flex-row gap-2">
          <Button
            variant="outline"
            className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            data-testid="qdial-add-queue-btn"
            onClick={() => handleSubmit(false)}
            disabled={submitting}
          >
            {submitting ? <Loader2 className="size-4 animate-spin" /> : "Add to Queue"}
          </Button>
          <Button
            className="flex-1 gap-2"
            data-testid="qdial-dial-now-btn"
            onClick={() => handleSubmit(true)}
            disabled={submitting}
          >
            {submitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Phone className="size-4" />
            )}
            Dial Now
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// ─── 4. Queue Table ───────────────────────────────────────────────────────────

type QueueFilter = "all" | OutboundCallStatus;

interface QueueTableProps {
  queue: OutboundQueueItem[];
  loading: boolean;
  onCancel: (id: string) => Promise<void>;
  onStart: (id: string) => Promise<void>;
}

function QueueTable({ queue, loading, onCancel, onStart }: QueueTableProps) {
  const [filter, setFilter] = React.useState<QueueFilter>("all");
  const [sortPriority, setSortPriority] = React.useState<"asc" | "desc" | null>(null);

  const priorityOrder: Record<CallPriority, number> = { urgent: 0, high: 1, normal: 2 };

  const filtered = React.useMemo(() => {
    let items = [...queue];
    if (filter !== "all") {
      items = items.filter((i) => i.status === filter);
    }
    if (sortPriority) {
      items.sort((a, b) => {
        const diff = priorityOrder[a.priority] - priorityOrder[b.priority];
        return sortPriority === "asc" ? diff : -diff;
      });
    }
    return items;
  }, [queue, filter, sortPriority]);

  const filterTabs: { key: QueueFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "queued", label: "Queued" },
    { key: "scheduled", label: "Scheduled" },
    { key: "in-progress", label: "In Progress" },
  ];

  function togglePrioritySort() {
    setSortPriority((prev) =>
      prev === null ? "asc" : prev === "asc" ? "desc" : null
    );
  }

  return (
    <div
      className="rounded-lg border border-zinc-800 bg-zinc-900/50"
      data-testid="queue-table-section"
    >
      {/* Filter Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-800 px-3 py-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              filter === tab.key
                ? "bg-zinc-800 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
            data-testid={`queue-filter-${tab.key}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-xs text-zinc-500 font-medium">Contact</TableHead>
              <TableHead className="text-xs text-zinc-500 font-medium">Phone</TableHead>
              <TableHead className="text-xs text-zinc-500 font-medium">Campaign</TableHead>
              <TableHead className="text-xs text-zinc-500 font-medium">Agent</TableHead>
              <TableHead className="text-xs text-zinc-500 font-medium">Status</TableHead>
              <TableHead className="text-xs text-zinc-500 font-medium">
                <button
                  onClick={togglePrioritySort}
                  className="flex items-center gap-1 hover:text-zinc-300 transition-colors"
                  data-testid="sort-priority-btn"
                >
                  Priority
                  {sortPriority === "asc" ? (
                    <ChevronUp className="size-3" />
                  ) : sortPriority === "desc" ? (
                    <ChevronDown className="size-3" />
                  ) : (
                    <ChevronDown className="size-3 opacity-40" />
                  )}
                </button>
              </TableHead>
              <TableHead className="text-xs text-zinc-500 font-medium">Queued</TableHead>
              <TableHead className="text-xs text-zinc-500 font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              // Skeleton rows while loading
              [...Array(3)].map((_, i) => (
                <TableRow key={i} className="border-zinc-800/60">
                  {[...Array(8)].map((_, j) => (
                    <TableCell key={j} className="py-3">
                      <SkeletonBox className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <Phone className="size-8 text-zinc-700" />
                    <p className="text-sm font-medium text-zinc-500">
                      {filter === "all"
                        ? "No calls in queue — Use 'New Call' to get started"
                        : `No ${filter} calls`}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => {
                const status = statusLabels[item.status];
                const priority = priorityLabels[item.priority];
                return (
                  <TableRow
                    key={item.id}
                    className="border-zinc-800/60 hover:bg-zinc-800/30 transition-colors"
                    data-testid={`queue-row-${item.id}`}
                  >
                    {/* Contact */}
                    <TableCell className="py-2.5">
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-200">{item.contactName}</span>
                        {item.notes && (
                          <span className="text-xs text-zinc-600 line-clamp-1 max-w-[180px]" title={item.notes}>
                            {item.notes}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Phone */}
                    <TableCell className="py-2.5 text-xs text-zinc-400 tabular-nums">
                      {item.contactPhone}
                    </TableCell>

                    {/* Campaign */}
                    <TableCell className="py-2.5">
                      <CampaignBadge type={item.campaignType} />
                    </TableCell>

                    {/* Agent */}
                    <TableCell className="py-2.5">
                      {item.assignedAgentName ? (
                        <span className="text-xs text-zinc-300">{item.assignedAgentName}</span>
                      ) : (
                        <span className="text-xs text-zinc-600 italic">Unassigned</span>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="py-2.5">
                      <div className="flex items-center gap-1.5">
                        <div className={`size-1.5 rounded-full ${status?.dot}`} />
                        <span className={`text-xs ${status?.color}`}>{status?.label}</span>
                      </div>
                    </TableCell>

                    {/* Priority */}
                    <TableCell className="py-2.5">
                      <span className={`text-xs font-medium ${priority?.color}`}>
                        {priority?.label}
                      </span>
                    </TableCell>

                    {/* Queued at */}
                    <TableCell className="py-2.5 text-xs text-zinc-500">
                      {item.scheduledTime
                        ? formatScheduledTime(item.scheduledTime)
                        : formatRelativeTime(item.queuedAt)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10"
                                  data-testid={`play-btn-${item.id}`}
                                  onClick={() => onStart(item.id)}
                                  disabled={item.status === "in-progress" || item.status === "completed"}
                                />
                              }
                            >
                              <Play className="size-3.5" />
                            </TooltipTrigger>
                            <TooltipContent>Start Call</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                                  data-testid={`reassign-btn-${item.id}`}
                                />
                              }
                            >
                              <User className="size-3.5" />
                            </TooltipTrigger>
                            <TooltipContent>Reassign</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-7 text-zinc-400 hover:text-rose-400 hover:bg-rose-400/10"
                                  data-testid={`cancel-btn-${item.id}`}
                                  onClick={() => onCancel(item.id)}
                                />
                              }
                            >
                              <X className="size-3.5" />
                            </TooltipTrigger>
                            <TooltipContent>Cancel</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ─── 5. Live Calls Monitor ────────────────────────────────────────────────────

interface LiveCallsMonitorProps {
  liveCalls: LiveCall[];
  loading: boolean;
}

function LiveCallsMonitor({ liveCalls, loading }: LiveCallsMonitorProps) {
  // Tick live durations from the startedAt timestamps (not mock timers)
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    if (liveCalls.length === 0) return;
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [liveCalls.length]);

  function getLiveDuration(call: LiveCall): number {
    return Math.floor((Date.now() - new Date(call.startedAt).getTime()) / 1000);
  }

  if (loading) {
    return (
      <div data-testid="live-calls-monitor">
        <div className="mb-2 flex items-center gap-2">
          <div className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
          <h3 className="text-sm font-medium text-zinc-200">Live Calls</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <SkeletonBox className="h-20 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (liveCalls.length === 0) {
    return (
      <div data-testid="live-calls-monitor">
        <div className="mb-2 flex items-center gap-2">
          <div className="size-1.5 rounded-full bg-zinc-700" />
          <h3 className="text-sm font-medium text-zinc-400">Live Calls</h3>
          <span className="text-xs text-zinc-600">No active calls</span>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="live-calls-monitor">
      <div className="mb-2 flex items-center gap-2">
        <div className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
        <h3 className="text-sm font-medium text-zinc-200">Live Calls</h3>
        <span className="text-xs text-zinc-500">({liveCalls.length} active)</span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {liveCalls.map((call) => {
          const duration = getLiveDuration(call);
          const recentLines = call.liveTranscript.slice(-3);

          return (
            <div
              key={call.id}
              className="rounded-lg border border-emerald-500/30 bg-zinc-900/50 p-4 shadow-[0_0_0_1px_rgba(52,211,153,0.08)] animate-pulse-border"
              data-testid={`live-call-card-${call.id}`}
              style={{ boxShadow: "0 0 0 1px rgba(52, 211, 153, 0.12), 0 0 12px rgba(52, 211, 153, 0.06)" }}
            >
              {/* Header */}
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-zinc-100">{call.contactName}</p>
                  <p className="text-xs text-zinc-500">{call.contactPhone}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2 py-0.5">
                    <div className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                    <span className="font-mono text-xs text-emerald-400 tabular-nums">
                      {formatDuration(duration)}
                    </span>
                  </div>
                  <CampaignBadge type={call.campaignType} />
                </div>
              </div>

              {/* Agent row */}
              <div className="mb-3 flex items-center gap-1.5 text-xs text-zinc-500">
                <Headset className="size-3.5" />
                <span>{call.agentName}</span>
                <span className="mx-1 text-zinc-700">·</span>
                <span className="capitalize">{call.direction}</span>
              </div>

              {/* Mini transcript */}
              <div
                className="mb-3 flex max-h-24 flex-col gap-1.5 overflow-y-auto rounded-md bg-zinc-950/50 p-2"
                data-testid={`live-transcript-${call.id}`}
              >
                {recentLines.length > 0 ? (
                  recentLines.map((turn, i) => (
                    <div key={i} className="flex gap-1.5">
                      <span
                        className={`shrink-0 text-[10px] font-medium uppercase tabular-nums ${
                          turn.role === "agent" ? "text-blue-400" : "text-zinc-400"
                        }`}
                      >
                        {turn.role === "agent" ? "AGT" : "CTX"}
                      </span>
                      <p className="text-xs leading-relaxed text-zinc-400 line-clamp-2">
                        {turn.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-zinc-600 italic">Live transcript not yet available</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1.5 border-zinc-700 text-xs text-zinc-400 hover:bg-zinc-800 opacity-60 cursor-not-allowed"
                          data-testid={`transfer-btn-${call.id}`}
                        />
                      }
                    >
                      <ArrowRight className="size-3.5" />
                      Transfer
                    </TooltipTrigger>
                    <TooltipContent>Phase 2</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-1.5 border-zinc-700 text-xs text-zinc-400 hover:bg-zinc-800 opacity-60 cursor-not-allowed"
                          data-testid={`takeover-btn-${call.id}`}
                        />
                      }
                    >
                      <Headset className="size-3.5" />
                      Take Over
                    </TooltipTrigger>
                    <TooltipContent>Phase 2</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 6. Completed Calls Section ───────────────────────────────────────────────

const outcomeColors: Record<string, string> = {
  answered: "bg-emerald-500/15 text-emerald-400",
  voicemail: "bg-blue-500/15 text-blue-400",
  "no-answer": "bg-zinc-500/15 text-zinc-400",
  busy: "bg-amber-500/15 text-amber-400",
  declined: "bg-rose-500/15 text-rose-400",
  "wrong-number": "bg-rose-500/15 text-rose-400",
};

function TranscriptView({ transcript }: { transcript: TranscriptTurn[] }) {
  return (
    <div className="flex max-h-64 flex-col gap-2 overflow-y-auto rounded-md bg-zinc-950/60 p-3">
      {transcript.map((turn, i) => (
        <div key={i} className={`flex gap-2 ${turn.role === "agent" ? "" : "flex-row-reverse"}`}>
          <div
            className={`flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold ${
              turn.role === "agent"
                ? "bg-blue-500/20 text-blue-400"
                : "bg-zinc-700 text-zinc-300"
            }`}
          >
            {turn.role === "agent" ? <Bot className="size-3" /> : <User className="size-3" />}
          </div>
          <div
            className={`max-w-[80%] rounded-lg px-2.5 py-1.5 text-xs leading-relaxed ${
              turn.role === "agent"
                ? "bg-blue-500/10 text-zinc-300"
                : "bg-zinc-800 text-zinc-300"
            }`}
          >
            {turn.text}
          </div>
        </div>
      ))}
    </div>
  );
}

function CompletedCallCard({ call }: { call: CompletedCallDetail }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const status = statusLabels[call.status];
  const outcome = call.outcome ?? "no-answer";

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} data-testid={`completed-call-${call.id}`}>
      <CollapsibleTrigger
        className="w-full"
        data-testid={`completed-call-trigger-${call.id}`}
      >
        <div className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-900/40 px-4 py-3 hover:bg-zinc-900/70 transition-colors cursor-pointer">
          {/* Left: toggle icon */}
          <div className="text-zinc-600">
            {isOpen ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </div>

          {/* Contact + agent */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-zinc-200">{call.contactName}</span>
              {call.assignedAgentName && (
                <span className="text-xs text-zinc-600">via {call.assignedAgentName}</span>
              )}
            </div>
          </div>

          {/* Campaign badge */}
          <CampaignBadge type={call.campaignType} />

          {/* Outcome badge */}
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              outcomeColors[outcome] ?? "bg-zinc-500/15 text-zinc-400"
            }`}
          >
            {outcome.replace("-", " ")}
          </span>

          {/* Duration */}
          {call.duration && (
            <div className="flex items-center gap-1 text-xs text-zinc-500">
              <Clock className="size-3" />
              {formatDuration(call.duration)}
            </div>
          )}

          {/* Sentiment */}
          <span className="text-base" title={call.sentiment}>
            {sentimentEmoji[call.sentiment] ?? "😐"}
          </span>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="rounded-b-lg border-x border-b border-zinc-800 bg-zinc-900/20 px-4 py-4 -mt-px">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Left: Transcript + Summary */}
            <div className="flex flex-col gap-3">
              <div>
                <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Transcript
                </h4>
                <TranscriptView transcript={call.transcript} />
              </div>

              {call.summary && (
                <div>
                  <h4 className="mb-1.5 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Summary
                  </h4>
                  <p className="text-xs leading-relaxed text-zinc-400">{call.summary}</p>
                </div>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex flex-col gap-4">
              {/* Actions Taken */}
              {call.actionsKicked.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Actions Taken
                  </h4>
                  <div className="flex flex-col gap-2">
                    {call.actionsKicked.map((action, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 rounded-md bg-emerald-500/5 border border-emerald-500/15 px-3 py-2"
                        data-testid={`action-kicked-${call.id}-${i}`}
                      >
                        <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-emerald-400" />
                        <div>
                          <p className="text-xs font-medium text-zinc-300">{action.description}</p>
                          <p className="text-[10px] text-zinc-600">
                            {action.referenceId} · {formatRelativeTime(action.createdAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Actions */}
              {call.suggestedActions.length > 0 && (
                <div>
                  <h4 className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                    Suggested Actions
                  </h4>
                  <div className="flex flex-col gap-2">
                    {call.suggestedActions.map((action, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="justify-start gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-600 text-xs h-auto py-2 px-3"
                        data-testid={`suggested-action-${call.id}-${i}`}
                      >
                        <SuggestedActionIcon type={action.type} />
                        <div className="flex flex-col items-start gap-0.5">
                          <span className="font-medium">{action.label}</span>
                          <span className="text-[10px] text-zinc-500 font-normal text-left leading-tight">
                            {action.description}
                          </span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {call.actionsKicked.length === 0 && call.suggestedActions.length === 0 && (
                <div className="flex items-center gap-2 text-xs text-zinc-600">
                  <AlertTriangle className="size-3.5" />
                  No actions generated for this call.
                </div>
              )}
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function CompletedCallsSection() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div data-testid="completed-calls-section">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="mb-3 flex w-full items-center justify-between"
        data-testid="completed-calls-toggle"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium text-zinc-200">Completed Today</h3>
          <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
            {sampleCompletedCalls.length}
          </span>
        </div>
        <div className="flex items-center gap-1 text-xs text-zinc-500">
          {isOpen ? (
            <>
              <ChevronUp className="size-3.5" />
              <span>Collapse</span>
            </>
          ) : (
            <>
              <ChevronDown className="size-3.5" />
              <span>Expand</span>
            </>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="flex flex-col gap-2">
          {sampleCompletedCalls.map((call) => (
            <CompletedCallCard key={call.id} call={call} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

export default function OutboundQueueTab() {
  const [queue, setQueue] = React.useState<OutboundQueueItem[]>([]);
  const [stats, setStats] = React.useState<QueueStats | null>(null);
  const [liveCalls, setLiveCalls] = React.useState<LiveCall[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  async function fetchData() {
    try {
      const res = await fetch("/api/operator/queue");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: QueueApiResponse = await res.json();
      setQueue(data.queue ?? []);
      setStats(data.stats ?? null);
      setLiveCalls(data.live ?? []);
      setError(null);
    } catch (err) {
      console.error("[OutboundQueueTab] fetch error:", err);
      setError("Failed to load queue data.");
    } finally {
      setLoading(false);
    }
  }

  // Initial fetch + 15-second polling
  React.useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  async function handleCancel(id: string) {
    try {
      await fetch(`/api/operator/queue/${id}`, { method: "DELETE" });
      await fetchData();
    } catch (err) {
      console.error("[OutboundQueueTab] cancel error:", err);
    }
  }

  async function handleStart(id: string) {
    try {
      await fetch(`/api/operator/queue/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in-progress" }),
      });
      await fetchData();
    } catch (err) {
      console.error("[OutboundQueueTab] start error:", err);
    }
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-5 p-4" data-testid="outbound-queue-tab">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">Outbound Queue</h2>
            <p className="text-xs text-zinc-500">Manage scheduled and queued outbound calls</p>
          </div>
          <QuickDialSheet onSuccess={fetchData} />
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-400">
            <AlertTriangle className="size-3.5 shrink-0" />
            {error}
          </div>
        )}

        {/* KPI Strip */}
        <KpiStrip stats={stats} loading={loading} />

        {/* Agent Pool */}
        <AgentPoolStrip liveCalls={liveCalls} />

        {/* Live Calls */}
        <LiveCallsMonitor liveCalls={liveCalls} loading={loading} />

        {/* Queue Table */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <h3 className="text-sm font-medium text-zinc-200">Call Queue</h3>
            {!loading && (
              <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">
                {queue.length}
              </span>
            )}
          </div>
          <QueueTable
            queue={queue}
            loading={loading}
            onCancel={handleCancel}
            onStart={handleStart}
          />
        </div>

        {/* Completed Calls */}
        <CompletedCallsSection />
      </div>
    </TooltipProvider>
  );
}
