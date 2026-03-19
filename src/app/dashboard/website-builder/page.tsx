"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Search,
  Globe,
  Plus,
  Eye,
  ExternalLink,
  Settings2,
  Paintbrush,
  LayoutGrid,
  BarChart3,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Smartphone,
  Monitor,
  Tablet,
  Rocket,
  RefreshCw,
  Link2,
  GripVertical,
  EyeOff,
  Zap,
  FileText,
  Users,
  Star,
  MapPin,
  MessageSquare,
  Image,
  HelpCircle,
  Megaphone,
  Info,
  TrendingUp,
  MousePointerClick,
  ChevronRight,
  Copy,
  Pencil,
  Maximize2,
  X,
  Download,
  Loader2,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  websiteTemplates,
  clientWebsites,
  type WebsiteTemplate,
  type ClientWebsite,
  type SiteStatus,
  type SiteTier,
  type SectionType,
  type TemplateIndustry,
  type WebsiteSection,
} from "@/lib/sample-data-p3";

// --- Helpers ---

function formatNumber(n: number): string {
  return n.toLocaleString();
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

function timeAgo(dateStr: string): string {
  if (!dateStr) return "Never";
  const d = new Date(dateStr + "T00:00:00");
  const now = new Date("2026-03-18T00:00:00");
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff}d ago`;
  if (diff < 30) return `${Math.floor(diff / 7)}w ago`;
  return formatDateShort(dateStr);
}

// --- Status badges ---

const siteStatusStyles: Record<SiteStatus, { className: string; variant?: "secondary" | "outline"; icon: typeof CheckCircle2 }> = {
  Published: { className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400", icon: CheckCircle2 },
  Draft: { variant: "secondary", className: "", icon: Clock },
  Maintenance: { className: "bg-amber-500/15 text-amber-700 dark:text-amber-400", icon: AlertTriangle },
};

function SiteStatusBadge({ status }: { status: SiteStatus }) {
  const style = siteStatusStyles[status];
  const Icon = style.icon;
  return (
    <Badge
      variant={style.variant ?? "default"}
      className={`text-[10px] gap-1 ${style.className} ${!style.variant ? "border-0" : ""}`}
    >
      <Icon className="h-2.5 w-2.5" />
      {status}
    </Badge>
  );
}

const tierLabels: Record<SiteTier, { label: string; className: string }> = {
  Static: { label: "Tier 1", className: "text-muted-foreground" },
  Portal: { label: "Tier 2", className: "text-blue-600 dark:text-blue-400" },
  Premium: { label: "Tier 3", className: "text-violet-600 dark:text-violet-400" },
};

function TierBadge({ tier }: { tier: SiteTier }) {
  const t = tierLabels[tier];
  return (
    <Badge variant="outline" className={`text-[10px] ${t.className}`}>
      {t.label} — {tier}
    </Badge>
  );
}

// --- Section icon map ---

const sectionConfig: Record<SectionType, { label: string; icon: typeof Globe; moduleSource?: string }> = {
  hero: { label: "Hero", icon: Rocket },
  services: { label: "Services", icon: LayoutGrid, moduleSource: "Service Config" },
  about: { label: "About", icon: Info },
  team: { label: "Team", icon: Users, moduleSource: "Workforce" },
  reviews: { label: "Reviews", icon: Star },
  contact: { label: "Contact", icon: MessageSquare, moduleSource: "Organization" },
  map: { label: "Service Area", icon: MapPin, moduleSource: "Geo" },
  promotions: { label: "Promotions", icon: Megaphone, moduleSource: "Sales & Marketing" },
  gallery: { label: "Gallery", icon: Image, moduleSource: "Work Orders" },
  faq: { label: "FAQ", icon: HelpCircle },
};

// --- Template preview card ---

function TemplateCard({
  template,
  onSelect,
}: {
  template: WebsiteTemplate;
  onSelect: () => void;
}) {
  return (
    <Card
      className="group cursor-pointer transition-all hover:shadow-md hover:border-foreground/20"
      onClick={onSelect}
      data-testid={`template-card-${template.id}`}
    >
      {/* Template preview swatch */}
      <div
        className="h-32 rounded-t-lg relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${template.previewStyle.primary} 0%, ${template.previewStyle.accent}33 100%)` }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div
              className="h-6 w-6 rounded-full"
              style={{ backgroundColor: template.previewStyle.accent }}
            />
            <div className="flex gap-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-1 rounded-full"
                  style={{
                    width: i === 2 ? "2rem" : "1.5rem",
                    backgroundColor: `${template.previewStyle.accent}88`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" variant="secondary" className="h-7 text-[10px] gap-1">
            <Eye className="h-3 w-3" /> Preview
          </Button>
        </div>
      </div>
      <CardContent className="p-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{template.name}</span>
          <Badge variant="outline" className="text-[10px]">
            {template.industry}
          </Badge>
        </div>
        <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
          {template.description}
        </p>
        <div className="flex items-center justify-between pt-1">
          <div className="flex gap-1">
            {template.sections.slice(0, 4).map((s) => {
              const cfg = sectionConfig[s];
              const Icon = cfg.icon;
              return (
                <div
                  key={s}
                  className="h-5 w-5 rounded-sm bg-muted flex items-center justify-center"
                  title={cfg.label}
                >
                  <Icon className="h-2.5 w-2.5 text-muted-foreground" />
                </div>
              );
            })}
            {template.sections.length > 4 && (
              <div className="h-5 w-5 rounded-sm bg-muted flex items-center justify-center">
                <span className="text-[8px] text-muted-foreground font-mono">
                  +{template.sections.length - 4}
                </span>
              </div>
            )}
          </div>
          <span className="text-[10px] text-muted-foreground font-mono">
            {template.popularityScore}% match
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Mini sparkline ---

function Sparkline({ data, height = 32, className = "" }: { data: number[]; height?: number; className?: string }) {
  if (data.length === 0) return <div className={`h-[${height}px] ${className}`} />;
  const max = Math.max(...data, 1);
  const w = 120;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = height - (v / max) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={height} className={className} viewBox={`0 0 ${w} ${height}`}>
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-foreground/40"
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════

type MainTab = "sites" | "templates" | "analytics";
type SheetTab = "preview" | "sections" | "theme" | "seo" | "analytics";

export default function WebsiteBuilderPage() {
  // Main state
  const [mainTab, setMainTab] = useState<MainTab>("sites");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [industryFilter, setIndustryFilter] = useState<string>("all");
  const [selectedSite, setSelectedSite] = useState<ClientWebsite | null>(null);
  const [siteSheetOpen, setSiteSheetOpen] = useState(false);
  const [siteSheetTab, setSiteSheetTab] = useState<SheetTab>("preview");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");

  // Filtered sites
  const filteredSites = useMemo(() => {
    return clientWebsites.filter((site) => {
      const matchesSearch =
        searchQuery === "" ||
        site.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        site.subdomain.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (site.customDomain && site.customDomain.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === "all" || site.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  // Filtered templates
  const filteredTemplates = useMemo(() => {
    return websiteTemplates.filter((tpl) => {
      const matchesSearch =
        searchQuery === "" ||
        tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.industry.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesIndustry = industryFilter === "all" || tpl.industry === industryFilter;
      return matchesSearch && matchesIndustry;
    });
  }, [searchQuery, industryFilter]);

  // Aggregated KPIs
  const kpis = useMemo(() => {
    const published = clientWebsites.filter((s) => s.status === "Published").length;
    const totalViews = clientWebsites.reduce((sum, s) => sum + s.analytics.pageViews30d, 0);
    const totalSubmissions = clientWebsites.reduce((sum, s) => sum + s.analytics.formSubmissions30d, 0);
    const drafts = clientWebsites.filter((s) => s.status === "Draft").length;
    return { published, totalViews, totalSubmissions, drafts };
  }, []);

  // Preview + publish state
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [fullPreviewOpen, setFullPreviewOpen] = useState(false);
  const [publishedUrl, setPublishedUrl] = useState<string | null>(null);

  const generatePreview = useCallback(async (siteId: string) => {
    setIsGenerating(true);
    setPreviewHtml(null);
    try {
      const res = await fetch(`/api/website/generate?siteId=${siteId}`);
      if (res.ok) {
        const html = await res.text();
        setPreviewHtml(html);
      }
    } catch (e) {
      console.error("Failed to generate preview", e);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  function openSiteDetail(site: ClientWebsite) {
    setSelectedSite(site);
    setSiteSheetTab("preview");
    setSiteSheetOpen(true);
    setPublishedUrl(null);
    generatePreview(site.id);
  }

  const templateForSite = (site: ClientWebsite) =>
    websiteTemplates.find((t) => t.id === site.templateId);

  // ── KPI Cards ──
  const kpiCards = [
    { label: "Live Sites", value: kpis.published.toString(), icon: Globe, change: null },
    { label: "Page Views (30d)", value: formatNumber(kpis.totalViews), icon: Eye, change: "+12.3%" },
    { label: "Form Submissions", value: formatNumber(kpis.totalSubmissions), icon: MousePointerClick, change: "+8.7%" },
    { label: "Draft Sites", value: kpis.drafts.toString(), icon: FileText, change: null },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Website Builder</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create and manage client websites — from simple landing pages to full customer portals
          </p>
        </div>
        <Button size="sm" className="gap-1.5" data-testid="btn-new-site">
          <Plus className="h-3.5 w-3.5" /> New Site
        </Button>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-4 gap-4">
        {kpiCards.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  {kpi.change && (
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                      {kpi.change}
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <span className="text-2xl font-semibold font-mono">{kpi.value}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{kpi.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Tab Navigation ── */}
      <div className="flex items-center justify-between">
        <Tabs
          value={mainTab}
          onValueChange={(v) => setMainTab((v ?? "sites") as MainTab)}
        >
          <TabsList>
            <TabsTrigger value="sites" data-testid="tab-sites">
              <Globe className="h-3.5 w-3.5 mr-1.5" /> My Sites
            </TabsTrigger>
            <TabsTrigger value="templates" data-testid="tab-templates">
              <LayoutGrid className="h-3.5 w-3.5 mr-1.5" /> Templates
            </TabsTrigger>
            <TabsTrigger value="analytics" data-testid="tab-analytics">
              <BarChart3 className="h-3.5 w-3.5 mr-1.5" /> Analytics
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* ── Toolbar ── */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder={mainTab === "templates" ? "Search templates..." : "Search sites..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 w-56 text-xs"
              data-testid="search-input"
            />
          </div>
          {mainTab === "sites" && (
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v ?? "all")}
            >
              <SelectTrigger className="h-8 w-36 text-xs" data-testid="filter-status">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          )}
          {mainTab === "templates" && (
            <Select
              value={industryFilter}
              onValueChange={(v) => setIndustryFilter(v ?? "all")}
            >
              <SelectTrigger className="h-8 w-40 text-xs" data-testid="filter-industry">
                <SelectValue placeholder="All Industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                <SelectItem value="Plumbing">Plumbing</SelectItem>
                <SelectItem value="HVAC">HVAC</SelectItem>
                <SelectItem value="Electrical">Electrical</SelectItem>
                <SelectItem value="Landscaping">Landscaping</SelectItem>
                <SelectItem value="Auto Repair">Auto Repair</SelectItem>
                <SelectItem value="Cleaning">Cleaning</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* TAB: MY SITES                                                  */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {mainTab === "sites" && (
        <div className="space-y-3">
          {filteredSites.map((site) => {
            const tpl = templateForSite(site);
            return (
              <Card
                key={site.id}
                className="group cursor-pointer hover:border-foreground/20 transition-colors"
                onClick={() => openSiteDetail(site)}
                data-testid={`site-card-${site.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Site color swatch */}
                    <div
                      className="h-12 w-12 rounded-lg flex-shrink-0 flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${site.theme.primaryColor} 0%, ${site.theme.accentColor}44 100%)`,
                      }}
                    >
                      <Globe className="h-5 w-5 text-white/80" />
                    </div>

                    {/* Site info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {site.clientName}
                        </span>
                        <SiteStatusBadge status={site.status} />
                        <TierBadge tier={site.tier} />
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                          <Link2 className="h-2.5 w-2.5" />
                          {site.customDomain || `${site.subdomain}.a1nt.app`}
                        </span>
                        {tpl && (
                          <span className="text-[10px] text-muted-foreground">
                            Template: {tpl.name}
                          </span>
                        )}
                        {site.lastBuildAt && (
                          <span className="text-[10px] text-muted-foreground">
                            Built {timeAgo(site.lastBuildAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Sparkline + stats */}
                    <div className="flex items-center gap-6">
                      {site.analytics.viewsByDay.length > 0 && (
                        <div className="flex flex-col items-end gap-0.5">
                          <Sparkline
                            data={site.analytics.viewsByDay.map((d) => d.views)}
                            height={24}
                          />
                          <span className="text-[10px] text-muted-foreground">
                            {formatNumber(site.analytics.pageViews30d)} views
                          </span>
                        </div>
                      )}

                      <div className="flex flex-col items-end gap-0.5 min-w-[60px]">
                        <span className="text-sm font-mono font-medium">
                          {formatNumber(site.analytics.uniqueVisitors30d)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          visitors
                        </span>
                      </div>

                      <div className="flex flex-col items-end gap-0.5 min-w-[40px]">
                        <span className="text-sm font-mono font-medium">
                          {site.analytics.formSubmissions30d}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          leads
                        </span>
                      </div>

                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>

                  {/* Section pills */}
                  <div className="flex items-center gap-1.5 mt-3 pl-16">
                    {site.sections
                      .filter((s) => s.visible)
                      .sort((a, b) => a.order - b.order)
                      .map((section) => {
                        const cfg = sectionConfig[section.type];
                        const Icon = cfg.icon;
                        return (
                          <div
                            key={section.type}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-[10px] text-muted-foreground"
                          >
                            <Icon className="h-2.5 w-2.5" />
                            {cfg.label}
                            {section.sourceModule && (
                              <span title={`Synced from ${section.sourceModule}`}><Zap className="h-2 w-2 text-amber-500" /></span>
                            )}
                          </div>
                        );
                      })}
                    {site.sections.filter((s) => !s.visible).length > 0 && (
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50 text-[10px] text-muted-foreground/50">
                        <EyeOff className="h-2.5 w-2.5" />
                        {site.sections.filter((s) => !s.visible).length} hidden
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredSites.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Globe className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                <p className="text-sm text-muted-foreground mt-3">
                  No sites match your search
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* TAB: TEMPLATES                                                 */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {mainTab === "templates" && (
        <div className="grid grid-cols-3 gap-4">
          {filteredTemplates.map((tpl) => (
            <TemplateCard
              key={tpl.id}
              template={tpl}
              onSelect={() => {
                /* Would open template preview / create site flow */
              }}
            />
          ))}

          {filteredTemplates.length === 0 && (
            <div className="col-span-3">
              <Card>
                <CardContent className="py-12 text-center">
                  <LayoutGrid className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                  <p className="text-sm text-muted-foreground mt-3">
                    No templates match your filters
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* TAB: ANALYTICS                                                 */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {mainTab === "analytics" && (
        <div className="space-y-4">
          {/* All-sites overview */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Traffic Overview — All Sites (30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Total Page Views
                  </span>
                  <p className="text-2xl font-semibold font-mono mt-1">
                    {formatNumber(kpis.totalViews)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Unique Visitors
                  </span>
                  <p className="text-2xl font-semibold font-mono mt-1">
                    {formatNumber(
                      clientWebsites.reduce((s, site) => s + site.analytics.uniqueVisitors30d, 0)
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Form Submissions
                  </span>
                  <p className="text-2xl font-semibold font-mono mt-1">
                    {formatNumber(kpis.totalSubmissions)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Per-site breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Site Performance</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-[10px] text-muted-foreground uppercase tracking-wider">
                    <th className="text-left font-medium px-4 py-2">Site</th>
                    <th className="text-right font-medium px-4 py-2">Views</th>
                    <th className="text-right font-medium px-4 py-2">Visitors</th>
                    <th className="text-right font-medium px-4 py-2">Submissions</th>
                    <th className="text-right font-medium px-4 py-2">Trend</th>
                    <th className="text-left font-medium px-4 py-2">Top Page</th>
                  </tr>
                </thead>
                <tbody>
                  {clientWebsites
                    .filter((s) => s.status !== "Draft")
                    .sort((a, b) => b.analytics.pageViews30d - a.analytics.pageViews30d)
                    .map((site) => (
                      <tr
                        key={site.id}
                        className="border-b last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => openSiteDetail(site)}
                        data-testid={`analytics-row-${site.id}`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-6 w-6 rounded flex-shrink-0 flex items-center justify-center"
                              style={{
                                background: `linear-gradient(135deg, ${site.theme.primaryColor} 0%, ${site.theme.accentColor}44 100%)`,
                              }}
                            >
                              <Globe className="h-3 w-3 text-white/80" />
                            </div>
                            <div>
                              <span className="text-xs font-medium">{site.clientName}</span>
                              <span className="text-[10px] text-muted-foreground block font-mono">
                                {site.customDomain || `${site.subdomain}.a1nt.app`}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-xs font-mono">{formatNumber(site.analytics.pageViews30d)}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-xs font-mono">{formatNumber(site.analytics.uniqueVisitors30d)}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-xs font-mono">{site.analytics.formSubmissions30d}</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Sparkline data={site.analytics.viewsByDay.map((d) => d.views)} height={20} />
                        </td>
                        <td className="px-4 py-3">
                          {site.analytics.topPages[0] && (
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {site.analytics.topPages[0].path} ({formatNumber(site.analytics.topPages[0].views)})
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* SITE DETAIL SHEET                                              */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <Sheet open={siteSheetOpen} onOpenChange={setSiteSheetOpen}>
        <SheetContent className="w-[560px] sm:max-w-[560px] overflow-y-auto">
          {selectedSite && (
            <>
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <div
                    className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${selectedSite.theme.primaryColor} 0%, ${selectedSite.theme.accentColor}44 100%)`,
                    }}
                  >
                    <Globe className="h-4 w-4 text-white/80" />
                  </div>
                  <div>
                    <span className="text-base">{selectedSite.clientName}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <SiteStatusBadge status={selectedSite.status} />
                      <TierBadge tier={selectedSite.tier} />
                    </div>
                  </div>
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Website details and management for {selectedSite.clientName}
                </SheetDescription>
              </SheetHeader>

              {/* Domain info */}
              <div className="mt-4 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-mono">
                      {selectedSite.customDomain || `${selectedSite.subdomain}.a1nt.app`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" data-testid="btn-copy-url">
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" data-testid="btn-open-site">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {!selectedSite.customDomain && (
                  <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                    <Info className="h-2.5 w-2.5" />
                    No custom domain connected — using A1NT subdomain
                  </p>
                )}
              </div>

              {/* Sheet sub-tabs */}
              <div className="mt-4">
                <Tabs
                  value={siteSheetTab}
                  onValueChange={(v) =>
                    setSiteSheetTab((v ?? "preview") as SheetTab)
                  }
                >
                  <TabsList className="w-full">
                    <TabsTrigger value="preview" className="flex-1 text-[10px]" data-testid="sheet-tab-preview">
                      <Eye className="h-3 w-3 mr-1" /> Preview
                    </TabsTrigger>
                    <TabsTrigger value="sections" className="flex-1 text-[10px]" data-testid="sheet-tab-sections">
                      <LayoutGrid className="h-3 w-3 mr-1" /> Sections
                    </TabsTrigger>
                    <TabsTrigger value="theme" className="flex-1 text-[10px]" data-testid="sheet-tab-theme">
                      <Paintbrush className="h-3 w-3 mr-1" /> Theme
                    </TabsTrigger>
                    <TabsTrigger value="seo" className="flex-1 text-[10px]" data-testid="sheet-tab-seo">
                      <Search className="h-3 w-3 mr-1" /> SEO
                    </TabsTrigger>
                    <TabsTrigger value="analytics" className="flex-1 text-[10px]" data-testid="sheet-tab-analytics">
                      <BarChart3 className="h-3 w-3 mr-1" /> Stats
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <Separator className="my-4" />

              {/* ── Preview Tab ── */}
              {siteSheetTab === "preview" && (
                <div className="space-y-3">
                  {/* Device toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {(
                        [
                          { device: "desktop" as const, icon: Monitor, label: "Desktop" },
                          { device: "tablet" as const, icon: Tablet, label: "Tablet" },
                          { device: "mobile" as const, icon: Smartphone, label: "Mobile" },
                        ] as const
                      ).map(({ device, icon: DIcon, label }) => (
                        <Button
                          key={device}
                          variant={previewDevice === device ? "secondary" : "ghost"}
                          size="sm"
                          className="h-7 gap-1 text-[10px]"
                          onClick={() => setPreviewDevice(device)}
                          data-testid={`preview-device-${device}`}
                        >
                          <DIcon className="h-3 w-3" /> {label}
                        </Button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-[10px]"
                        onClick={() => previewHtml && setFullPreviewOpen(true)}
                        disabled={!previewHtml}
                        data-testid="btn-fullscreen-preview"
                      >
                        <Maximize2 className="h-3 w-3" /> Full Screen
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-[10px]"
                        onClick={() => {
                          if (!previewHtml) return;
                          const blob = new Blob([previewHtml], { type: "text/html" });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${selectedSite?.subdomain || "site"}.html`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        disabled={!previewHtml}
                        data-testid="btn-download-html"
                      >
                        <Download className="h-3 w-3" /> Download
                      </Button>
                    </div>
                  </div>

                  {/* Preview iframe */}
                  <div
                    className="rounded-lg border overflow-hidden bg-white transition-all"
                    style={{
                      maxWidth:
                        previewDevice === "mobile"
                          ? "375px"
                          : previewDevice === "tablet"
                            ? "768px"
                            : "100%",
                      margin: previewDevice !== "desktop" ? "0 auto" : undefined,
                      height: "480px",
                    }}
                  >
                    {isGenerating ? (
                      <div className="h-full flex flex-col items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Generating preview...</span>
                      </div>
                    ) : previewHtml ? (
                      <iframe
                        srcDoc={previewHtml}
                        className="w-full h-full border-0"
                        sandbox="allow-scripts"
                        title="Site preview"
                        data-testid="preview-iframe"
                      />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center gap-2">
                        <Globe className="h-6 w-6 text-muted-foreground/30" />
                        <span className="text-xs text-muted-foreground">No preview available</span>
                      </div>
                    )}
                  </div>

                  {/* Published URL */}
                  {publishedUrl && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Site Published</span>
                      </div>
                      <a
                        href={publishedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-mono text-emerald-600 hover:underline mt-1 block truncate"
                      >
                        {publishedUrl}
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* ── Sections Tab ── */}
              {siteSheetTab === "sections" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                      Page Sections
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {selectedSite.sections.filter((s) => s.visible).length} active / {selectedSite.sections.length} total
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedSite.sections
                      .sort((a, b) => a.order - b.order)
                      .map((section) => {
                        const cfg = sectionConfig[section.type];
                        const Icon = cfg.icon;
                        return (
                          <div
                            key={section.type}
                            className={`flex items-center gap-3 p-2.5 rounded-lg border transition-colors ${
                              section.visible
                                ? "bg-card border-border"
                                : "bg-muted/30 border-transparent"
                            }`}
                            data-testid={`section-${section.type}`}
                          >
                            <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 cursor-grab" />
                            <div
                              className={`h-7 w-7 rounded flex items-center justify-center flex-shrink-0 ${
                                section.visible ? "bg-muted" : "bg-muted/50"
                              }`}
                            >
                              <Icon
                                className={`h-3.5 w-3.5 ${
                                  section.visible ? "text-foreground" : "text-muted-foreground/50"
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span
                                className={`text-xs font-medium ${
                                  !section.visible ? "text-muted-foreground/50" : ""
                                }`}
                              >
                                {cfg.label}
                              </span>
                              {section.sourceModule && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <Zap className="h-2 w-2 text-amber-500" />
                                  <span className="text-[10px] text-muted-foreground">
                                    Synced from {section.sourceModule}
                                    {section.lastSynced && ` · ${timeAgo(section.lastSynced)}`}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                data-testid={`edit-section-${section.type}`}
                              >
                                <Pencil className="h-3 w-3 text-muted-foreground" />
                              </Button>
                              <Switch
                                checked={section.visible}
                                className="scale-75"
                                data-testid={`toggle-section-${section.type}`}
                              />
                            </div>
                          </div>
                        );
                      })}
                  </div>

                  <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs mt-2" data-testid="btn-add-section">
                    <Plus className="h-3 w-3" /> Add Section
                  </Button>
                </div>
              )}

              {/* ── Theme Tab ── */}
              {siteSheetTab === "theme" && (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                      Color Scheme
                    </span>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-muted-foreground">Primary</label>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-8 w-8 rounded-md border"
                            style={{ backgroundColor: selectedSite.theme.primaryColor }}
                          />
                          <span className="text-xs font-mono text-muted-foreground">
                            {selectedSite.theme.primaryColor}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-muted-foreground">Accent</label>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-8 w-8 rounded-md border"
                            style={{ backgroundColor: selectedSite.theme.accentColor }}
                          />
                          <span className="text-xs font-mono text-muted-foreground">
                            {selectedSite.theme.accentColor}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                      Typography
                    </span>
                    <div className="mt-2 p-3 rounded-lg bg-muted/50">
                      <span className="text-sm" style={{ fontFamily: selectedSite.theme.fontFamily }}>
                        {selectedSite.theme.fontFamily}
                      </span>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        The quick brown fox jumps over the lazy dog
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                      Options
                    </span>
                    <div className="mt-2 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs">Dark Mode</span>
                          <p className="text-[10px] text-muted-foreground">Enable dark theme for the site</p>
                        </div>
                        <Switch checked={selectedSite.theme.darkMode} data-testid="toggle-dark-mode" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                      Preview
                    </span>
                    <div className="flex items-center gap-1 mt-2 mb-3">
                      {(
                        [
                          { device: "desktop" as const, icon: Monitor, label: "Desktop" },
                          { device: "tablet" as const, icon: Tablet, label: "Tablet" },
                          { device: "mobile" as const, icon: Smartphone, label: "Mobile" },
                        ] as const
                      ).map(({ device, icon: DIcon, label }) => (
                        <Button
                          key={device}
                          variant={previewDevice === device ? "secondary" : "ghost"}
                          size="sm"
                          className="h-7 gap-1 text-[10px]"
                          onClick={() => setPreviewDevice(device)}
                          data-testid={`preview-${device}`}
                        >
                          <DIcon className="h-3 w-3" /> {label}
                        </Button>
                      ))}
                    </div>
                    <div
                      className="rounded-lg border overflow-hidden bg-card"
                      style={{
                        maxWidth:
                          previewDevice === "mobile"
                            ? "320px"
                            : previewDevice === "tablet"
                              ? "768px"
                              : "100%",
                        margin: previewDevice !== "desktop" ? "0 auto" : undefined,
                      }}
                    >
                      {/* Mock preview */}
                      <div
                        className="h-20 flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${selectedSite.theme.primaryColor} 0%, ${selectedSite.theme.accentColor}44 100%)`,
                        }}
                      >
                        <div className="text-center">
                          <p className="text-white text-sm font-semibold">
                            {selectedSite.clientName}
                          </p>
                          <p className="text-white/60 text-[10px] mt-0.5">
                            {selectedSite.seo.description.slice(0, 60)}...
                          </p>
                        </div>
                      </div>
                      <div className="p-3 space-y-2">
                        {selectedSite.sections
                          .filter((s) => s.visible)
                          .sort((a, b) => a.order - b.order)
                          .slice(0, 4)
                          .map((section) => (
                            <div
                              key={section.type}
                              className="h-4 rounded bg-muted flex items-center px-2"
                            >
                              <span className="text-[8px] text-muted-foreground font-mono">
                                {sectionConfig[section.type].label}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── SEO Tab ── */}
              {siteSheetTab === "seo" && (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                      Search Engine Optimization
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] text-muted-foreground">Page Title</label>
                      <Input
                        value={selectedSite.seo.title}
                        className="mt-1 h-8 text-xs"
                        readOnly
                        data-testid="seo-title"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {selectedSite.seo.title.length}/60 characters
                      </p>
                    </div>

                    <div>
                      <label className="text-[10px] text-muted-foreground">Meta Description</label>
                      <textarea
                        value={selectedSite.seo.description}
                        className="mt-1 w-full text-xs p-2 rounded-md border bg-background resize-none h-16"
                        readOnly
                        data-testid="seo-description"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {selectedSite.seo.description.length}/160 characters
                      </p>
                    </div>

                    <Separator />

                    {/* Google preview */}
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                        Search Preview
                      </span>
                      <div className="mt-2 p-3 rounded-lg border bg-card">
                        <p className="text-blue-600 text-sm truncate">
                          {selectedSite.seo.title}
                        </p>
                        <p className="text-[10px] text-emerald-700 font-mono mt-0.5">
                          {selectedSite.customDomain || `${selectedSite.subdomain}.a1nt.app`}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {selectedSite.seo.description}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                        Extras
                      </span>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <span className="text-xs">Auto-generate sitemap.xml</span>
                          <Switch checked={true} data-testid="toggle-sitemap" />
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <span className="text-xs">Schema markup (LocalBusiness)</span>
                          <Switch checked={true} data-testid="toggle-schema" />
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                          <span className="text-xs">Open Graph image</span>
                          <Badge variant="outline" className="text-[10px]">
                            {selectedSite.seo.ogImage ? "Set" : "Auto-generated"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Analytics Tab ── */}
              {siteSheetTab === "analytics" && (
                <div className="space-y-4">
                  {selectedSite.analytics.pageViews30d > 0 ? (
                    <>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="p-3 rounded-lg bg-muted/50 text-center">
                          <span className="text-lg font-semibold font-mono">
                            {formatNumber(selectedSite.analytics.pageViews30d)}
                          </span>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Page Views</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50 text-center">
                          <span className="text-lg font-semibold font-mono">
                            {formatNumber(selectedSite.analytics.uniqueVisitors30d)}
                          </span>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Visitors</p>
                        </div>
                        <div className="p-3 rounded-lg bg-muted/50 text-center">
                          <span className="text-lg font-semibold font-mono">
                            {selectedSite.analytics.formSubmissions30d}
                          </span>
                          <p className="text-[10px] text-muted-foreground mt-0.5">Leads</p>
                        </div>
                      </div>

                      {/* Traffic chart */}
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                          Daily Traffic (7 Days)
                        </span>
                        <div className="mt-2 p-3 rounded-lg border bg-card">
                          <div className="flex items-end gap-1 h-24">
                            {selectedSite.analytics.viewsByDay.map((day, i) => {
                              const maxViews = Math.max(
                                ...selectedSite.analytics.viewsByDay.map((d) => d.views),
                                1
                              );
                              const heightPct = (day.views / maxViews) * 100;
                              return (
                                <div
                                  key={i}
                                  className="flex-1 flex flex-col items-center gap-1"
                                >
                                  <span className="text-[8px] font-mono text-muted-foreground">
                                    {day.views}
                                  </span>
                                  <div
                                    className="w-full rounded-t bg-foreground/15 transition-all"
                                    style={{ height: `${heightPct}%`, minHeight: "2px" }}
                                  />
                                  <span className="text-[8px] text-muted-foreground">
                                    {formatDateShort(day.date).split(" ")[1]}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Top pages */}
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                          Top Pages
                        </span>
                        <div className="mt-2 space-y-1">
                          {selectedSite.analytics.topPages.map((page, i) => {
                            const maxPageViews = selectedSite.analytics.topPages[0]?.views || 1;
                            const pct = (page.views / maxPageViews) * 100;
                            return (
                              <div
                                key={i}
                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50"
                              >
                                <span className="text-xs font-mono text-muted-foreground w-6 text-right">
                                  {i + 1}.
                                </span>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-xs font-mono">{page.path}</span>
                                    <span className="text-[10px] font-mono text-muted-foreground">
                                      {formatNumber(page.views)}
                                    </span>
                                  </div>
                                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-foreground/20"
                                      style={{ width: `${pct}%` }}
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-8 text-center">
                      <BarChart3 className="h-8 w-8 text-muted-foreground/30 mx-auto" />
                      <p className="text-sm text-muted-foreground mt-3">
                        No analytics data yet
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Publish this site to start collecting traffic data
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Action buttons ── */}
              <Separator className="my-4" />
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 flex-1"
                  onClick={() => {
                    setSiteSheetTab("preview");
                    generatePreview(selectedSite.id);
                  }}
                  disabled={isGenerating}
                  data-testid="btn-rebuild"
                >
                  {isGenerating ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  {isGenerating ? "Generating..." : "Rebuild Preview"}
                </Button>
                <Button
                  size="sm"
                  className="gap-1.5 flex-1"
                  onClick={() => {
                    if (!previewHtml) return;
                    // Open generated site in a new tab
                    const blob = new Blob([previewHtml], { type: "text/html" });
                    const url = URL.createObjectURL(blob);
                    window.open(url, "_blank");
                    // Simulate publish - in production this would push to hosting
                    setPublishedUrl(`https://${selectedSite.subdomain}.a1nt.app`);
                    setSiteSheetTab("preview");
                  }}
                  disabled={!previewHtml || isGenerating}
                  data-testid="btn-publish"
                >
                  <Rocket className="h-3.5 w-3.5" />
                  {selectedSite.status === "Draft" ? "Publish Site" : "View Live Site"}
                </Button>
              </div>

              {/* Quick Launch CTA for drafts */}
              {selectedSite.status === "Draft" && !previewHtml && (
                <div className="mt-4 p-3 rounded-lg border border-dashed border-foreground/20 bg-muted/30">
                  <div className="flex items-start gap-2">
                    <Zap className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium">Quick Launch</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        Get a live landing page with your contact info in under 2 minutes. Just fill in your hero text and hit publish — everything else auto-populates from your A1NT data.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1 text-[10px] h-6 mt-2"
                        onClick={() => {
                          setSiteSheetTab("preview");
                          generatePreview(selectedSite.id);
                        }}
                        data-testid="btn-quick-launch"
                      >
                        <Rocket className="h-2.5 w-2.5" /> Start Quick Launch
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="mt-4 text-[10px] text-muted-foreground space-y-0.5">
                <p>Created: {formatDate(selectedSite.createdAt)}</p>
                {selectedSite.publishedAt && (
                  <p>First published: {formatDate(selectedSite.publishedAt)}</p>
                )}
                {selectedSite.lastBuildAt && (
                  <p>Last build: {formatDate(selectedSite.lastBuildAt)}</p>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* ═══════ Full-screen preview overlay ═══════ */}
      {fullPreviewOpen && previewHtml && (
        <div className="fixed inset-0 z-[100] bg-background">
          <div className="flex items-center justify-between px-4 h-12 border-b bg-card">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">
                {selectedSite?.clientName} — Full Preview
              </span>
              <div className="flex items-center gap-1">
                {(
                  [
                    { device: "desktop" as const, icon: Monitor },
                    { device: "tablet" as const, icon: Tablet },
                    { device: "mobile" as const, icon: Smartphone },
                  ] as const
                ).map(({ device, icon: DIcon }) => (
                  <Button
                    key={device}
                    variant={previewDevice === device ? "secondary" : "ghost"}
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => setPreviewDevice(device)}
                  >
                    <DIcon className="h-3.5 w-3.5" />
                  </Button>
                ))}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5"
              onClick={() => setFullPreviewOpen(false)}
              data-testid="btn-close-fullscreen"
            >
              <X className="h-4 w-4" /> Close
            </Button>
          </div>
          <div
            className="h-[calc(100vh-48px)] bg-muted/30 flex justify-center"
          >
            <iframe
              srcDoc={previewHtml}
              className="h-full border-0 bg-white transition-all"
              style={{
                width:
                  previewDevice === "mobile"
                    ? "375px"
                    : previewDevice === "tablet"
                      ? "768px"
                      : "100%",
                maxWidth: "100%",
              }}
              sandbox="allow-scripts"
              title="Full screen site preview"
            />
          </div>
        </div>
      )}
    </div>
  );
}
