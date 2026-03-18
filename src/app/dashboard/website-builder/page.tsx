import { Globe } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export default function WebsiteBuilderPage() {
  return (
    <ModulePlaceholder
      title="Website Builder & Manager"
      description="An in-house website creator that gives every client a professional web presence connected in real-time to their Command Center."
      icon={Globe}
      priority="P3"
      features={[
        "Tier 1 — Static marketing site with live data from A1NT modules",
        "Industry-specific templates — constrained builder prevents ugly results",
        "Real-time sync — hours, services, team, promotions, service area map",
        "Custom domain + SSL, SEO basics, analytics dashboard",
        "Tier 2 — Customer portal: login, view invoices, pay, request service",
        "Tier 3 — Premium SaaS portal: subscriptions, route tracking, API access",
        "Builder interface — template gallery, section toggle, content editing, preview",
        "Auto-update from Sales & Marketing, Scheduling, Geo modules",
      ]}
    />
  );
}
