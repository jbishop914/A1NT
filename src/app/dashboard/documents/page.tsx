"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Search,
  FileText,
  FolderOpen,
  BookOpen,
  ClipboardList,
  Upload,
  Download,
  Eye,
  Share2,
  Tag,
  ArrowUpDown,
  Calendar,
  Plus,
  ExternalLink,
  ThumbsUp,
  Pencil,
  Archive,
  File,
  FileType2,
  Award,
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Globe,
  Bookmark,
  BookmarkCheck,
  Clock,
  Zap,
  Brain,
  Telescope,
  Link2,
  ChevronRight,
  Loader2,
  CheckCircle2,
  X,
  Copy,
  Filter,
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
import {
  sampleDocuments,
  sampleKBArticles,
  sampleFormTemplates,
  sampleSavedResearch,
  type Document as SampleDocument,
  type KBArticle,
  type FormTemplate,
  type SavedResearch,
  type DocType,
  type DocCategory,
  type ResearchSource,
} from "@/lib/sample-data-p3";

// --- Helpers ---

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTimestamp(isoStr: string): string {
  const d = new Date(isoStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type DocStatus = "Active" | "Draft" | "Archived";
type KBStatus = "Published" | "Draft" | "Under Review";
type FormStatus = "Active" | "Draft" | "Archived";

const docStatusStyles: Record<DocStatus, { className: string; variant?: "secondary" | "outline" }> = {
  Active: { className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  Draft: { variant: "secondary", className: "" },
  Archived: { variant: "outline", className: "text-muted-foreground" },
};

const kbStatusStyles: Record<KBStatus, { className: string; variant?: "secondary" | "outline" }> = {
  Published: { className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  Draft: { variant: "secondary", className: "" },
  "Under Review": { className: "bg-amber-500/15 text-amber-700 dark:text-amber-400" },
};

const formStatusStyles: Record<FormStatus, { className: string; variant?: "secondary" | "outline" }> = {
  Active: { className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  Draft: { variant: "secondary", className: "" },
  Archived: { variant: "outline", className: "text-muted-foreground" },
};

const researchStatusStyles: Record<string, { className: string; variant?: "secondary" | "outline" }> = {
  Saved: { className: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
  Published: { className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  Archived: { variant: "outline", className: "text-muted-foreground" },
};

function DocStatusBadge({ status }: { status: DocStatus }) {
  const style = docStatusStyles[status];
  return (
    <Badge
      variant={style.variant ?? "default"}
      className={`text-[10px] ${style.className} ${!style.variant ? "border-0" : ""}`}
    >
      {status}
    </Badge>
  );
}

function KBStatusBadge({ status }: { status: KBStatus }) {
  const style = kbStatusStyles[status];
  return (
    <Badge
      variant={style.variant ?? "default"}
      className={`text-[10px] ${style.className} ${!style.variant ? "border-0" : ""}`}
    >
      {status}
    </Badge>
  );
}

function FormStatusBadge({ status }: { status: FormStatus }) {
  const style = formStatusStyles[status];
  return (
    <Badge
      variant={style.variant ?? "default"}
      className={`text-[10px] ${style.className} ${!style.variant ? "border-0" : ""}`}
    >
      {status}
    </Badge>
  );
}

function ResearchStatusBadge({ status }: { status: string }) {
  const style = researchStatusStyles[status] ?? researchStatusStyles.Saved;
  return (
    <Badge
      variant={style.variant ?? "default"}
      className={`text-[10px] ${style.className} ${!style.variant ? "border-0" : ""}`}
    >
      {status}
    </Badge>
  );
}

const docTypeIcons: Record<DocType, typeof FileText> = {
  Document: FileText,
  Template: FileType2,
  SOP: BookOpen,
  Form: ClipboardList,
  Certificate: Award,
  Training: GraduationCap,
};

const docTypeStyles: Record<DocType, string> = {
  Document: "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  Template: "bg-violet-500/15 text-violet-700 dark:text-violet-400",
  SOP: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  Form: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
  Certificate: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400",
  Training: "bg-pink-500/15 text-pink-700 dark:text-pink-400",
};

function DocTypeBadge({ type }: { type: DocType }) {
  return (
    <Badge variant="default" className={`text-[10px] border-0 ${docTypeStyles[type]}`}>
      {type}
    </Badge>
  );
}

const sourceIcons: Record<ResearchSource, typeof Zap> = {
  "ai-quick": Zap,
  "ai-research": Brain,
  "ai-deep": Telescope,
};

const sourceLabels: Record<ResearchSource, string> = {
  "ai-quick": "Quick",
  "ai-research": "Research",
  "ai-deep": "Deep",
};

const sourceStyles: Record<ResearchSource, string> = {
  "ai-quick": "bg-amber-500/15 text-amber-700 dark:text-amber-400",
  "ai-research": "bg-blue-500/15 text-blue-700 dark:text-blue-400",
  "ai-deep": "bg-violet-500/15 text-violet-700 dark:text-violet-400",
};

function SourceBadge({ source }: { source: ResearchSource }) {
  const Icon = sourceIcons[source];
  return (
    <Badge variant="default" className={`text-[10px] border-0 gap-1 ${sourceStyles[source]}`}>
      <Icon className="h-2.5 w-2.5" />
      {sourceLabels[source]}
    </Badge>
  );
}

const allDocTypes: DocType[] = ["Document", "Template", "SOP", "Form", "Certificate", "Training"];
const allDocCategories: DocCategory[] = ["Operations", "HR & Compliance", "Client-Facing", "Technical", "Administrative", "Safety"];
const allDocStatuses: DocStatus[] = ["Active", "Draft", "Archived"];
const allKBStatuses: KBStatus[] = ["Published", "Draft", "Under Review"];

type TabId = "documents" | "knowledge-base" | "forms" | "ai-research";

// ─── Simulated search results for demo ───

interface DemoSearchResult {
  title: string;
  url: string;
  snippet: string;
  date?: string;
}

interface DemoResearchResponse {
  query: string;
  results: DemoSearchResult[];
  summary: string;
  citations: string[];
  mode: "quick" | "research" | "deep";
  timestamp: string;
}

// Simulated demo responses (used when no API key is present)
function simulateSearch(query: string, mode: "quick" | "research" | "deep"): DemoResearchResponse {
  const q = query.toLowerCase();
  const ts = new Date().toISOString();

  if (q.includes("heat pump") || q.includes("hvac")) {
    return {
      query,
      mode,
      timestamp: ts,
      results: [
        { title: "Heat Pump Efficiency Standards 2026 - DOE", url: "https://www.energy.gov/eere/buildings/heat-pumps", snippet: "The Department of Energy's updated efficiency standards for residential heat pumps take effect in 2026, requiring a minimum SEER2 rating of 15.2 for split systems.", date: "2026-02-15" },
        { title: "Cold Climate Heat Pump Technology Guide - NEEP", url: "https://neep.org/heating-electrification/ccashp-specification", snippet: "Cold climate heat pumps (ccASHP) can now operate efficiently down to -15°F, with COP ratings above 2.0 at 5°F outdoor temperature.", date: "2026-01-20" },
        { title: "Heat Pump vs Furnace: Cost Analysis 2026 - Energy Star", url: "https://www.energystar.gov/products/heat-pumps", snippet: "Average installation cost for a heat pump system is $5,500-$9,500 vs $3,800-$6,000 for a high-efficiency gas furnace. However, operating costs favor heat pumps in climate zones 1-4.", date: "2026-03-01" },
      ],
      summary: mode === "quick"
        ? "Heat pumps in 2026 must meet SEER2 15.2 minimum efficiency. Cold climate models now work down to -15°F. Installation costs range $5,500-$9,500 but operational savings favor heat pumps in most US climate zones."
        : "## Heat Pump Technology & Standards — 2026 Overview\n\nThe residential heat pump landscape has shifted significantly in 2026, driven by updated DOE efficiency standards and rapid advances in cold-climate technology.\n\n### Efficiency Standards\nNew DOE standards require a minimum SEER2 rating of 15.2 for split-system heat pumps, up from 14.3. This applies to all equipment manufactured after January 1, 2026. HSPF2 minimums have also increased to 7.8 for northern regions.\n\n### Cold Climate Performance\nModern cold-climate heat pumps (ccASHP) from manufacturers like Mitsubishi, Daikin, and Bosch now maintain heating capacity down to -15°F with COP ratings above 2.0 at 5°F — a significant improvement over units from even 2-3 years ago. The NEEP specification provides a standardized performance benchmark for contractors selecting equipment.\n\n### Cost Analysis\n- Installation: $5,500–$9,500 (heat pump) vs $3,800–$6,000 (gas furnace)\n- Annual operating cost savings: $200–$800 in climate zones 1-4\n- Federal tax credit: 30% of installed cost (up to $2,000) under IRA provisions\n- Typical payback period: 5-8 years depending on local utility rates\n\n### Key Takeaways for Technicians\n- Verify AHRI-rated capacity at the design temperature for the specific climate zone\n- Size according to Manual J — oversizing reduces efficiency and increases short-cycling\n- Always install with a backup/auxiliary heat source in climate zones 5-7\n- Check local utility rebate programs — many offer $1,000-$3,000 for qualifying installations",
      citations: [
        "https://www.energy.gov/eere/buildings/heat-pumps",
        "https://neep.org/heating-electrification/ccashp-specification",
        "https://www.energystar.gov/products/heat-pumps",
      ],
    };
  }

  // Default response
  return {
    query,
    mode,
    timestamp: ts,
    results: [
      { title: `Search results for: ${query}`, url: "https://example.com", snippet: `Comprehensive results for "${query}" — connect your Perplexity API key to get live web search results with AI-powered summaries.`, date: new Date().toISOString().split("T")[0] },
    ],
    summary: mode === "quick"
      ? `This is a demo response for "${query}". Connect your Perplexity API key (PERPLEXITY_API_KEY) to enable live AI-powered search with real web results, citations, and intelligent summaries.`
      : `## Demo Response: ${query}\n\nThis is a simulated research response. To enable live AI-powered research:\n\n1. Get an API key from [console.perplexity.ai](https://console.perplexity.ai)\n2. Add \`PERPLEXITY_API_KEY\` to your environment variables\n3. Search again to see real results\n\nThe AI Research feature supports three modes:\n- **Quick** — Fast answers using the fast-search preset\n- **Research** — Web search + AI summary, optimized for knowledge base articles\n- **Deep** — Comprehensive multi-step analysis for complex topics`,
    citations: [],
  };
}

// ────────────────────────────────────────────────────────
// MAIN PAGE
// ────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("documents");

  // Document state
  const [docSearch, setDocSearch] = useState("");
  const [docTypeFilter, setDocTypeFilter] = useState("all");
  const [docCategoryFilter, setDocCategoryFilter] = useState("all");
  const [selectedDoc, setSelectedDoc] = useState<SampleDocument | null>(null);

  // KB state
  const [kbSearch, setKbSearch] = useState("");
  const [kbCategoryFilter, setKbCategoryFilter] = useState("all");
  const [selectedKB, setSelectedKB] = useState<KBArticle | null>(null);

  // Form state
  const [formSearch, setFormSearch] = useState("");
  const [selectedForm, setSelectedForm] = useState<FormTemplate | null>(null);

  // AI Research state
  const [aiQuery, setAiQuery] = useState("");
  const [aiMode, setAiMode] = useState<"quick" | "research" | "deep">("research");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<DemoResearchResponse | null>(null);
  const [aiSaved, setAiSaved] = useState(false);
  const [selectedResearch, setSelectedResearch] = useState<SavedResearch | null>(null);
  const [savedResearch, setSavedResearch] = useState<SavedResearch[]>(sampleSavedResearch);
  const [researchSearch, setResearchSearch] = useState("");

  // --- Computed ---

  const filteredDocs = useMemo(() => {
    return sampleDocuments.filter((doc) => {
      const matchesType = docTypeFilter === "all" || doc.type === docTypeFilter;
      const matchesCategory = docCategoryFilter === "all" || doc.category === docCategoryFilter;
      const q = docSearch.toLowerCase();
      const matchesSearch =
        !q ||
        doc.name.toLowerCase().includes(q) ||
        doc.tags.some((t) => t.toLowerCase().includes(q)) ||
        doc.description.toLowerCase().includes(q);
      return matchesType && matchesCategory && matchesSearch;
    });
  }, [docSearch, docTypeFilter, docCategoryFilter]);

  const filteredKB = useMemo(() => {
    return sampleKBArticles.filter((article) => {
      const matchesCategory = kbCategoryFilter === "all" || article.category === kbCategoryFilter;
      const q = kbSearch.toLowerCase();
      const matchesSearch =
        !q ||
        article.title.toLowerCase().includes(q) ||
        article.tags.some((t) => t.toLowerCase().includes(q)) ||
        article.excerpt.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [kbSearch, kbCategoryFilter]);

  const filteredForms = useMemo(() => {
    const q = formSearch.toLowerCase();
    return sampleFormTemplates.filter((form) => {
      return !q || form.name.toLowerCase().includes(q) || form.category.toLowerCase().includes(q);
    });
  }, [formSearch]);

  const filteredSavedResearch = useMemo(() => {
    const q = researchSearch.toLowerCase();
    return savedResearch.filter((r) => {
      return !q ||
        r.title.toLowerCase().includes(q) ||
        r.tags.some((t) => t.toLowerCase().includes(q)) ||
        r.category.toLowerCase().includes(q) ||
        r.query.toLowerCase().includes(q);
    });
  }, [researchSearch, savedResearch]);

  const kbCategories = useMemo(() => {
    return [...new Set(sampleKBArticles.map((a) => a.category))];
  }, []);

  // --- AI Research handlers ---

  const handleAiSearch = useCallback(async () => {
    if (!aiQuery.trim() || aiLoading) return;
    setAiLoading(true);
    setAiResponse(null);
    setAiSaved(false);

    try {
      // Try calling the real API first
      const res = await fetch("/api/ai/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: aiQuery, mode: aiMode }),
      });

      if (res.ok) {
        const data = await res.json();
        setAiResponse({
          query: aiQuery,
          mode: aiMode,
          timestamp: data.timestamp ?? new Date().toISOString(),
          results: data.results ?? [],
          summary: data.answer ?? data.summary ?? "",
          citations: data.citations ?? [],
        });
      } else {
        // API not available (no key set) — use demo simulation
        await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));
        setAiResponse(simulateSearch(aiQuery, aiMode));
      }
    } catch {
      // Network error / API unavailable — use demo simulation
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 1200));
      setAiResponse(simulateSearch(aiQuery, aiMode));
    } finally {
      setAiLoading(false);
    }
  }, [aiQuery, aiMode, aiLoading]);

  const handleSaveToKB = useCallback(() => {
    if (!aiResponse) return;

    const newArticle: SavedResearch = {
      id: `res-${Date.now()}`,
      title: aiResponse.query.length > 60 ? aiResponse.query.slice(0, 57) + "..." : aiResponse.query,
      query: aiResponse.query,
      summary: aiResponse.summary,
      citations: aiResponse.citations.map((url) => {
        const match = aiResponse.results.find((r) => r.url === url);
        return { title: match?.title ?? new URL(url).hostname, url };
      }),
      tags: extractTags(aiResponse.query),
      category: "Research",
      source: `ai-${aiResponse.mode}` as ResearchSource,
      status: "Saved",
      savedBy: "Current User",
      savedAt: new Date().toISOString().split("T")[0],
      views: 0,
      helpful: 0,
    };

    setSavedResearch((prev) => [newArticle, ...prev]);
    setAiSaved(true);
  }, [aiResponse]);

  // --- KPIs ---
  const totalDocs = sampleDocuments.length;
  const activeDocs = sampleDocuments.filter((d) => d.status === "Active").length;
  const totalArticles = sampleKBArticles.length;
  const publishedArticles = sampleKBArticles.filter((a) => a.status === "Published").length;
  const totalForms = sampleFormTemplates.length;
  const totalSubmissions = sampleFormTemplates.reduce((s, f) => s + f.submissions, 0);
  const totalResearch = savedResearch.length;
  const publishedResearch = savedResearch.filter((r) => r.status === "Published").length;

  const kpis = [
    {
      label: "Documents",
      value: String(totalDocs),
      icon: FileText,
      detail: `${activeDocs} active`,
    },
    {
      label: "KB Articles",
      value: String(totalArticles),
      icon: BookOpen,
      detail: `${publishedArticles} published`,
    },
    {
      label: "AI Research",
      value: String(totalResearch),
      icon: Sparkles,
      detail: `${publishedResearch} published`,
    },
    {
      label: "Form Templates",
      value: String(totalForms),
      icon: ClipboardList,
      detail: `${totalSubmissions.toLocaleString()} submissions`,
    },
  ];

  const tabs: { id: TabId; label: string; icon: typeof FileText }[] = [
    { id: "documents", label: "Documents", icon: FolderOpen },
    { id: "knowledge-base", label: "Knowledge Base", icon: BookOpen },
    { id: "ai-research", label: "AI Research", icon: Sparkles },
    { id: "forms", label: "Forms", icon: ClipboardList },
  ];

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
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold tracking-tight font-mono">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b" data-testid="tab-bar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
            data-testid={`tab-${tab.id}`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Documents Tab */}
      {activeTab === "documents" && (
        <>
          {/* Toolbar */}
          <div className="flex items-center gap-3 flex-wrap" data-testid="toolbar-documents">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documents..."
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                className="pl-8"
                data-testid="input-search-documents"
              />
            </div>
            <Select value={docTypeFilter} onValueChange={(v) => setDocTypeFilter(v ?? "all")}>
              <SelectTrigger className="w-[140px]" data-testid="select-doc-type-filter">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {allDocTypes.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={docCategoryFilter} onValueChange={(v) => setDocCategoryFilter(v ?? "all")}>
              <SelectTrigger className="w-[160px]" data-testid="select-doc-category-filter">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {allDocCategories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex-1" />
            <Button size="sm" data-testid="button-upload-document">
              <Upload className="h-3.5 w-3.5 mr-1.5" />
              Upload
            </Button>
          </div>

          {/* Documents Table */}
          <Card data-testid="card-documents-table">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">
                      <span className="inline-flex items-center gap-1">
                        Name <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                      </span>
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>
                      <span className="inline-flex items-center gap-1">
                        Modified <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                      </span>
                    </TableHead>
                    <TableHead className="text-right">Version</TableHead>
                    <TableHead className="text-right">Size</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocs.map((doc) => (
                    <TableRow
                      key={doc.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedDoc(doc)}
                      data-testid={`row-doc-${doc.id}`}
                    >
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const Icon = docTypeIcons[doc.type];
                            return <Icon className="h-4 w-4 text-muted-foreground shrink-0" />;
                          })()}
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{doc.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{doc.description}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DocTypeBadge type={doc.type} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{doc.category}</TableCell>
                      <TableCell>
                        <DocStatusBadge status={doc.status} />
                      </TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground">
                        {formatDate(doc.lastModified)}
                      </TableCell>
                      <TableCell className="text-right text-sm font-mono text-muted-foreground">
                        v{doc.version}
                      </TableCell>
                      <TableCell className="text-right text-sm font-mono text-muted-foreground">
                        {doc.size}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredDocs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        No documents match your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Knowledge Base Tab */}
      {activeTab === "knowledge-base" && (
        <>
          {/* Toolbar */}
          <div className="flex items-center gap-3 flex-wrap" data-testid="toolbar-kb">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={kbSearch}
                onChange={(e) => setKbSearch(e.target.value)}
                className="pl-8"
                data-testid="input-search-kb"
              />
            </div>
            <Select value={kbCategoryFilter} onValueChange={(v) => setKbCategoryFilter(v ?? "all")}>
              <SelectTrigger className="w-[140px]" data-testid="select-kb-category-filter">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {kbCategories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex-1" />
            <Button size="sm" data-testid="button-new-article">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              New Article
            </Button>
          </div>

          {/* KB Article Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="kb-article-grid">
            {filteredKB.map((article) => (
              <Card
                key={article.id}
                className="cursor-pointer hover:border-foreground/20 transition-colors"
                onClick={() => setSelectedKB(article)}
                data-testid={`card-kb-${article.id}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm font-medium leading-snug">
                      {article.title}
                    </CardTitle>
                    <KBStatusBadge status={article.status} />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="text-[10px]">
                      {article.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{article.author}</span>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        <span className="font-mono">{article.views}</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp className="h-3 w-3" />
                        <span className="font-mono">{article.helpful}</span>
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {article.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredKB.length === 0 && (
              <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
                No articles match your search.
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── AI Research Tab ─── */}
      {activeTab === "ai-research" && (
        <div className="space-y-6" data-testid="tab-content-ai-research">
          {/* Search bar + mode selector */}
          <Card data-testid="card-ai-search">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium">AI-Powered Research</span>
                <span className="text-xs text-muted-foreground ml-1">Powered by Perplexity</span>
              </div>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Ask anything... e.g. 'R-454B refrigerant transition requirements' or 'heat pump sizing best practices'"
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAiSearch(); }}
                    className="pl-9 pr-3 h-10"
                    data-testid="input-ai-query"
                  />
                </div>
                <Select value={aiMode} onValueChange={(v) => setAiMode((v ?? "research") as "quick" | "research" | "deep")}>
                  <SelectTrigger className="w-[130px]" data-testid="select-ai-mode">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quick">
                      <span className="flex items-center gap-1.5">
                        <Zap className="h-3 w-3" /> Quick
                      </span>
                    </SelectItem>
                    <SelectItem value="research">
                      <span className="flex items-center gap-1.5">
                        <Brain className="h-3 w-3" /> Research
                      </span>
                    </SelectItem>
                    <SelectItem value="deep">
                      <span className="flex items-center gap-1.5">
                        <Telescope className="h-3 w-3" /> Deep
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAiSearch}
                  disabled={!aiQuery.trim() || aiLoading}
                  data-testid="button-ai-search"
                >
                  {aiLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  <span className="ml-1.5">{aiLoading ? "Searching..." : "Search"}</span>
                </Button>
              </div>

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3" /> Quick — fast answer
                </span>
                <span className="flex items-center gap-1">
                  <Brain className="h-3 w-3" /> Research — search + AI summary
                </span>
                <span className="flex items-center gap-1">
                  <Telescope className="h-3 w-3" /> Deep — thorough analysis
                </span>
              </div>
            </CardContent>
          </Card>

          {/* AI Response */}
          {aiLoading && (
            <Card data-testid="card-ai-loading">
              <CardContent className="p-6 flex items-center justify-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {aiMode === "deep" ? "Running deep analysis..." : aiMode === "research" ? "Searching the web and generating summary..." : "Getting a quick answer..."}
                </span>
              </CardContent>
            </Card>
          )}

          {aiResponse && !aiLoading && (
            <Card data-testid="card-ai-response">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="truncate">{aiResponse.query}</span>
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1.5">
                      <SourceBadge source={`ai-${aiResponse.mode}` as ResearchSource} />
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatTimestamp(aiResponse.timestamp)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {aiSaved ? (
                      <Button size="sm" variant="outline" disabled className="gap-1.5" data-testid="button-saved-to-kb">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        Saved
                      </Button>
                    ) : (
                      <Button size="sm" onClick={handleSaveToKB} className="gap-1.5" data-testid="button-save-to-kb">
                        <Bookmark className="h-3.5 w-3.5" />
                        Save to KB
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <Separator />
              <CardContent className="p-4 space-y-4">
                {/* Summary — rendered as simple formatted text */}
                <div className="prose prose-sm max-w-none text-sm text-foreground leading-relaxed" data-testid="ai-response-summary">
                  {aiResponse.summary.split("\n").map((line, i) => {
                    if (line.startsWith("## ")) {
                      return <h3 key={i} className="text-sm font-semibold mt-4 mb-2">{line.replace("## ", "")}</h3>;
                    }
                    if (line.startsWith("### ")) {
                      return <h4 key={i} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-3 mb-1.5">{line.replace("### ", "")}</h4>;
                    }
                    if (line.startsWith("- ")) {
                      return (
                        <div key={i} className="flex items-start gap-2 ml-1 my-0.5">
                          <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                          <span className="text-sm">{renderBold(line.replace("- ", ""))}</span>
                        </div>
                      );
                    }
                    // Numbered list: "1. ", "2. ", etc.
                    const numMatch = line.match(/^(\d+)\.\s+(.*)/);
                    if (numMatch) {
                      return (
                        <div key={i} className="flex items-start gap-2 ml-1 my-0.5">
                          <span className="text-xs font-mono text-muted-foreground shrink-0 mt-0.5 w-4 text-right">{numMatch[1]}.</span>
                          <span className="text-sm">{renderBold(numMatch[2])}</span>
                        </div>
                      );
                    }
                    if (!line.trim()) return <div key={i} className="h-2" />;
                    return <p key={i} className="my-1">{renderBold(line)}</p>;
                  })}
                </div>

                {/* Sources */}
                {aiResponse.results.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                        <Globe className="h-3 w-3" />
                        Sources ({aiResponse.results.length})
                      </h4>
                      <div className="space-y-1.5">
                        {aiResponse.results.map((result, i) => (
                          <div
                            key={i}
                            className="flex items-start gap-2 group"
                          >
                            <span className="text-[10px] font-mono text-muted-foreground mt-0.5 w-4 shrink-0 text-right">[{i + 1}]</span>
                            <div className="min-w-0 flex-1">
                              <a
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-foreground hover:underline inline-flex items-center gap-1"
                              >
                                {result.title}
                                <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                              </a>
                              {result.date && (
                                <span className="text-[10px] text-muted-foreground ml-2 font-mono">{result.date}</span>
                              )}
                              {result.snippet && (
                                <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                                  {result.snippet.slice(0, 150)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Saved Research section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-sm font-semibold flex items-center gap-1.5">
                <BookmarkCheck className="h-4 w-4 text-muted-foreground" />
                Saved Research
              </h3>
              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search saved research..."
                  value={researchSearch}
                  onChange={(e) => setResearchSearch(e.target.value)}
                  className="pl-8 h-8 text-sm"
                  data-testid="input-search-saved-research"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="saved-research-grid">
              {filteredSavedResearch.map((research) => (
                <Card
                  key={research.id}
                  className="cursor-pointer hover:border-foreground/20 transition-colors"
                  onClick={() => setSelectedResearch(research)}
                  data-testid={`card-research-${research.id}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-medium leading-snug">
                        {research.title}
                      </CardTitle>
                      <ResearchStatusBadge status={research.status} />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <SourceBadge source={research.source} />
                      <Badge variant="secondary" className="text-[10px]">
                        {research.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {research.summary.replace(/^##.*\n/gm, "").replace(/^###.*\n/gm, "").trim().slice(0, 120)}...
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{research.savedBy}</span>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1">
                          <Link2 className="h-3 w-3" />
                          <span className="font-mono">{research.citations.length}</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span className="font-mono">{research.views}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {research.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredSavedResearch.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground text-sm">
                  No saved research found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Forms Tab */}
      {activeTab === "forms" && (
        <>
          {/* Toolbar */}
          <div className="flex items-center gap-3 flex-wrap" data-testid="toolbar-forms">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search forms..."
                value={formSearch}
                onChange={(e) => setFormSearch(e.target.value)}
                className="pl-8"
                data-testid="input-search-forms"
              />
            </div>
            <div className="flex-1" />
            <Button size="sm" data-testid="button-new-form">
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              New Form
            </Button>
          </div>

          {/* Forms Table */}
          <Card data-testid="card-forms-table">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">
                      <span className="inline-flex items-center gap-1">
                        Form Name <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                      </span>
                    </TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Fields</TableHead>
                    <TableHead className="text-right">
                      <span className="inline-flex items-center gap-1 justify-end">
                        Submissions <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                      </span>
                    </TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead>Assigned To</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredForms.map((form) => (
                    <TableRow
                      key={form.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedForm(form)}
                      data-testid={`row-form-${form.id}`}
                    >
                      <TableCell className="pl-4">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="text-sm font-medium">{form.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">
                          {form.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <FormStatusBadge status={form.status} />
                      </TableCell>
                      <TableCell className="text-right text-sm font-mono text-muted-foreground">
                        {form.fields}
                      </TableCell>
                      <TableCell className="text-right text-sm font-mono">
                        {form.submissions.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground">
                        {formatDate(form.lastUsed)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {form.assignedTo}
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredForms.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                        No forms match your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}

      {/* Document Detail Sheet */}
      <Sheet open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto" data-testid="sheet-document-detail">
          {selectedDoc && (
            <DocumentDetail doc={selectedDoc} onClose={() => setSelectedDoc(null)} />
          )}
        </SheetContent>
      </Sheet>

      {/* KB Article Detail Sheet */}
      <Sheet open={!!selectedKB} onOpenChange={() => setSelectedKB(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto" data-testid="sheet-kb-detail">
          {selectedKB && (
            <KBDetail article={selectedKB} onClose={() => setSelectedKB(null)} />
          )}
        </SheetContent>
      </Sheet>

      {/* Form Detail Sheet */}
      <Sheet open={!!selectedForm} onOpenChange={() => setSelectedForm(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto" data-testid="sheet-form-detail">
          {selectedForm && (
            <FormDetail form={selectedForm} onClose={() => setSelectedForm(null)} />
          )}
        </SheetContent>
      </Sheet>

      {/* Saved Research Detail Sheet */}
      <Sheet open={!!selectedResearch} onOpenChange={() => setSelectedResearch(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto" data-testid="sheet-research-detail">
          {selectedResearch && (
            <ResearchDetail research={selectedResearch} onClose={() => setSelectedResearch(null)} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Helper: render bold text ───

function renderInline(text: string): React.ReactNode[] {
  // Split on **bold** and [link](url) patterns
  const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">
          {linkMatch[1]}
        </a>
      );
    }
    return part;
  });
}

/** @deprecated alias kept for grep-ability */
const renderBold = renderInline;

// ─── Helper: extract tags from query ───

function extractTags(query: string): string[] {
  const words = query.toLowerCase().split(/\s+/);
  const tagKeywords = [
    "hvac", "plumbing", "electrical", "refrigerant", "code", "nec", "epa",
    "safety", "permit", "installation", "diagnostic", "repair", "maintenance",
    "heat pump", "water heater", "furnace", "boiler", "ductwork", "piping",
    "brazing", "soldering", "insulation", "ventilation", "commercial", "residential",
  ];
  const tags: string[] = [];
  for (const kw of tagKeywords) {
    if (query.toLowerCase().includes(kw) && tags.length < 5) {
      tags.push(kw.charAt(0).toUpperCase() + kw.slice(1));
    }
  }
  if (tags.length === 0) {
    // Fallback: first 3 meaningful words
    const stopWords = new Set(["the", "a", "an", "is", "for", "and", "or", "to", "in", "of", "on", "at", "by", "with", "how", "what", "when", "where", "why", "vs", "best"]);
    for (const w of words) {
      if (w.length > 2 && !stopWords.has(w) && tags.length < 3) {
        tags.push(w.charAt(0).toUpperCase() + w.slice(1));
      }
    }
  }
  return tags;
}

// --- Document Detail ---

function DocumentDetail({ doc }: { doc: SampleDocument; onClose: () => void }) {
  const Icon = docTypeIcons[doc.type];
  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-lg flex items-center gap-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <span className="truncate">{doc.name}</span>
        </SheetTitle>
        <SheetDescription className="text-sm text-muted-foreground">
          {doc.description}
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <DocTypeBadge type={doc.type} />
          <DocStatusBadge status={doc.status} />
          {doc.shared && (
            <Badge variant="outline" className="text-[10px]">
              <Share2 className="h-3 w-3 mr-1" />
              Shared
            </Badge>
          )}
        </div>

        <Separator />

        {/* Details */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Details
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Category</p>
              <p className="text-sm">{doc.category}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">File Type</p>
              <p className="text-sm font-mono">{doc.fileType}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Size</p>
              <p className="text-sm font-mono">{doc.size}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Version</p>
              <p className="text-sm font-mono">v{doc.version}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Uploaded By</p>
              <p className="text-sm">{doc.uploadedBy}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Uploaded</p>
              <p className="text-sm font-mono">{formatDate(doc.uploadedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Modified</p>
              <p className="text-sm font-mono">{formatDate(doc.lastModified)}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Tags */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tags
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {doc.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px]">
                <Tag className="h-2.5 w-2.5 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2" data-testid="doc-actions">
          <Button size="sm" data-testid="button-download-doc">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Download
          </Button>
          <Button size="sm" variant="outline" data-testid="button-share-doc">
            <Share2 className="h-3.5 w-3.5 mr-1.5" />
            Share
          </Button>
          <Button size="sm" variant="outline" data-testid="button-edit-doc">
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
          <Button size="sm" variant="outline" data-testid="button-archive-doc">
            <Archive className="h-3.5 w-3.5 mr-1.5" />
            Archive
          </Button>
        </div>
      </div>
    </>
  );
}

// --- KB Article Detail ---

function KBDetail({ article }: { article: KBArticle; onClose: () => void }) {
  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-lg">{article.title}</SheetTitle>
        <SheetDescription className="text-sm text-muted-foreground">
          By {article.author}
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        {/* Status & Category */}
        <div className="flex items-center gap-2 flex-wrap">
          <KBStatusBadge status={article.status} />
          <Badge variant="secondary" className="text-[10px]">{article.category}</Badge>
        </div>

        <Separator />

        {/* Excerpt */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Excerpt
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{article.excerpt}</p>
        </div>

        <Separator />

        {/* Details */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Details
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm font-mono">{formatDate(article.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Updated</p>
              <p className="text-sm font-mono">{formatDate(article.lastUpdated)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Views</p>
              <p className="text-sm font-mono">{article.views.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Helpful Votes</p>
              <p className="text-sm font-mono">{article.helpful}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Tags */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tags
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {article.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px]">
                <Tag className="h-2.5 w-2.5 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2" data-testid="kb-actions">
          <Button size="sm" data-testid="button-view-article">
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            View Full Article
          </Button>
          <Button size="sm" variant="outline" data-testid="button-edit-article">
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
          <Button size="sm" variant="outline" data-testid="button-share-article">
            <Share2 className="h-3.5 w-3.5 mr-1.5" />
            Share
          </Button>
        </div>
      </div>
    </>
  );
}

// --- Form Template Detail ---

function FormDetail({ form }: { form: FormTemplate; onClose: () => void }) {
  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-lg flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-muted-foreground" />
          {form.name}
        </SheetTitle>
        <SheetDescription className="text-sm text-muted-foreground">
          Form template details
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        {/* Status */}
        <div className="flex items-center gap-2 flex-wrap">
          <FormStatusBadge status={form.status} />
          <Badge variant="secondary" className="text-[10px]">{form.category}</Badge>
        </div>

        <Separator />

        {/* Details */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Details
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Fields</p>
              <p className="text-sm font-mono">{form.fields}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Submissions</p>
              <p className="text-sm font-mono">{form.submissions.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Used</p>
              <p className="text-sm font-mono">{formatDate(form.lastUsed)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Assigned To</p>
              <p className="text-sm">{form.assignedTo}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2" data-testid="form-actions">
          <Button size="sm" data-testid="button-open-form">
            <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
            Open Form
          </Button>
          <Button size="sm" variant="outline" data-testid="button-edit-form">
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
          <Button size="sm" variant="outline" data-testid="button-view-submissions">
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            View Submissions
          </Button>
          <Button size="sm" variant="outline" data-testid="button-duplicate-form">
            <File className="h-3.5 w-3.5 mr-1.5" />
            Duplicate
          </Button>
        </div>
      </div>
    </>
  );
}

// --- Saved Research Detail ---

function ResearchDetail({ research, onClose }: { research: SavedResearch; onClose: () => void }) {
  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-lg flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-muted-foreground" />
          <span className="truncate">{research.title}</span>
        </SheetTitle>
        <SheetDescription className="text-sm text-muted-foreground">
          Researched by {research.savedBy}
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <SourceBadge source={research.source} />
          <ResearchStatusBadge status={research.status} />
          <Badge variant="secondary" className="text-[10px]">{research.category}</Badge>
        </div>

        <Separator />

        {/* Original query */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Original Query
          </h4>
          <p className="text-sm text-muted-foreground italic">&ldquo;{research.query}&rdquo;</p>
        </div>

        <Separator />

        {/* Summary */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Research Summary
          </h4>
          <div className="text-sm text-foreground leading-relaxed">
            {research.summary.split("\n").map((line, i) => {
              if (line.startsWith("## ")) {
                return <h3 key={i} className="text-sm font-semibold mt-3 mb-1.5">{line.replace("## ", "")}</h3>;
              }
              if (line.startsWith("### ")) {
                return <h4 key={i} className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mt-2 mb-1">{line.replace("### ", "")}</h4>;
              }
              if (line.startsWith("- ")) {
                return (
                  <div key={i} className="flex items-start gap-2 ml-1 my-0.5">
                    <ChevronRight className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="text-sm">{renderBold(line.replace("- ", ""))}</span>
                  </div>
                );
              }
              const numMatch = line.match(/^(\d+)\.\s+(.*)/);
              if (numMatch) {
                return (
                  <div key={i} className="flex items-start gap-2 ml-1 my-0.5">
                    <span className="text-xs font-mono text-muted-foreground shrink-0 mt-0.5 w-4 text-right">{numMatch[1]}.</span>
                    <span className="text-sm">{renderBold(numMatch[2])}</span>
                  </div>
                );
              }
              if (!line.trim()) return <div key={i} className="h-2" />;
              return <p key={i} className="my-1">{renderBold(line)}</p>;
            })}
          </div>
        </div>

        <Separator />

        {/* Citations */}
        {research.citations.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Link2 className="h-3 w-3" />
              Sources ({research.citations.length})
            </h4>
            <div className="space-y-1.5">
              {research.citations.map((cite, i) => (
                <a
                  key={i}
                  href={cite.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs group"
                >
                  <span className="font-mono text-muted-foreground w-4 text-right">[{i + 1}]</span>
                  <span className="font-medium text-foreground group-hover:underline">{cite.title}</span>
                  <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-60 transition-opacity" />
                </a>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* Tags */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Tags
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {research.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px]">
                <Tag className="h-2.5 w-2.5 mr-1" />
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        <Separator />

        {/* Details */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Details
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Saved</p>
              <p className="text-sm font-mono">{formatDate(research.savedAt)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Views</p>
              <p className="text-sm font-mono">{research.views}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Helpful Votes</p>
              <p className="text-sm font-mono">{research.helpful}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Saved By</p>
              <p className="text-sm">{research.savedBy}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2" data-testid="research-actions">
          <Button size="sm" data-testid="button-publish-research">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            Publish to KB
          </Button>
          <Button size="sm" variant="outline" data-testid="button-edit-research">
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
          <Button size="sm" variant="outline" data-testid="button-share-research">
            <Share2 className="h-3.5 w-3.5 mr-1.5" />
            Share
          </Button>
          <Button size="sm" variant="outline" data-testid="button-archive-research">
            <Archive className="h-3.5 w-3.5 mr-1.5" />
            Archive
          </Button>
        </div>
      </div>
    </>
  );
}
