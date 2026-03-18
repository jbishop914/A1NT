import { Calendar } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export default function SchedulingPage() {
  return (
    <ModulePlaceholder
      title="Scheduling & Dispatching"
      description="The operational heartbeat. Where jobs get assigned, routes get optimized, and the day gets organized."
      icon={Calendar}
      priority="P1"
      features={[
        "Calendar view (day/week/month) with drag-and-drop",
        "Job assignment by skill, availability, location",
        "Route optimization with map view",
        "Dispatch board — real-time crew tracking",
        "Recurring job scheduling",
        "Conflict detection and overtime alerts",
        "Customer-facing booking widget",
        "Mobile: today's schedule with navigation",
      ]}
    />
  );
}
