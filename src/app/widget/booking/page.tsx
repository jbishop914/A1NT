"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { BookingWidget } from "@/components/booking-widget";

function BookingWidgetPage() {
  const params = useSearchParams();
  const orgId = params.get("orgId") || undefined;
  const themeId = params.get("theme") || "clean-light";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "100vh",
        padding: "0",
        margin: "0",
        background: "transparent",
      }}
    >
      <BookingWidget orgId={orgId} themeId={themeId} />
    </div>
  );
}

/**
 * Standalone booking widget page — rendered in an iframe for embedded use.
 * URL: /widget/booking?orgId=xxx&theme=clean-light
 */
export default function WidgetBookingPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            color: "#666",
            fontSize: "14px",
          }}
        >
          Loading...
        </div>
      }
    >
      <BookingWidgetPage />
    </Suspense>
  );
}
