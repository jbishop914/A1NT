"use client";

/**
 * Campaigns & Messages Dashboard
 * 
 * Three tabs:
 * 1. Campaigns — Create, manage, and send marketing campaigns (email, SMS, or both)
 * 2. Contacts — Audience management, sync from CRM
 * 3. Message Log — Full delivery history for email + SMS with combined stats
 */

import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Send,
  Plus,
  Users,
  Activity,
  Search,
  MoreHorizontal,
  Trash2,
  Eye,
  Play,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  UserPlus,
  Inbox,
  MailOpen,
  MousePointerClick,
  AlertTriangle,
  FileText,
  ChevronLeft,
  Smartphone,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ORG_ID = process.env.NEXT_PUBLIC_A1NT_ORG_ID || "demo-org";

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function EmailDashboard() {
  const [activeTab, setActiveTab] = useState("campaigns");

  return (
    <div className="p-6 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Campaigns & Messages</h1>
            <p className="text-sm text-muted-foreground">
              Send email and SMS campaigns, manage contacts, track delivery
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="campaigns" className="gap-1.5" data-testid="tab-campaigns">
            <Send className="h-3.5 w-3.5" /> Campaigns
          </TabsTrigger>
          <TabsTrigger value="contacts" className="gap-1.5" data-testid="tab-contacts">
            <Users className="h-3.5 w-3.5" /> Contacts
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-1.5" data-testid="tab-logs">
            <Activity className="h-3.5 w-3.5" /> Message Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns">
          <CampaignsTab />
        </TabsContent>
        <TabsContent value="contacts">
          <ContactsTab />
        </TabsContent>
        <TabsContent value="logs">
          <MessageLogTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================================================
// CAMPAIGNS TAB
// ============================================================================

type CampaignChannel = "EMAIL" | "SMS" | "BOTH";

function CampaignsTab() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);
  const [sending, setSending] = useState<string | null>(null);

  // New campaign form
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<CampaignChannel>("EMAIL");
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("");
  const [smsBody, setSmsBody] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/email/campaigns?organizationId=${ORG_ID}`);
      if (res.ok) setCampaigns(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const resetForm = () => {
    setName("");
    setChannel("EMAIL");
    setSubject("");
    setBodyHtml("");
    setSmsBody("");
  };

  const canCreate = () => {
    if (!name) return false;
    if (channel === "EMAIL" || channel === "BOTH") {
      if (!subject || !bodyHtml) return false;
    }
    if (channel === "SMS" || channel === "BOTH") {
      if (!smsBody) return false;
    }
    return true;
  };

  const handleCreate = async () => {
    if (!canCreate()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/email/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: ORG_ID,
          name,
          channel,
          subject: channel !== "SMS" ? subject : undefined,
          bodyHtml: channel !== "SMS" ? bodyHtml : undefined,
          smsBody: channel !== "EMAIL" ? smsBody : undefined,
        }),
      });
      if (res.ok) {
        const campaign = await res.json();
        setCampaigns((prev) => [campaign, ...prev]);
        setShowComposer(false);
        resetForm();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(false);
    }
  };

  const handleSend = async (campaignId: string) => {
    setSending(campaignId);
    try {
      const res = await fetch("/api/email/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", campaignId }),
      });
      if (res.ok) fetchCampaigns();
    } catch (e) {
      console.error(e);
    } finally {
      setSending(null);
    }
  };

  const handleDelete = async (campaignId: string) => {
    try {
      await fetch(`/api/email/campaigns?id=${campaignId}`, { method: "DELETE" });
      setCampaigns((prev) => prev.filter((c) => c.id !== campaignId));
    } catch (e) {
      console.error(e);
    }
  };

  const channelBadge = (ch: string) => {
    const map: Record<string, { icon: any; label: string }> = {
      EMAIL: { icon: Mail, label: "Email" },
      SMS: { icon: Smartphone, label: "SMS" },
      BOTH: { icon: MessageSquare, label: "Both" },
    };
    const info = map[ch] || map.EMAIL;
    const Icon = info.icon;
    return (
      <Badge variant="outline" className="text-[10px] py-0 gap-1">
        <Icon className="h-2.5 w-2.5" /> {info.label}
      </Badge>
    );
  };

  const statusBadge = (status: string) => {
    const map: Record<string, { icon: any }> = {
      DRAFT: { icon: FileText },
      SCHEDULED: { icon: Clock },
      SENDING: { icon: Loader2 },
      SENT: { icon: CheckCircle2 },
      CANCELLED: { icon: XCircle },
    };
    const info = map[status] || map.DRAFT;
    const Icon = info.icon;
    return (
      <Badge variant="secondary" className="text-xs gap-1">
        <Icon className={`h-3 w-3 ${status === "SENDING" ? "animate-spin" : ""}`} />
        {status.charAt(0) + status.slice(1).toLowerCase()}
      </Badge>
    );
  };

  // SMS character count helper
  const smsCharInfo = (text: string) => {
    const hasUnicode = /[^\x00-\x7F]/.test(text);
    const singleLimit = hasUnicode ? 70 : 160;
    const multiLimit = hasUnicode ? 67 : 153;
    const segments = text.length <= singleLimit ? 1 : Math.ceil(text.length / multiLimit);
    return { chars: text.length, segments, limit: singleLimit, encoding: hasUnicode ? "Unicode" : "GSM-7" };
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div>
      {/* Composer */}
      {showComposer ? (
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">New Campaign</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => { setShowComposer(false); resetForm(); }}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Campaign name */}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Campaign Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Spring Maintenance Special"
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm mt-1"
                data-testid="input-campaign-name"
              />
            </div>

            {/* Channel selector */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-2 block">Channel</label>
              <div className="flex gap-2">
                {(["EMAIL", "SMS", "BOTH"] as CampaignChannel[]).map((ch) => {
                  const icons = { EMAIL: Mail, SMS: Smartphone, BOTH: MessageSquare };
                  const labels = { EMAIL: "Email Only", SMS: "SMS Only", BOTH: "Email + SMS" };
                  const Icon = icons[ch];
                  return (
                    <button
                      key={ch}
                      onClick={() => setChannel(ch)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-md border text-sm transition-colors ${
                        channel === ch
                          ? "border-foreground bg-foreground text-background"
                          : "border-input bg-background hover:bg-accent/50"
                      }`}
                      data-testid={`channel-${ch.toLowerCase()}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {labels[ch]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email fields — visible for EMAIL and BOTH */}
            {(channel === "EMAIL" || channel === "BOTH") && (
              <>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Subject Line</label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., 20% Off Annual Maintenance — This Month Only"
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm mt-1"
                    data-testid="input-campaign-subject"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Email Body (HTML)</label>
                  <textarea
                    value={bodyHtml}
                    onChange={(e) => setBodyHtml(e.target.value)}
                    placeholder="<h2>Spring Maintenance Special</h2><p>Book your annual service and save 20%...</p>"
                    className="w-full min-h-[160px] rounded-md border border-input bg-background px-3 py-2 text-sm mt-1 font-mono"
                    data-testid="input-campaign-body"
                  />
                </div>
              </>
            )}

            {/* SMS fields — visible for SMS and BOTH */}
            {(channel === "SMS" || channel === "BOTH") && (
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-muted-foreground">SMS Body</label>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    {smsBody && (() => {
                      const info = smsCharInfo(smsBody);
                      return (
                        <>
                          <span>{info.encoding}</span>
                          <span className="text-foreground font-medium">
                            {info.chars} chars
                          </span>
                          <span>·</span>
                          <span className={info.segments > 1 ? "text-amber-500 font-medium" : ""}>
                            {info.segments} segment{info.segments !== 1 ? "s" : ""}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
                <textarea
                  value={smsBody}
                  onChange={(e) => setSmsBody(e.target.value.slice(0, 1600))}
                  placeholder="Hi {{name}}, this is a reminder about..."
                  className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm mt-1"
                  maxLength={1600}
                  data-testid="input-campaign-sms"
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  160 chars = 1 segment (GSM-7). Multi-segment messages cost more. Use {"{{variable}}"} for personalization.
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={!canCreate() || creating} data-testid="button-create-campaign">
                {creating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                Create Draft
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""}
          </p>
          <Button size="sm" onClick={() => setShowComposer(true)} data-testid="button-new-campaign">
            <Plus className="h-3.5 w-3.5 mr-1" /> New Campaign
          </Button>
        </div>
      )}

      {/* Campaign List */}
      {campaigns.length === 0 && !showComposer ? (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <Send className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground">No campaigns yet</p>
          <p className="text-xs text-muted-foreground mt-1">Create your first campaign to reach your audience</p>
          <Button size="sm" className="mt-4" onClick={() => setShowComposer(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Create Campaign
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="flex items-center justify-between border rounded-lg px-4 py-3 hover:bg-accent/20 transition-colors"
              data-testid={`campaign-${campaign.id}`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">{campaign.name}</p>
                  {channelBadge(campaign.channel || "EMAIL")}
                  {statusBadge(campaign.status)}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {campaign.subject || (campaign.smsBody?.slice(0, 60) + "...")}
                  {campaign.totalSent > 0 && ` · ${campaign.totalSent} emails`}
                  {campaign.totalSmsSent > 0 && ` · ${campaign.totalSmsSent} SMS`}
                </p>
              </div>

              {/* Stats */}
              {campaign.status === "SENT" && (
                <div className="hidden md:flex items-center gap-4 mr-4">
                  {(campaign.channel === "EMAIL" || campaign.channel === "BOTH") && (
                    <>
                      <StatPill icon={Mail} value={campaign.totalSent} label="Emails" />
                      <StatPill icon={MailOpen} value={campaign.totalOpened} label="Opened" />
                      <StatPill icon={MousePointerClick} value={campaign.totalClicked} label="Clicked" />
                    </>
                  )}
                  {(campaign.channel === "SMS" || campaign.channel === "BOTH") && (
                    <>
                      <StatPill icon={Smartphone} value={campaign.totalSmsSent} label="SMS Sent" />
                      <StatPill icon={CheckCircle2} value={campaign.totalSmsDelivered} label="Delivered" />
                    </>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-1">
                {(campaign.status === "DRAFT" || campaign.status === "SCHEDULED") && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleSend(campaign.id)}
                    disabled={sending === campaign.id}
                    data-testid={`send-campaign-${campaign.id}`}
                  >
                    {sending === campaign.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Play className="h-3.5 w-3.5" />
                    )}
                    <span className="ml-1">Send</span>
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Eye className="h-3.5 w-3.5 mr-2" /> View Details
                    </DropdownMenuItem>
                    {campaign.status === "DRAFT" && (
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(campaign.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatPill({ icon: Icon, value, label }: { icon: any; value: number; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className="h-3 w-3" />
      <span className="font-medium text-foreground">{value}</span>
      <span>{label}</span>
    </div>
  );
}

// ============================================================================
// CONTACTS TAB (unchanged)
// ============================================================================

function ContactsTab() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [page, setPage] = useState(1);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ organizationId: ORG_ID, page: String(page), limit: "25" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/email/contacts?${params}`);
      if (res.ok) {
        const data = await res.json();
        setContacts(data.contacts);
        setTotal(data.total);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchContacts(); }, [fetchContacts]);

  const handleSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/email/contacts", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: ORG_ID }),
      });
      if (res.ok) fetchContacts();
    } catch (e) {
      console.error(e);
    } finally {
      setSyncing(false);
    }
  };

  const handleUnsubscribe = async (contactId: string) => {
    try {
      await fetch("/api/email/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: contactId, action: "unsubscribe" }),
      });
      fetchContacts();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search contacts..."
              className="h-9 rounded-md border border-input bg-background pl-9 pr-3 text-sm w-64"
              data-testid="search-contacts"
            />
          </div>
          <Badge variant="secondary" className="text-xs">{total} contacts</Badge>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleSync} disabled={syncing} data-testid="sync-contacts">
            {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <RefreshCw className="h-3.5 w-3.5 mr-1" />}
            Sync from CRM
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <Users className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground">No contacts yet</p>
          <p className="text-xs text-muted-foreground mt-1">Sync from your CRM or add contacts manually</p>
          <Button size="sm" className="mt-4" onClick={handleSync}>
            <UserPlus className="h-3.5 w-3.5 mr-1" /> Sync from CRM
          </Button>
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 text-xs text-muted-foreground">
                  <th className="text-left px-4 py-2.5 font-medium">Email</th>
                  <th className="text-left px-4 py-2.5 font-medium">Name</th>
                  <th className="text-left px-4 py-2.5 font-medium">Client</th>
                  <th className="text-center px-4 py-2.5 font-medium">Subscribed</th>
                  <th className="text-right px-4 py-2.5 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((contact) => (
                  <tr key={contact.id} className="border-t hover:bg-accent/20 transition-colors" data-testid={`contact-${contact.id}`}>
                    <td className="px-4 py-2.5 text-sm">{contact.email}</td>
                    <td className="px-4 py-2.5 text-sm text-muted-foreground">
                      {[contact.firstName, contact.lastName].filter(Boolean).join(" ") || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-sm text-muted-foreground">
                      {contact.client?.name || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      {contact.isSubscribed ? (
                        <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Unsubscribed</Badge>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {contact.isSubscribed && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-muted-foreground"
                          onClick={() => handleUnsubscribe(contact.id)}
                        >
                          Unsubscribe
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-muted-foreground">
              Page {page} of {Math.ceil(total / 25)}
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 25)} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================================
// MESSAGE LOG TAB (unified email + SMS)
// ============================================================================

function MessageLogTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ email: {}, sms: {} });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        organizationId: ORG_ID,
        page: String(page),
        limit: "25",
        channel: channelFilter,
      });
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`/api/messages/logs?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setStats(data.stats);
        setTotal(data.total);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, channelFilter, statusFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const emailTotal = (stats.email?.sent || 0) + (stats.email?.delivered || 0) + (stats.email?.bounced || 0) + (stats.email?.failed || 0);
  const smsTotal = (stats.sms?.sent || 0) + (stats.sms?.delivered || 0) + (stats.sms?.failed || 0) + (stats.sms?.undelivered || 0);

  return (
    <div>
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <StatCard icon={Mail} label="Emails Sent" value={stats.email?.total || 0} subValue={stats.email?.delivered || 0} subLabel="delivered" color="text-blue-500" />
        <StatCard icon={MailOpen} label="Opened" value={stats.email?.opened || 0} subValue={emailTotal > 0 ? Math.round(((stats.email?.opened || 0) / emailTotal) * 100) : 0} subLabel="%" color="text-violet-500" />
        <StatCard icon={Smartphone} label="SMS Sent" value={stats.sms?.total || 0} subValue={stats.sms?.delivered || 0} subLabel="delivered" color="text-emerald-500" />
        <StatCard icon={AlertTriangle} label="Bounced/Failed" value={(stats.email?.bounced || 0) + (stats.email?.failed || 0)} subValue={stats.sms?.failed || 0} subLabel="SMS failed" color="text-red-500" />
        <StatCard icon={Activity} label="Total Messages" value={(stats.email?.total || 0) + (stats.sms?.total || 0)} subValue={0} subLabel="" color="text-foreground" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4">
        <select
          value={channelFilter}
          onChange={(e) => { setChannelFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          data-testid="filter-channel"
        >
          <option value="all">All Channels</option>
          <option value="email">Email Only</option>
          <option value="sms">SMS Only</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          data-testid="filter-status"
        >
          <option value="">All Statuses</option>
          <option value="SENT">Sent</option>
          <option value="DELIVERED">Delivered</option>
          <option value="OPENED">Opened</option>
          <option value="BOUNCED">Bounced</option>
          <option value="FAILED">Failed</option>
        </select>
        <Badge variant="secondary" className="text-xs">{total} messages</Badge>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : logs.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <Inbox className="h-10 w-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm font-medium text-muted-foreground">No messages sent yet</p>
          <p className="text-xs text-muted-foreground mt-1">Emails and SMS messages will appear here once sent</p>
        </div>
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50 text-xs text-muted-foreground">
                  <th className="text-left px-4 py-2.5 font-medium w-10">Ch</th>
                  <th className="text-left px-4 py-2.5 font-medium">Subject / Body</th>
                  <th className="text-left px-4 py-2.5 font-medium">Recipient</th>
                  <th className="text-left px-4 py-2.5 font-medium">Status</th>
                  <th className="text-left px-4 py-2.5 font-medium">Event</th>
                  <th className="text-right px-4 py-2.5 font-medium">Sent</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={`${log.channel}-${log.id}`} className="border-t hover:bg-accent/20 transition-colors" data-testid={`log-${log.id}`}>
                    <td className="px-4 py-2.5">
                      {log.channel === "email" ? (
                        <Mail className="h-3.5 w-3.5 text-blue-500" />
                      ) : (
                        <Smartphone className="h-3.5 w-3.5 text-emerald-500" />
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-sm max-w-[250px] truncate">{log.subject || "—"}</td>
                    <td className="px-4 py-2.5 text-sm text-muted-foreground max-w-[200px] truncate">
                      {log.recipient || "—"}
                    </td>
                    <td className="px-4 py-2.5">{logStatusBadge(log.status)}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">
                      {log.triggerEvent || "—"}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground text-right">
                      {log.sentAt ? new Date(log.sentAt).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-xs text-muted-foreground">
              Page {page} of {Math.ceil(total / 25)}
            </p>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <Button variant="outline" size="sm" disabled={page >= Math.ceil(total / 25)} onClick={() => setPage(page + 1)}>
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subValue, subLabel, color }: { icon: any; label: string; value: number; subValue: number; subLabel: string; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Icon className={`h-4 w-4 ${color}`} />
          {subLabel && subValue > 0 && (
            <span className="text-xs text-muted-foreground">{subValue} {subLabel}</span>
          )}
        </div>
        <p className="text-2xl font-semibold tracking-tight">{value.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </CardContent>
    </Card>
  );
}

function logStatusBadge(status: string) {
  const map: Record<string, { bg: string; text: string }> = {
    QUEUED: { bg: "bg-zinc-100 dark:bg-zinc-800", text: "text-zinc-600 dark:text-zinc-400" },
    SENT: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-600" },
    DELIVERED: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-600" },
    OPENED: { bg: "bg-violet-50 dark:bg-violet-900/20", text: "text-violet-600" },
    CLICKED: { bg: "bg-indigo-50 dark:bg-indigo-900/20", text: "text-indigo-600" },
    BOUNCED: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600" },
    COMPLAINED: { bg: "bg-orange-50 dark:bg-orange-900/20", text: "text-orange-600" },
    FAILED: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600" },
    UNDELIVERED: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-600" },
  };
  const style = map[status] || map.QUEUED;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${style.bg} ${style.text}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
