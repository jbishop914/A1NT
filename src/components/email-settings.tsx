"use client";

/**
 * Messaging Settings Panel — Domain setup, sender config, notification preferences (Email + SMS)
 * 
 * Displays in Settings → Email & SMS. Handles:
 * 1. Domain Management: Add/verify sending domains with DNS record display
 * 2. Sender Configuration: Default from name/email/reply-to per domain
 * 3. Notification Preferences: Toggle which events send email/SMS + recipients
 */

import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Globe,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  Plus,
  Trash2,
  RefreshCw,
  Bell,
  Copy,
  Check,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const ORG_ID = process.env.NEXT_PUBLIC_A1NT_ORG_ID || "demo-org";

interface EmailDomain {
  id: string;
  domain: string;
  status: string;
  resendDomainId: string | null;
  dnsRecords: any[] | null;
  defaultFromName: string | null;
  defaultFromEmail: string | null;
  defaultReplyTo: string | null;
  verifiedAt: string | null;
}

interface NotificationPref {
  id: string;
  event: string;
  description: string | null;
  isEnabled: boolean;
  sendEmail: boolean;
  sendSms: boolean;
  sendToClient: boolean;
  sendToAdmin: boolean;
  sendToAssignee: boolean;
}

export function EmailSettings() {
  const [domains, setDomains] = useState<EmailDomain[]>([]);
  const [prefs, setPrefs] = useState<NotificationPref[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingDomain, setAddingDomain] = useState(false);
  const [newDomain, setNewDomain] = useState("");
  const [newFromName, setNewFromName] = useState("");
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [copiedRecord, setCopiedRecord] = useState<string | null>(null);
  const [savingPref, setSavingPref] = useState<string | null>(null);
  const [verifyingDomain, setVerifyingDomain] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [domainsRes, prefsRes] = await Promise.all([
        fetch(`/api/email/domains?organizationId=${ORG_ID}`),
        fetch(`/api/email/preferences?organizationId=${ORG_ID}`),
      ]);
      if (domainsRes.ok) setDomains(await domainsRes.json());
      if (prefsRes.ok) setPrefs(await prefsRes.json());
    } catch (e) {
      console.error("Failed to load email settings:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;
    setAddingDomain(true);
    try {
      const res = await fetch("/api/email/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationId: ORG_ID,
          domain: newDomain.trim(),
          defaultFromName: newFromName.trim() || undefined,
        }),
      });
      if (res.ok) {
        const domain = await res.json();
        setDomains((prev) => [domain, ...prev]);
        setNewDomain("");
        setNewFromName("");
        setExpandedDomain(domain.id);
      }
    } catch (e) {
      console.error("Failed to add domain:", e);
    } finally {
      setAddingDomain(false);
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    setVerifyingDomain(domainId);
    try {
      const res = await fetch("/api/email/domains", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: domainId, action: "verify" }),
      });
      if (res.ok) {
        const updated = await res.json();
        setDomains((prev) => prev.map((d) => (d.id === domainId ? updated : d)));
      }
    } catch (e) {
      console.error("Failed to verify domain:", e);
    } finally {
      setVerifyingDomain(null);
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    try {
      const res = await fetch(`/api/email/domains?id=${domainId}`, { method: "DELETE" });
      if (res.ok) setDomains((prev) => prev.filter((d) => d.id !== domainId));
    } catch (e) {
      console.error("Failed to delete domain:", e);
    }
  };

  const handleTogglePref = async (prefId: string, field: string, value: boolean) => {
    setSavingPref(prefId);
    try {
      const res = await fetch("/api/email/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: prefId, [field]: value }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPrefs((prev) => prev.map((p) => (p.id === prefId ? updated : p)));
      }
    } catch (e) {
      console.error("Failed to update preference:", e);
    } finally {
      setSavingPref(null);
    }
  };

  const copyToClipboard = (text: string, recordId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRecord(recordId);
    setTimeout(() => setCopiedRecord(null), 2000);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return <Badge variant="default" className="bg-emerald-600 text-xs gap-1"><CheckCircle2 className="h-3 w-3" /> Verified</Badge>;
      case "VERIFYING":
        return <Badge variant="secondary" className="text-xs gap-1"><Clock className="h-3 w-3" /> Verifying</Badge>;
      case "FAILED":
        return <Badge variant="destructive" className="text-xs gap-1"><AlertCircle className="h-3 w-3" /> Failed</Badge>;
      default:
        return <Badge variant="outline" className="text-xs gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-5 space-y-6">
      {/* ===== DOMAIN MANAGEMENT ===== */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold">Sending Domains</h3>
          </div>
          <Button variant="ghost" size="sm" onClick={fetchData} data-testid="refresh-email-settings">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Add your domain or subdomain to send branded emails (e.g., notifications.yourbusiness.com).
          You'll need to add DNS records to verify ownership.
        </p>

        {/* Add domain form */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
            placeholder="notifications.yourdomain.com"
            className="flex-1 h-9 rounded-md border border-input bg-background px-3 text-sm"
            data-testid="input-new-domain"
          />
          <input
            type="text"
            value={newFromName}
            onChange={(e) => setNewFromName(e.target.value)}
            placeholder="Company Name"
            className="w-40 h-9 rounded-md border border-input bg-background px-3 text-sm"
            data-testid="input-from-name"
          />
          <Button
            size="sm"
            onClick={handleAddDomain}
            disabled={!newDomain.trim() || addingDomain}
            data-testid="button-add-domain"
          >
            {addingDomain ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            <span className="ml-1">Add</span>
          </Button>
        </div>

        {/* Domain list */}
        {domains.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground border border-dashed rounded-lg">
            <Mail className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>No sending domains configured</p>
            <p className="text-xs mt-1">Add a domain above to start sending branded emails</p>
          </div>
        ) : (
          <div className="space-y-2">
            {domains.map((domain) => (
              <div key={domain.id} className="border rounded-lg">
                <button
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-accent/30 transition-colors"
                  onClick={() => setExpandedDomain(expandedDomain === domain.id ? null : domain.id)}
                  data-testid={`domain-${domain.domain}`}
                >
                  <div className="flex items-center gap-3">
                    {expandedDomain === domain.id ? (
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{domain.domain}</p>
                      {domain.defaultFromEmail && (
                        <p className="text-xs text-muted-foreground">
                          {domain.defaultFromName && `${domain.defaultFromName} · `}{domain.defaultFromEmail}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge(domain.status)}
                  </div>
                </button>

                {/* Expanded: DNS records + actions */}
                {expandedDomain === domain.id && (
                  <div className="border-t px-4 py-4 bg-muted/10 space-y-4">
                    {domain.dnsRecords && (domain.dnsRecords as any[]).length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          DNS Records to Add
                        </p>
                        <div className="space-y-2">
                          {(domain.dnsRecords as any[]).map((record: any, i: number) => (
                            <div key={i} className="bg-background rounded border px-3 py-2">
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-[10px] py-0">
                                    {record.type}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">{record.record}</span>
                                </div>
                                <button
                                  onClick={() => copyToClipboard(record.value, `${domain.id}-${i}`)}
                                  className="text-muted-foreground hover:text-foreground transition-colors"
                                >
                                  {copiedRecord === `${domain.id}-${i}` ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>
                              </div>
                              <div className="flex gap-2 text-xs">
                                <span className="text-muted-foreground shrink-0">Name:</span>
                                <code className="text-foreground break-all">{record.name}</code>
                              </div>
                              <div className="flex gap-2 text-xs mt-1">
                                <span className="text-muted-foreground shrink-0">Value:</span>
                                <code className="text-foreground break-all">{record.value}</code>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {domain.status !== "VERIFIED" && (
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleVerifyDomain(domain.id)}
                          disabled={verifyingDomain === domain.id}
                          data-testid={`verify-domain-${domain.domain}`}
                        >
                          {verifyingDomain === domain.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                          ) : (
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                          )}
                          Verify Domain
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteDomain(domain.id)}
                        data-testid={`delete-domain-${domain.domain}`}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* ===== NOTIFICATION PREFERENCES ===== */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Notification Preferences</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Choose which events trigger automatic messages, which channels to use, and who receives them.
        </p>

        {/* Column headers */}
        <div className="flex items-center px-3 py-2 mb-1 border-b">
          <div className="flex-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Event</div>
          <div className="flex items-center gap-5 shrink-0">
            <div className="flex items-center gap-1 w-16 justify-center">
              <Mail className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">Email</span>
            </div>
            <div className="flex items-center gap-1 w-16 justify-center">
              <Smartphone className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-semibold text-muted-foreground uppercase">SMS</span>
            </div>
            <div className="w-[1px] h-4 bg-border" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase w-14 text-center">Client</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase w-14 text-center">Admin</span>
            <span className="text-[10px] font-semibold text-muted-foreground uppercase w-16 text-center">Assignee</span>
            <div className="w-[1px] h-4 bg-border" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase w-10 text-center">On</span>
          </div>
        </div>

        <div className="space-y-0.5">
          {prefs.map((pref) => {
            const [category] = pref.event.split(".");
            const disabled = !pref.isEnabled;
            return (
              <div
                key={pref.id}
                className={`flex items-center px-3 py-2 rounded-md hover:bg-accent/30 transition-colors ${disabled ? "opacity-50" : ""}`}
                data-testid={`pref-${pref.event}`}
              >
                <div className="flex-1 mr-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] py-0 font-normal capitalize">
                      {category}
                    </Badge>
                    <p className="text-sm font-medium">{formatEventName(pref.event)}</p>
                  </div>
                  {pref.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{pref.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-5 shrink-0">
                  {/* Channel toggles */}
                  <div className="w-16 flex justify-center">
                    <Switch
                      checked={pref.sendEmail}
                      onCheckedChange={(v) => handleTogglePref(pref.id, "sendEmail", v ?? false)}
                      className="scale-75"
                      disabled={disabled}
                      data-testid={`toggle-email-${pref.event}`}
                    />
                  </div>
                  <div className="w-16 flex justify-center">
                    <Switch
                      checked={pref.sendSms}
                      onCheckedChange={(v) => handleTogglePref(pref.id, "sendSms", v ?? false)}
                      className="scale-75"
                      disabled={disabled}
                      data-testid={`toggle-sms-${pref.event}`}
                    />
                  </div>

                  <div className="w-[1px] h-4 bg-border" />

                  {/* Recipient toggles */}
                  <div className="w-14 flex justify-center">
                    <Switch
                      checked={pref.sendToClient}
                      onCheckedChange={(v) => handleTogglePref(pref.id, "sendToClient", v ?? false)}
                      className="scale-75"
                      disabled={disabled}
                    />
                  </div>
                  <div className="w-14 flex justify-center">
                    <Switch
                      checked={pref.sendToAdmin}
                      onCheckedChange={(v) => handleTogglePref(pref.id, "sendToAdmin", v ?? false)}
                      className="scale-75"
                      disabled={disabled}
                    />
                  </div>
                  <div className="w-16 flex justify-center">
                    <Switch
                      checked={pref.sendToAssignee}
                      onCheckedChange={(v) => handleTogglePref(pref.id, "sendToAssignee", v ?? false)}
                      className="scale-75"
                      disabled={disabled}
                    />
                  </div>

                  <div className="w-[1px] h-4 bg-border" />

                  {/* Master toggle */}
                  <div className="w-10 flex justify-center">
                    <Switch
                      checked={pref.isEnabled}
                      onCheckedChange={(v) => handleTogglePref(pref.id, "isEnabled", v ?? false)}
                      data-testid={`toggle-${pref.event}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {prefs.length === 0 && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            Notification preferences will be created when you first open this panel.
          </div>
        )}
      </div>

      {/* ENV hints */}
      <Separator />
      <div className="bg-muted/30 rounded-lg px-4 py-3 space-y-2">
        <p className="text-xs font-medium text-muted-foreground mb-1">Required Environment Variables</p>
        <div className="flex items-center gap-2">
          <Mail className="h-3 w-3 text-muted-foreground" />
          <code className="text-xs text-foreground">RESEND_API_KEY=re_xxxxxxxxx</code>
        </div>
        <div className="flex items-center gap-2">
          <MessageSquare className="h-3 w-3 text-muted-foreground" />
          <code className="text-xs text-foreground">TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_PHONE_NUMBER</code>
        </div>
      </div>
    </div>
  );
}

function formatEventName(event: string): string {
  return event
    .split(".")
    .map((part) =>
      part
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    )
    .join(" → ");
}
