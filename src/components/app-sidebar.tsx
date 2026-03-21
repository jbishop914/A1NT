"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  FileText,
  UsersRound,
  Package,
  Phone,
  MapPin,
  TrendingUp,
  BarChart3,
  Truck,
  FolderOpen,
  Globe,
  Settings,
  Building2,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Zap,
  Shield,
  Bot,
  ChevronsRight,
  GraduationCap,
  Layers,
  Headset,
  CreditCard,
  Mail,
  MessageSquare,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────

type NotificationLevel = "none" | "info" | "warning" | "alert" | "critical";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  notifications?: NotificationLevel;
  notificationCount?: number;
  quickLinks?: { label: string; href: string }[];
}

interface NavSection {
  id: string;
  label: string;
  icon: React.ElementType;
  items: NavItem[];
}

// ─── Notification dot colors (blue → yellow → orange → red spectrum) ──

const notificationColors: Record<NotificationLevel, string> = {
  none: "",
  info: "bg-blue-500",
  warning: "bg-amber-400",
  alert: "bg-orange-500",
  critical: "bg-red-500",
};

// ─── Navigation structure ──────────────────────────────────────────

const navSections: NavSection[] = [
  {
    id: "core",
    label: "Core",
    icon: Zap,
    items: [
      {
        label: "Command Center",
        href: "/dashboard",
        icon: LayoutDashboard,
        quickLinks: [
          { label: "Map View", href: "/dashboard" },
          { label: "Camera Feeds", href: "/dashboard#cameras" },
          { label: "Quick Actions", href: "/dashboard#actions" },
        ],
      },
      {
        label: "Client Intelligence",
        href: "/dashboard/clients",
        icon: Users,
        notifications: "info",
        notificationCount: 3,
        quickLinks: [
          { label: "All Clients", href: "/dashboard/clients" },
          { label: "New Lead", href: "/dashboard/clients#new" },
          { label: "Run Analysis", href: "/dashboard/clients#analysis" },
        ],
      },
      {
        label: "Messages",
        href: "/dashboard/messages",
        icon: MessageSquare,
        notifications: "warning",
        notificationCount: 4,
        quickLinks: [
          { label: "Inbox", href: "/dashboard/messages" },
          { label: "Phone", href: "/dashboard/messages#phone" },
          { label: "SMS", href: "/dashboard/messages#sms" },
          { label: "Email", href: "/dashboard/messages#email" },
        ],
      },
    ],
  },
  {
    id: "operations",
    label: "Operations",
    icon: ClipboardList,
    items: [
      {
        label: "Scheduling",
        href: "/dashboard/scheduling",
        icon: Calendar,
        notifications: "warning",
        notificationCount: 5,
        quickLinks: [
          { label: "Today", href: "/dashboard/scheduling" },
          { label: "This Week", href: "/dashboard/scheduling#week" },
          { label: "New Event", href: "/dashboard/scheduling#new" },
        ],
      },
      {
        label: "Work Orders",
        href: "/dashboard/work-orders",
        icon: ClipboardList,
        notifications: "alert",
        notificationCount: 2,
        quickLinks: [
          { label: "Pipeline", href: "/dashboard/work-orders" },
          { label: "New Order", href: "/dashboard/work-orders#new" },
        ],
      },
      {
        label: "Invoicing",
        href: "/dashboard/invoicing",
        icon: FileText,
        notifications: "critical",
        notificationCount: 1,
        quickLinks: [
          { label: "Outstanding", href: "/dashboard/invoicing" },
          { label: "New Invoice", href: "/dashboard/invoicing#new" },
        ],
      },
      {
        label: "Payments",
        href: "/dashboard/payments",
        icon: CreditCard,
        quickLinks: [
          { label: "Transactions", href: "/dashboard/payments" },
          { label: "Payouts", href: "/dashboard/payments#payouts" },
        ],
      },
    ],
  },
  {
    id: "management",
    label: "Management",
    icon: Shield,
    items: [
      {
        label: "Workforce",
        href: "/dashboard/workforce",
        icon: UsersRound,
        quickLinks: [
          { label: "Team", href: "/dashboard/workforce" },
          { label: "Time Tracking", href: "/dashboard/workforce#time" },
        ],
      },
      {
        label: "Inventory",
        href: "/dashboard/inventory",
        icon: Package,
      },
      {
        label: "AI Receptionist",
        href: "/dashboard/ai-receptionist",
        icon: Phone,
        notifications: "info",
        notificationCount: 7,
      },
      {
        label: "Operator",
        href: "/dashboard/operator",
        icon: Headset,
        quickLinks: [
          { label: "Outbound Queue", href: "/dashboard/operator" },
          { label: "Inbound Routing", href: "/dashboard/operator#inbound" },
        ],
      },
      {
        label: "AI Agents",
        href: "/dashboard/ai-agents",
        icon: Bot,
      },
      {
        label: "Infrastructure",
        href: "/dashboard/infrastructure-geo",
        icon: MapPin,
      },
    ],
  },
  {
    id: "growth",
    label: "Growth",
    icon: TrendingUp,
    items: [
      {
        label: "Sales & Marketing",
        href: "/dashboard/sales-marketing",
        icon: TrendingUp,
      },
      {
        label: "Campaigns & Messages",
        href: "/dashboard/email",
        icon: Mail,
      },
      {
        label: "Financial Reports",
        href: "/dashboard/financial-reports",
        icon: BarChart3,
      },
      {
        label: "Fleet & Equipment",
        href: "/dashboard/fleet-equipment",
        icon: Truck,
      },
      {
        label: "Documents",
        href: "/dashboard/documents",
        icon: FolderOpen,
      },
      {
        label: "Website Builder",
        href: "/dashboard/website-builder",
        icon: Globe,
      },
    ],
  },
  {
    id: "platform",
    label: "Platform",
    icon: Layers,
    items: [
      {
        label: "Demo & Training",
        href: "/dashboard/demo-training",
        icon: GraduationCap,
        quickLinks: [
          { label: "Guided Tour", href: "/dashboard/demo-training" },
          { label: "Industry Sandbox", href: "/dashboard/demo-training#sandbox" },
          { label: "Personal Preview", href: "/dashboard/demo-training#preview" },
        ],
      },
    ],
  },
];

