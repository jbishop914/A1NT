"use client";

/* ─── Operator Module ──────────────────────────────────────────────────────
   Phone system nerve center. Three tabs:
   1. Outbound Queue  — manage, queue, and monitor outbound calls
   2. Inbound Routing — routing rules, overrides, schedule
   3. IVR / Menus     — (Phase 2) IVR menu builder
   ──────────────────────────────────────────────────────────────────────── */

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Headset,
  PhoneOutgoing,
  PhoneIncoming,
  Menu,
} from "lucide-react";
import OutboundQueueTab from "@/components/operator/outbound-queue-tab";
import InboundRoutingTab from "@/components/operator/inbound-routing-tab";

// ─── Tab Types ────────────────────────────────────────────────────

type OperatorTab = "outbound" | "inbound" | "ivr";

// ─── IVR Placeholder ─────────────────────────────────────────────

function IvrPlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6">
      <div className="w-16 h-16 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mb-6">
        <Menu className="w-8 h-8 text-zinc-500" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-200 mb-2">
        IVR Menu System
      </h3>
      <p className="text-sm text-zinc-500 text-center max-w-md mb-8">
        Build and manage your phone menu tree. Assign keypad numbers to
        departments, record greeting messages, test the full call flow, and
        set up department routing — all from one visual editor.
      </p>
      <div className="grid grid-cols-2 gap-3 max-w-sm w-full">
        {[
          { label: "Menu Tree Builder", desc: "Visual drag-and-drop" },
          { label: "Keypad Assignments", desc: "Press 1 for Sales, etc." },
          { label: "Message Recording", desc: "Upload, record, or TTS" },
          { label: "Test & Preview", desc: "Simulate a call-in" },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3"
          >
            <p className="text-xs font-medium text-zinc-300">{item.label}</p>
            <p className="text-xs text-zinc-600 mt-0.5">{item.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 px-4 py-2 rounded-full bg-zinc-800/30 border border-zinc-800">
        <span className="text-xs text-zinc-500">Coming in Phase 2</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────

export default function OperatorPage() {
  const [activeTab, setActiveTab] = useState<OperatorTab>("outbound");

  return (
    <div className="flex flex-col gap-4 p-4 md:p-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center">
            <Headset className="w-5 h-5 text-zinc-300" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zinc-100">Operator</h1>
            <p className="text-xs text-zinc-500">
              Phone system command center
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab((v ?? "outbound") as OperatorTab)}
        data-testid="operator-tabs"
      >
        <TabsList className="h-9 bg-zinc-900/50 border border-zinc-800">
          <TabsTrigger
            value="outbound"
            className="text-xs px-4 gap-1.5"
            data-testid="tab-outbound"
          >
            <PhoneOutgoing className="w-3.5 h-3.5" />
            Outbound Queue
          </TabsTrigger>
          <TabsTrigger
            value="inbound"
            className="text-xs px-4 gap-1.5"
            data-testid="tab-inbound"
          >
            <PhoneIncoming className="w-3.5 h-3.5" />
            Inbound Routing
          </TabsTrigger>
          <TabsTrigger
            value="ivr"
            className="text-xs px-4 gap-1.5"
            data-testid="tab-ivr"
          >
            <Menu className="w-3.5 h-3.5" />
            IVR / Menus
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Tab Content */}
      <div className="min-h-0">
        {activeTab === "outbound" && <OutboundQueueTab />}
        {activeTab === "inbound" && <InboundRoutingTab />}
        {activeTab === "ivr" && <IvrPlaceholder />}
      </div>
    </div>
  );
}
