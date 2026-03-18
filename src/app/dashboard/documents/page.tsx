import { FileText } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export default function DocumentsPage() {
  return (
    <ModulePlaceholder
      title="Documents & Knowledge Base"
      description="The filing cabinet, training manual, and compliance library in one place."
      icon={FileText}
      priority="P3"
      features={[
        "Document storage with folders and tagging",
        "Template library — contracts, forms, checklists",
        "Knowledge base — SOPs and training materials",
        "Version control for document revisions",
        "Digital signature sending",
        "Custom form builder for intake and inspections",
        "Full-text search across all documents",
        "Client-facing document sharing portal",
      ]}
    />
  );
}
