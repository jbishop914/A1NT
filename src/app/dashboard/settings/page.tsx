import { Settings, Building2, Users, Shield, Bell, Palette } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const settingsSections = [
  {
    icon: Building2,
    title: "Organization",
    description: "Company name, address, industry, branding",
  },
  {
    icon: Users,
    title: "Team & Roles",
    description: "Invite users, manage permissions and roles",
  },
  {
    icon: Shield,
    title: "Security",
    description: "Authentication, sessions, two-factor setup",
  },
  {
    icon: Bell,
    title: "Notifications",
    description: "Email and in-app notification preferences",
  },
  {
    icon: Palette,
    title: "Modules",
    description: "Activate, deactivate, and configure modules",
  },
];

export default function SettingsPage() {
  return (
    <div className="p-6 max-w-[800px]">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
          <Settings className="h-5 w-5 text-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your organization and platform preferences</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {settingsSections.map((section, i) => (
            <div key={section.title}>
              <button
                className="w-full flex items-center gap-4 px-4 py-4 text-left hover:bg-accent/50 transition-colors"
                data-testid={`settings-${section.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <section.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{section.title}</p>
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                </div>
              </button>
              {i < settingsSections.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
