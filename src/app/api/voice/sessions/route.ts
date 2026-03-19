/* ─── Active Voice Sessions API ────────────────────────────────────────────
   Returns the list of currently active voice sessions for the dashboard.
   Used by the AI Agents page to show real-time call status.
   ──────────────────────────────────────────────────────────────────────── */

import { NextResponse } from "next/server";

// Note: In the serverless Vercel environment, this import won't share state
// with the voice server process. In production, sessions would be stored in
// Redis or the database. For the standalone voice server, this works correctly.
// For now, we return a demo response for the dashboard.

export async function GET() {
  // Phase 1: Return demo data for dashboard development
  // Phase 2: Query Redis/DB for active sessions from the voice server
  const demoSessions = [
    {
      id: "vs-demo-1",
      agentId: "agent-alex",
      agentName: "Alex",
      callSid: "CA-demo-001",
      status: "active" as const,
      startedAt: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 min ago
      callerNumber: "+12035550147",
      callerName: "Mrs. Johnson",
      model: "gpt-realtime-mini",
      duration: 180,
      toolCalls: 2,
      tokensUsed: 1247,
    },
  ];

  return NextResponse.json({
    sessions: demoSessions,
    totalActive: demoSessions.length,
    serverStatus: "running",
  });
}
