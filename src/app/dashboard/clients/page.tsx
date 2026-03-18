"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  MoreHorizontal,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

// Sample data
const clients = [
  {
    id: "1",
    name: "Riverside Property Management",
    email: "info@riversidepm.com",
    phone: "(555) 234-5678",
    city: "Springfield",
    state: "IL",
    status: "Active" as const,
    tags: ["Commercial", "Maintenance Plan"],
    totalRevenue: 12480,
    openJobs: 2,
    lastService: "Mar 12, 2026",
  },
  {
    id: "2",
    name: "Oak Street Apartments",
    email: "mgmt@oakstreet.com",
    phone: "(555) 345-6789",
    city: "Springfield",
    state: "IL",
    status: "Active" as const,
    tags: ["Residential", "Priority"],
    totalRevenue: 8920,
    openJobs: 1,
    lastService: "Mar 15, 2026",
  },
  {
    id: "3",
    name: "Martinez Residence",
    email: "carlos.m@email.com",
    phone: "(555) 456-7890",
    city: "Shelbyville",
    state: "IL",
    status: "Active" as const,
    tags: ["Residential"],
    totalRevenue: 3240,
    openJobs: 0,
    lastService: "Mar 10, 2026",
  },
  {
    id: "4",
    name: "Downtown Dental Office",
    email: "office@downtowndental.com",
    phone: "(555) 567-8901",
    city: "Springfield",
    state: "IL",
    status: "Active" as const,
    tags: ["Commercial"],
    totalRevenue: 5680,
    openJobs: 1,
    lastService: "Mar 8, 2026",
  },
  {
    id: "5",
    name: "Greenfield Schools",
    email: "facilities@greenfield.edu",
    phone: "(555) 678-9012",
    city: "Greenfield",
    state: "IL",
    status: "Lead" as const,
    tags: ["Institutional", "New Lead"],
    totalRevenue: 0,
    openJobs: 0,
    lastService: "—",
  },
  {
    id: "6",
    name: "Harbor View Restaurant",
    email: "owner@harborview.com",
    phone: "(555) 789-0123",
    city: "Capital City",
    state: "IL",
    status: "Active" as const,
    tags: ["Commercial", "Kitchen"],
    totalRevenue: 6120,
    openJobs: 0,
    lastService: "Feb 28, 2026",
  },
  {
    id: "7",
    name: "Sunset Senior Living",
    email: "maint@sunsetsenior.com",
    phone: "(555) 890-1234",
    city: "Springfield",
    state: "IL",
    status: "Active" as const,
    tags: ["Institutional", "Maintenance Plan"],
    totalRevenue: 15340,
    openJobs: 3,
    lastService: "Mar 16, 2026",
  },
  {
    id: "8",
    name: "Thompson Construction",
    email: "jen@thompsonconstruction.com",
    phone: "(555) 901-2345",
    city: "Shelbyville",
    state: "IL",
    status: "Inactive" as const,
    tags: ["Commercial"],
    totalRevenue: 2100,
    openJobs: 0,
    lastService: "Jan 15, 2026",
  },
];

const statusColors: Record<string, string> = {
  Active: "default",
  Lead: "outline",
  Inactive: "secondary",
  Churned: "destructive",
};

const summaryCards = [
  { label: "Total Clients", value: "142" },
  { label: "Active", value: "128" },
  { label: "New Leads", value: "8" },
  { label: "Avg. Revenue", value: "$6,240" },
];

export default function ClientIntelligencePage() {
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<typeof clients[0] | null>(null);

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase()) ||
    c.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="text-xl font-semibold tracking-tight mt-0.5">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
            data-testid="input-search-clients"
          />
        </div>
        <Button variant="outline" size="sm" data-testid="button-filter">
          <Filter className="h-3.5 w-3.5 mr-1.5" />
          Filter
        </Button>
        <Button variant="outline" size="sm" data-testid="button-sort">
          <ArrowUpDown className="h-3.5 w-3.5 mr-1.5" />
          Sort
        </Button>
        <div className="flex-1" />
        <Button size="sm" data-testid="button-add-client">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add Client
        </Button>
      </div>

      {/* Client Table */}
      <Card data-testid="card-client-table">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Open Jobs</TableHead>
                <TableHead>Last Service</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((client) => (
                <TableRow
                  key={client.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedClient(client)}
                  data-testid={`row-client-${client.id}`}
                >
                  <TableCell className="pl-4">
                    <div>
                      <p className="text-sm font-medium">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{client.city}, {client.state}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={statusColors[client.status] as "default" | "outline" | "secondary" | "destructive"}
                      className="text-[10px]"
                    >
                      {client.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {client.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px] font-normal">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm font-mono">
                    ${client.totalRevenue.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {client.openJobs > 0 ? (
                      <span className="font-medium">{client.openJobs}</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {client.lastService}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Client</DropdownMenuItem>
                        <DropdownMenuItem>Create Work Order</DropdownMenuItem>
                        <DropdownMenuItem>Create Invoice</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No clients match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Client Detail Slide-out */}
      <Sheet open={!!selectedClient} onOpenChange={() => setSelectedClient(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto" data-testid="sheet-client-detail">
          {selectedClient && (
            <>
              <SheetHeader>
                <SheetTitle className="text-lg">{selectedClient.name}</SheetTitle>
                <SheetDescription>
                  <Badge
                    variant={statusColors[selectedClient.status] as "default" | "outline" | "secondary" | "destructive"}
                    className="text-[10px]"
                  >
                    {selectedClient.status}
                  </Badge>
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6">
                {/* Contact Info */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Contact
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{selectedClient.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{selectedClient.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{selectedClient.city}, {selectedClient.state}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Revenue & Activity */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Overview
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Revenue</p>
                      <p className="text-lg font-semibold font-mono">
                        ${selectedClient.totalRevenue.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Open Jobs</p>
                      <p className="text-lg font-semibold">{selectedClient.openJobs}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last Service</p>
                      <p className="text-sm">{selectedClient.lastService}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Tags */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tags
                  </h4>
                  <div className="flex gap-1.5 flex-wrap">
                    {selectedClient.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs font-normal">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Quick Links */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Quick Links
                  </h4>
                  <div className="space-y-1">
                    {[
                      { label: "Work Orders", href: "/dashboard/work-orders" },
                      { label: "Invoices", href: "/dashboard/invoicing" },
                      { label: "Schedule", href: "/dashboard/scheduling" },
                    ].map((link) => (
                      <Button
                        key={link.label}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between"
                        asChild
                      >
                        <a href={link.href}>
                          {link.label}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
