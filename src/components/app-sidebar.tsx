"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  Receipt,
  UserCog,
  Package,
  Phone,
  Megaphone,
  BarChart3,
  Truck,
  FileText,
  ChevronDown,
  Settings,
  Building2,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const coreModules = [
  {
    title: "Command Center",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Client Intelligence",
    href: "/dashboard/clients",
    icon: Users,
  },
];

const operationsModules = [
  {
    title: "Scheduling",
    href: "/dashboard/scheduling",
    icon: Calendar,
  },
  {
    title: "Work Orders",
    href: "/dashboard/work-orders",
    icon: ClipboardList,
  },
  {
    title: "Invoicing",
    href: "/dashboard/invoicing",
    icon: Receipt,
  },
];

const managementModules = [
  {
    title: "Workforce",
    href: "/dashboard/workforce",
    icon: UserCog,
  },
  {
    title: "Inventory",
    href: "/dashboard/inventory",
    icon: Package,
  },
  {
    title: "AI Receptionist",
    href: "/dashboard/ai-receptionist",
    icon: Phone,
  },
];

const growthModules = [
  {
    title: "Sales & Marketing",
    href: "/dashboard/sales-marketing",
    icon: Megaphone,
  },
  {
    title: "Financial Reports",
    href: "/dashboard/financial-reports",
    icon: BarChart3,
  },
  {
    title: "Fleet & Equipment",
    href: "/dashboard/fleet-equipment",
    icon: Truck,
  },
  {
    title: "Documents",
    href: "/dashboard/documents",
    icon: FileText,
  },
];

function NavGroup({
  label,
  items,
  pathname,
  defaultOpen = true,
}: {
  label: string;
  items: typeof coreModules;
  pathname: string;
  defaultOpen?: boolean;
}) {
  const hasActiveItem = items.some(
    (item) =>
      pathname === item.href ||
      (item.href !== "/dashboard" && pathname.startsWith(item.href))
  );

  return (
    <Collapsible defaultOpen={defaultOpen || hasActiveItem} className="group/collapsible">
      <SidebarGroup>
        <SidebarGroupLabel asChild>
          <CollapsibleTrigger className="flex w-full items-center justify-between gap-1">
            <span>{label}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground transition-transform group-data-[state=open]/collapsible:rotate-180" />
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" && pathname.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      data-testid={`nav-${item.href.split("/").pop()}`}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5"
          data-testid="link-logo"
        >
          {/* A1NT Logo — geometric monochrome mark */}
          <svg
            width="28"
            height="28"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="A1 Integrations"
          >
            <rect
              x="2"
              y="2"
              width="24"
              height="24"
              rx="6"
              fill="currentColor"
              className="text-foreground"
            />
            <path
              d="M10 18L14 8L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-background"
            />
            <path
              d="M11.5 15H16.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              className="text-background"
            />
          </svg>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-foreground leading-none">
              A1 Integrations
            </span>
            <span className="text-[11px] text-muted-foreground leading-tight mt-0.5">
              Business Operations
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <NavGroup label="Core" items={coreModules} pathname={pathname} />
        <NavGroup
          label="Operations"
          items={operationsModules}
          pathname={pathname}
        />
        <NavGroup
          label="Management"
          items={managementModules}
          pathname={pathname}
          defaultOpen={false}
        />
        <NavGroup
          label="Growth & Analytics"
          items={growthModules}
          pathname={pathname}
          defaultOpen={false}
        />
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname === "/dashboard/settings"}
              data-testid="nav-settings"
            >
              <Link href="/dashboard/settings">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild data-testid="nav-organization">
              <Link href="/dashboard/settings">
                <Building2 className="h-4 w-4" />
                <span className="truncate">Acme Plumbing Co.</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
