"use client";

import { useState, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  Receipt,
  PieChart,
  Users,
  Clock,
  Star,
  AlertCircle,
  Download,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import {
  sampleMonthlyFinancials,
  sampleExpenseCategories,
  sampleRevenueByService,
  sampleARAgingBuckets,
  sampleTechPerformance,
  type MonthlyFinancial,
  type ARAgingBucket,
} from "@/lib/sample-data-p3";

// --- Helpers ---

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatCompact(amount: number): string {
  if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}k`;
  return `$${amount.toLocaleString()}`;
}

function pctChange(current: number, previous: number): { value: string; positive: boolean } {
  if (previous === 0) return { value: "+0%", positive: true };
  const change = ((current - previous) / previous) * 100;
  return {
    value: `${change >= 0 ? "+" : ""}${change.toFixed(1)}%`,
    positive: change >= 0,
  };
}

function renderStars(rating: number) {
  return (
    <div className="flex items-center gap-0.5">
      <Star className="h-3 w-3 fill-foreground/60 text-foreground/60" />
      <span className="text-sm font-mono">{rating.toFixed(1)}</span>
    </div>
  );
}

// Aging bucket color coding
function agingBucketColor(bucket: string): string {
  if (bucket === "Current") return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
  if (bucket === "1–30 Days") return "bg-blue-500/15 text-blue-700 dark:text-blue-400";
  if (bucket === "31–60 Days") return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
  if (bucket === "61–90 Days") return "bg-orange-500/15 text-orange-700 dark:text-orange-400";
  return "bg-red-500/15 text-red-700 dark:text-red-400"; // 90+
}

function agingBarColor(bucket: string): string {
  if (bucket === "Current") return "bg-emerald-500/60";
  if (bucket === "1–30 Days") return "bg-blue-500/60";
  if (bucket === "31–60 Days") return "bg-amber-500/60";
  if (bucket === "61–90 Days") return "bg-orange-500/60";
  return "bg-red-500/60";
}

type TabValue = "overview" | "expenses" | "revenue" | "ar-aging" | "team";

// --- Page Component ---

export default function FinancialReportsPage() {
  const [activeTab, setActiveTab] = useState<TabValue>("overview");

  // --- Computed KPIs ---
  const currentMonth = sampleMonthlyFinancials[sampleMonthlyFinancials.length - 1];
  const prevMonth = sampleMonthlyFinancials[sampleMonthlyFinancials.length - 2];

  const revenueChange = pctChange(currentMonth.revenue, prevMonth.revenue);
  const profitChange = pctChange(currentMonth.profit, prevMonth.profit);

  const totalExpenses = sampleExpenseCategories.reduce((sum, c) => sum + c.amount, 0);
  const totalBudgeted = sampleExpenseCategories.reduce((sum, c) => sum + c.budgeted, 0);

  const totalAR = sampleARAgingBuckets.reduce((sum, b) => sum + b.total, 0);
  const overdueAR = sampleARAgingBuckets
    .filter((b) => b.bucket !== "Current")
    .reduce((sum, b) => sum + b.total, 0);

  const profitMargin = currentMonth.revenue > 0
    ? ((currentMonth.profit / currentMonth.revenue) * 100).toFixed(1)
    : "0.0";

  const kpis = [
    {
      label: "Revenue (MTD)",
      value: formatCurrency(currentMonth.revenue),
      icon: DollarSign,
      detail: `${revenueChange.value} vs last month`,
      positive: revenueChange.positive,
    },
    {
      label: "Net Profit (MTD)",
      value: formatCurrency(currentMonth.profit),
      icon: TrendingUp,
      detail: `${profitMargin}% margin`,
      positive: profitChange.positive,
    },
    {
      label: "Expenses (MTD)",
      value: formatCurrency(totalExpenses),
      icon: Receipt,
      detail: `${formatCurrency(totalBudgeted)} budgeted`,
      positive: totalExpenses <= totalBudgeted,
    },
    {
      label: "AR Outstanding",
      value: formatCurrency(totalAR),
      icon: AlertCircle,
      detail: `${formatCurrency(overdueAR)} overdue`,
      positive: overdueAR === 0,
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1400px]" data-testid="financial-reports-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" data-testid="page-title">
            Financial Reporting & Analytics
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            See the whole picture. Know where every dollar goes.
          </p>
        </div>
        <Button size="sm" variant="outline" data-testid="button-export">
          <Download className="h-3.5 w-3.5 mr-1.5" />
          Export
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" data-testid="kpi-row">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} data-testid={`kpi-${kpi.label.toLowerCase().replace(/[\s()]/g, "-")}`}>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xl font-semibold tracking-tight mt-0.5 font-mono">{kpi.value}</p>
                <p className={`text-xs mt-1 ${kpi.positive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                  {kpi.detail}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as TabValue)}
        data-testid="report-tabs"
      >
        <TabsList className="h-8">
          <TabsTrigger value="overview" className="text-xs px-3" data-testid="tab-overview">
            Overview
          </TabsTrigger>
          <TabsTrigger value="expenses" className="text-xs px-3" data-testid="tab-expenses">
            Expenses
          </TabsTrigger>
          <TabsTrigger value="revenue" className="text-xs px-3" data-testid="tab-revenue">
            Revenue
          </TabsTrigger>
          <TabsTrigger value="ar-aging" className="text-xs px-3" data-testid="tab-ar-aging">
            AR Aging
          </TabsTrigger>
          <TabsTrigger value="team" className="text-xs px-3" data-testid="tab-team">
            Team Performance
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tab Content */}
      {activeTab === "overview" && <OverviewTab data={sampleMonthlyFinancials} />}
      {activeTab === "expenses" && <ExpensesTab />}
      {activeTab === "revenue" && <RevenueTab />}
      {activeTab === "ar-aging" && <ARAgingTab />}
      {activeTab === "team" && <TeamPerformanceTab />}
    </div>
  );
}

