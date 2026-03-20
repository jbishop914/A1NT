"use client";

/**
 * Payment Settings Panel — Stripe Connect Onboarding & Status
 * 
 * Displays in Settings → Payments. Handles:
 * 1. Initial state: No Stripe account → "Set Up Payments" CTA
 * 2. Onboarding: Account created but incomplete → Resume onboarding link
 * 3. Active: Account live → Status dashboard, Express dashboard link, fee config
 */

import { useState, useEffect, useCallback } from "react";
import {
  CreditCard,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  ArrowRight,
  DollarSign,
  Landmark,
  ShieldCheck,
  Zap,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface StripeAccountStatus {
  connected: boolean;
  status: string | null;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
  businessName?: string;
  stripeAccountId?: string;
  applicationFeePercent?: number;
  applicationFeeFixed?: number;
  payoutScheduleInterval?: string;
  onboardingCompletedAt?: string;
  requirements?: any;
  message?: string;
}

export function PaymentSettings() {
  const [accountStatus, setAccountStatus] = useState<StripeAccountStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/stripe/connect");
      const data = await res.json();
      setAccountStatus(data);
      setError(null);
    } catch {
      setError("Could not load payment account status.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    // Check for return from Stripe onboarding
    const params = new URLSearchParams(window.location.search);
    if (params.get("stripe") === "complete") {
      // Clear the URL param and refresh status
      window.history.replaceState({}, "", window.location.pathname);
      setTimeout(fetchStatus, 1000);
    }
  }, [fetchStatus]);

  const handleSetupPayments = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/stripe/connect", { method: "POST" });
      const data = await res.json();

      if (data.onboardingUrl) {
        window.open(data.onboardingUrl, "_blank");
        // Refresh status after a delay
        setTimeout(fetchStatus, 3000);
      } else if (data.error) {
        setError(data.error);
      }
    } catch {
      setError("Failed to start payment setup.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResumeOnboarding = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/stripe/connect", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "refresh_onboarding" }),
      });
      const data = await res.json();
      if (data.onboardingUrl) {
        window.open(data.onboardingUrl, "_blank");
      }
    } catch {
      setError("Failed to resume onboarding.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenDashboard = async () => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/stripe/connect", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dashboard_link" }),
      });
      const data = await res.json();
      if (data.dashboardUrl) {
        window.open(data.dashboardUrl, "_blank");
      }
    } catch {
      setError("Failed to open payments dashboard.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading payment settings...</span>
      </div>
    );
  }

  // ================================================================
  // STATE 1: No Stripe account → Setup CTA
  // ================================================================
  if (!accountStatus?.connected) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <CreditCard className="h-5 w-5 text-emerald-500" />
          </div>
          <div className="flex-1 space-y-1">
            <h3 className="text-sm font-semibold">Accept Online Payments</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Connect a payment account to accept credit cards, debit cards, and bank transfers
              directly through your invoices, booking widget, and customer portal.
              Powered by Stripe — the same payment infrastructure used by Amazon, Shopify, and millions of businesses.
            </p>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: DollarSign, label: "Invoice payments", desc: "\"Pay Now\" links on invoices" },
            { icon: Zap, label: "Booking deposits", desc: "Collect upfront for service calls" },
            { icon: Landmark, label: "Auto payouts", desc: "Funds deposited to your bank" },
            { icon: ShieldCheck, label: "PCI compliant", desc: "Stripe handles card security" },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-2 p-2 rounded-md bg-muted/30">
              <item.icon className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium">{item.label}</p>
                <p className="text-[10px] text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Fee info */}
        <div className="rounded-lg border border-dashed border-border p-3 bg-muted/20">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Transaction rate:</span>{" "}
            3.4% + 55¢ per successful charge (includes Stripe processing + platform fee).
            No monthly fees. No setup fees. Cancel anytime.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-red-500">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </div>
        )}

        {/* CTA */}
        <Button
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={handleSetupPayments}
          disabled={actionLoading}
          data-testid="btn-setup-payments"
        >
          {actionLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <CreditCard className="h-4 w-4 mr-2" />
          )}
          Set Up Payments
          <ArrowRight className="h-4 w-4 ml-auto" />
        </Button>
      </div>
    );
  }

  // ================================================================
  // STATE 2: Onboarding incomplete → Resume
  // ================================================================
  if (accountStatus.status === "ONBOARDING" || accountStatus.status === "PENDING_REVIEW") {
    const isPending = accountStatus.status === "PENDING_REVIEW";

    return (
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
            isPending 
              ? "bg-amber-500/10 border border-amber-500/20" 
              : "bg-blue-500/10 border border-blue-500/20"
          }`}>
            {isPending ? (
              <Clock className="h-5 w-5 text-amber-500" />
            ) : (
              <CreditCard className="h-5 w-5 text-blue-500" />
            )}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold">
                {isPending ? "Verification In Progress" : "Complete Payment Setup"}
              </h3>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${
                isPending ? "border-amber-500/30 text-amber-600" : "border-blue-500/30 text-blue-600"
              }`}>
                {isPending ? "Under Review" : "Incomplete"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isPending
                ? "Stripe is reviewing your account details. This typically takes 1-2 business days. You'll be able to accept payments once verified."
                : "Your payment account has been created but onboarding is incomplete. Complete the setup to start accepting payments."
              }
            </p>
          </div>
        </div>

        {/* Status checklist */}
        <div className="space-y-2 pl-2">
          <StatusRow done={true} label="Stripe account created" />
          <StatusRow done={accountStatus.detailsSubmitted ?? false} label="Business details submitted" />
          <StatusRow done={accountStatus.chargesEnabled ?? false} label="Payment processing enabled" />
          <StatusRow done={accountStatus.payoutsEnabled ?? false} label="Bank payouts enabled" />
        </div>

        {!isPending && (
          <Button
            className="w-full"
            onClick={handleResumeOnboarding}
            disabled={actionLoading}
            data-testid="btn-resume-onboarding"
          >
            {actionLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ArrowRight className="h-4 w-4 mr-2" />
            )}
            Resume Setup
            <ExternalLink className="h-3.5 w-3.5 ml-auto opacity-50" />
          </Button>
        )}

        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> {error}
          </p>
        )}
      </div>
    );
  }

  // ================================================================
  // STATE 3: Active account → Status dashboard
  // ================================================================
  const totalRate = `${(2.9 + (accountStatus.applicationFeePercent || 0.5)).toFixed(1)}% + ${
    ((30 + (accountStatus.applicationFeeFixed || 25)) / 100).toFixed(2)
  }¢`;

  return (
    <div className="p-6 space-y-5">
      {/* Header with status */}
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Payments Active</h3>
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/10 text-[10px] px-1.5 py-0">
              Live
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {accountStatus.businessName || "Your business"} is ready to accept payments.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 h-8 text-xs gap-1"
          onClick={() => { setLoading(true); fetchStatus(); }}
          data-testid="btn-refresh-status"
        >
          <RefreshCw className="h-3 w-3" />
          Refresh
        </Button>
      </div>

      {/* Status grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border p-3 space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Transaction Rate</p>
          <p className="text-sm font-semibold">{totalRate}</p>
          <p className="text-[10px] text-muted-foreground">per charge</p>
        </div>
        <div className="rounded-lg border border-border p-3 space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Payouts</p>
          <p className="text-sm font-semibold capitalize">{accountStatus.payoutScheduleInterval || "Daily"}</p>
          <p className="text-[10px] text-muted-foreground">to your bank</p>
        </div>
        <div className="rounded-lg border border-border p-3 space-y-1">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Status</p>
          <div className="flex items-center gap-1">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-sm font-semibold text-emerald-600">Active</p>
          </div>
          <p className="text-[10px] text-muted-foreground">Cards & bank</p>
        </div>
      </div>

      {/* Capabilities */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Enabled Capabilities</p>
        <div className="flex flex-wrap gap-2">
          {accountStatus.chargesEnabled && (
            <Badge variant="secondary" className="text-[10px] gap-1">
              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
              Card Payments
            </Badge>
          )}
          {accountStatus.payoutsEnabled && (
            <Badge variant="secondary" className="text-[10px] gap-1">
              <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
              Bank Payouts
            </Badge>
          )}
          <Badge variant="secondary" className="text-[10px] gap-1">
            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
            Invoice Pay Links
          </Badge>
          <Badge variant="secondary" className="text-[10px] gap-1">
            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
            Booking Payments
          </Badge>
        </div>
      </div>

      {/* Requirements warning */}
      {accountStatus.requirements?.currently_due?.length > 0 && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-medium text-amber-700">Action Required</p>
            <p className="text-[10px] text-amber-600/80 mt-0.5">
              Stripe requires additional information. Open your payments dashboard to resolve.
            </p>
          </div>
        </div>
      )}

      <Separator />

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs gap-1.5"
          onClick={handleOpenDashboard}
          disabled={actionLoading}
          data-testid="btn-open-dashboard"
        >
          {actionLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ExternalLink className="h-3 w-3" />}
          Open Stripe Dashboard
        </Button>
      </div>

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}

function StatusRow({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {done ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
      ) : (
        <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/30" />
      )}
      <span className={`text-xs ${done ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
    </div>
  );
}
