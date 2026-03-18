"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  ArrowUpDown,
  Receipt,
  AlertCircle,
  DollarSign,
  FileText,
  Send,
  CheckCircle2,
  Download,
  Pencil,
  ExternalLink,
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
import Link from "next/link";
import {
  invoices,
  workOrders,
  type SampleInvoice,
  type InvoiceStatus,
} from "@/lib/sample-data";

// --- Helpers ---

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const statusStyles: Record<InvoiceStatus, { className: string; variant?: "secondary" | "outline" }> = {
  Paid: { className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400" },
  Sent: { className: "bg-blue-500/15 text-blue-700 dark:text-blue-400" },
  Viewed: { className: "bg-violet-500/15 text-violet-700 dark:text-violet-400" },
  Draft: { variant: "secondary", className: "" },
  Overdue: { className: "bg-red-500/15 text-red-700 dark:text-red-400" },
  Cancelled: { variant: "outline", className: "line-through" },
};

function StatusBadge({ status }: { status: InvoiceStatus }) {
  const style = statusStyles[status];
  return (
    <Badge
      variant={style.variant ?? "default"}
      className={`text-[10px] ${style.className} ${
        !style.variant ? "border-0" : ""
      }`}
    >
      {status}
    </Badge>
  );
}

const allStatuses: InvoiceStatus[] = ["Draft", "Sent", "Viewed", "Paid", "Overdue", "Cancelled"];

// --- Status bar colors (matching status badge tones) ---
const statusBarColors: Record<InvoiceStatus, string> = {
  Draft: "bg-muted-foreground/40",
  Sent: "bg-blue-500/60",
  Viewed: "bg-violet-500/60",
  Paid: "bg-emerald-500/60",
  Overdue: "bg-red-500/60",
  Cancelled: "bg-muted-foreground/20",
};

export default function InvoicingPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedInvoice, setSelectedInvoice] = useState<SampleInvoice | null>(null);

  // --- Computed ---

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesStatus = statusFilter === "all" || inv.status === statusFilter;
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.clientName.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [search, statusFilter]);

  const totalOutstanding = useMemo(() => {
    return invoices
      .filter((inv) => inv.status !== "Paid" && inv.status !== "Cancelled")
      .reduce((sum, inv) => sum + (inv.total - inv.amountPaid), 0);
  }, []);

  const overdueInvoices = useMemo(() => {
    return invoices.filter((inv) => inv.status === "Overdue");
  }, []);

  const overdueTotal = useMemo(() => {
    return overdueInvoices.reduce((sum, inv) => sum + (inv.total - inv.amountPaid), 0);
  }, [overdueInvoices]);

  const paidMTD = useMemo(() => {
    return invoices
      .filter((inv) => inv.status === "Paid")
      .reduce((sum, inv) => sum + inv.amountPaid, 0);
  }, []);

  const draftCount = useMemo(() => {
    return invoices.filter((inv) => inv.status === "Draft").length;
  }, []);

  // Date range of visible invoices
  const dateRange = useMemo(() => {
    if (filtered.length === 0) return null;
    const dates = filtered.map((inv) => inv.issueDate).sort();
    return { from: formatDate(dates[0]), to: formatDate(dates[dates.length - 1]) };
  }, [filtered]);

  // Status distribution for quick stats bar
  const statusDistribution = useMemo(() => {
    const counts: Record<InvoiceStatus, number> = {
      Draft: 0, Sent: 0, Viewed: 0, Paid: 0, Overdue: 0, Cancelled: 0,
    };
    for (const inv of invoices) {
      counts[inv.status]++;
    }
    const total = invoices.length;
    return allStatuses
      .filter((s) => counts[s] > 0)
      .map((s) => ({ status: s, count: counts[s], pct: (counts[s] / total) * 100 }));
  }, []);

  const kpis = [
    {
      label: "Total Outstanding",
      value: formatCurrency(totalOutstanding),
      icon: DollarSign,
      detail: `${invoices.filter((i) => i.status !== "Paid" && i.status !== "Cancelled").length} invoices`,
    },
    {
      label: "Overdue",
      value: formatCurrency(overdueTotal),
      icon: AlertCircle,
      detail: `${overdueInvoices.length} invoice${overdueInvoices.length !== 1 ? "s" : ""}`,
      alert: overdueInvoices.length > 0,
    },
    {
      label: "Paid (MTD)",
      value: formatCurrency(paidMTD),
      icon: CheckCircle2,
      detail: `${invoices.filter((i) => i.status === "Paid").length} invoices`,
    },
    {
      label: "Draft",
      value: String(draftCount),
      icon: FileText,
      detail: "Awaiting send",
    },
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
              <kpi.icon className={`h-4 w-4 ${kpi.alert ? "text-red-500" : "text-muted-foreground"}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold tracking-tight font-mono">{kpi.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{kpi.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Stats Bar — status distribution */}
      <div className="space-y-1.5" data-testid="status-distribution-bar">
        <div className="flex h-1 w-full rounded-full overflow-hidden bg-muted">
          {statusDistribution.map((seg) => (
            <div
              key={seg.status}
              className={`${statusBarColors[seg.status]} transition-all`}
              style={{ width: `${seg.pct}%` }}
              title={`${seg.status}: ${seg.count}`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {statusDistribution.map((seg) => (
            <div key={seg.status} className="flex items-center gap-1.5">
              <div className={`h-2 w-2 rounded-full ${statusBarColors[seg.status]}`} />
              <span className="text-xs text-muted-foreground">
                {seg.status} ({seg.count})
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap" data-testid="toolbar">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
            data-testid="input-search-invoices"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-[140px]" data-testid="select-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {allStatuses.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {dateRange && (
          <span className="text-xs text-muted-foreground hidden sm:inline">
            {dateRange.from} — {dateRange.to}
          </span>
        )}
        <div className="flex-1" />
        <Button size="sm" data-testid="button-new-invoice">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          New Invoice
        </Button>
      </div>

      {/* Invoice Table */}
      <Card data-testid="card-invoice-table">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">
                  <span className="inline-flex items-center gap-1">
                    Invoice # <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                  </span>
                </TableHead>
                <TableHead>
                  <span className="inline-flex items-center gap-1">
                    Client <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                  </span>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <span className="inline-flex items-center gap-1">
                    Issue Date <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                  </span>
                </TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">
                  <span className="inline-flex items-center gap-1 justify-end">
                    Amount <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                  </span>
                </TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-right">Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((inv) => {
                const balance = inv.total - inv.amountPaid;
                return (
                  <TableRow
                    key={inv.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedInvoice(inv)}
                    data-testid={`row-invoice-${inv.id}`}
                  >
                    <TableCell className="pl-4 font-mono text-sm">
                      {inv.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-sm">{inv.clientName}</TableCell>
                    <TableCell>
                      <StatusBadge status={inv.status} />
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">
                      {formatDate(inv.issueDate)}
                    </TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">
                      {formatDate(inv.dueDate)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono">
                      {formatCurrency(inv.total)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono text-muted-foreground">
                      {formatCurrency(inv.amountPaid)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono">
                      <span className={balance > 0 ? "font-medium" : "text-muted-foreground"}>
                        {formatCurrency(balance)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No invoices match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Invoice Detail Slide-out */}
      <Sheet open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto" data-testid="sheet-invoice-detail">
          {selectedInvoice && (
            <InvoiceDetail invoice={selectedInvoice} onClose={() => setSelectedInvoice(null)} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// --- Invoice Detail Component ---

function InvoiceDetail({ invoice, onClose }: { invoice: SampleInvoice; onClose: () => void }) {
  const balance = invoice.total - invoice.amountPaid;
  const relatedWO = invoice.workOrderNumber
    ? workOrders.find((wo) => wo.orderNumber === invoice.workOrderNumber)
    : null;

  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-lg flex items-center gap-2">
          <span className="font-mono">{invoice.invoiceNumber}</span>
          <StatusBadge status={invoice.status} />
        </SheetTitle>
        <SheetDescription className="text-sm">
          <Link
            href={`/dashboard/clients`}
            className="hover:underline"
            data-testid="link-invoice-client"
          >
            {invoice.clientName}
            <ExternalLink className="inline h-3 w-3 ml-1 -mt-0.5" />
          </Link>
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        {/* Dates & Reference */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Details
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground">Issue Date</p>
              <p className="text-sm font-mono">{formatDate(invoice.issueDate)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Due Date</p>
              <p className={`text-sm font-mono ${invoice.status === "Overdue" ? "text-red-600 dark:text-red-400 font-medium" : ""}`}>
                {formatDate(invoice.dueDate)}
              </p>
            </div>
            {invoice.workOrderNumber && (
              <div>
                <p className="text-xs text-muted-foreground">Work Order</p>
                <Link
                  href="/dashboard/work-orders"
                  className="text-sm font-mono hover:underline"
                  data-testid="link-invoice-work-order"
                >
                  {invoice.workOrderNumber}
                  <ExternalLink className="inline h-3 w-3 ml-1 -mt-0.5" />
                </Link>
              </div>
            )}
          </div>
        </div>

        <Separator />

        {/* Line Items */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Line Items
          </h4>
          <div data-testid="invoice-line-items">
            {/* Header */}
            <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-0 py-1.5 border-b text-xs text-muted-foreground">
              <span>Description</span>
              <span className="w-12 text-right">Qty</span>
              <span className="w-20 text-right">Price</span>
              <span className="w-20 text-right">Total</span>
            </div>
            {/* Rows */}
            {invoice.lineItems.map((item) => (
              <div
                key={item.id}
                className="grid grid-cols-[1fr_auto_auto_auto] gap-2 px-0 py-2 border-b last:border-0 text-sm"
                data-testid={`line-item-${item.id}`}
              >
                <span className="pr-2">{item.description}</span>
                <span className="w-12 text-right font-mono text-muted-foreground">
                  {item.quantity}
                </span>
                <span className="w-20 text-right font-mono text-muted-foreground">
                  {formatCurrency(item.unitPrice)}
                </span>
                <span className="w-20 text-right font-mono">
                  {formatCurrency(item.total)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Financial Summary */}
        <div className="space-y-3" data-testid="invoice-financial-summary">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Summary
          </h4>
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono">{formatCurrency(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Tax ({(invoice.taxRate * 100).toFixed(2)}%)
              </span>
              <span className="font-mono">{formatCurrency(invoice.taxAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm font-medium">
              <span>Total</span>
              <span className="font-mono">{formatCurrency(invoice.total)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount Paid</span>
              <span className="font-mono text-muted-foreground">
                {formatCurrency(invoice.amountPaid)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm font-semibold">
              <span>Balance Due</span>
              <span className={`font-mono ${balance > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                {formatCurrency(balance)}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <>
            <Separator />
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Notes
              </h4>
              <p className="text-sm text-muted-foreground">{invoice.notes}</p>
            </div>
          </>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2" data-testid="invoice-actions">
          <Button size="sm" data-testid="button-send-invoice">
            <Send className="h-3.5 w-3.5 mr-1.5" />
            Send Invoice
          </Button>
          <Button size="sm" variant="outline" data-testid="button-mark-paid">
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
            Mark as Paid
          </Button>
          <Button size="sm" variant="outline" data-testid="button-download-pdf">
            <Download className="h-3.5 w-3.5 mr-1.5" />
            Download PDF
          </Button>
          <Button size="sm" variant="outline" data-testid="button-edit-invoice">
            <Pencil className="h-3.5 w-3.5 mr-1.5" />
            Edit
          </Button>
        </div>
      </div>
    </>
  );
}
