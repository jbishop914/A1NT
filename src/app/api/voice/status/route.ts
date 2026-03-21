/* ─── Twilio Voice Status Callback ─────────────────────────────────────────
   
   Receives call status updates from Twilio (initiated, ringing, answered,
   completed, busy, no-answer, canceled, failed).
   
   Updates the CallRecord status in PostgreSQL when a call ends.
   
   Configure in Twilio console under the phone number's "Status Callback URL":
   https://your-domain.com/api/voice/status
   ──────────────────────────────────────────────────────────────────────── */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ingestMessage } from "@/lib/messages/ingest";

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
        // Try updating by callSid first. If the record was created with a temp SID
        // (pending-xxx) and the real SID was never written (e.g. call failed instantly),
        // fall back to finding any ACTIVE outbound record matching the caller/callee.
        let updatedRecord;
        try {
          updatedRecord = await db.callRecord.update({
            where: { callSid },
            data: {
              status: dbStatus,
              endedAt: new Date(),
              ...(duration ? { duration: parseInt(duration, 10) } : {}),
            },
          });
        } catch {
          // callSid not found — try finding the record by the To number + ACTIVE status
          const fallback = await db.callRecord.findFirst({
            where: {
              callerNumber: from,
              direction: "OUTBOUND",
              status: "ACTIVE",
            },
            orderBy: { startedAt: "desc" },
          });
          if (fallback) {
            updatedRecord = await db.callRecord.update({
              where: { id: fallback.id },
              data: {
                callSid, // Store the real SID
                status: dbStatus,
                endedAt: new Date(),
                ...(duration ? { duration: parseInt(duration, 10) } : {}),
              },
            });
            console.log(`[Voice] Fallback: matched ACTIVE record ${fallback.id} for callSid ${callSid}`);
          }
        }
        if (!updatedRecord) throw new Error("No matching record found");
        console.log(`[Voice] Call record ${callSid} updated: status=${dbStatus}`);

        // Also update the linked OutboundQueueItem if this was an outbound call
        if (updatedRecord.direction === "OUTBOUND") {
          try {
            // Map call status to queue outcome
            const outcomeMap: Record<string, string> = {
              completed: "ANSWERED",
              failed: "NO_ANSWER",
              busy: "BUSY",
              "no-answer": "NO_ANSWER",
              canceled: "NO_ANSWER",
            };

            const queueStatus = dbStatus === "COMPLETED" ? "COMPLETED" : "FAILED";
            const outcome = outcomeMap[callStatus] ?? "NO_ANSWER";

            // Find the OutboundQueueItem linked to this CallRecord
            const queueItem = await db.outboundQueueItem.findUnique({
              where: { callRecordId: updatedRecord.id },
            });

            if (queueItem) {
              await db.outboundQueueItem.update({
                where: { id: queueItem.id },
                data: {
                  status: queueStatus as any,
                  outcome: outcome as any,
                  completedAt: new Date(),
                  duration: duration ? parseInt(duration, 10) : null,
                },
              });
              console.log(`[Voice] OutboundQueueItem ${queueItem.id} updated: status=${queueStatus}, outcome=${outcome}`);
            }
          } catch (queueErr) {
            console.log(`[Voice] Could not update OutboundQueueItem for call ${callSid}:`, queueErr);
          }
        }

        // ── Ingest into Unified Messages ──
        try {
          const callDuration = duration ? parseInt(duration, 10) : 0;
          const summaryText = updatedRecord.summary || "Call completed";
          const transcriptData = updatedRecord.transcript as
            | Array<{ speaker: string; text: string }>
            | null;
          const formattedTranscript = transcriptData
            ? transcriptData
                .map((t) => `${t.speaker}: ${t.text}`)
                .join("\n")
            : undefined;

          await ingestMessage({
            channel: "PHONE",
            direction: updatedRecord.direction as "INBOUND" | "OUTBOUND",
            contactName: updatedRecord.callerName || updatedRecord.callerNumber,
            contactPhone: updatedRecord.callerNumber,
            body: summaryText,
            preview: summaryText.substring(0, 120),
            sourceId: updatedRecord.id,
            sourceType: "CallRecord",
            hasVoicemail:
              dbStatus === "MISSED" && callDuration > 10,
            transcription: formattedTranscript,
            organizationId: updatedRecord.organizationId,
          });
          console.log(`[Voice] Ingested call ${callSid} into Messages`);
        } catch (ingestErr) {
          console.log(`[Voice] Could not ingest call into Messages:`, ingestErr);
        }
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
