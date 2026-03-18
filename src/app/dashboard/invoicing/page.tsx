import { Receipt } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export default function InvoicingPage() {
  return (
    <ModulePlaceholder
      title="Invoicing & Payments"
      description="Get paid. Cleanly. Automatically when possible."
      icon={Receipt}
      priority="P1"
      features={[
        "Invoice creation — manual or auto-generated from work orders",
        "Status tracking: Draft → Sent → Viewed → Paid → Overdue",
        "Stripe payment processing",
        "Recurring invoices for maintenance clients",
        "Automated overdue reminders",
        "Client payment portal",
        "Batch invoicing for multiple jobs",
        "Export to CSV/PDF for accountant handoff",
      ]}
    />
  );
}
