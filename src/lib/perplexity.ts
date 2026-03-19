/**
 * Perplexity AI Service Layer
 *
 * Provides typed access to Perplexity's three API surfaces:
 *   1. Search API  – raw ranked web results with filters
 *   2. Agent API   – third-party LLMs with web_search + fetch_url tools
 *   3. Sonar API   – Perplexity's native models with built-in search
 *
 * The API key is read from PERPLEXITY_API_KEY env var (server-side only).
 */

// ────────────────────────────────────────────────────────
// Types — Search API
// ────────────────────────────────────────────────────────

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  date?: string | null;
  last_updated?: string | null;
}

export interface SearchRequest {
  query: string | string[];
  max_results?: number;
  max_tokens_per_page?: number;
  max_tokens?: number;
  country?: string;
  search_domain_filter?: string[];
  search_language_filter?: string[];
  search_recency_filter?: "hour" | "day" | "week" | "month" | "year";
  search_after_date?: string;
  search_before_date?: string;
}

export interface SearchResponse {
  id: string;
  results: SearchResult[] | SearchResult[][];
}

// ────────────────────────────────────────────────────────
// Types — Agent API
// ────────────────────────────────────────────────────────

export type AgentPreset =
  | "fast-search"
  | "pro-search"
  | "deep-research"
  | "advanced-deep-research";

export type AgentModel =
  | "openai/gpt-5.4"
  | "openai/gpt-5.2"
  | "openai/gpt-5.1"
  | "openai/gpt-5-mini"
  | "anthropic/claude-opus-4-6"
  | "anthropic/claude-sonnet-4-6"
  | "anthropic/claude-haiku-4-5"
  | "google/gemini-3.1-pro-preview"
  | "google/gemini-3-flash-preview"
  | "google/gemini-2.5-pro"
  | "google/gemini-2.5-flash"
  | "xai/grok-4-1-fast-non-reasoning"
  | "nvidia/nemotron-3-super-120b-a12b"
  | "perplexity/sonar";

export interface AgentWebSearchTool {
  type: "web_search";
  filters?: {
    search_domain_filter?: string[];
    search_recency_filter?: "day" | "week" | "month" | "year";
    search_after_date?: string;
    search_before_date?: string;
    max_tokens_per_page?: number;
  };
}

export interface AgentFetchUrlTool {
  type: "fetch_url";
}

export interface AgentFunctionTool {
  type: "function";
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  strict?: boolean;
}

export type AgentTool = AgentWebSearchTool | AgentFetchUrlTool | AgentFunctionTool;

export interface AgentResponseFormat {
  type: "json_schema";
  json_schema: {
    name: string;
    schema: Record<string, unknown>;
  };
}

export interface AgentRequest {
  /** Use either preset or model, not both */
  preset?: AgentPreset;
  model?: AgentModel;
  input: string;
  instructions?: string;
  tools?: AgentTool[];
  stream?: boolean;
  max_output_tokens?: number;
  response_format?: AgentResponseFormat;
}

export interface AgentOutputItem {
  type: string;
  text?: string;
  call_id?: string;
  name?: string;
  arguments?: string;
}

export interface AgentUsage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

export interface AgentResponse {
  id: string;
  output: AgentOutputItem[];
  output_text: string;
  usage?: AgentUsage;
  citations?: string[];
  search_results?: SearchResult[];
}

// ────────────────────────────────────────────────────────
// Types — Sonar (Chat Completions) API
// ────────────────────────────────────────────────────────

export type SonarModel =
  | "sonar"
  | "sonar-pro"
  | "sonar-deep-research"
  | "sonar-reasoning-pro";

export interface SonarMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface SonarRequest {
  model: SonarModel;
  messages: SonarMessage[];
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  search_mode?: "web" | "academic" | "sec";
  search_domain_filter?: string[];
  search_recency_filter?: "hour" | "day" | "week" | "month" | "year";
  return_images?: boolean;
  return_related_questions?: boolean;
  response_format?: AgentResponseFormat;
}

export interface SonarChoice {
  index: number;
  finish_reason: string;
  message: SonarMessage;
}

