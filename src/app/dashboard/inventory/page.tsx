"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Package,
  AlertTriangle,
  DollarSign,
  FileText,
  Warehouse,
  Truck,
  Wrench,
  MoreHorizontal,
  ArrowUpDown,
  ExternalLink,
  ShoppingCart,
  TrendingUp,
  MapPin,
  Calendar,
  Box,
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
  inventoryItems,
  inventoryLocations,
  purchaseOrders,
  type InventoryItem,
  type InventoryLocation,
  type PurchaseOrder,
  type StockStatus,
} from "@/lib/sample-data-p2";

// --- Helpers ---

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function stockStatusStyle(status: StockStatus): string {
  switch (status) {
    case "In Stock":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0";
    case "Low Stock":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0";
    case "Out of Stock":
      return "bg-red-500/15 text-red-700 dark:text-red-400 border-0";
    case "On Order":
      return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-0";
  }
}

function stockQtyColor(item: InventoryItem): string {
  if (item.stockQty === 0) return "text-red-600 dark:text-red-400";
  if (item.stockQty <= item.minQty) return "text-amber-600 dark:text-amber-400";
  return "text-emerald-600 dark:text-emerald-400";
}

function poStatusStyle(status: PurchaseOrder["status"]): string {
  switch (status) {
    case "Draft":
      return "";
    case "Sent":
      return "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-0";
    case "Confirmed":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-0";
    case "Received":
      return "bg-foreground/10 text-muted-foreground border-0";
    case "Partial":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-0";
  }
}

function locationIcon(type: InventoryLocation["type"]) {
  switch (type) {
    case "Warehouse":
      return Warehouse;
    case "Truck":
    case "Van":
      return Truck;
    case "Shop":
      return Wrench;
  }
}

// Unique categories from data
const CATEGORIES = Array.from(new Set(inventoryItems.map((i) => i.category))).sort();

// --- Component ---