// ─── Overview Tab ──────────────────────────────────────────────────

function OverviewTab({ data }: { data: MonthlyFinancial[] }) {
  const maxRevenue = Math.max(...data.map((m) => m.revenue));

  return (
    <div className="space-y-6">
      {/* 6-Month Revenue/Expenses/Profit Bar Chart */}
      <Card data-testid="card-monthly-chart">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">6-Month Financial Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Chart Legend */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm bg-foreground/70" />
                <span className="text-xs text-muted-foreground">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm bg-foreground/30" />
                <span className="text-xs text-muted-foreground">Expenses</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-sm bg-emerald-500/60" />
                <span className="text-xs text-muted-foreground">Profit</span>
              </div>
            </div>

            {/* Bars */}
            <div className="space-y-3">
              {data.map((month) => (
                <div key={month.month} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground w-20 shrink-0">{month.month}</span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {formatCompact(month.revenue)} rev · {formatCompact(month.profit)} profit
                    </span>
                  </div>
                  <div className="flex gap-1 h-5">
                    {/* Revenue bar */}
                    <div
                      className="bg-foreground/70 rounded-sm h-full transition-all"
                      style={{ width: `${(month.revenue / maxRevenue) * 100}%` }}
                      title={`Revenue: ${formatCurrency(month.revenue)}`}
                    />
                  </div>
                  <div className="flex gap-1 h-3">
                    {/* Expenses bar */}
                    <div
                      className="bg-foreground/30 rounded-sm h-full transition-all"
                      style={{ width: `${(month.expenses / maxRevenue) * 100}%` }}
                      title={`Expenses: ${formatCurrency(month.expenses)}`}
                    />
                  </div>
                  <div className="flex gap-1 h-3">
                    {/* Profit bar */}
                    <div
                      className="bg-emerald-500/60 rounded-sm h-full transition-all"
                      style={{ width: `${(month.profit / maxRevenue) * 100}%` }}
                      title={`Profit: ${formatCurrency(month.profit)}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Summary Table */}
      <Card data-testid="card-monthly-table">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Month</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Expenses</TableHead>
                <TableHead className="text-right">Net Profit</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead className="text-right">Jobs</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...data].reverse().map((month) => {
                const margin = month.revenue > 0
                  ? ((month.profit / month.revenue) * 100).toFixed(1)
                  : "0.0";
                return (
                  <TableRow key={month.month} data-testid={`row-month-${month.month.replace(/\s+/g, "-")}`}>
                    <TableCell className="pl-4 text-sm">{month.month}</TableCell>
                    <TableCell className="text-right text-sm font-mono">
                      {formatCurrency(month.revenue)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono text-muted-foreground">
                      {formatCurrency(month.expenses)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono font-medium">
                      {formatCurrency(month.profit)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono">
                      <span className={Number(margin) >= 30 ? "text-emerald-600 dark:text-emerald-400" : ""}>
                        {margin}%
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono">{month.jobsCompleted}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Expenses Tab ──────────────────────────────────────────────────

function ExpensesTab() {
  const totalSpent = sampleExpenseCategories.reduce((sum, c) => sum + c.amount, 0);
  const totalBudgeted = sampleExpenseCategories.reduce((sum, c) => sum + c.budgeted, 0);
  const sorted = [...sampleExpenseCategories].sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-6">
      {/* Budget vs Actual Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card data-testid="card-total-spent">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground">Total Spent (MTD)</p>
            <p className="text-xl font-semibold font-mono mt-0.5">{formatCurrency(totalSpent)}</p>
          </CardContent>
        </Card>
        <Card data-testid="card-total-budgeted">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground">Total Budget</p>
            <p className="text-xl font-semibold font-mono mt-0.5">{formatCurrency(totalBudgeted)}</p>
          </CardContent>
        </Card>
        <Card data-testid="card-budget-remaining">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground">Remaining</p>
            <p className={`text-xl font-semibold font-mono mt-0.5 ${totalBudgeted - totalSpent >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
              {formatCurrency(totalBudgeted - totalSpent)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expense Categories with Budget Comparison Bars */}
      <Card data-testid="card-expense-categories">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Expense Categories — Budget vs Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sorted.map((cat) => {
              const pct = cat.budgeted > 0 ? (cat.amount / cat.budgeted) * 100 : 0;
              const overBudget = cat.amount > cat.budgeted;
              return (
                <div key={cat.category} className="space-y-1.5" data-testid={`expense-cat-${cat.category.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{cat.category}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono">{formatCurrency(cat.amount)}</span>
                      <span className="text-xs text-muted-foreground font-mono">
                        / {formatCurrency(cat.budgeted)}
                      </span>
                      {overBudget && (
                        <Badge variant="secondary" className="text-[10px] bg-red-500/15 text-red-700 dark:text-red-400 border-0">
                          Over
                        </Badge>
                      )}
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${overBudget ? "bg-red-500/60" : "bg-foreground/40"}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {pct.toFixed(0)}% of budget used
                  </p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Revenue Tab ───────────────────────────────────────────────────

function RevenueTab() {
  const totalRevenue = sampleRevenueByService.reduce((sum, s) => sum + s.revenue, 0);
  const maxRevenue = Math.max(...sampleRevenueByService.map((s) => s.revenue));

  return (
    <div className="space-y-6">
      {/* Revenue by Service — Horizontal Bar Chart */}
      <Card data-testid="card-revenue-by-service">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Revenue by Service Line (MTD)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sampleRevenueByService.map((svc) => {
              const pct = totalRevenue > 0 ? ((svc.revenue / totalRevenue) * 100).toFixed(1) : "0";
              const TrendIcon = svc.trend === "up" ? TrendingUp : svc.trend === "down" ? TrendingDown : Minus;
              const trendColor = svc.trend === "up"
                ? "text-emerald-600 dark:text-emerald-400"
                : svc.trend === "down"
                  ? "text-red-600 dark:text-red-400"
                  : "text-muted-foreground";
              return (
                <div key={svc.service} className="space-y-1.5" data-testid={`revenue-svc-${svc.service.toLowerCase().replace(/\s+/g, "-")}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{svc.service}</span>
                      <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{pct}%</span>
                      <span className="text-sm font-mono font-medium">{formatCurrency(svc.revenue)}</span>
                    </div>
                  </div>
                  <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="bg-foreground/50 h-full rounded-full transition-all"
                      style={{ width: `${(svc.revenue / maxRevenue) * 100}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <span>{svc.jobs} jobs</span>
                    <span>Avg {formatCurrency(svc.avgPerJob)}/job</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Summary Table */}
      <Card data-testid="card-revenue-table">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Service Line Detail</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Service</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Jobs</TableHead>
                <TableHead className="text-right">Avg/Job</TableHead>
                <TableHead className="text-right">% of Total</TableHead>
                <TableHead>Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleRevenueByService.map((svc) => {
                const pct = totalRevenue > 0 ? ((svc.revenue / totalRevenue) * 100).toFixed(1) : "0";
                const TrendIcon = svc.trend === "up" ? TrendingUp : svc.trend === "down" ? TrendingDown : Minus;
                const trendColor = svc.trend === "up"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : svc.trend === "down"
                    ? "text-red-600 dark:text-red-400"
                    : "text-muted-foreground";
                return (
                  <TableRow key={svc.service} data-testid={`row-svc-${svc.service.toLowerCase().replace(/\s+/g, "-")}`}>
                    <TableCell className="pl-4 text-sm">{svc.service}</TableCell>
                    <TableCell className="text-right text-sm font-mono font-medium">
                      {formatCurrency(svc.revenue)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono">{svc.jobs}</TableCell>
                    <TableCell className="text-right text-sm font-mono text-muted-foreground">
                      {formatCurrency(svc.avgPerJob)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono">{pct}%</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                        <span className={`text-xs ${trendColor}`}>
                          {svc.trend === "up" ? "Up" : svc.trend === "down" ? "Down" : "Flat"}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {/* Total row */}
              <TableRow className="font-medium border-t-2">
                <TableCell className="pl-4 text-sm">Total</TableCell>
                <TableCell className="text-right text-sm font-mono">
                  {formatCurrency(totalRevenue)}
                </TableCell>
                <TableCell className="text-right text-sm font-mono">
                  {sampleRevenueByService.reduce((sum, s) => sum + s.jobs, 0)}
                </TableCell>
                <TableCell className="text-right text-sm font-mono text-muted-foreground">—</TableCell>
                <TableCell className="text-right text-sm font-mono">100%</TableCell>
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── AR Aging Tab ──────────────────────────────────────────────────

function ARAgingTab() {
  const totalAR = sampleARAgingBuckets.reduce((sum, b) => sum + b.total, 0);
  const maxBucket = Math.max(...sampleARAgingBuckets.map((b) => b.total));
  const [selectedBucket, setSelectedBucket] = useState<ARAgingBucket | null>(null);

  return (
    <div className="space-y-6">
      {/* Aging Distribution Bar */}
      <Card data-testid="card-ar-distribution">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">
            Accounts Receivable — {formatCurrency(totalAR)} Outstanding
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Stacked bar */}
            <div className="flex h-4 w-full rounded-full overflow-hidden bg-muted">
              {sampleARAgingBuckets
                .filter((b) => b.total > 0)
                .map((b) => (
                  <div
                    key={b.bucket}
                    className={`${agingBarColor(b.bucket)} transition-all cursor-pointer hover:opacity-80`}
                    style={{ width: `${(b.total / totalAR) * 100}%` }}
                    title={`${b.bucket}: ${formatCurrency(b.total)}`}
                    onClick={() => setSelectedBucket(b)}
                  />
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 flex-wrap">
              {sampleARAgingBuckets.map((b) => (
                <div key={b.bucket} className="flex items-center gap-1.5">
                  <div className={`h-2 w-2 rounded-full ${agingBarColor(b.bucket)}`} />
                  <span className="text-xs text-muted-foreground">
                    {b.bucket} ({formatCurrency(b.total)})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Aging Buckets with Horizontal Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4" data-testid="ar-bucket-cards">
        {sampleARAgingBuckets.map((bucket) => {
          const pct = totalAR > 0 ? ((bucket.total / totalAR) * 100).toFixed(1) : "0";
          return (
            <Card
              key={bucket.bucket}
              className={`cursor-pointer transition-shadow hover:shadow-md ${selectedBucket?.bucket === bucket.bucket ? "ring-1 ring-foreground/20" : ""}`}
              onClick={() => setSelectedBucket(bucket)}
              data-testid={`ar-bucket-${bucket.bucket.toLowerCase().replace(/[\s–+]/g, "-")}`}
            >
              <CardContent className="pt-4 pb-3 px-4">
                <Badge variant="secondary" className={`text-[10px] ${agingBucketColor(bucket.bucket)} border-0 mb-2`}>
                  {bucket.bucket}
                </Badge>
                <p className="text-lg font-semibold font-mono">{formatCurrency(bucket.total)}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {bucket.count} invoice{bucket.count !== 1 ? "s" : ""} · {pct}%
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Bucket Detail */}
      {selectedBucket && selectedBucket.clients.length > 0 && (
        <Card data-testid="card-ar-bucket-detail">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Badge variant="secondary" className={`text-[10px] ${agingBucketColor(selectedBucket.bucket)} border-0`}>
                {selectedBucket.bucket}
              </Badge>
              Client Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">Client</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Days Overdue</TableHead>
                  <TableHead className="text-right">% of Bucket</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedBucket.clients.map((client) => {
                  const clientPct = selectedBucket.total > 0
                    ? ((client.amount / selectedBucket.total) * 100).toFixed(1)
                    : "0";
                  return (
                    <TableRow key={client.name} data-testid={`row-ar-client-${client.name.toLowerCase().replace(/\s+/g, "-")}`}>
                      <TableCell className="pl-4 text-sm">
                        <Link
                          href="/dashboard/clients"
                          className="hover:underline underline-offset-2"
                          data-testid={`link-ar-client-${client.name.toLowerCase().replace(/\s+/g, "-")}`}
                        >
                          {client.name}
                          <ExternalLink className="inline h-3 w-3 ml-1 -mt-0.5 text-muted-foreground" />
                        </Link>
                      </TableCell>
                      <TableCell className="text-right text-sm font-mono font-medium">
                        {formatCurrency(client.amount)}
                      </TableCell>
                      <TableCell className="text-right text-sm font-mono">
                        {client.daysOverdue === 0 ? (
                          <span className="text-muted-foreground">Current</span>
                        ) : (
                          <span className={client.daysOverdue > 60 ? "text-red-600 dark:text-red-400 font-medium" : ""}>
                            {client.daysOverdue}d
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm font-mono text-muted-foreground">
                        {clientPct}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Team Performance Tab ──────────────────────────────────────────

function TeamPerformanceTab() {
  const maxRevenue = Math.max(...sampleTechPerformance.map((t) => t.revenue));

  return (
    <div className="space-y-6">
      {/* Technician Revenue Bars */}
      <Card data-testid="card-tech-revenue-bars">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Technician Revenue (MTD)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sampleTechPerformance.map((tech) => (
              <div key={tech.name} className="space-y-1.5" data-testid={`tech-bar-${tech.initials.toLowerCase()}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6 shrink-0">
                      <AvatarFallback className="text-[10px] bg-foreground/10">
                        {tech.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{tech.name}</span>
                  </div>
                  <span className="text-sm font-mono font-medium">{formatCurrency(tech.revenue)}</span>
                </div>
                <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="bg-foreground/50 h-full rounded-full transition-all"
                    style={{ width: `${(tech.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>{tech.jobs} jobs</span>
                  <span>{tech.hoursWorked}h worked</span>
                  <span>Avg {formatCurrency(tech.avgJobValue)}/job</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Comparison Table */}
      <Card data-testid="card-tech-comparison-table">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">Technician Comparison</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Technician</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Jobs</TableHead>
                <TableHead className="text-right">Avg/Job</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">$/Hour</TableHead>
                <TableHead className="text-right">Cost/Job</TableHead>
                <TableHead className="text-right">Rating</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sampleTechPerformance.map((tech) => {
                const revenuePerHour = tech.hoursWorked > 0
                  ? (tech.revenue / tech.hoursWorked)
                  : 0;
                return (
                  <TableRow key={tech.name} data-testid={`row-tech-${tech.initials.toLowerCase()}`}>
                    <TableCell className="pl-4">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7 shrink-0">
                          <AvatarFallback className="text-[10px] bg-foreground/10">
                            {tech.initials}
                          </AvatarFallback>
                        </Avatar>
                        <Link
                          href="/dashboard/workforce"
                          className="text-sm hover:underline underline-offset-2"
                          data-testid={`link-tech-${tech.initials.toLowerCase()}`}
                        >
                          {tech.name}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono font-medium">
                      {formatCurrency(tech.revenue)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono">{tech.jobs}</TableCell>
                    <TableCell className="text-right text-sm font-mono text-muted-foreground">
                      {formatCurrency(tech.avgJobValue)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono">{tech.hoursWorked}h</TableCell>
                    <TableCell className="text-right text-sm font-mono text-muted-foreground">
                      {formatCurrency(revenuePerHour)}
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono text-muted-foreground">
                      {formatCurrency(tech.costPerJob)}
                    </TableCell>
                    <TableCell className="text-right">
                      {renderStars(tech.rating)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
