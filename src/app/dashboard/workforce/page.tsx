import { UserCog } from "lucide-react";
import { ModulePlaceholder } from "@/components/module-placeholder";

export default function WorkforcePage() {
  return (
    <ModulePlaceholder
      title="Employee & Workforce Management"
      description="Know your team. Manage their time. Track their certifications."
      icon={UserCog}
      priority="P2"
      features={[
        "Employee directory with profiles and skills",
        "Availability and PTO management",
        "Time tracking — clock in/out, hours per job",
        "Skill/certification tracking with expiration alerts",
        "Performance metrics per technician",
        "Payroll data export",
        "Organizational chart / team structure",
        "Onboarding checklists for new hires",
      ]}
    />
  );
}