// ─── Component ─────────────────────────────────────────────────────

interface AppSidebarProps {
  businessName?: string;
  platformName?: string;
}

export function AppSidebar({
  businessName = "Old Bishop Farm",
  platformName = "A1 Integrations",
}: AppSidebarProps) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Close expanded sidebar on route change
  useEffect(() => {
    setExpanded(false);
    setHoveredSection(null);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  // Get the highest notification level for a section
  const sectionNotification = (section: NavSection): NotificationLevel => {
    const levels: NotificationLevel[] = ["none", "info", "warning", "alert", "critical"];
    let max: NotificationLevel = "none";
    for (const item of section.items) {
      if (item.notifications && levels.indexOf(item.notifications) > levels.indexOf(max)) {
        max = item.notifications;
      }
    }
    return max;
  };

  return (
    <>
      {/* Slide-out tab handle — fixed position so sidebar overflow can't clip it */}
      {!expanded && (
        <button
          onClick={() => setExpanded(true)}
          className="
            fixed z-50 top-1/2 -translate-y-1/2
            w-4 h-12
            bg-neutral-800/80 hover:bg-neutral-700/90
            border-y border-r border-white/[0.08] hover:border-white/[0.15]
            rounded-r-md
            flex items-center justify-center
            transition-all duration-200 ease-out
            group cursor-pointer
          "
          style={{ left: '3.5rem' }}
          data-testid="sidebar-slide-tab"
        >
          <ChevronsRight className="w-3 h-3 text-white/40 group-hover:text-white/70 transition-colors" />
        </button>
      )}

      {/* Backdrop for expanded state */}
      {expanded && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px]"
          onClick={() => setExpanded(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-40
          flex flex-col
          bg-black/40 backdrop-blur-2xl
          border-r border-white/[0.06]
          transition-all duration-300 ease-out
          ${expanded ? "w-64" : "w-14"}
        `}
        onMouseLeave={() => {
          if (!expanded) {
            setHoveredSection(null);
            setHoveredItem(null);
          }
        }}
      >

        {/* ── Header: Business name ── */}
        <div className="h-14 flex items-center px-3 border-b border-white/[0.06] shrink-0">
          {expanded ? (
            <div className="flex items-center justify-between w-full">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {businessName}
                </p>
                <p className="text-[10px] text-white/40 truncate">
                  Powered by {platformName}
                </p>
              </div>
              <button
                onClick={() => setExpanded(false)}
                className="p-1 rounded hover:bg-white/10 transition-colors shrink-0 ml-2"
                data-testid="sidebar-collapse"
              >
                <PanelLeftClose className="w-4 h-4 text-white/50" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setExpanded(true)}
              className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center hover:bg-white/15 transition-colors mx-auto"
              data-testid="sidebar-expand"
            >
              <Building2 className="w-4 h-4 text-white/70" />
            </button>
          )}
        </div>

        {/* ── Navigation ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-none">
          {navSections.map((section) => {
            const sectionNotif = sectionNotification(section);
            const SectionIcon = section.icon;

            return (
              <div key={section.id} className="mb-1">
                {/* Section header — only visible when expanded */}
                {expanded ? (
                  <div className="px-3 py-1.5">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-white/30">
                      {section.label}
                    </p>
                  </div>
                ) : (
                  /* Collapsed: section icon as divider */
                  <div
                    className="flex justify-center py-1.5 relative"
                    onMouseEnter={() => setHoveredSection(section.id)}
                  >
                    <div className="w-6 h-[1px] bg-white/[0.06]" />
                    {sectionNotif !== "none" && (
                      <div
                        className={`absolute right-2 top-1.5 w-1.5 h-1.5 rounded-full ${notificationColors[sectionNotif]}`}
                      />
                    )}
                  </div>
                )}

                {/* Nav items */}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <div
                      key={item.href}
                      className="relative"
                      onMouseEnter={() => !expanded && setHoveredItem(item.href)}
                      onMouseLeave={() => !expanded && setHoveredItem(null)}
                    >
                      <Link
                        href={item.href}
                        className={`
                          flex items-center gap-3 mx-1.5 rounded-md transition-all duration-150
                          ${expanded ? "px-2.5 py-1.5" : "px-0 py-1.5 justify-center"}
                          ${
                            active
                              ? "bg-white/10 text-white"
                              : "text-white/50 hover:text-white/80 hover:bg-white/[0.05]"
                          }
                        `}
                        data-testid={`nav-${item.href.split("/").pop()}`}
                      >
                        <div className="relative shrink-0">
                          <Icon className={`w-4 h-4 ${active ? "text-white" : ""}`} />
                          {/* Notification dot */}
                          {item.notifications && item.notifications !== "none" && (
                            <div
                              className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-black/50 ${notificationColors[item.notifications]}`}
                            />
                          )}
                        </div>

                        {expanded && (
                          <>
                            <span className="text-sm truncate flex-1">{item.label}</span>
                            {item.notificationCount && item.notificationCount > 0 && (
                              <span
                                className={`
                                  text-[10px] font-mono px-1.5 py-0.5 rounded-full
                                  ${
                                    item.notifications === "critical"
                                      ? "bg-red-500/20 text-red-400"
                                      : item.notifications === "alert"
                                        ? "bg-orange-500/20 text-orange-400"
                                        : item.notifications === "warning"
                                          ? "bg-amber-400/20 text-amber-400"
                                          : "bg-blue-500/20 text-blue-400"
                                  }
                                `}
                              >
                                {item.notificationCount}
                              </span>
                            )}
                          </>
                        )}
                      </Link>

                      {/* ── Tooltip / Quick links flyout (collapsed state) ── */}
                      {!expanded && hoveredItem === item.href && (
                        <div
                          className="
                            absolute left-full top-0 ml-2 z-50
                            bg-black/80 backdrop-blur-xl border border-white/10
                            rounded-lg shadow-2xl shadow-black/50
                            py-2 px-3 min-w-[180px]
                            animate-in fade-in slide-in-from-left-2 duration-150
                          "
                        >
                          <p className="text-sm font-medium text-white mb-0.5">
                            {item.label}
                          </p>
                          {item.quickLinks && item.quickLinks.length > 0 && (
                            <div className="mt-1.5 pt-1.5 border-t border-white/[0.06] space-y-0.5">
                              {item.quickLinks.map((ql) => (
                                <Link
                                  key={ql.href}
                                  href={ql.href}
                                  className="flex items-center gap-1.5 py-1 text-xs text-white/50 hover:text-white/80 transition-colors"
                                >
                                  <ChevronRight className="w-3 h-3" />
                                  {ql.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* ── Footer ── */}
        <div className="border-t border-white/[0.06] py-2 shrink-0">
          <Link
            href="/dashboard/settings"
            className={`
              flex items-center gap-3 mx-1.5 rounded-md transition-all duration-150
              ${expanded ? "px-2.5 py-1.5" : "px-0 py-1.5 justify-center"}
              ${
                isActive("/dashboard/settings")
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white/80 hover:bg-white/[0.05]"
              }
            `}
            data-testid="nav-settings"
          >
            <Settings className="w-4 h-4 shrink-0" />
            {expanded && <span className="text-sm">Settings</span>}
          </Link>

          {/* Expand toggle in footer when collapsed */}
          {!expanded && (
            <button
              onClick={() => setExpanded(true)}
              className="flex items-center justify-center w-full py-1.5 mt-1 text-white/30 hover:text-white/50 transition-colors"
              data-testid="sidebar-expand-footer"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
