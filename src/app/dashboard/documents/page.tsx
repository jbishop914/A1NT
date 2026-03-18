"use client";

import { useState, useMemo } from "react";
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
  type Document as SampleDocument,
  type KBArticle,
  type FormTemplate,
  type DocType,
  type DocCategory,
} from "@/lib/sample-data-p3";

// --- Helpers ---

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
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

const allDocTypes: DocType[] = ["Document", "Template", "SOP", "Form", "Certificate", "Training"];
const allDocCategories: DocCategory[] = ["Operations", "HR & Compliance", "Client-Facing", "Technical", "Administrative", "Safety"];
const allDocStatuses: DocStatus[] = ["Active", "Draft", "Archived"];
const allKBStatuses: KBStatus[] = ["Published", "Draft", "Under Review"];

type TabId = "documents" | "knowledge-base" | "forms";

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

  const kbCategories = useMemo(() => {
    return [...new Set(sampleKBArticles.map((a) => a.category))];
  }, []);

  // --- KPIs ---
  const totalDocs = sampleDocuments.length;
  const activeDocs = sampleDocuments.filter((d) => d.status === "Active").length;
  const totalArticles = sampleKBArticles.length;
  const publishedArticles = sampleKBArticles.filter((a) => a.status === "Published").length;
  const totalForms = sampleFormTemplates.length;
  const totalSubmissions = sampleFormTemplates.reduce((s, f) => s + f.submissions, 0);
  const totalKBViews = sampleKBArticles.reduce((s, a) => s + a.views, 0);

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
      label: "Form Templates",
      value: String(totalForms),
      icon: ClipboardList,
      detail: `${totalSubmissions.toLocaleString()} submissions`,
    },
    {
      label: "KB Views",
      value: totalKBViews.toLocaleString(),
      icon: Eye,
      detail: "All time",
    },
  ];

  const tabs: { id: TabId; label: string; icon: typeof FileText }[] = [
    { id: "documents", label: "Documents", icon: FolderOpen },
    { id: "knowledge-base", label: "Knowledge Base", icon: BookOpen },
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
    </div>
  );
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
