"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Bot,
  Phone,
  Mail,
  MessageSquare,
  Smartphone,
  Globe,
  Eye,
  Settings2,
  Pause,
  Play,
  Star,
  ChevronDown,
  ChevronUp,
  PhoneCall,
  Timer,
  Radio,
  AlertTriangle,
  Layers,
  Brain,
  Activity,
  Target,
  Zap,
  Shield,
  BarChart3,
  Pencil,
  Archive,
  Trash2,
  Rocket,
  CheckCircle2,
  ListChecks,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  sampleAgents,
  agentRoles,
  agentPersonas,
  defaultContextLayers,
  type AgentEmployee,
  type AgentStatus,
  type InteractionChannel,
  type ContextLayer,
  type CorrectionCategory,
  type CorrectionStatus,
  type AgentCorrection,
} from "@/lib/sample-data-agents";

// ─── Helpers ────────────────────────────────────────────────────

const channelIcon: Record<InteractionChannel, typeof Phone> = {
  phone: Phone,
  email: Mail,
  chat: MessageSquare,
  sms: Smartphone,
  "web-form": Globe,
};

const statusColor: Record<AgentStatus, string> = {
  active: "bg-emerald-500/20 text-emerald-400",
  training: "bg-amber-500/20 text-amber-400",
  paused: "bg-zinc-500/20 text-zinc-400",
  deactivated: "bg-red-500/20 text-red-400",
};

const correctionCategoryColor: Record<CorrectionCategory, string> = {
  "knowledge-gap": "bg-blue-500/20 text-blue-400",
  "process-error": "bg-orange-500/20 text-orange-400",
  "tone-issue": "bg-purple-500/20 text-purple-400",
  "escalation-failure": "bg-red-500/20 text-red-400",
  "factual-error": "bg-amber-500/20 text-amber-400",
};

const correctionStatusColor: Record<CorrectionStatus, string> = {
  active: "bg-emerald-500/20 text-emerald-400",
  resolved: "bg-zinc-500/20 text-zinc-400",
  archived: "bg-zinc-600/20 text-zinc-500",
};

const contextLayerTypeColor: Record<ContextLayer["type"], string> = {
  static: "bg-zinc-500/20 text-zinc-400",
  template: "bg-blue-500/20 text-blue-400",
  dynamic: "bg-emerald-500/20 text-emerald-400",
  persona: "bg-purple-500/20 text-purple-400",
  runtime: "bg-orange-500/20 text-orange-400",
};

function accuracyColor(rate: number) {
  if (rate >= 95) return "text-emerald-400";
  if (rate >= 85) return "text-amber-400";
  return "text-red-400";
}

