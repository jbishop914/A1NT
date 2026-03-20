"use client";

import { useState } from "react";
import { Palette, Eye, Code, Copy, Check } from "lucide-react";
import { BookingWidget, BOOKING_THEMES, type BookingTheme } from "@/components/booking-widget";

/**
 * Booking Widget Preview — allows admin to:
 * 1. Preview the widget with different themes
 * 2. Copy the embed snippet
 */
export function BookingWidgetPreview() {
  const [selectedTheme, setSelectedTheme] = useState<BookingTheme>(BOOKING_THEMES[0]);
  const [tab, setTab] = useState<"preview" | "embed">("preview");
  const [copied, setCopied] = useState(false);

  const embedSnippet = `<!-- A1NT Booking Widget -->
<div id="a1nt-booking"></div>
<script src="https://a1ntegrel.vercel.app/widget/booking.js"
  data-org-id="YOUR_ORG_ID"
  data-theme="${selectedTheme.id}">
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Tab toggle */}
      <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-lg w-fit">
        <button
          onClick={() => setTab("preview")}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all ${
            tab === "preview"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Preview
        </button>
        <button
          onClick={() => setTab("embed")}
          className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium transition-all ${
            tab === "embed"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          Embed Code
        </button>
      </div>

      <div className="flex gap-6">
        {/* Theme Selector */}
        <div className="w-[200px] shrink-0 space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs font-medium">Widget Theme</span>
          </div>
          <div className="space-y-1.5">
            {BOOKING_THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTheme(t)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-md text-left text-xs transition-colors border ${
                  selectedTheme.id === t.id
                    ? "border-emerald-500/50 bg-emerald-500/10 text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-muted/30"
                }`}
                data-testid={`theme-${t.id}`}
              >
                {/* Color preview swatch */}
                <div className="flex gap-0.5 shrink-0">
                  <div
                    className="w-3 h-3 rounded-sm"
                    style={{ background: t.colors.bg, border: `1px solid ${t.colors.border}` }}
                  />
                  <div className="w-3 h-3 rounded-sm" style={{ background: t.colors.accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{t.name}</p>
                  <p className="text-[9px] text-muted-foreground capitalize">{t.mode}</p>
                </div>
                {selectedTheme.id === t.id && (
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Preview / Embed */}
        <div className="flex-1 flex justify-center">
          {tab === "preview" ? (
            <div
              className="p-6 rounded-xl border border-border"
              style={{
                background:
                  selectedTheme.mode === "dark"
                    ? "repeating-conic-gradient(#1a1a1a 0% 25%, #111 0% 50%) 0 0 / 20px 20px"
                    : "repeating-conic-gradient(#f3f3f3 0% 25%, #fff 0% 50%) 0 0 / 20px 20px",
              }}
            >
              <BookingWidget
                themeId={selectedTheme.id}
                showClose
                onClose={() => {}}
              />
            </div>
          ) : (
            <div className="w-full max-w-[600px] space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Copy and paste this code into your website HTML
                </p>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy Snippet
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 rounded-lg bg-muted/50 border border-border text-xs font-mono text-foreground overflow-x-auto whitespace-pre-wrap">
                {embedSnippet}
              </pre>
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-medium">Installation Guide</h4>
                <div className="space-y-1 text-[11px] text-muted-foreground">
                  <p><strong>WordPress:</strong> Add an HTML block to your page and paste the snippet.</p>
                  <p><strong>Squarespace:</strong> Go to Settings → Advanced → Code Injection and paste in the footer.</p>
                  <p><strong>Wix:</strong> Use the &quot;Embed Code&quot; element and paste the snippet.</p>
                  <p><strong>Shopify:</strong> Edit your theme code and add the snippet before the closing &lt;/body&gt; tag.</p>
                  <p><strong>Custom HTML:</strong> Paste the snippet anywhere in your page HTML.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
