"use client";

import { Settings, Building2, Users, Shield, Bell, Palette, Map, MapPin, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { CommandCenterSettingsPanel } from "@/components/command-center-settings";
import { ServiceAreaSettings } from "@/components/service-area-settings";
import { PaymentSettings } from "@/components/payment-settings";

const settingsSections = [
  {
    id: "command-center",
    icon: Map,
    title: "Command Center",
    description: "Map style, background, logo overlay, default view",
    expandable: true,
  },
  {
    id: "service-area",
    icon: MapPin,
    title: "Service Area",
    description: "Define your service boundary, radius, and business hours",
    expandable: true,
  },
  {
    id: "payments",
    icon: CreditCard,
    title: "Payments",
    description: "Accept online payments, manage Stripe Connect, transaction fees",
    expandable: true,
  },
  {
    id: "organization",
    icon: Building2,
    title: "Organization",
    description: "Company name, address, industry, branding",
  },
  {
    id: "team-roles",
    icon: Users,
    title: "Team & Roles",
    description: "Invite users, manage permissions and roles",
  },
  {
    id: "security",
    icon: Shield,
    title: "Security",
    description: "Authentication, sessions, two-factor setup",
  },
  {
    id: "notifications",
    icon: Bell,
    title: "Notifications",
    description: "Email and in-app notification preferences",
  },
  {
    id: "modules",
    icon: Palette,
    title: "Modules",
    description: "Activate, deactivate, and configure modules",
  },
];

export default function SettingsPage() {
  const [expandedSection, setExpandedSection] = useState<string | null>("command-center");

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
            <div key={section.id}>
              <button
                className="w-full flex items-center gap-4 px-4 py-4 text-left hover:bg-accent/50 transition-colors"
                onClick={() => {
                  if (section.expandable) {
                    setExpandedSection(
                      expandedSection === section.id ? null : section.id
                    );
                  }
                }}
                data-testid={`settings-${section.id}`}
              >
                <section.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{section.title}</p>
                  <p className="text-xs text-muted-foreground">{section.description}</p>
                </div>
              </button>
              {/* Expandable Command Center panel */}
              {section.id === "command-center" && expandedSection === "command-center" && (
                <div className="border-t border-border bg-muted/10">
                  <CommandCenterSettingsPanel />
                </div>
              )}
              {/* Expandable Service Area panel */}
              {section.id === "service-area" && expandedSection === "service-area" && (
                <div className="border-t border-border bg-muted/10">
                  <ServiceAreaSettings />
                </div>
              )}
              {/* Expandable Payments panel */}
              {section.id === "payments" && expandedSection === "payments" && (
                <div className="border-t border-border bg-muted/10">
                  <PaymentSettings />
                </div>
              )}
              {i < settingsSections.length - 1 && <Separator />}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
