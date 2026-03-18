"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  ArrowUpDown,
  DollarSign,
  TrendingUp,
  Users,
  FileText,
  Send,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Megaphone,
  Target,
  Gift,
  ExternalLink,
  BarChart3,
  Mail,
  MessageSquare,
  Zap,
  BookOpen,
  Star,
  Pencil,
  Phone,
  Building,
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
  sampleLeads,
  sampleCampaigns,
  sampleEstimates,
  sampleReferrals,
  type Lead,
  type LeadStage,
  type Campaign,
  type CampaignStatus,
  type CampaignType,
  type Estimate,
  type EstimateStatus,
  type Referral,
} from "@/lib/sample-data-p3";

// --- Helpers ---

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCurrencyShort(amount: number): string {
  if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }
  return `$${amount.toLocaleString()}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDateShort(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatPercent(numerator: number, denominator: number): string {
  if (denominator === 0) return "0%";
  return `${((numerator / denominator) * 100).toFixed(1)}%`;
}

// --- Stage badge styles ---

const stageOrder: LeadStage[] = ["New", "Contacted", "Qualified", "Proposal", "Won", "Lost"];

const stageStyles: Record<LeadStage, { className: string; variant?: "secondary" | "outline" }> = {
  New: { variant: "outline", className: "" },
  Contacted: { className: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
  Qualified: { className: "bg-violet-500/15 text-violet-700 dark:text-violet-400" },
  Proposal: { className: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  Won: { className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  Lost: { variant: "secondary", className: "line-through" },
};

function StageBadge({ stage }: { stage: LeadStage }) {
  const style = stageStyles[stage];
  return (
    <Badge
      variant={style.variant ?? "default"}
      className={`text-[10px] ${style.className} ${!style.variant ? "border-0" : ""}`}
    >
      {stage}
    </Badge>
  );
}

// --- Campaign status badge ---

const campaignStatusStyles: Record<CampaignStatus, { className: string; variant?: "secondary" | "outline" }> = {
  Draft: { variant: "secondary", className: "" },
  Active: { className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  Paused: { className: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
  Completed: { className: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
};

function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  const style = campaignStatusStyles[status];
  return (
    <Badge
      variant={style.variant ?? "default"}
      className={`text-[10px] ${style.className} ${!style.variant ? "border-0" : ""}`}
    >
      {status}
    </Badge>
  );
}

// --- Campaign type badge ---

const campaignTypeIcons: Record<CampaignType, typeof Mail> = {
  Email: Mail,
  SMS: MessageSquare,
  "Automated Sequence": Zap,
  "Direct Mail": BookOpen,
  "Referral Program": Gift,
};

function CampaignTypeBadge({ type }: { type: CampaignType }) {
  const Icon = campaignTypeIcons[type];
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3 w-3 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">{type}</span>
    </div>
  );
}

// --- Estimate status badge ---

const estimateStatusStyles: Record<EstimateStatus, { className: string; variant?: "secondary" | "outline" }> = {
  Draft: { variant: "secondary", className: "" },
  Sent: { className: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
  Viewed: { className: "bg-violet-500/15 text-violet-700 dark:text-violet-400" },
  Accepted: { className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  Declined: { className: "bg-red-500/15 text-red-700 dark:text-red-400" },
  Expired: { className: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
};

function EstimateStatusBadge({ status }: { status: EstimateStatus }) {
  const style = estimateStatusStyles[status];
  return (
    <Badge
      variant={style.variant ?? "default"}
      className={`text-[10px] ${style.className} ${!style.variant ? "border-0" : ""}`}
    >
      {status}
    </Badge>
  );
}

// --- Referral status badge ---

function ReferralStatusBadge({ status }: { status: Referral["status"] }) {
  const styles: Record<string, { className: string; variant?: "secondary" | "outline" }> = {
    Pending: { className: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
    Converted: { className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
    Lost: { variant: "secondary", className: "line-through" },
  };
  const style = styles[status];
  return (
    <Badge
      variant={style.variant ?? "default"}
      className={`text-[10px] ${style.className} ${!style.variant ? "border-0" : ""}`}
    >
      {status}
    </Badge>
  );
}

// --- Lead score indicator ---

function LeadScore({ score }: { score: number }) {
  const color =
    score >= 80
      ? "text-emerald-600 dark:text-emerald-400"
      : score >= 60
        ? "text-amber-600 dark:text-amber-400"
        : "text-muted-foreground";
  return (
    <div className="flex items-center gap-1">
      <div
        className={`h-1.5 w-8 rounded-full bg-muted overflow-hidden`}
      >
        <div
          className={`h-full rounded-full ${
            score >= 80
              ? "bg-emerald-500"
              : score >= 60
                ? "bg-amber-500"
                : "bg-muted-foreground/40"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-[10px] font-mono ${color}`}>{score}</span>
    </div>
  );
}

// --- Pipeline stages (exclude Won/Lost for kanban) ---
const pipelineStages: LeadStage[] = ["New", "Contacted", "Qualified", "Proposal"];

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

export default function SalesMarketingPage() {
  const [activeTab, setActiveTab] = useState<"leads" | "campaigns" | "estimates" | "referrals">("leads");
  const [search, setSearch] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [selectedEstimate, setSelectedEstimate] = useState<Estimate | null>(null);
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [campaignStatusFilter, setCampaignStatusFilter] = useState<string>("all");
  const [estimateStatusFilter, setEstimateStatusFilter] = useState<string>("all");

  // --- KPI computations ---

  const pipelineValue = useMemo(() => {
    return sampleLeads
      .filter((l) => l.stage !== "Won" && l.stage !== "Lost")
      .reduce((sum, l) => sum + l.value, 0);
  }, []);

  const activeLeads = useMemo(() => {
    return sampleLeads.filter((l) => l.stage !== "Won" && l.stage !== "Lost").length;
  }, []);

  const conversionRate = useMemo(() => {
    const total = sampleLeads.length;
    const won = sampleLeads.filter((l) => l.stage === "Won").length;
    return total > 0 ? ((won / total) * 100).toFixed(1) : "0";
  }, []);

  const campaignRevenue = useMemo(() => {
    return sampleCampaigns.reduce((sum, c) => sum + c.revenue, 0);
  }, []);

  // --- Filtered leads ---
  const filteredLeads = useMemo(() => {
    return sampleLeads.filter((l) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        l.name.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.source.toLowerCase().includes(q);
      const matchesStage = stageFilter === "all" || l.stage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [search, stageFilter]);

  // --- Pipeline columns ---
  const pipelineColumns = useMemo(() => {
    return pipelineStages.map((stage) => ({
      stage,
      leads: filteredLeads.filter((l) => l.stage === stage),
      value: filteredLeads.filter((l) => l.stage === stage).reduce((sum, l) => sum + l.value, 0),
    }));
  }, [filteredLeads]);

  // --- Won / Lost summary ---
  const wonLeads = useMemo(() => sampleLeads.filter((l) => l.stage === "Won"), []);
  const lostLeads = useMemo(() => sampleLeads.filter((l) => l.stage === "Lost"), []);

  // --- Filtered campaigns ---
  const filteredCampaigns = useMemo(() => {
    return sampleCampaigns.filter((c) => {
      const q = search.toLowerCase();
      const matchesSearch = !q || c.name.toLowerCase().includes(q) || c.type.toLowerCase().includes(q);
      const matchesStatus = campaignStatusFilter === "all" || c.status === campaignStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, campaignStatusFilter]);

  // --- Filtered estimates ---
  const filteredEstimates = useMemo(() => {
    return sampleEstimates.filter((e) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        e.number.toLowerCase().includes(q) ||
        e.clientName.toLowerCase().includes(q) ||
        e.title.toLowerCase().includes(q);
      const matchesStatus = estimateStatusFilter === "all" || e.status === estimateStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, estimateStatusFilter]);

  // --- KPIs ---
  const kpis = [
    {
      label: "Pipeline Value",
      value: formatCurrency(pipelineValue),
      icon: DollarSign,
      detail: `${activeLeads} active leads`,
    },
    {
      label: "Conversion Rate",
      value: `${conversionRate}%`,
      icon: TrendingUp,
      detail: `${wonLeads.length} won / ${sampleLeads.length} total`,
    },
    {
      label: "Campaign Revenue",
      value: formatCurrency(campaignRevenue),
      icon: Megaphone,
      detail: `${sampleCampaigns.filter((c) => c.status === "Active").length} active campaigns`,
    },
    {
      label: "Referrals",
      value: String(sampleReferrals.length),
      icon: Gift,
      detail: `${sampleReferrals.filter((r) => r.status === "Converted").length} converted`,
    },
  ];

  // --- Clear search when switching tabs ---
  const handleTabChange = (tab: string) => {
    setActiveTab(tab as typeof activeTab);
    setSearch("");
  };

  return (
    <div className="p-6 space-y-6 max-w-[1400px]" data-testid="sales-marketing-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" data-testid="page-title">
            Sales & Marketing
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Pipeline, campaigns, estimates, and referral tracking
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" data-testid="kpi-row">
        {kpis.map((kpi) => (
          <Card key={kpi.label} data-testid={`card-kpi-${kpi.label.toLowerCase().replace(/\s+/g, "-")}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.label}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold tracking-tight font-mono">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs + Toolbar */}
      <div className="flex items-center gap-3 flex-wrap" data-testid="toolbar">
        <Tabs value={activeTab} onValueChange={handleTabChange} data-testid="section-tabs">
          <TabsList className="h-8">
            <TabsTrigger value="leads" className="text-xs px-3" data-testid="tab-leads">
              Leads
            </TabsTrigger>
            <TabsTrigger value="campaigns" className="text-xs px-3" data-testid="tab-campaigns">
              Campaigns
            </TabsTrigger>
            <TabsTrigger value="estimates" className="text-xs px-3" data-testid="tab-estimates">
              Estimates
            </TabsTrigger>
            <TabsTrigger value="referrals" className="text-xs px-3" data-testid="tab-referrals">
              Referrals
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={
              activeTab === "leads"
                ? "Search leads..."
                : activeTab === "campaigns"
                  ? "Search campaigns..."
                  : activeTab === "estimates"
                    ? "Search estimates..."
                    : "Search referrals..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8"
            data-testid="input-search"
          />
        </div>

        {/* Contextual filter */}
        {activeTab === "leads" && (
          <Select value={stageFilter} onValueChange={(v) => setStageFilter(v ?? "all")}>
            <SelectTrigger className="w-[130px] h-8 text-xs" data-testid="select-stage-filter">
              <SelectValue placeholder="Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              {stageOrder.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {activeTab === "campaigns" && (
          <Select value={campaignStatusFilter} onValueChange={(v) => setCampaignStatusFilter(v ?? "all")}>
            <SelectTrigger className="w-[130px] h-8 text-xs" data-testid="select-campaign-status-filter">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {(["Draft", "Active", "Paused", "Completed"] as CampaignStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {activeTab === "estimates" && (
          <Select value={estimateStatusFilter} onValueChange={(v) => setEstimateStatusFilter(v ?? "all")}>
            <SelectTrigger className="w-[140px] h-8 text-xs" data-testid="select-estimate-status-filter">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {(["Draft", "Sent", "Viewed", "Accepted", "Declined", "Expired"] as EstimateStatus[]).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="flex-1" />

        {activeTab === "leads" && (
          <Button size="sm" className="h-8" data-testid="button-new-lead">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Lead
          </Button>
        )}
        {activeTab === "campaigns" && (
          <Button size="sm" className="h-8" data-testid="button-new-campaign">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Campaign
          </Button>
        )}
        {activeTab === "estimates" && (
          <Button size="sm" className="h-8" data-testid="button-new-estimate">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            New Estimate
          </Button>
        )}
      </div>

      {/* ═══ LEADS TAB — Pipeline Kanban ═══ */}
      {activeTab === "leads" && (
        <div className="space-y-4">
          {/* Pipeline Kanban */}
          <div className="overflow-x-auto pb-2" data-testid="leads-pipeline">
            <div className="flex gap-4 min-w-max">
              {pipelineColumns.map((col) => (
                <div
                  key={col.stage}
                  className="w-[260px] shrink-0"
                  data-testid={`pipeline-col-${col.stage.toLowerCase()}`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {col.stage}
                      </h3>
                      <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                        {col.leads.length}
                      </Badge>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {formatCurrencyShort(col.value)}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-2 min-h-[200px]">
                    {col.leads.map((lead) => (
                      <button
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="w-full text-left rounded-lg border bg-card p-3 space-y-2 hover:border-foreground/20 transition-colors cursor-pointer"
                        data-testid={`pipeline-card-${lead.id}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-medium truncate">{lead.name}</span>
                          <LeadScore score={lead.score} />
                        </div>
                        {lead.company && (
                          <p className="text-xs text-muted-foreground truncate">
                            {lead.company}
                          </p>
                        )}
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <span className="text-xs font-mono font-medium">
                            {formatCurrencyShort(lead.value)}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {lead.assignedTo !== "Unassigned" ? (
                              <>
                                <Avatar className="h-5 w-5">
                                  <AvatarFallback className="text-[9px] bg-foreground/10">
                                    {getInitials(lead.assignedTo)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                                  {lead.assignedTo}
                                </span>
                              </>
                            ) : (
                              <span className="text-[10px] text-muted-foreground/60 italic">
                                Unassigned
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>{lead.source}</span>
                          {lead.nextFollowUp && (
                            <span className="font-mono">
                              Follow-up: {formatDateShort(lead.nextFollowUp)}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                    {col.leads.length === 0 && (
                      <div className="flex items-center justify-center h-[100px] border border-dashed rounded-lg">
                        <span className="text-xs text-muted-foreground/50">No leads</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Won / Lost Summary */}
          {(wonLeads.length > 0 || lostLeads.length > 0) && (
            <div className="grid grid-cols-2 gap-4" data-testid="won-lost-summary">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    Won ({wonLeads.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {wonLeads.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setSelectedLead(l)}
                      className="w-full text-left flex items-center justify-between text-sm hover:bg-muted/50 rounded px-2 py-1 -mx-2 cursor-pointer"
                      data-testid={`won-lead-${l.id}`}
                    >
                      <span className="truncate">{l.name}</span>
                      <span className="font-mono text-emerald-600 dark:text-emerald-400 text-xs">
                        {formatCurrency(l.value)}
                      </span>
                    </button>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <XCircle className="h-3.5 w-3.5 text-red-500" />
                    Lost ({lostLeads.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {lostLeads.map((l) => (
                    <button
                      key={l.id}
                      onClick={() => setSelectedLead(l)}
                      className="w-full text-left flex items-center justify-between text-sm hover:bg-muted/50 rounded px-2 py-1 -mx-2 cursor-pointer"
                      data-testid={`lost-lead-${l.id}`}
                    >
                      <span className="truncate text-muted-foreground">{l.name}</span>
                      <span className="font-mono text-red-600 dark:text-red-400 text-xs">
                        {formatCurrency(l.value)}
                      </span>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ═══ CAMPAIGNS TAB ═══ */}
      {activeTab === "campaigns" && (
        <Card data-testid="card-campaigns-table">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">
                    <span className="inline-flex items-center gap-1">
                      Campaign <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                    </span>
                  </TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Sent</TableHead>
                  <TableHead className="text-right">Open Rate</TableHead>
                  <TableHead className="text-right">Click Rate</TableHead>
                  <TableHead className="text-right">Converted</TableHead>
                  <TableHead className="text-right">
                    <span className="inline-flex items-center gap-1 justify-end">
                      Revenue <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                    </span>
                  </TableHead>
                  <TableHead className="text-right">ROI</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map((c) => {
                  const roi = c.spend > 0 ? ((c.revenue - c.spend) / c.spend * 100).toFixed(0) : "—";
                  return (
                    <TableRow
                      key={c.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedCampaign(c)}
                      data-testid={`row-campaign-${c.id}`}
                    >
                      <TableCell className="pl-4 text-sm font-medium">{c.name}</TableCell>
                      <TableCell><CampaignTypeBadge type={c.type} /></TableCell>
                      <TableCell><CampaignStatusBadge status={c.status} /></TableCell>
                      <TableCell className="text-right text-sm font-mono">{c.sent.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-sm font-mono text-muted-foreground">
                        {formatPercent(c.opened, c.sent)}
                      </TableCell>
                      <TableCell className="text-right text-sm font-mono text-muted-foreground">
                        {formatPercent(c.clicked, c.sent)}
                      </TableCell>
                      <TableCell className="text-right text-sm font-mono">{c.converted}</TableCell>
                      <TableCell className="text-right text-sm font-mono">
                        {formatCurrency(c.revenue)}
                      </TableCell>
                      <TableCell className="text-right text-sm font-mono">
                        {roi !== "—" ? (
                          <span className={Number(roi) > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}>
                            {roi}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredCampaigns.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-muted-foreground">
                      No campaigns match your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ═══ ESTIMATES TAB ═══ */}
      {activeTab === "estimates" && (
        <Card data-testid="card-estimates-table">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">
                    <span className="inline-flex items-center gap-1">
                      Estimate # <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                    </span>
                  </TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">
                    <span className="inline-flex items-center gap-1 justify-end">
                      Amount <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                    </span>
                  </TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Expires</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEstimates.map((est) => (
                  <TableRow
                    key={est.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedEstimate(est)}
                    data-testid={`row-estimate-${est.id}`}
                  >
                    <TableCell className="pl-4 font-mono text-sm">{est.number}</TableCell>
                    <TableCell className="text-sm">{est.clientName}</TableCell>
                    <TableCell className="text-sm max-w-[200px] truncate">{est.title}</TableCell>
                    <TableCell><EstimateStatusBadge status={est.status} /></TableCell>
                    <TableCell className="text-right text-sm font-mono font-medium">
                      {formatCurrency(est.amount)}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">
                      {formatDateShort(est.sentDate)}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">
                      {formatDateShort(est.expiresDate)}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEstimates.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                      No estimates match your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* ═══ REFERRALS TAB ═══ */}
      {activeTab === "referrals" && (
        <div className="space-y-4">
          {/* Referral summary cards */}
          <div className="grid grid-cols-3 gap-4" data-testid="referral-summary-cards">
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground">Total Referrals</p>
                <p className="text-xl font-semibold tracking-tight mt-0.5 font-mono">
                  {sampleReferrals.length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground">Converted Value</p>
                <p className="text-xl font-semibold tracking-tight mt-0.5 font-mono text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(
                    sampleReferrals
                      .filter((r) => r.status === "Converted")
                      .reduce((sum, r) => sum + r.value, 0)
                  )}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <p className="text-xs text-muted-foreground">Pending Value</p>
                <p className="text-xl font-semibold tracking-tight mt-0.5 font-mono text-amber-600 dark:text-amber-400">
                  {formatCurrency(
                    sampleReferrals
                      .filter((r) => r.status === "Pending")
                      .reduce((sum, r) => sum + r.value, 0)
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Referrals table */}
          <Card data-testid="card-referrals-table">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Referrer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Referred</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                    <TableHead>Reward</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sampleReferrals.map((ref) => (
                    <TableRow
                      key={ref.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedReferral(ref)}
                      data-testid={`row-referral-${ref.id}`}
                    >
                      <TableCell className="pl-4 text-sm font-medium">{ref.referrerName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{ref.referrerType}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{ref.referredName}</TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground">
                        {formatDateShort(ref.date)}
                      </TableCell>
                      <TableCell><ReferralStatusBadge status={ref.status} /></TableCell>
                      <TableCell className="text-right text-sm font-mono">
                        {formatCurrency(ref.value)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{ref.reward}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ═══ LEAD DETAIL SHEET ═══ */}
      <Sheet open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto" data-testid="sheet-lead-detail">
          {selectedLead && <LeadDetail lead={selectedLead} onClose={() => setSelectedLead(null)} />}
        </SheetContent>
      </Sheet>

      {/* ═══ CAMPAIGN DETAIL SHEET ═══ */}
      <Sheet open={!!selectedCampaign} onOpenChange={() => setSelectedCampaign(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto" data-testid="sheet-campaign-detail">
          {selectedCampaign && <CampaignDetail campaign={selectedCampaign} onClose={() => setSelectedCampaign(null)} />}
        </SheetContent>
      </Sheet>

      {/* ═══ ESTIMATE DETAIL SHEET ═══ */}
      <Sheet open={!!selectedEstimate} onOpenChange={() => setSelectedEstimate(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto" data-testid="sheet-estimate-detail">
          {selectedEstimate && <EstimateDetail estimate={selectedEstimate} onClose={() => setSelectedEstimate(null)} />}
        </SheetContent>
      </Sheet>

      {/* ═══ REFERRAL DETAIL SHEET ═══ */}
      <Sheet open={!!selectedReferral} onOpenChange={() => setSelectedReferral(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto" data-testid="sheet-referral-detail">
          {selectedReferral && <ReferralDetail referral={selectedReferral} onClose={() => setSelectedReferral(null)} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// LEAD DETAIL
// ═══════════════════════════════════════════════════════════════════

function LeadDetail({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-lg flex items-center gap-2">
          {lead.name}
          <StageBadge stage={lead.stage} />
        </SheetTitle>
        <SheetDescription className="text-sm">
          {lead.company || "Individual"} — AI Score: {lead.score}
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        {/* Contact */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Contact
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-mono text-sm">{lead.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-mono text-sm">{lead.phone}</span>
            </div>
            {lead.company && (
              <div className="flex items-center gap-2 text-sm">
                <Building className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{lead.company}</span>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Lead Details */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Lead Details
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Value</p>
              <p className="text-sm font-mono font-medium">{formatCurrency(lead.value)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Source</p>
              <p className="text-sm">{lead.source}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">AI Score</p>
              <div className="mt-0.5">
                <LeadScore score={lead.score} />
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Assigned To</p>
              <p className="text-sm">
                {lead.assignedTo !== "Unassigned" ? (
                  <span className="flex items-center gap-1.5">
                    <Avatar className="h-5 w-5 inline-flex">
                      <AvatarFallback className="text-[9px] bg-foreground/10">
                        {getInitials(lead.assignedTo)}
                      </AvatarFallback>
                    </Avatar>
                    {lead.assignedTo}
                  </span>
                ) : (
                  <span className="text-muted-foreground/60 italic">Unassigned</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Timeline */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Timeline
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm font-mono">{formatDate(lead.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Contact</p>
              <p className="text-sm font-mono">{formatDate(lead.lastContact)}</p>
            </div>
            {lead.nextFollowUp && (
              <div>
                <p className="text-xs text-muted-foreground">Next Follow-Up</p>
                <p className="text-sm font-mono">{formatDate(lead.nextFollowUp)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {lead.notes && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Notes
              </h4>
              <p className="text-sm text-muted-foreground">{lead.notes}</p>
            </div>
          </>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2" data-testid="lead-actions">
          <Button size="sm" data-testid="button-create-estimate">
            <FileText className="h-3.5 w-3.5 mr-1.5" />
            Create Estimate
          </Button>
          <Button size="sm" variant="outline" data-testid="button-edit-lead">
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
          <Button size="sm" variant="outline" data-testid="button-advance-stage">
            <ChevronRight className="h-3.5 w-3.5 mr-1.5" />
            Advance Stage
          </Button>
          <Button
            size="sm"
            variant="outline"
            render={<Link href="/dashboard/clients" />}
            data-testid="button-view-client"
          >
            <Users className="h-3.5 w-3.5 mr-1.5" />
            View Client
          </Button>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CAMPAIGN DETAIL
// ═══════════════════════════════════════════════════════════════════

function CampaignDetail({ campaign, onClose }: { campaign: Campaign; onClose: () => void }) {
  const roi = campaign.spend > 0 ? ((campaign.revenue - campaign.spend) / campaign.spend * 100).toFixed(0) : null;

  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-lg flex items-center gap-2">
          {campaign.name}
          <CampaignStatusBadge status={campaign.status} />
        </SheetTitle>
        <SheetDescription className="text-sm">
          <CampaignTypeBadge type={campaign.type} />
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        {/* Audience */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Audience
          </h4>
          <p className="text-sm">{campaign.audience}</p>
        </div>

        <Separator />

        {/* Schedule */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Schedule
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Start Date</p>
              <p className="text-sm font-mono">{formatDate(campaign.startDate)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">End Date</p>
              <p className="text-sm font-mono">{campaign.endDate ? formatDate(campaign.endDate) : "Ongoing"}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Performance Metrics */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Performance
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Sent</p>
              <p className="text-sm font-mono">{campaign.sent.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Opened</p>
              <p className="text-sm font-mono">
                {campaign.opened.toLocaleString()}
                <span className="text-muted-foreground ml-1">({formatPercent(campaign.opened, campaign.sent)})</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Clicked</p>
              <p className="text-sm font-mono">
                {campaign.clicked.toLocaleString()}
                <span className="text-muted-foreground ml-1">({formatPercent(campaign.clicked, campaign.sent)})</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Converted</p>
              <p className="text-sm font-mono">
                {campaign.converted}
                <span className="text-muted-foreground ml-1">({formatPercent(campaign.converted, campaign.sent)})</span>
              </p>
            </div>
          </div>

          {/* Funnel visualization */}
          <div className="space-y-1.5 pt-2">
            {[
              { label: "Sent", val: campaign.sent },
              { label: "Opened", val: campaign.opened },
              { label: "Clicked", val: campaign.clicked },
              { label: "Converted", val: campaign.converted },
            ].map((step) => (
              <div key={step.label} className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground w-16">{step.label}</span>
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-foreground/30 rounded-full"
                    style={{
                      width: campaign.sent > 0 ? `${(step.val / campaign.sent) * 100}%` : "0%",
                    }}
                  />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground w-8 text-right">
                  {step.val}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Financial */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Financial
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Revenue</p>
              <p className="text-sm font-mono font-medium text-emerald-600 dark:text-emerald-400">
                {formatCurrency(campaign.revenue)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Spend</p>
              <p className="text-sm font-mono">{formatCurrency(campaign.spend)}</p>
            </div>
            {roi !== null && (
              <div>
                <p className="text-xs text-muted-foreground">ROI</p>
                <p className={`text-sm font-mono font-medium ${Number(roi) > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                  {roi}%
                </p>
              </div>
            )}
            {campaign.converted > 0 && (
              <div>
                <p className="text-xs text-muted-foreground">Cost per Conversion</p>
                <p className="text-sm font-mono">
                  {formatCurrency(campaign.spend / campaign.converted)}
                </p>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2" data-testid="campaign-actions">
          <Button size="sm" data-testid="button-edit-campaign">
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit Campaign
          </Button>
          {campaign.status === "Draft" && (
            <Button size="sm" variant="outline" data-testid="button-launch-campaign">
              <Send className="h-3.5 w-3.5 mr-1.5" />
              Launch
            </Button>
          )}
          {campaign.status === "Active" && (
            <Button size="sm" variant="outline" data-testid="button-pause-campaign">
              <Clock className="h-3.5 w-3.5 mr-1.5" />
              Pause
            </Button>
          )}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ESTIMATE DETAIL
// ═══════════════════════════════════════════════════════════════════

function EstimateDetail({ estimate, onClose }: { estimate: Estimate; onClose: () => void }) {
  const itemTotal = estimate.items.reduce((sum, item) => sum + item.qty * item.price, 0);

  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-lg flex items-center gap-2">
          <span className="font-mono">{estimate.number}</span>
          <EstimateStatusBadge status={estimate.status} />
        </SheetTitle>
        <SheetDescription className="text-sm">
          <Link
            href="/dashboard/clients"
            className="hover:underline"
            data-testid="link-estimate-client"
          >
            {estimate.clientName}
            <ExternalLink className="inline h-3 w-3 ml-1 -mt-0.5" />
          </Link>
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        {/* Title & Dates */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Details
          </h4>
          <p className="text-sm font-medium">{estimate.title}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Sent</p>
              <p className="text-sm font-mono">{formatDate(estimate.sentDate)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Expires</p>
              <p className="text-sm font-mono">{formatDate(estimate.expiresDate)}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Line Items */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Line Items
          </h4>
          <div data-testid="estimate-line-items">
            {/* Header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-0 py-1.5 border-b text-xs text-muted-foreground">
              <span>Description</span>
              <span className="w-12 text-right">Qty</span>
              <span className="w-20 text-right">Price</span>
              <span className="w-20 text-right">Total</span>
            </div>
            {/* Rows */}
            {estimate.items.map((item, idx) => (
              <div
                key={idx}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-0 py-2 border-b last:border-0 text-sm"
              >
                <span className="pr-2">{item.description}</span>
                <span className="w-12 text-right font-mono text-muted-foreground">
                  {item.qty}
                </span>
                <span className="w-20 text-right font-mono text-muted-foreground">
                  {formatCurrency(item.price)}
                </span>
                <span className={`w-20 text-right font-mono ${item.qty * item.price < 0 ? "text-red-600 dark:text-red-400" : ""}`}>
                  {formatCurrency(item.qty * item.price)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div className="space-y-1.5" data-testid="estimate-summary">
          <div className="flex justify-between text-sm font-semibold">
            <span>Total</span>
            <span className="font-mono">{formatCurrency(estimate.amount)}</span>
          </div>
        </div>

        {/* Notes */}
        {estimate.notes && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Notes
              </h4>
              <p className="text-sm text-muted-foreground">{estimate.notes}</p>
            </div>
          </>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2" data-testid="estimate-actions">
          {(estimate.status === "Draft" || estimate.status === "Sent") && (
            <Button size="sm" data-testid="button-send-estimate">
              <Send className="h-3.5 w-3.5 mr-1.5" />
              {estimate.status === "Draft" ? "Send Estimate" : "Resend"}
            </Button>
          )}
          {estimate.status === "Accepted" && (
            <Button
              size="sm"
              render={<Link href="/dashboard/work-orders" />}
              data-testid="button-create-work-order"
            >
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Create Work Order
            </Button>
          )}
          <Button size="sm" variant="outline" data-testid="button-edit-estimate">
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            render={<Link href="/dashboard/clients" />}
            data-testid="button-view-estimate-client"
          >
            <Users className="h-3.5 w-3.5 mr-1.5" />
            View Client
          </Button>
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// REFERRAL DETAIL
// ═══════════════════════════════════════════════════════════════════

function ReferralDetail({ referral, onClose }: { referral: Referral; onClose: () => void }) {
  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-lg flex items-center gap-2">
          Referral
          <ReferralStatusBadge status={referral.status} />
        </SheetTitle>
        <SheetDescription className="text-sm">
          {referral.referrerName} → {referral.referredName}
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        {/* Referral Info */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Details
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Referrer</p>
              <p className="text-sm font-medium">{referral.referrerName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Type</p>
              <Badge variant="outline" className="text-[10px]">{referral.referrerType}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Referred</p>
              <p className="text-sm">{referral.referredName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="text-sm font-mono">{formatDate(referral.date)}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Value & Reward */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Value & Reward
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Lead Value</p>
              <p className="text-sm font-mono font-medium">{formatCurrency(referral.value)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Reward</p>
              <p className="text-sm">{referral.reward}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2" data-testid="referral-actions">
          <Button
            size="sm"
            variant="outline"
            render={<Link href="/dashboard/clients" />}
            data-testid="button-view-referrer"
          >
            <Users className="h-3.5 w-3.5 mr-1.5" />
            View Referrer
          </Button>
          {referral.status === "Pending" && (
            <Button size="sm" data-testid="button-mark-converted">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              Mark Converted
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
