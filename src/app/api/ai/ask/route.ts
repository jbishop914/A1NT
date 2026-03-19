import { NextRequest, NextResponse } from "next/server";
import { agent, kbResearch, quickAsk, deepResearch } from "@/lib/perplexity";

/**
 * POST /api/ai/ask
 * AI-powered Q&A. Supports three modes via `mode` field:
 *   - "quick"    → fast-search preset (default)
 *   - "research" → search + summarize for KB
 *   - "deep"     → deep-research preset for thorough analysis
 *
 * Body: { query: string; mode?: "quick" | "research" | "deep"; domainFilter?: string[]; recencyFilter?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, mode = "quick", domainFilter, recencyFilter } = body as {
      query: string;
      mode?: "quick" | "research" | "deep";
      domainFilter?: string[];
      recencyFilter?: "day" | "week" | "month" | "year";
    };

    if (!query?.trim()) {
      return NextResponse.json({ error: "query is required" }, { status: 400 });
    }

    switch (mode) {
      case "quick": {
        const data = await quickAsk(query);
        return NextResponse.json({
          mode: "quick",
          query,
          answer: data.answer,
          citations: data.citations,
          timestamp: new Date().toISOString(),
        });
      }

      case "research": {
        const data = await kbResearch({
          query,
          domainFilter,
          recencyFilter,
          maxResults: 8,
        });
        return NextResponse.json({
          mode: "research",
          ...data,
        });
      }

      case "deep": {
        const data = await deepResearch(query);
        return NextResponse.json({
          mode: "deep",
          ...data,
        });
      }

      default:
        return NextResponse.json(
          { error: `Invalid mode: ${mode}` },
          { status: 400 },
        );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/ai/ask]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
