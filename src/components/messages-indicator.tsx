"use client";

/**
 * Messages Indicator — Glass pill component for the Command Center
 *
 * Shows: envelope icon with tri-state colored dot + assistant icon placeholder.
 * Click envelope → navigates to /dashboard/messages.
 * Fetches from /api/messages/unread.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, Bot } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ORG_ID = process.env.NEXT_PUBLIC_A1NT_ORG_ID || "demo-org";

interface UnreadCounts {
  unread: number;
  read: number;
  resolved: number;
  total: number;
}

function statusDotColor(counts: UnreadCounts): string {
  if (counts.unread > 0) return "bg-red-500";
  if (counts.read > 0) return "bg-amber-400";
  return "bg-emerald-500";
}

function statusLabel(counts: UnreadCounts): string {
  if (counts.unread > 0) return `${counts.unread} unread`;
  if (counts.read > 0) return `${counts.read} read`;
  return "All resolved";
}

export function MessagesIndicator() {
  const router = useRouter();
  const [counts, setCounts] = useState<UnreadCounts>({
    unread: 0,
    read: 0,
    resolved: 0,
    total: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const res = await fetch(
          `/api/messages/unread?orgId=${ORG_ID}&employeeId=demo-employee`
        );
        if (res.ok) {
          setCounts(await res.json());
        }
      } catch {
        // Silently fail — indicator is non-critical
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-xl rounded-lg border border-white/[0.08] px-2.5 py-1.5">
        {/* Messages button */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                onClick={() => router.push("/dashboard/messages")}
                className="relative flex items-center gap-1.5 text-white/60 hover:text-white transition-colors"
              />
            }
          >
            <Mail className="w-4 h-4" />
            <div
              className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border border-black/50 ${statusDotColor(counts)}`}
            />
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">{statusLabel(counts)} — Click to open Messages</p>
          </TooltipContent>
        </Tooltip>

        <div className="w-[1px] h-4 bg-white/[0.08]" />

        {/* AI Assistant placeholder */}
        <Tooltip>
          <TooltipTrigger
            render={
              <button className="flex items-center text-white/30 cursor-default" />
            }
          >
            <Bot className="w-4 h-4" />
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">AI Message Assistant — Coming Soon</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
