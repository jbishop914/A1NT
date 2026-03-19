import { NextRequest, NextResponse } from "next/server";

/**
 * POST /api/ai/save-to-kb
 * Saves a research result as a Knowledge Base article.
 *
 * In demo mode (no DB), this returns the article object that would be persisted.
 * When Prisma + PostgreSQL are connected, this will write to the KB table.
 *
 * Body: {
 *   title: string;
 *   content: string;     // the AI-generated summary / research
 *   query: string;       // original search query
 *   citations: string[]; // source URLs
 *   tags: string[];      // auto-generated or user-edited tags
 *   category: string;    // KB category
 *   source: "ai-research" | "ai-quick" | "ai-deep";
 * }
 */

interface SaveToKBRequest {
  title: string;
  content: string;
  query: string;
  citations: string[];
  tags: string[];
  category: string;
  source: "ai-research" | "ai-quick" | "ai-deep";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SaveToKBRequest;

    if (!body.title?.trim() || !body.content?.trim()) {
      return NextResponse.json(
        { error: "title and content are required" },
        { status: 400 },
      );
    }

    // Build the KB article record
    const article = {
      id: `kb-ai-${Date.now()}`,
      title: body.title,
      content: body.content,
      query: body.query,
      citations: body.citations ?? [],
      tags: body.tags ?? [],
      category: body.category || "Research",
      source: body.source || "ai-research",
      author: "AI Research Assistant",
      status: "Draft" as const,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      views: 0,
      helpful: 0,
    };

    // TODO: When DB is connected, persist via Prisma:
    // await prisma.kbArticle.create({ data: article });

    return NextResponse.json({
      success: true,
      article,
      message: "Article saved to Knowledge Base (demo mode)",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[/api/ai/save-to-kb]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
