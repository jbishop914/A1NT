/* ─── Twilio Voice Status Callback ─────────────────────────────────────────
   
   Receives call status updates from Twilio (initiated, ringing, answered,
   completed, busy, no-answer, canceled, failed).
   
   Updates the CallRecord status in PostgreSQL when a call ends.
   
   Configure in Twilio console under the phone number's "Status Callback URL":
   https://your-domain.com/api/voice/status
   ──────────────────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/** Map Twilio call status to our CallStatus enum */
const STATUS_MAP: Record<string, "ACTIVE" | "COMPLETED" | "MISSED" | "FAILED"> = {
  initiated: "ACTIVE",
  ringing: "ACTIVE",
  "in-progress": "ACTIVE",
  completed: "COMPLETED",
  busy: "MISSED",
  "no-answer": "MISSED",
  canceled: "MISSED",
  failed: "FAILED",
};

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

    // Update the call record in the database if it exists
    if (callSid && (callStatus === "completed" || callStatus === "failed" || callStatus === "busy" || callStatus === "no-answer" || callStatus === "canceled")) {
      const dbStatus = STATUS_MAP[callStatus] ?? "COMPLETED";
      
      try {
        await db.callRecord.update({
          where: { callSid },
          data: {
            status: dbStatus,
            endedAt: new Date(),
            ...(duration ? { duration: parseInt(duration, 10) } : {}),
          },
        });
        console.log(`[Voice] Call record ${callSid} updated: status=${dbStatus}`);
      } catch (err) {
        // Record might not exist yet (race condition) or might have been created
        // by the voice server's endSession(). That's fine — log and continue.
        console.log(`[Voice] Could not update call record ${callSid} (may not exist yet or already updated)`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Voice] Status callback error:", err);
    return NextResponse.json({ error: "Failed to process status" }, { status: 500 });
  }
}
