# P2 Module Build Guide

## Design System (CRITICAL — follow exactly)

- **Framework:** Next.js 16 + React 19 + TypeScript, App Router, `src/` directory
- **CSS:** Tailwind v4 + shadcn v4. Uses `@import "tailwindcss"`, `@theme inline`, oklch colors
- **shadcn v4 uses Base UI** (`@base-ui/react`) — NOT Radix. **NO `asChild` prop.** Use `render={<Component />}` or direct children.
- **Base UI Select** `onValueChange` passes `string | null` — always null-coalesce: `(v) => setState(v ?? "all")`
- **Font:** Geist (literal values in @theme inline, NOT var references)

## Aesthetic

Josh's direction: "Nuxt UI Pro style — clean, minimal, professional, elegant. Color sparingly and intentionally. Monochrome symbols/icons."

- oklch color tokens from globals.css
- Monochrome icons from `lucide-react`
- `font-mono` for numbers, dates, currency, codes
- `text-[10px]` for tiny labels, `text-xs` for body, `text-sm` for slightly larger
- Status badges: emerald=positive, blue=info, amber=warning, red=alert, secondary=neutral
- Sheet (slide-out) for detail views with uppercase tracking-wider section labels + Separator between sections
- KPI cards at top: 4-column grid with icon, label, value, change indicator
- Search + filter toolbar pattern
- `data-testid` on all interactive elements

## Page Structure Pattern (from P1 modules)

```tsx
"use client";
import { useState, useMemo } from "react";
// ... lucide icons, shadcn components, sample data

export default function ModulePage() {
  // State for filters, active items, sheet open, tabs
  // useMemo for filtered/computed data
  // KPI cards, toolbar, main content, detail sheet
}
```

## Component Imports

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import Link from "next/link";
```

## File Locations

- Pages: `src/app/dashboard/{module-slug}/page.tsx`
- Sample data: `src/lib/sample-data-p2.ts`
- Existing P1 example: `src/app/dashboard/scheduling/page.tsx`

## Key Patterns

1. **Wrapper:** `<div className="p-6 space-y-6 max-w-[1400px]">`
2. **Page title:** `<h1 className="text-lg font-semibold">Module Name</h1>` with subtitle
3. **KPI grid:** `grid grid-cols-4 gap-4` with Card components
4. **Toolbar:** flex row with Search input, filter Selects, action Button
5. **Main content:** Table or grid view with row click → Sheet detail
6. **Sheet detail:** SheetContent with sections separated by `<Separator />`
7. **Cross-module links:** `<Link href="/dashboard/work-orders">` etc.
8. **Currency format:** `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` in `font-mono`
