"use client";

import * as React from "react";
import {
  Phone,
  User,
  AlertTriangle,
  Wrench,
  Calendar,
  FileText,
  TrendingUp,
  MessageCircle,
  ArrowRight,
  Trash2,
  Plus,
  Edit2,
  Clock,
  CheckCircle2,
  XCircle,
  Hash,
  PhoneCall,
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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

import type {
  RoutingRule,
  CustomRoutingRule,
  ScheduleBlock,
  RoutingOverride,
  RoutingDestination,
  DayOfWeek,
} from "@/types/operator";

// ─── API Response type ────────────────────────────────────────────────────────

interface RoutingConfig {
  rules: RoutingRule[];
  override: RoutingOverride;
  customRules: CustomRoutingRule[];
  schedule: ScheduleBlock[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCountdown(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return "Expired";
  const totalSecs = Math.floor(diff / 1000);
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m remaining`;
  return `${m}m remaining`;
}

function formatHour(h: number): string {
  if (h === 0) return "12am";
  if (h === 12) return "12pm";
  if (h < 12) return `${h}am`;
  return `${h - 12}pm`;
}

function useCountdown(expiresAt: string | null): string {
  const [label, setLabel] = React.useState(
    expiresAt ? formatCountdown(expiresAt) : ""
  );
  React.useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => setLabel(formatCountdown(expiresAt)), 15000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return label;
}

// ─── Skeleton helpers ─────────────────────────────────────────────────────────

function SkeletonLine({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-zinc-800/70 ${className ?? "h-4 w-full"}`}
    />
  );
}

// ─── Intent Icon ─────────────────────────────────────────────────────────────

function IntentIcon({ intent }: { intent: string }) {
  const cls = "size-4 text-zinc-400";
  switch (intent.toLowerCase()) {
    case "emergency":
      return <AlertTriangle className={cls} />;
    case "service request":
      return <Wrench className={cls} />;
    case "appointment":
      return <Calendar className={cls} />;
    case "billing":
      return <FileText className={cls} />;
    case "sales inquiry":
      return <TrendingUp className={cls} />;
    default:
      return <MessageCircle className={cls} />;
  }
}

// ─── Priority Badge ───────────────────────────────────────────────────────────

function PriorityBadge({ priority }: { priority: RoutingRule["priority"] }) {
  const map: Record<string, string> = {
    urgent: "bg-rose-500/15 text-rose-400 border-rose-500/20",
    high: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    normal: "bg-zinc-700/50 text-zinc-400 border-zinc-700",
    low: "bg-zinc-800/80 text-zinc-500 border-zinc-700/50",
  };
  const labels: Record<string, string> = {
    urgent: "Urgent",
    high: "High",
    normal: "Normal",
    low: "Low",
  };
  return (
    <span
      className={`inline-flex h-5 items-center rounded px-1.5 text-[10px] font-medium border ${
        map[priority] ?? map.normal
      }`}
    >
      {labels[priority] ?? priority}
    </span>
  );
}

// ─── Destination style map ────────────────────────────────────────────────────

const destinationColors: Record<RoutingDestination, string> = {
  "ai-receptionist": "bg-emerald-500/80",
  "ai-receptionist-limited": "bg-amber-500/70",
  human: "bg-blue-500/80",
  voicemail: "bg-zinc-500/70",
  "ivr-menu": "bg-violet-500/80",
  "emergency-only": "bg-rose-500/80",
  "forward-cell": "bg-cyan-500/80",
  "forward-employee": "bg-sky-500/80",
};

const destinationLabels: Record<RoutingDestination, string> = {
  "ai-receptionist": "AI Receptionist",
  "ai-receptionist-limited": "AI (Limited)",
  human: "Human Agent",
  voicemail: "Voicemail",
  "ivr-menu": "IVR Menu",
  "emergency-only": "Emergency Only",
  "forward-cell": "Forward → Cell",
  "forward-employee": "Forward → Employee",
};

// ─── Section 1: Active Routing Status Banner ─────────────────────────────────

type OverrideAction = "cell" | "employee" | "emergency" | null;

interface ConfigStripProps {
  action: OverrideAction;
  onCancel: () => void;
  onActivate: (payload: {
    mode: string;
    destination: string;
    forwardToNumber: string | null;
    forwardToName: string | null;
    reason: string;
    durationMinutes: number | null;
  }) => Promise<void>;
}

function ConfigStrip({ action, onCancel, onActivate }: ConfigStripProps) {
  const [duration, setDuration] = React.useState("1hr");
  const [phone, setPhone] = React.useState(
    action === "cell" ? "+12039155211" : ""
  );
  const [saving, setSaving] = React.useState(false);

  const handleActivate = async () => {
    const durationMap: Record<string, number | null> = {
      "1hr": 60,
      "2hr": 120,
      "4hr": 240,
      "8hr": 480,
      cancel: null,
    };

    const durationMinutes = durationMap[duration] ?? 60;

    let mode = "override";
    let destination = "forward-cell";
    let forwardToNumber: string | null = null;
    let forwardToName: string | null = null;
    let reason = "";

    if (action === "cell") {
      destination = "forward-cell";
      forwardToNumber = phone || "+12039155211";
      forwardToName = "Josh Bishop";
      reason = "Diverted all calls to cell";
    } else if (action === "employee") {
      destination = "forward-employee";
      forwardToNumber = phone || null;
      forwardToName = null;
      reason = "Diverted all calls to employee";
    } else if (action === "emergency") {
      mode = "emergency";
      destination = "emergency-only";
      reason = "Emergency override — calls restricted";
    }

    setSaving(true);
    try {
      await onActivate({
        mode,
        destination,
        forwardToNumber,
        forwardToName,
        reason,
        durationMinutes,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      data-testid="override-config-strip"
      className="mt-2 flex flex-wrap items-end gap-3 rounded-lg border border-zinc-800 bg-zinc-900/70 px-4 py-3"
    >
      {/* Duration */}
      <div className="flex flex-col gap-1">
        <Label className="text-xs text-zinc-500">Duration</Label>
        <Select
          value={duration}
          onValueChange={(v) => setDuration(v ?? "1hr")}
        >
          <SelectTrigger
            data-testid="override-duration-select"
            className="h-7 w-36 border-zinc-700 bg-zinc-800 text-xs text-zinc-200"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1hr">1 hour</SelectItem>
            <SelectItem value="2hr">2 hours</SelectItem>
            <SelectItem value="4hr">4 hours</SelectItem>
            <SelectItem value="8hr">8 hours</SelectItem>
            <SelectItem value="cancel">Until cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Phone input for cell/employee */}
      {(action === "cell" || action === "employee") && (
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-zinc-500">
            {action === "cell" ? "Forward to" : "Employee phone"}
          </Label>
          <Input
            data-testid="override-phone-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="h-7 w-40 border-zinc-700 bg-zinc-800 text-xs text-zinc-200 placeholder:text-zinc-600"
            placeholder="+1 (xxx) xxx-xxxx"
          />
        </div>
      )}

      <div className="flex gap-2">
        <Button
          data-testid="override-activate-btn"
          size="sm"
          className="h-7 bg-zinc-100 text-zinc-900 text-xs hover:bg-white"
          onClick={handleActivate}
          disabled={saving}
        >
          <CheckCircle2 className="size-3" />
          {saving ? "Activating…" : "Activate"}
        </Button>
        <Button
          data-testid="override-cancel-btn"
          size="sm"
          variant="ghost"
          className="h-7 text-xs text-zinc-500 hover:text-zinc-300"
          onClick={onCancel}
          disabled={saving}
        >
          <XCircle className="size-3" />
          Cancel
        </Button>
      </div>
    </div>
  );
}

interface RoutingStatusBannerProps {
  override: RoutingOverride;
  loading: boolean;
  onRefetch: () => void;
}

function RoutingStatusBanner({
  override,
  loading,
  onRefetch,
}: RoutingStatusBannerProps) {
  const [activeAction, setActiveAction] = React.useState<OverrideAction>(null);
  const [deactivating, setDeactivating] = React.useState(false);
  const countdown = useCountdown(override.expiresAt);
  const isActive = override.active;

  const handleActionClick = (action: OverrideAction) => {
    setActiveAction((prev) => (prev === action ? null : action));
  };

  const handleActivate = async (payload: {
    mode: string;
    destination: string;
    forwardToNumber: string | null;
    forwardToName: string | null;
    reason: string;
    durationMinutes: number | null;
  }) => {
    await fetch("/api/operator/routing", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: true, ...payload }),
    });
    setActiveAction(null);
    onRefetch();
  };

  const handleDeactivate = async () => {
    setDeactivating(true);
    try {
      await fetch("/api/operator/routing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: false }),
      });
      onRefetch();
    } finally {
      setDeactivating(false);
    }
  };

  if (loading) {
    return (
      <div data-testid="routing-status-section" className="space-y-3">
        <div className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
          <SkeletonLine className="mt-1 size-2 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonLine className="h-4 w-48" />
            <SkeletonLine className="h-3 w-72" />
          </div>
        </div>
        <div className="flex gap-2">
          <SkeletonLine className="h-7 w-36 rounded-md" />
          <SkeletonLine className="h-7 w-40 rounded-md" />
          <SkeletonLine className="h-7 w-36 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div data-testid="routing-status-section" className="space-y-3">
      {/* Banner */}
      <div
        data-testid="routing-status-banner"
        className={`flex items-start gap-3 rounded-lg border bg-zinc-900/50 px-4 py-3 ${
          isActive
            ? "border-amber-500/30 border-l-2 border-l-amber-500"
            : "border-zinc-800 border-l-2 border-l-emerald-500"
        }`}
      >
        <div
          className={`mt-1 size-2 shrink-0 rounded-full ${
            isActive
              ? "bg-amber-400 animate-pulse"
              : "bg-emerald-500"
          }`}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-zinc-100">
            {isActive ? override.reason : "Normal Routing Active"}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {isActive
              ? `Override by ${override.activatedBy} · ${countdown}`
              : "All calls routing per intent rules and weekly schedule"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5 text-xs text-zinc-500">
          {isActive ? (
            <>
              <Clock className="size-3.5" />
              {countdown}
              <Button
                data-testid="override-deactivate-btn"
                size="sm"
                variant="ghost"
                className="ml-2 h-6 px-2 text-[11px] text-zinc-500 hover:text-rose-400"
                onClick={handleDeactivate}
                disabled={deactivating}
              >
                {deactivating ? "Deactivating…" : "Deactivate"}
              </Button>
            </>
          ) : (
            <>
              <Clock className="size-3.5" />
              Schedule-based
            </>
          )}
        </div>
      </div>

      {/* Quick override buttons */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {/* Divert All → My Cell */}
          <div className="flex flex-col">
            <Button
              data-testid="override-cell-btn"
              size="sm"
              variant="outline"
              className={`h-7 border-amber-600/40 bg-amber-500/10 text-amber-400 text-xs hover:bg-amber-500/20 hover:text-amber-300 hover:border-amber-500/60 ${
                activeAction === "cell" ? "bg-amber-500/20 border-amber-500/60" : ""
              }`}
              onClick={() => handleActionClick("cell")}
            >
              <PhoneCall className="size-3" />
              Divert All → My Cell
            </Button>
          </div>

          {/* Divert All → Employee */}
          <div className="flex flex-col">
            <Button
              data-testid="override-employee-btn"
              size="sm"
              variant="outline"
              className={`h-7 border-blue-600/40 bg-blue-500/10 text-blue-400 text-xs hover:bg-blue-500/20 hover:text-blue-300 hover:border-blue-500/60 ${
                activeAction === "employee" ? "bg-blue-500/20 border-blue-500/60" : ""
              }`}
              onClick={() => handleActionClick("employee")}
            >
              <User className="size-3" />
              Divert All → Employee
            </Button>
          </div>

          {/* Emergency Override */}
          <div className="flex flex-col">
            <Button
              data-testid="override-emergency-btn"
              size="sm"
              variant="outline"
              className={`h-7 border-rose-600/40 bg-rose-500/10 text-rose-400 text-xs hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/60 ${
                activeAction === "emergency" ? "bg-rose-500/20 border-rose-500/60" : ""
              }`}
              onClick={() => handleActionClick("emergency")}
            >
              <AlertTriangle className="size-3" />
              Emergency Override
            </Button>
          </div>
        </div>

        {/* Inline config strip */}
        {activeAction !== null && (
          <ConfigStrip
            action={activeAction}
            onCancel={() => setActiveAction(null)}
            onActivate={handleActivate}
          />
        )}
      </div>
    </div>
  );
}

// ─── Section 2: Intent-Based Routing Rules Table ─────────────────────────────

interface RoutingRulesTableProps {
  rules: RoutingRule[];
  loading: boolean;
  onRulesChange: (updater: (prev: RoutingRule[]) => RoutingRule[]) => void;
}

function RoutingRulesTable({
  rules,
  loading,
  onRulesChange,
}: RoutingRulesTableProps) {
  const toggleRule = async (id: string, newEnabled: boolean) => {
    // Optimistic update
    onRulesChange((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: newEnabled } : r))
    );

    try {
      await fetch("/api/operator/routing/rules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled: newEnabled }),
      });
    } catch {
      // Revert on failure
      onRulesChange((prev) =>
        prev.map((r) => (r.id === id ? { ...r, enabled: !newEnabled } : r))
      );
    }
  };

  return (
    <div data-testid="routing-rules-section" className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-100">
            Intent-Based Routing Rules
          </h3>
          <p className="text-xs text-zinc-500">
            Define how calls are routed based on caller intent
          </p>
        </div>
      </div>

      {loading ? (
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <div className="space-y-px">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b border-zinc-800 bg-zinc-900/50 px-4 py-3"
              >
                <SkeletonLine className="h-4 w-32" />
                <SkeletonLine className="h-3 w-48" />
                <SkeletonLine className="h-3 w-40" />
                <SkeletonLine className="h-5 w-12 rounded" />
                <SkeletonLine className="h-5 w-8 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ) : rules.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-8 text-center">
          <MessageCircle className="mx-auto mb-2 size-5 text-zinc-700" />
          <p className="text-sm text-zinc-600">No routing rules configured</p>
          <p className="text-xs text-zinc-700">
            Routing rules will appear here once they are set up
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-800">
          <Table>
            <TableHeader>
              <TableRow className="border-zinc-800 hover:bg-transparent">
                <TableHead className="h-8 pl-4 text-xs text-zinc-500 font-medium">
                  Intent
                </TableHead>
                <TableHead className="h-8 text-xs text-zinc-500 font-medium">
                  Business Hours
                </TableHead>
                <TableHead className="h-8 text-xs text-zinc-500 font-medium">
                  After Hours
                </TableHead>
                <TableHead className="h-8 text-xs text-zinc-500 font-medium">
                  Priority
                </TableHead>
                <TableHead className="h-8 text-xs text-zinc-500 font-medium">
                  Status
                </TableHead>
                <TableHead className="h-8 pr-4 text-xs text-zinc-500 font-medium">
                  {/* Edit */}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow
                  key={rule.id}
                  data-testid={`routing-rule-row-${rule.id}`}
                  className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800/40"
                >
                  <TableCell className="py-2.5 pl-4">
                    <div className="flex items-center gap-2">
                      <IntentIcon intent={rule.intent} />
                      <span
                        className={`text-sm font-medium ${
                          rule.enabled ? "text-zinc-100" : "text-zinc-500"
                        }`}
                      >
                        {rule.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 max-w-[220px]">
                    <span className="text-xs text-zinc-400 leading-snug">
                      {rule.businessHoursRoute}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5 max-w-[220px]">
                    <span className="text-xs text-zinc-500 leading-snug">
                      {rule.afterHoursRoute}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    <PriorityBadge priority={rule.priority} />
                  </TableCell>
                  <TableCell className="py-2.5">
                    <Switch
                      data-testid={`routing-rule-toggle-${rule.id}`}
                      size="sm"
                      checked={rule.enabled}
                      onCheckedChange={(checked) =>
                        toggleRule(rule.id, checked)
                      }
                    />
                  </TableCell>
                  <TableCell className="py-2.5 pr-4">
                    <Button
                      data-testid={`routing-rule-edit-${rule.id}`}
                      size="icon-sm"
                      variant="ghost"
                      className="text-zinc-600 hover:text-zinc-300"
                    >
                      <Edit2 className="size-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

// ─── Section 3: Custom Routing Rules ────────────────────────────────────────

type RuleTypeLabelMap = Record<CustomRoutingRule["type"], string>;
const ruleTypeLabels: RuleTypeLabelMap = {
  "area-code": "Area Code",
  "specific-number": "Specific Number",
  "caller-id": "Caller ID",
};

type RuleTypeBadgeMap = Record<CustomRoutingRule["type"], string>;
const ruleTypeBadgeColors: RuleTypeBadgeMap = {
  "area-code": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "specific-number": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "caller-id": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
};

interface AddRuleFormState {
  type: CustomRoutingRule["type"];
  match: string;
  destination: RoutingDestination;
  forwardTo: string;
  voicemailMessage: string;
  expiration: string;
  note: string;
}

const DEFAULT_FORM: AddRuleFormState = {
  type: "area-code",
  match: "",
  destination: "ai-receptionist",
  forwardTo: "",
  voicemailMessage: "",
  expiration: "never",
  note: "",
};

function CustomRuleCard({
  rule,
  onToggle,
  onDelete,
}: {
  rule: CustomRoutingRule;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const expiryLabel = rule.expiresAt
    ? formatCountdown(rule.expiresAt)
    : "Permanent";

  return (
    <div
      data-testid={`custom-rule-card-${rule.id}`}
      className="flex items-start justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3"
    >
      <div className="min-w-0 flex-1 space-y-1.5">
        {/* Top row: type badge + match */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex h-5 items-center rounded px-1.5 text-[10px] font-medium border ${
              ruleTypeBadgeColors[rule.type]
            }`}
          >
            {ruleTypeLabels[rule.type]}
          </span>
          <span className="font-mono text-sm font-semibold text-zinc-100">
            {rule.match}
          </span>
        </div>

        {/* Destination */}
        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <ArrowRight className="size-3 text-zinc-600" />
          <span>{destinationLabels[rule.destination]}</span>
          {rule.forwardTo && (
            <span className="text-zinc-500">· {rule.forwardTo}</span>
          )}
        </div>

        {/* Expiry + note */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-600">
          <span className="flex items-center gap-1">
            <Clock className="size-3" />
            {expiryLabel}
          </span>
          {rule.note && (
            <span className="text-zinc-500 truncate max-w-xs">{rule.note}</span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex shrink-0 items-center gap-2">
        <Switch
          data-testid={`custom-rule-toggle-${rule.id}`}
          size="sm"
          checked={rule.enabled}
          onCheckedChange={onToggle}
        />
        <Button
          data-testid={`custom-rule-delete-${rule.id}`}
          size="icon-sm"
          variant="ghost"
          className="text-zinc-700 hover:text-rose-400"
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

function getMatchLabel(type: CustomRoutingRule["type"]): string {
  switch (type) {
    case "area-code":
      return "Area Code (3 digits)";
    case "specific-number":
      return "Phone Number (E.164)";
    case "caller-id":
      return "Caller ID Pattern";
  }
}

interface CustomRoutingRulesProps {
  rules: CustomRoutingRule[];
  loading: boolean;
  onRulesChange: (
    updater: (prev: CustomRoutingRule[]) => CustomRoutingRule[]
  ) => void;
  onRefetch: () => void;
}

function CustomRoutingRules({
  rules,
  loading,
  onRulesChange,
  onRefetch,
}: CustomRoutingRulesProps) {
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [form, setForm] = React.useState<AddRuleFormState>(DEFAULT_FORM);
  const [saving, setSaving] = React.useState(false);

  const needsForwardTo =
    form.destination === "forward-cell" || form.destination === "forward-employee";
  const needsVoicemail = form.destination === "voicemail";

  const handleToggle = async (id: string, newEnabled: boolean) => {
    // Optimistic update
    onRulesChange((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: newEnabled } : r))
    );

    try {
      await fetch("/api/operator/routing/custom", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled: newEnabled }),
      });
    } catch {
      // Revert on failure
      onRulesChange((prev) =>
        prev.map((r) => (r.id === id ? { ...r, enabled: !newEnabled } : r))
      );
    }
  };

  const handleDelete = async (id: string) => {
    // Optimistic update
    onRulesChange((prev) => prev.filter((r) => r.id !== id));

    try {
      await fetch(`/api/operator/routing/custom?id=${id}`, {
        method: "DELETE",
      });
    } catch {
      // Refetch to restore on failure
      onRefetch();
    }
  };

  const handleSave = async () => {
    const expiresAt: string | null = (() => {
      const hoursMap: Record<string, number> = {
        "1h": 1,
        "4h": 4,
        "8h": 8,
        "24h": 24,
      };
      const h = hoursMap[form.expiration];
      return h ? new Date(Date.now() + h * 3600000).toISOString() : null;
    })();

    setSaving(true);
    try {
      await fetch("/api/operator/routing/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          match: form.match,
          destination: form.destination,
          forwardTo: form.forwardTo || null,
          voicemailMessage: form.voicemailMessage || null,
          expiresAt,
          note: form.note,
        }),
      });
      setForm(DEFAULT_FORM);
      setSheetOpen(false);
      onRefetch();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div data-testid="custom-routing-section" className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-100">Custom Rules</h3>
          <p className="text-xs text-zinc-500">
            Override routing for specific numbers or area codes
          </p>
        </div>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger
            data-testid="add-custom-rule-btn"
            render={
              <Button
                size="sm"
                variant="outline"
                className="h-7 border-zinc-700 bg-zinc-800 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
              />
            }
          >
            <Plus className="size-3" />
            Add Rule
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md bg-zinc-950 border-zinc-800">
            <SheetHeader className="border-b border-zinc-800 pb-3">
              <SheetTitle className="text-zinc-100">Add Custom Rule</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {/* Rule Type */}
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Rule Type</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      type: (v ?? "area-code") as CustomRoutingRule["type"],
                    }))
                  }
                >
                  <SelectTrigger
                    data-testid="add-rule-type-select"
                    className="w-full border-zinc-700 bg-zinc-900 text-zinc-200 text-sm"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="area-code">Area Code</SelectItem>
                    <SelectItem value="specific-number">Specific Number</SelectItem>
                    <SelectItem value="caller-id">Caller ID</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Match */}
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">
                  {getMatchLabel(form.type)}
                </Label>
                <Input
                  data-testid="add-rule-match-input"
                  value={form.match}
                  onChange={(e) => setForm((f) => ({ ...f, match: e.target.value }))}
                  placeholder={
                    form.type === "area-code"
                      ? "212"
                      : form.type === "specific-number"
                      ? "+12035551234"
                      : "Pattern"
                  }
                  className="border-zinc-700 bg-zinc-900 text-zinc-200 placeholder:text-zinc-600"
                />
              </div>

              {/* Destination */}
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Destination</Label>
                <Select
                  value={form.destination}
                  onValueChange={(v) =>
                    setForm((f) => ({
                      ...f,
                      destination: (v ?? "ai-receptionist") as RoutingDestination,
                    }))
                  }
                >
                  <SelectTrigger
                    data-testid="add-rule-destination-select"
                    className="w-full border-zinc-700 bg-zinc-900 text-zinc-200 text-sm"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(destinationLabels) as RoutingDestination[]).map(
                      (d) => (
                        <SelectItem key={d} value={d}>
                          {destinationLabels[d]}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Forward-to phone */}
              {needsForwardTo && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">
                    {form.destination === "forward-cell"
                      ? "Forward to Phone Number"
                      : "Forward to Employee"}
                  </Label>
                  <Input
                    data-testid="add-rule-forward-input"
                    value={form.forwardTo}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, forwardTo: e.target.value }))
                    }
                    placeholder="+12039155211"
                    className="border-zinc-700 bg-zinc-900 text-zinc-200 placeholder:text-zinc-600"
                  />
                </div>
              )}

              {/* Voicemail message */}
              {needsVoicemail && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-zinc-400">Voicemail Message</Label>
                  <Textarea
                    data-testid="add-rule-voicemail-input"
                    value={form.voicemailMessage}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, voicemailMessage: e.target.value }))
                    }
                    placeholder="Leave a message and we'll get back to you..."
                    className="min-h-[80px] border-zinc-700 bg-zinc-900 text-zinc-200 placeholder:text-zinc-600 resize-none"
                  />
                </div>
              )}

              {/* Expiration */}
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Expiration</Label>
                <Select
                  value={form.expiration}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, expiration: v ?? "never" }))
                  }
                >
                  <SelectTrigger
                    data-testid="add-rule-expiration-select"
                    className="w-full border-zinc-700 bg-zinc-900 text-zinc-200 text-sm"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="1h">1 hour</SelectItem>
                    <SelectItem value="4h">4 hours</SelectItem>
                    <SelectItem value="8h">8 hours</SelectItem>
                    <SelectItem value="24h">24 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <Label className="text-xs text-zinc-400">Note</Label>
                <Input
                  data-testid="add-rule-note-input"
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="Optional note..."
                  className="border-zinc-700 bg-zinc-900 text-zinc-200 placeholder:text-zinc-600"
                />
              </div>
            </div>

            <SheetFooter className="border-t border-zinc-800">
              <Button
                data-testid="add-rule-cancel-btn"
                size="sm"
                variant="ghost"
                className="text-zinc-500 hover:text-zinc-300"
                onClick={() => {
                  setForm(DEFAULT_FORM);
                  setSheetOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                data-testid="add-rule-save-btn"
                size="sm"
                className="bg-zinc-100 text-zinc-900 hover:bg-white"
                onClick={handleSave}
                disabled={!form.match || saving}
              >
                {saving ? "Saving…" : "Save Rule"}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Rule cards */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="flex items-start justify-between gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3"
            >
              <div className="flex-1 space-y-2">
                <SkeletonLine className="h-5 w-40" />
                <SkeletonLine className="h-3 w-64" />
                <SkeletonLine className="h-3 w-32" />
              </div>
              <SkeletonLine className="h-5 w-8 rounded-full" />
            </div>
          ))}
        </div>
      ) : rules.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-8 text-center">
          <Hash className="mx-auto mb-2 size-5 text-zinc-700" />
          <p className="text-sm text-zinc-600">No custom routing rules</p>
          <p className="text-xs text-zinc-700">
            Add one to get started
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => (
            <CustomRuleCard
              key={rule.id}
              rule={rule}
              onToggle={() => handleToggle(rule.id, !rule.enabled)}
              onDelete={() => handleDelete(rule.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Section 4: Schedule-Based Routing (Visual Grid) ─────────────────────────

const DAYS: DayOfWeek[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DAY_LABELS: Record<DayOfWeek, string> = {
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
  sun: "Sun",
};
const HOUR_LABELS = [0, 3, 6, 9, 12, 15, 18, 21];
const TOTAL_HOURS = 24;

function getBlockSegments(block: ScheduleBlock): Array<{ start: number; end: number }> {
  // Handles wrap-around: e.g., startHour=21, endHour=8
  if (block.startHour < block.endHour) {
    return [{ start: block.startHour, end: block.endHour }];
  }
  // Wraps midnight
  return [
    { start: block.startHour, end: 24 },
    { start: 0, end: block.endHour },
  ];
}

function ScheduleBlockSegment({
  block,
  start,
  end,
}: {
  block: ScheduleBlock;
  start: number;
  end: number;
}) {
  const left = (start / TOTAL_HOURS) * 100;
  const width = ((end - start) / TOTAL_HOURS) * 100;
  const color = destinationColors[block.destination];

  const timeLabel = `${formatHour(block.startHour)}–${
    block.endHour === 24 ? "12am" : formatHour(block.endHour)
  }`;

  const scriptPreview = block.agentScript
    ? block.agentScript.length > 80
      ? block.agentScript.slice(0, 80) + "…"
      : block.agentScript
    : null;

  return (
    <TooltipProvider delay={200}>
      <Tooltip>
        <TooltipTrigger
          render={
            <div
              data-testid={`schedule-block-${block.id}-${start}`}
              style={{ left: `${left}%`, width: `${width}%` }}
              className={`absolute top-0.5 bottom-0.5 rounded-sm ${color} cursor-default opacity-90 hover:opacity-100 transition-opacity`}
            />
          }
        />
        <TooltipContent
          side="top"
          className="max-w-[220px] bg-zinc-900 text-zinc-100 border border-zinc-700 rounded-md p-2.5 text-xs shadow-xl"
        >
          <p className="font-medium text-zinc-100">{block.label}</p>
          <p className="text-zinc-400 mt-0.5">{timeLabel}</p>
          {scriptPreview && (
            <p className="text-zinc-500 mt-1 leading-snug">{scriptPreview}</p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface ScheduleGridProps {
  schedule: ScheduleBlock[];
  loading: boolean;
}

function ScheduleGrid({ schedule, loading }: ScheduleGridProps) {
  const blocksByDay = React.useMemo(() => {
    const map: Record<DayOfWeek, ScheduleBlock[]> = {
      mon: [],
      tue: [],
      wed: [],
      thu: [],
      fri: [],
      sat: [],
      sun: [],
    };
    schedule.forEach((b) => {
      map[b.day].push(b);
    });
    return map;
  }, [schedule]);

  return (
    <div data-testid="schedule-routing-section" className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-100">
            Weekly Routing Schedule
          </h3>
          <p className="text-xs text-zinc-500">
            Visual overview of how calls are routed throughout the week
          </p>
        </div>
        <Button
          data-testid="edit-schedule-btn"
          size="sm"
          variant="outline"
          className="h-7 border-zinc-700 bg-zinc-800 text-xs text-zinc-300 hover:bg-zinc-700 hover:text-zinc-100"
        >
          <Edit2 className="size-3" />
          Edit Schedule
        </Button>
      </div>

      {loading ? (
        <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <SkeletonLine className="h-3 w-8 shrink-0" />
              <SkeletonLine className="h-6 flex-1 rounded-sm" />
            </div>
          ))}
        </div>
      ) : schedule.length === 0 ? (
        <div className="rounded-lg border border-dashed border-zinc-800 bg-zinc-900/30 px-6 py-8 text-center">
          <Calendar className="mx-auto mb-2 size-5 text-zinc-700" />
          <p className="text-sm text-zinc-600">No schedule configured</p>
          <p className="text-xs text-zinc-700">
            Defaults to AI Receptionist 24/7
          </p>
        </div>
      ) : (
        <>
          {/* Grid */}
          <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900/50">
            {/* Hour labels */}
            <div className="px-2 pt-2 pb-0">
              <div className="flex" style={{ marginLeft: "48px" }}>
                {HOUR_LABELS.map((h) => (
                  <div
                    key={h}
                    className="text-[10px] text-zinc-600 select-none"
                    style={{
                      width: `${(3 / TOTAL_HOURS) * 100}%`,
                      minWidth: "28px",
                    }}
                  >
                    {formatHour(h)}
                  </div>
                ))}
              </div>
            </div>

            {/* Day rows */}
            <div className="px-2 pb-2 space-y-1">
              {DAYS.map((day) => {
                const blocks = blocksByDay[day];
                return (
                  <div
                    key={day}
                    data-testid={`schedule-row-${day}`}
                    className="flex items-center gap-2"
                  >
                    {/* Day label */}
                    <div className="w-10 shrink-0 text-right text-[11px] font-medium text-zinc-500">
                      {DAY_LABELS[day]}
                    </div>

                    {/* Track */}
                    <div className="relative h-6 flex-1 rounded-sm bg-zinc-800/60">
                      {blocks.map((block) =>
                        getBlockSegments(block).map((seg) => (
                          <ScheduleBlockSegment
                            key={`${block.id}-${seg.start}`}
                            block={block}
                            start={seg.start}
                            end={seg.end}
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Hour tick marks (bottom axis) */}
            <div className="border-t border-zinc-800/50 px-2 pb-2 pt-1">
              <div className="flex" style={{ marginLeft: "48px" }}>
                {Array.from({ length: 25 }, (_, i) => i).map((h) => (
                  <div
                    key={h}
                    className={`flex-shrink-0 h-1.5 border-l ${
                      h % 3 === 0 ? "border-zinc-700" : "border-zinc-800"
                    }`}
                    style={{ width: `${(1 / TOTAL_HOURS) * 100}%`, minWidth: "3.5px" }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {(Object.keys(destinationLabels) as RoutingDestination[]).map((dest) => (
              <div key={dest} className="flex items-center gap-1.5">
                <div
                  className={`size-2.5 rounded-sm ${destinationColors[dest]}`}
                />
                <span className="text-[11px] text-zinc-500">
                  {destinationLabels[dest]}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

const EMPTY_OVERRIDE: RoutingOverride = {
  id: "",
  active: false,
  mode: "normal",
  destination: "ai-receptionist",
  forwardToNumber: null,
  forwardToName: null,
  reason: "",
  activatedAt: null,
  expiresAt: null,
  activatedBy: "",
};

export default function InboundRoutingTab() {
  const [loading, setLoading] = React.useState(true);
  const [override, setOverride] = React.useState<RoutingOverride>(EMPTY_OVERRIDE);
  const [rules, setRules] = React.useState<RoutingRule[]>([]);
  const [customRules, setCustomRules] = React.useState<CustomRoutingRule[]>([]);
  const [schedule, setSchedule] = React.useState<ScheduleBlock[]>([]);

  const fetchConfig = React.useCallback(async () => {
    try {
      const res = await fetch("/api/operator/routing");
      if (!res.ok) return;
      const data: RoutingConfig = await res.json();
      setOverride(data.override);
      setRules(data.rules);
      setCustomRules(data.customRules);
      setSchedule(data.schedule);
    } catch (err) {
      console.error("[InboundRoutingTab] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return (
    <div
      data-testid="inbound-routing-tab"
      className="space-y-6 px-1 py-2"
    >
      {/* Section 1 */}
      <Card className="border-zinc-800 bg-zinc-950 shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-zinc-100">
            Routing Control
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <RoutingStatusBanner
            override={override}
            loading={loading}
            onRefetch={fetchConfig}
          />
        </CardContent>
      </Card>

      {/* Section 2 */}
      <Card className="border-zinc-800 bg-zinc-950 shadow-none">
        <CardContent className="pt-4">
          <RoutingRulesTable
            rules={rules}
            loading={loading}
            onRulesChange={setRules}
          />
        </CardContent>
      </Card>

      {/* Section 3 */}
      <Card className="border-zinc-800 bg-zinc-950 shadow-none">
        <CardContent className="pt-4">
          <CustomRoutingRules
            rules={customRules}
            loading={loading}
            onRulesChange={setCustomRules}
            onRefetch={fetchConfig}
          />
        </CardContent>
      </Card>

      {/* Section 4 */}
      <Card className="border-zinc-800 bg-zinc-950 shadow-none">
        <CardContent className="pt-4">
          <ScheduleGrid schedule={schedule} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}
