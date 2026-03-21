"use client";

/**
 * Unified Messages Inbox — Phase 1
 *
 * Two-panel layout:
 * Left: Thread list with tri-state dots, channel icons, search, filter tabs
 * Right: Thread detail with conversation timeline
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Phone,
  MessageSquare,
  Mail,
  Search,
  CheckCircle2,
  Circle,
  ArrowDownLeft,
  ArrowUpRight,
  Voicemail,
  Loader2,
  RefreshCw,
  Send,
  Bot,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ORG_ID = process.env.NEXT_PUBLIC_A1NT_ORG_ID || "demo-org";
const POLL_INTERVAL = 30_000; // 30s

// ─── Types ────────────────────────────────────────────────────────

interface ThreadSummary {
  id: string;
  contactName: string;
  contactPhone: string | null;
  contactEmail: string | null;
  channel: "PHONE" | "SMS" | "EMAIL";
  subject: string | null;
  preview: string | null;
  lastMessageAt: string;
  messageCount: number;
  readStatus: "UNREAD" | "READ" | "RESOLVED";
  latestMessage: {
    id: string;
    channel: string;
    direction: string;
    body: string;
    preview: string | null;
    createdAt: string;
    hasVoicemail: boolean;
  } | null;
}

interface ThreadMessage {
  id: string;
  channel: "PHONE" | "SMS" | "EMAIL";
  direction: "INBOUND" | "OUTBOUND";
  body: string;
  preview: string | null;
  subject: string | null;
  hasVoicemail: boolean;
  transcription: string | null;
  createdAt: string;
}

interface ThreadDetail {
  id: string;
  contactName: string;
  contactPhone: string | null;
  contactEmail: string | null;
  channel: "PHONE" | "SMS" | "EMAIL";
  subject: string | null;
  messages: ThreadMessage[];
}

// ─── Helpers ──────────────────────────────────────────────────────

const CHANNEL_ICON: Record<string, React.ElementType> = {
  PHONE: Phone,
  SMS: MessageSquare,
  EMAIL: Mail,
};

const CHANNEL_LABEL: Record<string, string> = {
  PHONE: "Phone",
  SMS: "SMS",
  EMAIL: "Email",
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function readStatusDot(status: string): string {
  switch (status) {
    case "UNREAD":
      return "bg-red-500";
    case "READ":
      return "bg-amber-400";
    case "RESOLVED":
      return "bg-emerald-500";
    default:
      return "bg-red-500";
  }
}

// ─── Thread List Panel ────────────────────────────────────────────

function ThreadListPanel({
  threads,
  activeId,
  onSelect,
  filter,
  setFilter,
  search,
  setSearch,
  loading,
  onRefresh,
}: {
  threads: ThreadSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  filter: string;
  setFilter: (f: string) => void;
  search: string;
  setSearch: (s: string) => void;
  loading: boolean;
  onRefresh: () => void;
}) {
  return (
    <div className="flex flex-col h-full border-r border-white/[0.06]">
      {/* Header */}
      <div className="p-3 border-b border-white/[0.06] space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Messages</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/40 hover:text-white"
            onClick={onRefresh}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            type="text"
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/[0.05] border border-white/[0.08] rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 transition-colors"
          />
        </div>

        {/* Filter tabs */}
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList className="w-full bg-white/[0.04] h-8">
            <TabsTrigger value="all" className="text-[11px] flex-1 data-[state=active]:bg-white/10">
              All
            </TabsTrigger>
            <TabsTrigger value="phone" className="text-[11px] flex-1 data-[state=active]:bg-white/10">
              <Phone className="w-3 h-3 mr-1" />
              Phone
            </TabsTrigger>
            <TabsTrigger value="sms" className="text-[11px] flex-1 data-[state=active]:bg-white/10">
              <MessageSquare className="w-3 h-3 mr-1" />
              SMS
            </TabsTrigger>
            <TabsTrigger value="email" className="text-[11px] flex-1 data-[state=active]:bg-white/10">
              <Mail className="w-3 h-3 mr-1" />
              Email
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Thread list */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        {threads.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-white/30 gap-2">
            <Inbox className="w-8 h-8" />
            <p className="text-xs">No messages yet</p>
            <p className="text-[10px] text-white/20">Use the seed endpoint to add sample data</p>
          </div>
        )}
        {threads.map((thread) => {
          const ChannelIcon = CHANNEL_ICON[thread.channel] || MessageSquare;
          const isActive = thread.id === activeId;

          return (
            <button
              key={thread.id}
              onClick={() => onSelect(thread.id)}
              className={`
                w-full text-left px-3 py-2.5 border-b border-white/[0.04] transition-colors
                ${isActive ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"}
              `}
            >
              <div className="flex items-start gap-2.5">
                {/* Read status dot */}
                <div className="mt-1.5 shrink-0">
                  <div
                    className={`w-2 h-2 rounded-full ${readStatusDot(thread.readStatus)}`}
                  />
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <ChannelIcon className="w-3 h-3 text-white/40 shrink-0" />
                      <span
                        className={`text-xs truncate ${
                          thread.readStatus === "UNREAD"
                            ? "font-semibold text-white"
                            : "text-white/70"
                        }`}
                      >
                        {thread.contactName}
                      </span>
                    </div>
                    <span className="text-[10px] text-white/30 shrink-0">
                      {formatRelativeTime(thread.lastMessageAt)}
                    </span>
                  </div>

                  {thread.subject && (
                    <p className="text-[11px] text-white/50 truncate mt-0.5">
                      {thread.subject}
                    </p>
                  )}

                  <p className="text-[11px] text-white/30 truncate mt-0.5">
                    {thread.preview || "No preview"}
                  </p>

                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="outline"
                      className="text-[9px] px-1.5 py-0 border-white/10 text-white/40"
                    >
                      {CHANNEL_LABEL[thread.channel]}
                    </Badge>
                    <span className="text-[9px] text-white/20">
                      {thread.messageCount} msg{thread.messageCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Thread Detail Panel ──────────────────────────────────────────

function ThreadDetailPanel({
  thread,
  loading,
  onMarkResolved,
}: {
  thread: ThreadDetail | null;
  loading: boolean;
  onMarkResolved: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [thread?.messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/30 gap-2">
        <MessageSquare className="w-10 h-10" />
        <p className="text-sm">Select a conversation</p>
        <p className="text-xs text-white/20">Choose a thread from the list to view messages</p>
      </div>
    );
  }

  // Group messages by date
  const messagesByDate: Record<string, ThreadMessage[]> = {};
  for (const msg of thread.messages) {
    const dateKey = formatDate(msg.createdAt);
    if (!messagesByDate[dateKey]) messagesByDate[dateKey] = [];
    messagesByDate[dateKey].push(msg);
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-white truncate">
            {thread.contactName}
          </h3>
          <div className="flex items-center gap-2 mt-0.5">
            {thread.contactPhone && (
              <span className="text-[10px] text-white/40">{thread.contactPhone}</span>
            )}
            {thread.contactEmail && (
              <span className="text-[10px] text-white/40">{thread.contactEmail}</span>
            )}
          </div>
          {thread.subject && (
            <p className="text-xs text-white/50 mt-0.5 truncate">{thread.subject}</p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            className="text-[11px] h-7 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
            onClick={onMarkResolved}
          >
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Resolve
          </Button>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-[11px] h-7 border-white/10 text-white/40"
                    disabled
                  />
                }
              >
                <Send className="w-3 h-3 mr-1" />
                Reply
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Reply coming in Phase 2</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Messages timeline */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-none px-4 py-3">
        {Object.entries(messagesByDate).map(([date, msgs]) => (
          <div key={date}>
            {/* Date separator */}
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-[1px] bg-white/[0.06]" />
              <span className="text-[10px] text-white/30 font-medium">{date}</span>
              <div className="flex-1 h-[1px] bg-white/[0.06]" />
            </div>

            {/* Messages */}
            {msgs.map((msg) => {
              const ChannelIcon = CHANNEL_ICON[msg.channel] || MessageSquare;
              const isInbound = msg.direction === "INBOUND";

              return (
                <div
                  key={msg.id}
                  className={`flex mb-3 ${isInbound ? "justify-start" : "justify-end"}`}
                >
                  <div
                    className={`
                      max-w-[75%] rounded-lg px-3 py-2
                      ${
                        isInbound
                          ? "bg-white/[0.06] border border-white/[0.08]"
                          : "bg-blue-500/15 border border-blue-500/20"
                      }
                    `}
                  >
                    {/* Channel + direction indicator */}
                    <div className="flex items-center gap-1.5 mb-1">
                      <ChannelIcon className="w-3 h-3 text-white/30" />
                      {isInbound ? (
                        <ArrowDownLeft className="w-3 h-3 text-white/30" />
                      ) : (
                        <ArrowUpRight className="w-3 h-3 text-blue-400/50" />
                      )}
                      <span className="text-[9px] text-white/30">
                        {CHANNEL_LABEL[msg.channel]} · {formatTime(msg.createdAt)}
                      </span>
                    </div>

                    {/* Subject line for emails */}
                    {msg.subject && (
                      <p className="text-[11px] font-medium text-white/60 mb-1">
                        {msg.subject}
                      </p>
                    )}

                    {/* Message body */}
                    <p className="text-xs text-white/80 whitespace-pre-wrap leading-relaxed">
                      {msg.body}
                    </p>

                    {/* Voicemail indicator */}
                    {msg.hasVoicemail && (
                      <div className="mt-2 pt-2 border-t border-white/[0.06]">
                        <div className="flex items-center gap-1.5">
                          <Voicemail className="w-3 h-3 text-amber-400" />
                          <span className="text-[10px] text-amber-400 font-medium">
                            Voicemail
                          </span>
                        </div>
                        {msg.transcription && (
                          <p className="text-[11px] text-white/50 mt-1 italic">
                            &ldquo;{msg.transcription}&rdquo;
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Reply bar (disabled for Phase 1) */}
      <div className="px-4 py-3 border-t border-white/[0.06]">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              render={
                <div className="flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 opacity-50 cursor-not-allowed" />
              }
            >
              <Circle className="w-3.5 h-3.5 text-white/20" />
              <span className="text-xs text-white/20">
                Reply functionality coming in Phase 2...
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Reply, draft, and AI-suggested responses coming in Phase 2</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────

export default function MessagesPage() {
  const [threads, setThreads] = useState<ThreadSummary[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [activeThread, setActiveThread] = useState<ThreadDetail | null>(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Fetch threads
  const fetchThreads = useCallback(async () => {
    try {
      const params = new URLSearchParams({ orgId: ORG_ID });
      if (filter !== "all") params.set("filter", filter);
      if (search) params.set("search", search);

      const res = await fetch(`/api/messages/threads?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setThreads(data.threads || []);
    } catch {
      console.error("Failed to fetch threads");
    } finally {
      setLoadingList(false);
    }
  }, [filter, search]);

  // Fetch thread detail
  const fetchThreadDetail = useCallback(async (id: string) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/messages/threads/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setActiveThread(data.thread);

      // Mark as read
      await fetch(`/api/messages/threads/${id}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: "demo-employee", status: "READ" }),
      }).catch(() => {});
    } catch {
      console.error("Failed to fetch thread detail");
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  // Initial load + polling
  useEffect(() => {
    fetchThreads();
    const interval = setInterval(fetchThreads, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchThreads]);

  // Fetch detail when active thread changes
  useEffect(() => {
    if (activeThreadId) {
      fetchThreadDetail(activeThreadId);
    } else {
      setActiveThread(null);
    }
  }, [activeThreadId, fetchThreadDetail]);

  const handleMarkResolved = async () => {
    if (!activeThreadId) return;
    await fetch(`/api/messages/threads/${activeThreadId}/read`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ employeeId: "demo-employee", status: "RESOLVED" }),
    }).catch(() => {});
    // Update local state
    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId ? { ...t, readStatus: "RESOLVED" } : t
      )
    );
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] bg-black/20 rounded-lg border border-white/[0.06] overflow-hidden">
      {/* Left panel: Thread list */}
      <div className="w-[360px] shrink-0">
        <ThreadListPanel
          threads={threads}
          activeId={activeThreadId}
          onSelect={setActiveThreadId}
          filter={filter}
          setFilter={setFilter}
          search={search}
          setSearch={setSearch}
          loading={loadingList}
          onRefresh={() => {
            setLoadingList(true);
            fetchThreads();
          }}
        />
      </div>

      {/* Right panel: Thread detail */}
      <div className="flex-1 min-w-0">
        <ThreadDetailPanel
          thread={activeThread}
          loading={loadingDetail}
          onMarkResolved={handleMarkResolved}
        />
      </div>
    </div>
  );
}
