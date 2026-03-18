import { Package } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export default function InventoryPage() {
  return (
    <ModulePlaceholder
      title="Inventory & Parts Management"
      description="Track what you have, what you need, and what you're using."
      icon={Package}
      priority="P2"
      features={[
        "Item catalog — SKUs, categories, unit costs",
        "Stock levels with low-stock alerts",
        "Multi-location inventory (warehouse/truck/van)",
        "Usage tracking per work order",
        "Purchase orders and supplier management",
        "Cost tracking per job for profitability analysis",
        "Barcode/QR scanning on mobile",
        "Reorder automation at configurable thresholds",
      ]}
    />
  );
}
