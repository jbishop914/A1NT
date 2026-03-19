/* ─── Twilio Voice Status Callback ─────────────────────────────────────────
   
   Receives call status updates from Twilio (initiated, ringing, answered,
   completed, busy, no-answer, canceled, failed).
   
   Configure in Twilio console under the phone number's "Status Callback URL":
   https://your-domain.com/api/voice/status
   ──────────────────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const callSid = formData.get("CallSid")?.toString() ?? "";
    const callStatus = formData.get("CallStatus")?.toString() ?? "";
    const from = formData.get("From")?.toString() ?? "";
    const to = formData.get("To")?.toString() ?? "";
    const duration = formData.get("CallDuration")?.toString();
    const timestamp = formData.get("Timestamp")?.toString();

    console.log(
      `[Voice] Status update: ${callSid} → ${callStatus}` +
        `${duration ? ` (${duration}s)` : ""}` +
        ` | ${from} → ${to}`
    );

    // Phase 2: Persist call records to database
    // Phase 3: Update agent interaction logs
    // Phase 4: Trigger post-call analysis (sentiment, corrections)

    if (callStatus === "completed" || callStatus === "failed") {
      console.log(
        `[Voice] Call ${callSid} ended: status=${callStatus}` +
          `${duration ? `, duration=${duration}s` : ""}` +
          `${timestamp ? `, at=${timestamp}` : ""}`
      );
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Voice] Status callback error:", err);
    return NextResponse.json({ error: "Failed to process status" }, { status: 500 });
  }
}