export interface SonarResponse {
  id: string;
  model: string;
  choices: SonarChoice[];
  citations?: string[];
  search_results?: SearchResult[];
  related_questions?: string[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ────────────────────────────────────────────────────────
// Client
// ────────────────────────────────────────────────────────

const BASE = "https://api.perplexity.ai";

function getApiKey(): string {
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) throw new Error("PERPLEXITY_API_KEY environment variable is not set");
  return key;
}

async function pplxFetch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`Perplexity API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

// ────────────────────────────────────────────────────────
// Public API
// ────────────────────────────────────────────────────────

/**
 * Search API — raw ranked web results.
 * POST https://api.perplexity.ai/search
 */
export async function search(req: SearchRequest): Promise<SearchResponse> {
  return pplxFetch<SearchResponse>("/search", req);
}

/**
 * Agent API — third-party LLMs with web tools.
 * POST https://api.perplexity.ai/v1/agent
 */
export async function agent(req: AgentRequest): Promise<AgentResponse> {
  return pplxFetch<AgentResponse>("/v1/agent", req);
}

/**
 * Sonar (Chat Completions) API — Perplexity's native models.
 * POST https://api.perplexity.ai/v1/sonar
 */
export async function sonar(req: SonarRequest): Promise<SonarResponse> {
  return pplxFetch<SonarResponse>("/v1/sonar", req);
}

// ────────────────────────────────────────────────────────
// Convenience: KB Research helpers
// ────────────────────────────────────────────────────────

export interface KBSearchParams {
  query: string;
  domainFilter?: string[];
  recencyFilter?: "day" | "week" | "month" | "year";
  maxResults?: number;
}

export interface KBResearchResult {
  query: string;
  results: SearchResult[];
  summary: string;
  citations: string[];
  model: string;
  timestamp: string;
}

/**
 * Two-step KB research: first search the web for raw results,
 * then summarize with an AI model for the Knowledge Base.
 */
export async function kbResearch(params: KBSearchParams): Promise<KBResearchResult> {
  const { query, domainFilter, recencyFilter, maxResults = 8 } = params;

  // Step 1: raw search results
  const searchRes = await search({
    query,
    max_results: maxResults,
    max_tokens_per_page: 2048,
    search_domain_filter: domainFilter,
    search_recency_filter: recencyFilter,
  });

  const rawResults = (Array.isArray(searchRes.results[0])
    ? (searchRes.results as SearchResult[][])[0]
    : searchRes.results) as SearchResult[];

  // Step 2: summarize with Agent API (pro-search preset)
  const agentRes = await agent({
    preset: "pro-search",
    input: `Based on these search results, provide a comprehensive, well-organized summary answering the question: "${query}"\n\nSearch results:\n${rawResults.map((r, i) => `[${i + 1}] ${r.title}\n${r.snippet?.slice(0, 500)}\nURL: ${r.url}`).join("\n\n")}`,
    instructions: "Provide a clear, factual summary with inline citations using [1], [2], etc. referencing the search results. Organize with headers if the topic is complex. Keep it concise but thorough.",
    tools: [{ type: "web_search" }],
  });

  return {
    query,
    results: rawResults,
    summary: agentRes.output_text,
    citations: agentRes.citations ?? rawResults.map((r) => r.url),
    model: "pro-search",
    timestamp: new Date().toISOString(),
  };
}

/**
 * Quick AI ask — uses the fast-search preset for quick answers.
 */
export async function quickAsk(question: string): Promise<{ answer: string; citations: string[] }> {
  const res = await agent({
    preset: "fast-search",
    input: question,
  });

  return {
    answer: res.output_text,
    citations: res.citations ?? [],
  };
}

/**
 * Deep research — uses the deep-research preset for thorough analysis.
 */
export async function deepResearch(
  topic: string,
  instructions?: string,
): Promise<KBResearchResult> {
  const res = await agent({
    preset: "deep-research",
    input: topic,
    instructions:
      instructions ??
      "Provide a comprehensive, well-cited analysis suitable for a professional knowledge base article. Use clear headers, include specific data points, and cite all sources.",
    tools: [{ type: "web_search" }, { type: "fetch_url" }],
  });

  return {
    query: topic,
    results: res.search_results ?? [],
    summary: res.output_text,
    citations: res.citations ?? [],
    model: "deep-research",
    timestamp: new Date().toISOString(),
  };
}
