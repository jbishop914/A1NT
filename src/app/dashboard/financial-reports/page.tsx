import { BarChart3 } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export default function FinancialReportsPage() {
  return (
    <ModulePlaceholder
      title="Financial Reporting & Analytics"
      description="See the whole picture. Know where every dollar goes."
      icon={BarChart3}
      priority="P3"
      features={[
        "Revenue dashboard — daily to annual views",
        "Profit & loss reporting",
        "Cash flow forecasting",
        "Revenue breakdown by service, technician, region",
        "Labor cost analysis per job and department",
        "Accounts receivable aging",
        "Comparison views — period over period",
        "Customizable report builder with scheduled delivery",
      ]}
    />
  );
}