export default function InventoryPage() {
  const [viewTab, setViewTab] = useState<"items" | "orders">("items");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");

  // --- Filtered inventory ---
  const filtered = useMemo(() => {
    return inventoryItems.filter((item) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
      const matchesStatus = statusFilter === "all" || item.status === statusFilter;
      const matchesLocation = locationFilter === "all" || item.location === locationFilter;
      return matchesSearch && matchesCategory && matchesStatus && matchesLocation;
    });
  }, [search, categoryFilter, statusFilter, locationFilter]);

  // --- KPI calculations ---
  const totalSKUs = inventoryItems.length;
  const lowOutCount = inventoryItems.filter(
    (i) => i.status === "Low Stock" || i.status === "Out of Stock"
  ).length;
  const totalValue = inventoryItems.reduce((sum, i) => sum + i.unitCost * i.stockQty, 0);
  const openPOs = purchaseOrders.filter((po) => po.status !== "Received").length;

  return (
    <div className="p-6 space-y-6 max-w-[1400px]" data-testid="inventory-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" data-testid="page-title">
            Inventory & Parts Management
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Track what you have, what you need, and what you&apos;re using
          </p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4" data-testid="kpi-row">
        {[
          { label: "Total SKUs", value: String(totalSKUs), icon: Package, testId: "kpi-total-skus" },
          { label: "Low / Out of Stock", value: String(lowOutCount), icon: AlertTriangle, testId: "kpi-low-stock" },
          { label: "Inventory Value", value: formatCurrency(totalValue), icon: DollarSign, testId: "kpi-inv-value" },
          { label: "Open POs", value: String(openPOs), icon: FileText, testId: "kpi-open-pos" },
        ].map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label} data-testid={kpi.testId}>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{kpi.label}</p>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-xl font-semibold tracking-tight mt-0.5 font-mono">{kpi.value}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Location Cards Row */}
      <div className="overflow-x-auto pb-1 -mx-6 px-6" data-testid="location-cards">
        <div className="flex gap-3 min-w-max">
          <button
            onClick={() => setLocationFilter("all")}
            className={`rounded-lg border p-3 min-w-[160px] text-left transition-colors cursor-pointer ${
              locationFilter === "all"
                ? "border-foreground/30 bg-foreground/5"
                : "hover:border-foreground/20"
            }`}
            data-testid="location-all"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Box className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold">All Locations</span>
            </div>
            <p className="text-sm font-mono font-semibold">
              {inventoryLocations.reduce((s, l) => s + l.itemCount, 0)} items
            </p>
            <p className="text-[10px] text-muted-foreground font-mono">
              {formatCurrency(inventoryLocations.reduce((s, l) => s + l.totalValue, 0))}
            </p>
          </button>
          {inventoryLocations.map((loc) => {
            const Icon = locationIcon(loc.type);
            const isActive = locationFilter === loc.name;
            return (
              <button
                key={loc.id}
                onClick={() => setLocationFilter(isActive ? "all" : loc.name)}
                className={`rounded-lg border p-3 min-w-[160px] text-left transition-colors cursor-pointer ${
                  isActive
                    ? "border-foreground/30 bg-foreground/5"
                    : "hover:border-foreground/20"
                }`}
                data-testid={`location-${loc.id}`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-semibold truncate">{loc.name}</span>
                </div>
                <p className="text-sm font-mono font-semibold">{loc.itemCount} items</p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  {formatCurrency(loc.totalValue)}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap" data-testid="toolbar">
        <Tabs
          value={viewTab}
          onValueChange={(v) => setViewTab(v as "items" | "orders")}
          data-testid="view-tabs"
        >
          <TabsList className="h-8">
            <TabsTrigger value="items" className="text-xs px-3" data-testid="tab-items">
              Inventory
            </TabsTrigger>
            <TabsTrigger value="orders" className="text-xs px-3" data-testid="tab-orders">
              Purchase Orders
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, SKU, category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-8"
            data-testid="input-search"
          />
        </div>

        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "all")}>
          <SelectTrigger className="w-[140px] h-8 text-xs" data-testid="select-category-filter">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-[140px] h-8 text-xs" data-testid="select-status-filter">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="In Stock">In Stock</SelectItem>
            <SelectItem value="Low Stock">Low Stock</SelectItem>
            <SelectItem value="Out of Stock">Out of Stock</SelectItem>
            <SelectItem value="On Order">On Order</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <Button size="sm" className="h-8" data-testid="button-add-item">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Item
        </Button>
      </div>

      {/* Inventory Table */}
      {viewTab === "items" && (
        <Card data-testid="inventory-table">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">SKU</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Min / Max</TableHead>
                  <TableHead className="text-right">Unit Cost</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead className="text-right">Used/Mo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedItem(item)}
                    data-testid={`row-inv-${item.id}`}
                  >
                    <TableCell className="pl-4 font-mono text-xs text-muted-foreground">
                      {item.sku}
                    </TableCell>
                    <TableCell className="text-sm font-medium max-w-[200px] truncate">
                      {item.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] font-normal">
                        {item.category}
                      </Badge>
                    </TableCell>
                    <TableCell className={`text-right text-sm font-mono font-semibold ${stockQtyColor(item)}`}>
                      {item.stockQty}
                    </TableCell>
                    <TableCell className="text-right text-xs font-mono text-muted-foreground">
                      {item.minQty} / {item.maxQty}
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono">
                      {formatCurrency(item.unitCost)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate max-w-[120px]">
                      {item.location}
                    </TableCell>
                    <TableCell className="text-xs truncate max-w-[120px]">
                      {item.supplier}
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono">
                      {item.usedThisMonth}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={item.status === "In Stock" ? "secondary" : "default"}
                        className={`text-[10px] ${stockStatusStyle(item.status)}`}
                      >
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted transition-colors"
                          data-testid={`actions-inv-${item.id}`}
                        >
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedItem(item)} data-testid={`action-view-${item.id}`}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem data-testid={`action-edit-${item.id}`}>
                            Edit Item
                          </DropdownMenuItem>
                          <DropdownMenuItem data-testid={`action-reorder-${item.id}`}>
                            Create PO
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-12 text-muted-foreground">
                      No inventory items match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Purchase Orders Tab */}
      {viewTab === "orders" && (
        <Card data-testid="po-table">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-4">PO #</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>Order Date</TableHead>
                  <TableHead>Expected</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {purchaseOrders.map((po) => (
                  <TableRow
                    key={po.id}
                    className="cursor-pointer"
                    onClick={() => setSelectedPO(po)}
                    data-testid={`row-po-${po.id}`}
                  >
                    <TableCell className="pl-4 font-mono text-sm">{po.poNumber}</TableCell>
                    <TableCell className="text-sm">{po.supplier}</TableCell>
                    <TableCell>
                      <Badge
                        variant={po.status === "Draft" ? "secondary" : "default"}
                        className={`text-[10px] ${poStatusStyle(po.status)}`}
                      >
                        {po.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm font-mono">{po.items}</TableCell>
                    <TableCell className="text-right text-sm font-mono">{formatCurrency(po.total)}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{po.orderDate}</TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{po.expectedDate}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-muted transition-colors"
                          data-testid={`actions-po-${po.id}`}
                        >
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedPO(po)} data-testid={`action-view-po-${po.id}`}>
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem data-testid={`action-edit-po-${po.id}`}>
                            Edit PO
                          </DropdownMenuItem>
                          {po.status === "Draft" && (
                            <DropdownMenuItem data-testid={`action-send-po-${po.id}`}>
                              Send to Supplier
                            </DropdownMenuItem>
                          )}
                          {po.status === "Confirmed" && (
                            <DropdownMenuItem data-testid={`action-receive-po-${po.id}`}>
                              Mark Received
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Item Detail Sheet */}
      <Sheet open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto" data-testid="sheet-item-detail">
          {selectedItem && (
            <ItemDetail item={selectedItem} />
          )}
        </SheetContent>
      </Sheet>

      {/* PO Detail Sheet */}
      <Sheet open={!!selectedPO} onOpenChange={() => setSelectedPO(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto" data-testid="sheet-po-detail">
          {selectedPO && (
            <PODetail po={selectedPO} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// --- Item Detail Component ---

function ItemDetail({ item }: { item: InventoryItem }) {
  const stockPct = Math.min((item.stockQty / item.maxQty) * 100, 100);
  const minPct = (item.minQty / item.maxQty) * 100;
  const needsReorder = item.stockQty <= item.minQty;

  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-lg flex items-center gap-2">
          <span className="font-mono text-sm text-muted-foreground">{item.sku}</span>
        </SheetTitle>
        <SheetDescription className="flex items-center gap-2 flex-wrap">
          <span className="text-base font-medium text-foreground">{item.name}</span>
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        {/* Status & Category */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            variant={item.status === "In Stock" ? "secondary" : "default"}
            className={`text-[10px] ${stockStatusStyle(item.status)}`}
          >
            {item.status}
          </Badge>
          <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
        </div>

        {/* Reorder Alert */}
        {needsReorder && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                Reorder Recommended
              </p>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/70 mt-0.5">
                Stock ({item.stockQty}) is at or below minimum ({item.minQty}).
                Suggest ordering {item.maxQty - item.stockQty} units.
              </p>
            </div>
          </div>
        )}

        <Separator />

        {/* Stock Level Visualization */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Stock Level
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Current</span>
              <span className={`font-mono font-semibold ${stockQtyColor(item)}`}>
                {item.stockQty} units
              </span>
            </div>
            {/* Bar visualization */}
            <div className="relative h-3 rounded-full bg-muted overflow-hidden">
              <div
                className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                  item.stockQty === 0
                    ? "bg-red-500/60"
                    : item.stockQty <= item.minQty
                      ? "bg-amber-500/60"
                      : "bg-emerald-500/40"
                }`}
                style={{ width: `${stockPct}%` }}
              />
              {/* Min threshold marker */}
              <div
                className="absolute top-0 bottom-0 w-px bg-foreground/30"
                style={{ left: `${minPct}%` }}
                title={`Min: ${item.minQty}`}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
              <span>0</span>
              <span>Min: {item.minQty}</span>
              <span>Max: {item.maxQty}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Pricing */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Pricing
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Unit Cost</p>
              <p className="text-sm font-mono font-semibold mt-0.5">{formatCurrency(item.unitCost)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Unit Price</p>
              <p className="text-sm font-mono font-semibold mt-0.5">
                {item.unitPrice > 0 ? formatCurrency(item.unitPrice) : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Stock Value</p>
              <p className="text-sm font-mono font-semibold mt-0.5">
                {formatCurrency(item.unitCost * item.stockQty)}
              </p>
            </div>
          </div>
          {item.unitPrice > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3" />
              <span>Margin: {(((item.unitPrice - item.unitCost) / item.unitPrice) * 100).toFixed(0)}%</span>
            </div>
          )}
        </div>

        <Separator />

        {/* Usage & Supply */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Usage & Supply
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Used This Month</p>
              <p className="text-sm font-mono font-semibold mt-0.5">{item.usedThisMonth} units</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Ordered</p>
              <p className="text-sm font-mono mt-0.5">{item.lastOrdered}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Location & Supplier */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Location & Supplier
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{item.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{item.supplier}</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2" data-testid="item-actions">
          <Button size="sm" variant="outline" data-testid="button-edit-item">
            Edit Item
          </Button>
          <Button size="sm" variant="outline" data-testid="button-create-po">
            <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
            Create PO
          </Button>
          <Button size="sm" variant="outline" data-testid="button-adjust-stock">
            Adjust Stock
          </Button>
        </div>
      </div>
    </>
  );
}

// --- PO Detail Component ---

function PODetail({ po }: { po: PurchaseOrder }) {
  return (
    <>
      <SheetHeader>
        <SheetTitle className="text-lg">
          <span className="font-mono">{po.poNumber}</span>
        </SheetTitle>
        <SheetDescription className="flex items-center gap-2 flex-wrap">
          <Badge
            variant={po.status === "Draft" ? "secondary" : "default"}
            className={`text-[10px] ${poStatusStyle(po.status)}`}
          >
            {po.status}
          </Badge>
          <span className="text-sm text-muted-foreground">{po.supplier}</span>
        </SheetDescription>
      </SheetHeader>

      <div className="mt-6 space-y-6">
        {/* Order Summary */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Order Summary
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Items</p>
              <p className="text-sm font-mono font-semibold mt-0.5">{po.items}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-sm font-mono font-semibold mt-0.5">{formatCurrency(po.total)}</p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Dates */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Dates
          </h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Ordered: <span className="font-mono">{po.orderDate}</span></span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Expected: <span className="font-mono">{po.expectedDate}</span></span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Supplier */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Supplier
          </h4>
          <div className="flex items-center gap-2 text-sm">
            <ShoppingCart className="h-3.5 w-3.5 text-muted-foreground" />
            <span>{po.supplier}</span>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2" data-testid="po-actions">
          <Button size="sm" variant="outline" data-testid="button-edit-po">
            Edit PO
          </Button>
          {po.status === "Draft" && (
            <Button size="sm" data-testid="button-send-po">
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Send to Supplier
            </Button>
          )}
          {po.status === "Confirmed" && (
            <Button size="sm" data-testid="button-receive-po">
              Mark Received
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
