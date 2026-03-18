"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const routeLabels: Record<string, string> = {
  dashboard: "Command Center",
  clients: "Client Intelligence",
  scheduling: "Scheduling",
  "work-orders": "Work Orders",
  invoicing: "Invoicing",
  workforce: "Workforce",
  inventory: "Inventory",
  "ai-receptionist": "AI Receptionist",
  "sales-marketing": "Sales & Marketing",
  "financial-reports": "Financial Reports",
  "fleet-equipment": "Fleet & Equipment",
  documents: "Documents",
  settings: "Settings",
};

export function BreadcrumbNav() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length <= 1) {
    return (
      <nav aria-label="breadcrumb" className="flex items-center">
        <span className="text-sm font-medium text-foreground">
          Command Center
        </span>
      </nav>
    );
  }

  const breadcrumbs = segments.map((segment, index) => {
    const href = "/" + segments.slice(0, index + 1).join("/");
    const label = routeLabels[segment] || segment;
    const isLast = index === segments.length - 1;

    return { href, label, isLast };
  });

  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-sm">
      {breadcrumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1.5">
          {i > 0 && (
            <span className="text-muted-foreground/60">/</span>
          )}
          {crumb.isLast ? (
            <span className="font-medium text-foreground">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
