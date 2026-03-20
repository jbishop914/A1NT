/**
 * A1NT Booking Widget — Embeddable Loader
 *
 * Usage:
 *   <div id="a1nt-booking"></div>
 *   <script src="https://a1ntegrel.vercel.app/widget/booking-loader.js"
 *     data-org-id="YOUR_ORG_ID"
 *     data-theme="clean-light">
 *   </script>
 *
 * This loader:
 * 1. Reads config from script tag data attributes
 * 2. Creates an iframe pointing to the hosted widget page
 * 3. Handles auto-resizing to fit content
 */
(function () {
  "use strict";

  // Find the script tag to read config
  var scripts = document.querySelectorAll('script[src*="booking-loader"]');
  var script = scripts[scripts.length - 1];

  var orgId = script.getAttribute("data-org-id") || "";
  var theme = script.getAttribute("data-theme") || "clean-light";
  var containerId = script.getAttribute("data-container") || "a1nt-booking";

  // Find or create container
  var container = document.getElementById(containerId);
  if (!container) {
    container = document.createElement("div");
    container.id = containerId;
    script.parentNode.insertBefore(container, script);
  }

  // Build iframe URL
  var baseUrl = script.src.replace(/\/widget\/booking-loader\.js.*$/, "");
  var widgetUrl =
    baseUrl +
    "/widget/booking?orgId=" +
    encodeURIComponent(orgId) +
    "&theme=" +
    encodeURIComponent(theme);

  // Create iframe
  var iframe = document.createElement("iframe");
  iframe.src = widgetUrl;
  iframe.style.width = "100%";
  iframe.style.maxWidth = "480px";
  iframe.style.minHeight = "500px";
  iframe.style.height = "620px";
  iframe.style.border = "none";
  iframe.style.borderRadius = "12px";
  iframe.style.overflow = "hidden";
  iframe.style.display = "block";
  iframe.style.margin = "0 auto";
  iframe.setAttribute("title", "Book Appointment");
  iframe.setAttribute("loading", "lazy");
  iframe.setAttribute("allow", "clipboard-write");

  container.appendChild(iframe);

  // Listen for resize messages from the iframe
  window.addEventListener("message", function (event) {
    if (event.data && event.data.type === "a1nt-booking-resize") {
      iframe.style.height = event.data.height + "px";
    }
    if (event.data && event.data.type === "a1nt-booking-complete") {
      // Optionally dispatch a custom event the host page can listen to
      var customEvent = new CustomEvent("a1nt:booking-complete", {
        detail: event.data.booking,
      });
      document.dispatchEvent(customEvent);
    }
  });
})();
