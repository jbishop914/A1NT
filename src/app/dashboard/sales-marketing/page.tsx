import { Megaphone } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export default function SalesMarketingPage() {
  return (
    <ModulePlaceholder
      title="Sales & Marketing Automation"
      description="Fill the pipeline. Keep clients coming back."
      icon={Megaphone}
      priority="P3"
      features={[
        "Campaign builder — email, SMS, call sequences",
        "Campaign queue from Client Intelligence suggestions",
        "Client segmentation by location, history, spend",
        "Lead pipeline tracking from first contact to conversion",
        "Automated post-service follow-ups and reviews",
        "Estimate/quote management",
        "Referral tracking",
        "ROI tracking per campaign",
      ]}
    />
  );
}
