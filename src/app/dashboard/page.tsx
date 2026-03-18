import {
  DollarSign,
  ClipboardList,
  Users,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Plus,
  FileText,
  UserPlus,
  Phone,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const kpiCards = [
  {
    title: "Revenue (MTD)",
    value: "$24,580",
    change: "+12.5%",
    trend: "up" as "up" | "down" | "neutral",
    icon: DollarSign,
  },
  {
    title: "Active Jobs",
    value: "18",
    change: "+3",
    trend: "up" as "up" | "down" | "neutral",
    icon: ClipboardList,
  },
  {
    title: "Active Clients",
    value: "142",
    change: "+8",
    trend: "up" as "up" | "down" | "neutral",
    icon: Users,
  },
  {
    title: "Open Invoices",
    value: "$8,340",
    change: "6 pending",
    trend: "neutral" as "up" | "down" | "neutral",
    icon: Receipt,
  },
];

const quickActions = [
  { label: "New Work Order", icon: ClipboardList, href: "/dashboard/work-orders" },
  { label: "New Client", icon: UserPlus, href: "/dashboard/clients" },
  { label: "New Invoice", icon: FileText, href: "/dashboard/invoicing" },
];

const recentActivity = [
  {
    id: 1,
    action: "Work order completed",
    detail: "WO-1084 — Water heater install at 742 Evergreen",
    time: "12 min ago",
    type: "success" as const,
  },
  {
    id: 2,
    action: "New client added",
    detail: "Riverside Property Management",
    time: "34 min ago",
    type: "info" as const,
  },
  {
    id: 3,
    action: "Invoice sent",
    detail: "INV-2091 — $1,240.00 to Martinez Residence",
    time: "1 hr ago",
    type: "default" as const,
  },
  {
    id: 4,
    action: "Call received",
    detail: "AI receptionist captured lead — emergency drain repair",
    time: "1 hr ago",
    type: "info" as const,
  },
  {
    id: 5,
    action: "Payment received",
    detail: "INV-2088 — $680.00 from Oak Street Apartments",
    time: "2 hr ago",
    type: "success" as const,
  },
  {
    id: 6,
    action: "Work order assigned",
    detail: "WO-1085 — AC maintenance assigned to Mike R.",
    time: "3 hr ago",
    type: "default" as const,
  },
];

const todaysSchedule = [
  { time: "8:00 AM", job: "HVAC inspection — 12 Oak Lane", tech: "Mike R.", status: "Completed" },
  { time: "9:30 AM", job: "Furnace repair — 88 Pine St", tech: "Dave S.", status: "In Progress" },
  { time: "11:00 AM", job: "Water heater install — 742 Evergreen", tech: "Mike R.", status: "Completed" },
  { time: "1:00 PM", job: "AC maintenance — 305 Cedar Ave", tech: "Lisa K.", status: "Scheduled" },
  { time: "2:30 PM", job: "Pipe leak fix — 19 Maple Dr", tech: "Dave S.", status: "Scheduled" },
  { time: "4:00 PM", job: "Thermostat install — 67 Birch Rd", tech: "Mike R.", status: "Scheduled" },
];

export default function CommandCenterPage() {
  return (
    <div className="p-6 space-y-6 max-w-[1400px]">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} data-testid={`card-kpi-${kpi.title.toLowerCase().replace(/\s+/g, "-")}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {kpi.title}
              </CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold tracking-tight">{kpi.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {kpi.trend === "up" && (
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                )}
                {kpi.trend === "down" && (
                  <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
                )}
                <span className={`text-xs ${
                  kpi.trend === "up"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : kpi.trend === "down"
                    ? "text-red-500"
                    : "text-muted-foreground"
                }`}>
                  {kpi.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            size="sm"
            render={<Link href={action.href} />}
            data-testid={`button-${action.label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            {action.label}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Activity Feed — wider column */}
        <Card className="lg:col-span-3" data-testid="card-activity-feed">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            {recentActivity.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 py-3 border-b last:border-0"
                data-testid={`activity-item-${item.id}`}
              >
                <div className="mt-0.5">
                  {item.type === "success" ? (
                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  ) : item.type === "info" ? (
                    <div className="h-2 w-2 rounded-full bg-foreground/40" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-foreground/20" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium leading-tight">{item.action}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {item.detail}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {item.time}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Today's Schedule — narrower column */}
        <Card className="lg:col-span-2" data-testid="card-schedule">
          <CardHeader className="pb-3 flex flex-row items-center justify-between gap-1">
            <CardTitle className="text-sm font-semibold">Today&apos;s Schedule</CardTitle>
            <Button variant="ghost" size="sm" render={<Link href="/dashboard/scheduling" />}>
              View all
            </Button>
          </CardHeader>
          <CardContent className="space-y-0">
            {todaysSchedule.map((slot, i) => (
              <div
                key={i}
                className="flex items-start gap-3 py-2.5 border-b last:border-0"
                data-testid={`schedule-item-${i}`}
              >
                <span className="text-xs text-muted-foreground w-16 shrink-0 pt-0.5 font-mono">
                  {slot.time}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm leading-tight truncate">{slot.job}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{slot.tech}</p>
                </div>
                <Badge
                  variant={
                    slot.status === "Completed"
                      ? "secondary"
                      : slot.status === "In Progress"
                      ? "default"
                      : "outline"
                  }
                  className="text-[10px] shrink-0"
                >
                  {slot.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
