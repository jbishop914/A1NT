import { type LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ModulePlaceholderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  priority: "P1" | "P2" | "P3";
  features: string[];
}

export function ModulePlaceholder({
  title,
  description,
  icon: Icon,
  priority,
  features,
}: ModulePlaceholderProps) {
  return (
    <div className="p-6 max-w-[800px]">
      <div className="flex items-start gap-3 mb-6">
        <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-foreground" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            <Badge variant="outline" className="text-[10px]">{priority}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
        <h2 className="text-sm font-medium mb-1">Coming Soon</h2>
        <p className="text-xs text-muted-foreground max-w-md mx-auto mb-6">
          This module is in the build queue. Below is a preview of planned features.
        </p>

        <div className="text-left max-w-sm mx-auto">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Planned Features
          </h3>
          <ul className="space-y-2">
            {features.map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-foreground/25 mt-1.5 shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
