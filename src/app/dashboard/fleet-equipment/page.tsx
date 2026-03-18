import { Truck } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export default function FleetEquipmentPage() {
  return (
    <ModulePlaceholder
      title="Fleet & Equipment Management"
      description="Track your trucks, tools, and equipment. Know when things need service."
      icon={Truck}
      priority="P3"
      features={[
        "Vehicle/equipment registry with assigned employees",
        "Maintenance scheduling — mileage or time-based",
        "Fuel tracking and cost analysis",
        "GPS integration for vehicle tracking",
        "Equipment checkout system",
        "Maintenance history and cost tracking per asset",
        "Insurance/registration expiration alerts",
        "Mobile: report equipment issues from the field",
      ]}
    />
  );
}
