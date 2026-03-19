import { NextRequest, NextResponse } from "next/server";
import { search, type SearchRequest } from "@/lib/perplexity";

/**
 * POST /api/ai/search
 * Proxies to the Perplexity Search API.
 * Body: SearchRequest (query, max_results, filters, etc.)
 */
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SearchRequest;

    if (!body.query || (typeof body.query === "string" && !body.query.trim())) {
      return NextResponse.json(
        { error: "query is required" },
        { status: 400 },
      );
    }

    const data = await search({
      query: body.query,
      max_results: body.max_results ?? 8,
      max_tokens_per_page: body.max_tokens_per_page ?? 2048,
      max_tokens: body.max_tokens,
      country: body.country,
      search_domain_filter: body.search_domain_filter,
      search_language_filter: body.search_language_filter,
      search_recency_filter: body.search_recency_filter,
      search_after_date: body.search_after_date,
      search_before_date: body.search_before_date,
    });

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/ai/search]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
