import { MapPin } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export default function InfrastructureGeoPage() {
  return (
    <ModulePlaceholder
      title="Infrastructure & Geo"
      description="The spatial brain of the platform. A layered map/GIS system for managing client locations, your own facilities, incidents, and compliance."
      icon={MapPin}
      priority="P2"
      features={[
        "Core map engine — satellite, street, terrain via Mapbox GL JS",
        "Client location directory with filter, cluster, and drill-down",
        "Site-level sticky pins — hazards, access notes, equipment locations",
        "Drawing tools — polygons, lines, freehand annotations, geometry",
        "Incident tracking with precise geolocation and compliance audit trail",
        "Workers' comp injury reports with OSHA fields and auto-archiving",
        "In-house facility management — utilities, inspections, emergency protocols",
        "3D Digital Twin (premium) — Three.js building model, virtual onboarding",
        "Cross-module layers — dispatch routes, fleet tracking, work order pins",
      ]}
    />
  );
}
