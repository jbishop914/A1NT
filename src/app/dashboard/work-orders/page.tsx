import { ClipboardList } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export default function WorkOrdersPage() {
  return (
    <ModulePlaceholder
      title="Work Orders & Job Tracking"
      description="Every job from intake to completion to payment. The digital replacement for paper work orders."
      icon={ClipboardList}
      priority="P1"
      features={[
        "Status pipeline: New → Assigned → In Progress → Completed → Invoiced",
        "Photo attachments — before/after documentation",
        "Technician notes and internal comments",
        "Material/parts tracking per job",
        "Customer signature capture (mobile)",
        "Automatic invoice generation from completed orders",
        "Template-specific fields per industry",
        "Full audit trail per work order",
      ]}
    />
  );
}