function formatDuration(s: number) {
  if (s === 0) return "—";
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getRoleForAgent(a: AgentEmployee) {
  return agentRoles.find((r) => r.id === a.roleId);
}

function getPersonaForAgent(a: AgentEmployee) {
  return agentPersonas.find((p) => p.id === a.personaId);
}

// ─── Permission modules ─────────────────────────────────────────

const permissionModules = [
  "clients",
  "scheduling",
  "work-orders",
  "knowledge-base",
  "invoicing",
  "financial",
  "inventory",
  "workforce",
] as const;

const toolToggles = [
  "Calendar",
  "Transfer calls",
  "Send notifications",
] as const;

// ═══════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════

export default function AIAgentsPage() {
  const [activeTab, setActiveTab] = useState<"roster" | "builder" | "learning">("roster");
  const [selectedAgent, setSelectedAgent] = useState<AgentEmployee | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Builder state
  const [builderPersonaId, setBuilderPersonaId] = useState(agentPersonas[0].id);
  const [builderRoleId, setBuilderRoleId] = useState(agentRoles[0].id);
  const [builderModel, setBuilderModel] = useState<string>("gpt-realtime-mini");
  const [builderTemp, setBuilderTemp] = useState(0.7);
  const [builderVoice, setBuilderVoice] = useState<string>("alloy");
  const [builderMaxTokens, setBuilderMaxTokens] = useState("4096");
  const [builderVadMode, setBuilderVadMode] = useState<string>("semantic");
  const [builderFrequency, setBuilderFrequency] = useState<string>("standard");
  const [builderDepth, setBuilderDepth] = useState<string>("summary");
  const [builderRetention, setBuilderRetention] = useState<string>("rolling-90");
  const [deployAlert, setDeployAlert] = useState(false);

  // Collapsible sections for builder
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    model: true,
    context: true,
    permissions: false,
    learning: false,
  });

  // Experience tab state
  const [experienceAgentId, setExperienceAgentId] = useState(sampleAgents[0].id);
  const [expandedInteraction, setExpandedInteraction] = useState<string | null>(null);
  const [expandedCorrection, setExpandedCorrection] = useState<string | null>(null);
  const [corrCategoryFilter, setCorrCategoryFilter] = useState("all");
  const [corrStatusFilter, setCorrStatusFilter] = useState("all");

  // Derived
  const experienceAgent = useMemo(
    () => sampleAgents.find((a) => a.id === experienceAgentId) ?? sampleAgents[0],
    [experienceAgentId]
  );

  const activeAgents = sampleAgents.filter((a) => a.status === "active");

  const summaryCards = useMemo(() => {
    const totalAgents = sampleAgents.length;
    const activeCount = activeAgents.length;
    const tasksToday = sampleAgents.reduce((s, a) => s + a.interactions.filter((i) => {
      const d = new Date(i.timestamp);
      return d.toDateString() === new Date("2026-03-19").toDateString();
    }).length, 0);
    const totalTasks = activeAgents.reduce((s, a) => s + a.metrics.tasksCompleted, 0);
    const avgAccuracy = totalTasks > 0
      ? activeAgents.reduce((s, a) => s + a.metrics.accuracyRate * a.metrics.tasksCompleted, 0) / totalTasks
      : 0;
    const avgSatisfaction = totalTasks > 0
      ? activeAgents.reduce((s, a) => s + a.metrics.satisfactionScore * a.metrics.tasksCompleted, 0) / totalTasks
      : 0;
    return { totalAgents, activeCount, tasksToday, avgAccuracy, avgSatisfaction };
  }, [activeAgents]);

  const builderPersona = agentPersonas.find((p) => p.id === builderPersonaId);
  const builderRole = agentRoles.find((r) => r.id === builderRoleId);

  const filteredCorrections = useMemo(() => {
    return experienceAgent.corrections.filter((c) => {
      if (corrCategoryFilter !== "all" && c.category !== corrCategoryFilter) return false;
      if (corrStatusFilter !== "all" && c.status !== corrStatusFilter) return false;
      return true;
    });
  }, [experienceAgent, corrCategoryFilter, corrStatusFilter]);

  function toggleSection(key: string) {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function openAgentSheet(agent: AgentEmployee) {
    setSelectedAgent(agent);
    setSheetOpen(true);
  }

  // ─── RENDER ────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6 max-w-[1400px]" data-testid="ai-agents-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">AI Agents</h1>
          <p className="text-sm text-muted-foreground">
            Manage, configure, and monitor your AI workforce
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => setActiveTab("builder")}>
          <Bot className="size-4" />
          New Agent
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard icon={Bot} label="Total Agents" value={String(summaryCards.totalAgents)} sub={`${summaryCards.activeCount} active`} />
        <SummaryCard icon={Activity} label="Tasks Today" value={String(summaryCards.tasksToday)} />
        <SummaryCard icon={Target} label="Avg Accuracy" value={`${summaryCards.avgAccuracy.toFixed(1)}%`} valueClass={accuracyColor(summaryCards.avgAccuracy)} />
        <SummaryCard icon={Star} label="Avg Satisfaction" value={`${summaryCards.avgSatisfaction.toFixed(1)}/5`} />
      </div>

      {/* Live Calls Banner */}
      <LiveCallsBanner />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab((v ?? "roster") as typeof activeTab)}>
        <TabsList className="h-8">
          <TabsTrigger value="roster" className="text-xs px-3">Agent Roster</TabsTrigger>
          <TabsTrigger value="builder" className="text-xs px-3">Agent Builder</TabsTrigger>
          <TabsTrigger value="learning" className="text-xs px-3">Experience & Learning</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tab Content */}
      {activeTab === "roster" && <RosterTab agents={sampleAgents} onOpenAgent={openAgentSheet} />}
      {activeTab === "builder" && (
        <BuilderTab
          persona={builderPersona}
          personaId={builderPersonaId}
          setPersonaId={setBuilderPersonaId}
          role={builderRole}
          roleId={builderRoleId}
          setRoleId={setBuilderRoleId}
          model={builderModel}
          setModel={setBuilderModel}
          temp={builderTemp}
          setTemp={setBuilderTemp}
          voice={builderVoice}
          setVoice={setBuilderVoice}
          maxTokens={builderMaxTokens}
          setMaxTokens={setBuilderMaxTokens}
          vadMode={builderVadMode}
          setVadMode={setBuilderVadMode}
          frequency={builderFrequency}
          setFrequency={setBuilderFrequency}
          depth={builderDepth}
          setDepth={setBuilderDepth}
          retention={builderRetention}
          setRetention={setBuilderRetention}
          openSections={openSections}
          toggleSection={toggleSection}
          deployAlert={deployAlert}
          setDeployAlert={setDeployAlert}
        />
      )}
      {activeTab === "learning" && (
        <LearningTab
          agents={sampleAgents}
          agent={experienceAgent}
          agentId={experienceAgentId}
          setAgentId={setExperienceAgentId}
          expandedInteraction={expandedInteraction}
          setExpandedInteraction={setExpandedInteraction}
          expandedCorrection={expandedCorrection}
          setExpandedCorrection={setExpandedCorrection}
          corrCategoryFilter={corrCategoryFilter}
          setCorrCategoryFilter={setCorrCategoryFilter}
          corrStatusFilter={corrStatusFilter}
          setCorrStatusFilter={setCorrStatusFilter}
          filteredCorrections={filteredCorrections}
        />
      )}

      {/* Agent Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
          {selectedAgent && <AgentDetailSheet agent={selectedAgent} onClose={() => setSheetOpen(false)} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SUMMARY CARD
// ═══════════════════════════════════════════════════════════════════

function SummaryCard({ icon: Icon, label, value, sub, valueClass }: {
  icon: typeof Bot;
  label: string;
  value: string;
  sub?: string;
  valueClass?: string;
}) {
  return (
    <Card className="p-0">
      <CardContent className="p-4 flex items-start gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={`text-lg font-semibold ${valueClass ?? "text-foreground"}`}>{value}</p>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ROSTER TAB
// ═══════════════════════════════════════════════════════════════════

function RosterTab({ agents, onOpenAgent }: {
  agents: AgentEmployee[];
  onOpenAgent: (a: AgentEmployee) => void;
}) {
  return (
    <Card className="p-0">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4">Agent</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Channels</TableHead>
              <TableHead>Autonomy</TableHead>
              <TableHead className="text-right">Tasks</TableHead>
              <TableHead className="text-right">Accuracy</TableHead>
              <TableHead className="text-right">Satisfaction</TableHead>
              <TableHead className="text-right pr-4">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agents.map((agent) => {
              const role = getRoleForAgent(agent);
              return (
                <TableRow
                  key={agent.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onOpenAgent(agent)}
                >
                  <TableCell className="pl-4">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
                        {agent.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{agent.name}</p>
                        <Badge variant="secondary" className={`text-[10px] h-4 ${statusColor[agent.status]}`}>
                          {agent.status}
                        </Badge>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-foreground">{role?.name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{agent.department}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {agent.channels.map((ch) => {
                        const Icon = channelIcon[ch];
                        return (
                          <span key={ch} className="flex size-6 items-center justify-center rounded bg-muted">
                            <Icon className="size-3 text-muted-foreground" />
                          </span>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs capitalize">
                      {agent.autonomyLevel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-foreground">
                    {agent.metrics.tasksCompleted.toLocaleString()}
                  </TableCell>
                  <TableCell className={`text-right text-sm font-medium ${accuracyColor(agent.metrics.accuracyRate)}`}>
                    {agent.metrics.accuracyRate}%
                  </TableCell>
                  <TableCell className="text-right text-sm text-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Star className="size-3 text-amber-400 fill-amber-400" />
                      {agent.metrics.satisfactionScore}
                    </span>
                  </TableCell>
                  <TableCell className="text-right pr-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => onOpenAgent(agent)}>
                        <Eye className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-sm">
                        <Settings2 className="size-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-sm">
                        {agent.status === "paused" ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ═══════════════════════════════════════════════════════════════════
// AGENT DETAIL SHEET
// ═══════════════════════════════════════════════════════════════════

function AgentDetailSheet({ agent, onClose }: { agent: AgentEmployee; onClose: () => void }) {
  const role = getRoleForAgent(agent);
  const persona = getPersonaForAgent(agent);
  const m = agent.metrics;

  return (
    <>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-foreground">
            {agent.name[0]}
          </div>
          <div>
            <span>{agent.name}</span>
            <Badge variant="secondary" className={`ml-2 text-[10px] h-4 ${statusColor[agent.status]}`}>
              {agent.status}
            </Badge>
          </div>
        </SheetTitle>
        <SheetDescription>
          {role?.name} · {agent.department} · {agent.autonomyLevel}
        </SheetDescription>
      </SheetHeader>
      <div className="flex-1 space-y-5 px-4 pb-6">
        {/* Performance Metrics */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Performance</h4>
          <div className="grid grid-cols-3 gap-2">
            {([
              ["Tasks", m.tasksCompleted.toLocaleString()],
              ["Accuracy", `${m.accuracyRate}%`],
              ["Satisfaction", `${m.satisfactionScore}/5`],
              ["Avg Response", `${m.avgResponseTime}s`],
              ["Resolution", `${m.resolutionRate}%`],
              ["Escalation", `${m.escalationRate}%`],
              ["Calls", m.totalCalls],
              ["Emails", m.totalEmails],
              ["Chats", m.totalChats],
            ] as const).map(([label, val]) => (
              <div key={label} className="rounded-lg bg-muted/50 p-2.5">
                <p className="text-[10px] text-muted-foreground">{label}</p>
                <p className="text-sm font-semibold text-foreground">{val}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Learned Behaviors */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Learned Behaviors ({agent.learnedBehaviors.length})
          </h4>
          {agent.learnedBehaviors.length === 0 ? (
            <p className="text-xs text-muted-foreground">No learned behaviors yet.</p>
          ) : (
            <ul className="space-y-1.5">
              {agent.learnedBehaviors.map((b, i) => (
                <li key={i} className="text-xs text-foreground/80 flex gap-2">
                  <Brain className="size-3 shrink-0 mt-0.5 text-purple-400" />
                  {b}
                </li>
              ))}
            </ul>
          )}
        </div>

        <Separator />

        {/* Recent Interactions */}
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Recent Interactions
          </h4>
          {agent.interactions.slice(0, 5).map((int) => {
            const ChIcon = channelIcon[int.channel];
            return (
              <div key={int.id} className="flex items-start gap-2.5 py-2 border-b border-border/50 last:border-0">
                <span className="flex size-6 items-center justify-center rounded bg-muted shrink-0 mt-0.5">
                  <ChIcon className="size-3 text-muted-foreground" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-medium text-foreground truncate">{int.customerName}</p>
                    {int.hasCorrection && <AlertTriangle className="size-3 text-amber-400 shrink-0" />}
                    <OutcomeBadge outcome={int.outcome} />
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{int.summary}</p>
                  <p className="text-[10px] text-muted-foreground/60">{formatTimestamp(int.timestamp)} · {formatDuration(int.duration)}</p>
                </div>
              </div>
            );
          })}
          {agent.interactions.length === 0 && (
            <p className="text-xs text-muted-foreground">No interactions yet.</p>
          )}
        </div>

        {/* Persona Info */}
        {persona && (
          <>
            <Separator />
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Persona</h4>
              <p className="text-xs text-foreground/80 italic">&ldquo;{persona.greeting}&rdquo;</p>
              <p className="text-[11px] text-muted-foreground mt-1">{persona.personality}</p>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const map: Record<string, string> = {
    resolved: "bg-emerald-500/20 text-emerald-400",
    escalated: "bg-amber-500/20 text-amber-400",
    error: "bg-red-500/20 text-red-400",
    transferred: "bg-blue-500/20 text-blue-400",
    pending: "bg-zinc-500/20 text-zinc-400",
  };
  return (
    <Badge variant="secondary" className={`text-[9px] h-3.5 ${map[outcome] ?? ""}`}>
      {outcome}
    </Badge>
  );
}

// ═══════════════════════════════════════════════════════════════════
// BUILDER TAB
// ═══════════════════════════════════════════════════════════════════

interface BuilderTabProps {
  persona: typeof agentPersonas[number] | undefined;
  personaId: string;
  setPersonaId: (v: string) => void;
  role: typeof agentRoles[number] | undefined;
  roleId: string;
  setRoleId: (v: string) => void;
  model: string;
  setModel: (v: string) => void;
  temp: number;
  setTemp: (v: number) => void;
  voice: string;
  setVoice: (v: string) => void;
  maxTokens: string;
  setMaxTokens: (v: string) => void;
  vadMode: string;
  setVadMode: (v: string) => void;
  frequency: string;
  setFrequency: (v: string) => void;
  depth: string;
  setDepth: (v: string) => void;
  retention: string;
  setRetention: (v: string) => void;
  openSections: Record<string, boolean>;
  toggleSection: (k: string) => void;
  deployAlert: boolean;
  setDeployAlert: (v: boolean) => void;
}

function BuilderTab(props: BuilderTabProps) {
  const {
    persona, personaId, setPersonaId,
    role, roleId, setRoleId,
    model, setModel,
    temp, setTemp,
    voice, setVoice,
    maxTokens, setMaxTokens,
    vadMode, setVadMode,
    frequency, setFrequency,
    depth, setDepth,
    retention, setRetention,
    openSections, toggleSection,
    deployAlert, setDeployAlert,
  } = props;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* ─── Left: Assembly Panel ─── */}
        <div className="space-y-4">
          {/* Persona Selector */}
          <Card className="p-0">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Bot className="size-4" /> Persona
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <Select value={personaId} onValueChange={(v) => setPersonaId(v ?? personaId)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {agentPersonas.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {persona && (
                <div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-2">
                  <p className="text-xs text-foreground italic">&ldquo;{persona.greeting}&rdquo;</p>
                  <p className="text-[11px] text-muted-foreground">{persona.personality}</p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-[10px]">Voice: {persona.voice}</Badge>
                    <Badge variant="outline" className="text-[10px]">Style: {persona.communicationStyle.split(".")[0]}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Role Selector */}
          <Card className="p-0">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <Shield className="size-4" /> Role
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <Select value={roleId} onValueChange={(v) => setRoleId(v ?? roleId)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {agentRoles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name} — {r.department}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {role && (
                <div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-2">
                  <p className="text-[11px] text-muted-foreground">{role.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {role.capabilities.map((c) => (
                      <Badge key={c} variant="secondary" className="text-[10px]">{c}</Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {role.dataAccess.map((d) => (
                      <Badge key={d} variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20">{d}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Company Info */}
          <Card className="p-0">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <BarChart3 className="size-4" /> Company
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="rounded-lg border border-border/50 bg-muted/30 p-3 space-y-1">
                <p className="text-sm font-medium text-foreground">TripleA Plumbing</p>
                <p className="text-xs text-muted-foreground">Cheshire, CT · 5 employees</p>
                <p className="text-[11px] text-muted-foreground">Residential & commercial plumbing, HVAC, drain cleaning</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Right: Configuration Panel ─── */}
        <div className="space-y-3">
          {/* Model Configuration */}
          <CollapsibleSection title="Model Configuration" icon={Zap} sectionKey="model" open={openSections.model} toggle={toggleSection}>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Model</Label>
                <Select value={model} onValueChange={(v) => setModel(v ?? model)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-realtime-mini">gpt-realtime-mini</SelectItem>
                    <SelectItem value="gpt-realtime-1.5">gpt-realtime-1.5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Voice</Label>
                <Select value={voice} onValueChange={(v) => setVoice(v ?? voice)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["alloy", "echo", "fable", "onyx", "nova", "shimmer"].map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Temperature: {temp.toFixed(1)}</Label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temp}
                  onChange={(e) => setTemp(parseFloat(e.target.value))}
                  className="w-full accent-primary h-1.5"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Max Tokens</Label>
                <Input value={maxTokens} onChange={(e) => setMaxTokens(e.target.value)} className="h-8" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">VAD Mode</Label>
                <Select value={vadMode} onValueChange={(v) => setVadMode(v ?? vadMode)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="semantic">Semantic</SelectItem>
                    <SelectItem value="server-vad">Server VAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleSection>

          {/* Context Layers — visual highlight */}
          <CollapsibleSection title="Context Layers" icon={Layers} sectionKey="context" open={openSections.context} toggle={toggleSection}>
            <div className="space-y-1.5">
              {defaultContextLayers.map((layer) => (
                <ContextLayerBar key={layer.layer} layer={layer} />
              ))}
              <div className="flex items-center justify-between pt-2 border-t border-border/50">
                <span className="text-xs font-medium text-foreground">Total Tokens</span>
                <span className="text-xs font-semibold text-foreground">
                  {defaultContextLayers.reduce((s, l) => s + l.tokenEstimate, 0).toLocaleString()}
                </span>
              </div>
            </div>
          </CollapsibleSection>

          {/* Tools & Permissions */}
          <CollapsibleSection title="Tools & Permissions" icon={Shield} sectionKey="permissions" open={openSections.permissions} toggle={toggleSection}>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {permissionModules.map((mod) => (
                  <div key={mod} className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/20 px-2.5 py-1.5">
                    <span className="text-xs text-foreground capitalize">{mod.replace("-", " ")}</span>
                    <div className="flex gap-2">
                      <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        R <Switch size="sm" defaultChecked />
                      </label>
                      <label className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        W <Switch size="sm" />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Tool Toggles</p>
                {toolToggles.map((tool) => (
                  <div key={tool} className="flex items-center justify-between">
                    <span className="text-xs text-foreground">{tool}</span>
                    <Switch size="sm" defaultChecked />
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleSection>

          {/* Learning Configuration */}
          <CollapsibleSection title="Learning Configuration" icon={Brain} sectionKey="learning" open={openSections.learning} toggle={toggleSection}>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Correction Frequency</Label>
                <Select value={frequency} onValueChange={(v) => setFrequency(v ?? frequency)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="standard">Standard</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Learning Depth</Label>
                <Select value={depth} onValueChange={(v) => setDepth(v ?? depth)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary</SelectItem>
                    <SelectItem value="full-context">Full Context</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Retention Policy</Label>
                <Select value={retention} onValueChange={(v) => setRetention(v ?? retention)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="permanent">Permanent</SelectItem>
                    <SelectItem value="rolling-90">Rolling 90 days</SelectItem>
                    <SelectItem value="decaying-60">Decaying 60 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Auto-Correction Triggers</p>
                {([
                  ["Customer Frustration", true],
                  ["Escalation After Failure", true],
                  ["Tool Call Failure", true],
                  ["Long Silence", false],
                  ["Repeated Question", true],
                  ["Contradictory Statements", false],
                ] as const).map(([label, def]) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-foreground">{label}</span>
                    <Switch size="sm" defaultChecked={def} />
                  </div>
                ))}
              </div>
            </div>
          </CollapsibleSection>
        </div>
      </div>

      {/* Deploy Button */}
      <div className="flex justify-end pt-2">
        {deployAlert && (
          <div className="mr-auto flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle2 className="size-4" />
            Agent deployment initiated successfully!
          </div>
        )}
        <Button
          size="lg"
          className="gap-2"
          onClick={() => {
            setDeployAlert(true);
            setTimeout(() => setDeployAlert(false), 3000);
          }}
        >
          <Rocket className="size-4" />
          Deploy Agent
        </Button>
      </div>
    </div>
  );
}

// ─── Context Layer Bar (visual highlight) ────────────────────────

function ContextLayerBar({ layer }: { layer: ContextLayer }) {
  const maxTokens = 400;
  const widthPct = Math.min((layer.tokenEstimate / maxTokens) * 100, 100);

  return (
    <div className="group relative rounded-lg border border-border/50 bg-muted/20 p-2.5 hover:bg-muted/40 transition-colors cursor-default">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="flex size-5 items-center justify-center rounded bg-muted text-[10px] font-bold text-muted-foreground">
            {layer.layer}
          </span>
          <span className="text-xs font-medium text-foreground">{layer.name}</span>
          <Badge variant="secondary" className={`text-[9px] h-3.5 ${contextLayerTypeColor[layer.type]}`}>
            {layer.type}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground font-mono">
            {layer.tokenEstimate > 0 ? `${layer.tokenEstimate} tokens` : "dynamic"}
          </span>
          {layer.editable && (
            <Pencil className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </div>
      {/* Token bar visualization */}
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            layer.type === "static" ? "bg-zinc-500" :
            layer.type === "template" ? "bg-blue-500" :
            layer.type === "dynamic" ? "bg-emerald-500" :
            layer.type === "persona" ? "bg-purple-500" :
            "bg-orange-500"
          }`}
          style={{ width: layer.tokenEstimate > 0 ? `${widthPct}%` : "0%" }}
        />
      </div>
      <p className="text-[10px] text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {layer.description}
      </p>
      <p className="text-[10px] text-muted-foreground/50 mt-0.5 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
        {layer.source}
      </p>
    </div>
  );
}

// ─── Collapsible Section Wrapper ────────────────────────────────

function CollapsibleSection({ title, icon: Icon, sectionKey, open, toggle, children }: {
  title: string;
  icon: typeof Zap;
  sectionKey: string;
  open: boolean;
  toggle: (k: string) => void;
  children: React.ReactNode;
}) {
  return (
    <Collapsible open={open} onOpenChange={() => toggle(sectionKey)}>
      <Card className="p-0 overflow-hidden">
        <CollapsibleTrigger className="flex w-full items-center justify-between p-3 hover:bg-muted/30 transition-colors cursor-pointer">
          <span className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Icon className="size-4 text-muted-foreground" />
            {title}
          </span>
          {open ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="px-3 pb-3 pt-0">
            {children}
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

// ═══════════════════════════════════════════════════════════════════
// EXPERIENCE & LEARNING TAB
// ═══════════════════════════════════════════════════════════════════

interface LearningTabProps {
  agents: AgentEmployee[];
  agent: AgentEmployee;
  agentId: string;
  setAgentId: (v: string) => void;
  expandedInteraction: string | null;
  setExpandedInteraction: (v: string | null) => void;
  expandedCorrection: string | null;
  setExpandedCorrection: (v: string | null) => void;
  corrCategoryFilter: string;
  setCorrCategoryFilter: (v: string) => void;
  corrStatusFilter: string;
  setCorrStatusFilter: (v: string) => void;
  filteredCorrections: AgentCorrection[];
}

function LearningTab(props: LearningTabProps) {
  const {
    agents, agent, agentId, setAgentId,
    expandedInteraction, setExpandedInteraction,
    expandedCorrection, setExpandedCorrection,
    corrCategoryFilter, setCorrCategoryFilter,
    corrStatusFilter, setCorrStatusFilter,
    filteredCorrections,
  } = props;

  const activeCorrections = agent.corrections.filter((c) => c.status === "active").length;
  const resolvedCorrections = agent.corrections.filter((c) => c.status === "resolved").length;

  return (
    <div className="space-y-4">
      {/* Agent Selector */}
      <div className="flex items-center gap-3">
        <Label className="text-xs text-muted-foreground">Agent:</Label>
        <Select value={agentId} onValueChange={(v) => setAgentId(v ?? agentId)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {agents.map((a) => (
              <SelectItem key={a.id} value={a.id}>{a.name} — {a.department}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Learning Metrics Mini-Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniCard label="Corrections this month" value={agent.corrections.length} icon={AlertTriangle} />
        <MiniCard label="Active corrections" value={activeCorrections} icon={Zap} />
        <MiniCard label="Resolved corrections" value={resolvedCorrections} icon={CheckCircle2} />
        <MiniCard label="Learned behaviors" value={agent.learnedBehaviors.length} icon={Brain} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Activity Log */}
        <Card className="p-0">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5">
              <Activity className="size-4" /> Activity Log
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0 max-h-[480px] overflow-y-auto space-y-1">
            {agent.interactions.length === 0 && (
              <p className="text-xs text-muted-foreground py-4 text-center">No interactions recorded yet.</p>
            )}
            {agent.interactions.map((int) => {
              const ChIcon = channelIcon[int.channel];
              const isExpanded = expandedInteraction === int.id;
              return (
                <div
                  key={int.id}
                  className="rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                  onClick={() => setExpandedInteraction(isExpanded ? null : int.id)}
                >
                  <div className="flex items-center gap-2.5 p-2.5">
                    <span className="flex size-6 items-center justify-center rounded bg-muted shrink-0">
                      <ChIcon className="size-3 text-muted-foreground" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-foreground truncate">{int.customerName}</span>
                        {int.hasCorrection && <AlertTriangle className="size-3 text-amber-400 shrink-0" />}
                        <OutcomeBadge outcome={int.outcome} />
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{formatTimestamp(int.timestamp)}</span>
                        <span>·</span>
                        <span>{formatDuration(int.duration)}</span>
                        <span>·</span>
                        <span>{int.responseTime}s avg</span>
                      </div>
                    </div>
                    {isExpanded ? <ChevronUp className="size-3 text-muted-foreground" /> : <ChevronDown className="size-3 text-muted-foreground" />}
                  </div>
                  {isExpanded && (
                    <div className="px-2.5 pb-2.5 border-t border-border/30">
                      <p className="text-xs text-foreground/80 pt-2">{int.summary}</p>
                      <div className="flex gap-2 mt-1.5 text-[10px] text-muted-foreground">
                        <span>Tool calls: {int.toolCalls}</span>
                        <span>Sentiment: {int.sentiment > 0 ? "+" : ""}{int.sentiment}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Corrections */}
        <Card className="p-0">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-1.5">
                <ListChecks className="size-4" /> Corrections
              </CardTitle>
              <div className="flex gap-2">
                <Select value={corrCategoryFilter} onValueChange={(v) => setCorrCategoryFilter(v ?? "all")}>
                  <SelectTrigger size="sm" className="text-[10px] h-6">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="knowledge-gap">Knowledge Gap</SelectItem>
                    <SelectItem value="process-error">Process Error</SelectItem>
                    <SelectItem value="tone-issue">Tone Issue</SelectItem>
                    <SelectItem value="escalation-failure">Escalation Failure</SelectItem>
                    <SelectItem value="factual-error">Factual Error</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={corrStatusFilter} onValueChange={(v) => setCorrStatusFilter(v ?? "all")}>
                  <SelectTrigger size="sm" className="text-[10px] h-6">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 max-h-[480px] overflow-y-auto space-y-2">
            {filteredCorrections.length === 0 && (
              <p className="text-xs text-muted-foreground py-4 text-center">No corrections found.</p>
            )}
            {filteredCorrections.map((corr) => {
              const isExpanded = expandedCorrection === corr.id;
              return (
                <div
                  key={corr.id}
                  className="rounded-lg border border-border/50 bg-muted/20 hover:bg-muted/40 transition-colors"
                >
                  <div
                    className="flex items-start gap-2.5 p-2.5 cursor-pointer"
                    onClick={() => setExpandedCorrection(isExpanded ? null : corr.id)}
                  >
                    <AlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Badge variant="secondary" className={`text-[9px] h-3.5 ${correctionCategoryColor[corr.category]}`}>
                          {corr.category.replace("-", " ")}
                        </Badge>
                        <Badge variant="secondary" className={`text-[9px] h-3.5 ${correctionStatusColor[corr.status]}`}>
                          {corr.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground mt-1">{corr.description}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(corr.date).toLocaleDateString()} · {corr.trigger}
                      </p>
                    </div>
                    {isExpanded ? <ChevronUp className="size-3 text-muted-foreground" /> : <ChevronDown className="size-3 text-muted-foreground" />}
                  </div>
                  {isExpanded && (
                    <div className="px-2.5 pb-2.5 border-t border-border/30 space-y-2">
                      <div className="pt-2">
                        <p className="text-[10px] font-medium text-red-400 uppercase">Original</p>
                        <p className="text-xs text-foreground/70 mt-0.5 italic">&ldquo;{corr.originalResponse}&rdquo;</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-emerald-400 uppercase">Corrected</p>
                        <p className="text-xs text-foreground/70 mt-0.5">{corr.correctedGuidance}</p>
                      </div>
                      <div className="flex gap-1.5 pt-1">
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1">
                          <Pencil className="size-3" /> Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1">
                          <Archive className="size-3" /> Archive
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 text-red-400 hover:text-red-300">
                          <Trash2 className="size-3" /> Remove
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Learned Behaviors */}
      <Card className="p-0">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm flex items-center gap-1.5">
            <Brain className="size-4" /> Learned Behaviors
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          {agent.learnedBehaviors.length === 0 ? (
            <p className="text-xs text-muted-foreground">No learned behaviors yet.</p>
          ) : (
            <ul className="space-y-2">
              {agent.learnedBehaviors.map((b, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-foreground/80">
                  <CheckCircle2 className="size-3.5 shrink-0 mt-0.5 text-emerald-400" />
                  {b}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MiniCard({ label, value, icon: Icon }: { label: string; value: number; icon: typeof AlertTriangle }) {
  return (
    <Card className="p-0">
      <CardContent className="p-3 flex items-center gap-3">
        <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
          <Icon className="size-3.5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-lg font-semibold text-foreground">{value}</p>
          <p className="text-[10px] text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

/* ─── Live Calls Banner ───────────────────────────────────────────────── */

interface LiveCall {
  id: string;
  agentName: string;
  callerName: string | null;
  callerNumber: string;
  durationSec: number;
  status: "active" | "ringing" | "on-hold";
  toolCalls: number;
}

function LiveCallsBanner() {
  const [expanded, setExpanded] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Demo data — in production, this polls /api/voice/sessions
  const [liveCalls] = useState<LiveCall[]>([
    {
      id: "vs-demo-1",
      agentName: "Alex",
      callerName: "Mrs. Johnson",
      callerNumber: "+1 (203) 555-0147",
      durationSec: 183,
      status: "active",
      toolCalls: 2,
    },
  ]);

  // Tick the elapsed counter every second for the live duration display
  useEffect(() => {
    if (liveCalls.length === 0) return;
    const timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(timer);
  }, [liveCalls.length]);

  if (liveCalls.length === 0) return null;

  return (
    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.04]">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left"
      >
        <div className="flex items-center gap-3">
          {/* Pulsing indicator */}
          <span className="relative flex size-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-xs font-medium text-emerald-400">
            {liveCalls.length} Live Call{liveCalls.length !== 1 ? "s" : ""}
          </span>
          {/* Quick summary of first call */}
          <span className="text-xs text-muted-foreground">
            {liveCalls[0].agentName} — {liveCalls[0].callerName ?? liveCalls[0].callerNumber}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-muted-foreground">
            {formatCallDuration(liveCalls[0].durationSec + elapsed)}
          </span>
          {expanded ? (
            <ChevronUp className="size-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-3.5 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-emerald-500/10 px-4 py-3 space-y-2">
          {liveCalls.map((call) => (
            <div
              key={call.id}
              className="flex items-center justify-between rounded-md bg-white/[0.02] px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-7 items-center justify-center rounded-full bg-emerald-500/10">
                  <PhoneCall className="size-3.5 text-emerald-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-foreground">
                      {call.agentName}
                    </span>
                    <Radio className="size-3 text-emerald-400" />
                    <span className="text-xs text-muted-foreground">
                      {call.callerName ?? call.callerNumber}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Timer className="size-2.5" />
                      {formatCallDuration(call.durationSec + elapsed)}
                    </span>
                    {call.toolCalls > 0 && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Zap className="size-2.5" />
                        {call.toolCalls} tool calls
                      </span>
                    )}
                    <Badge variant="outline" className="text-[9px] py-0 h-4 bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      {call.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-6 text-[10px] text-muted-foreground">
                <Eye className="size-3 mr-1" /> Monitor
              </Button>
            </div>
          ))}

          {/* Voice Pipeline Status */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[10px] text-muted-foreground">
              Voice Pipeline: OpenAI Realtime (gpt-realtime-mini) via Twilio Media Streams
            </span>
            <span className="text-[10px] text-emerald-400/60">
              Server: Connected
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

function formatCallDuration(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
