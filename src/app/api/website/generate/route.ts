import { NextRequest, NextResponse } from "next/server";
import { generateSiteHTML } from "@/lib/site-generator";
import { clientWebsites } from "@/lib/sample-data-p3";

export async function GET(request: NextRequest) {
  const siteId = request.nextUrl.searchParams.get("siteId");

  if (!siteId) {
    return NextResponse.json({ error: "siteId parameter is required" }, { status: 400 });
  }

  const site = clientWebsites.find((s) => s.id === siteId);

  if (!site) {
    return NextResponse.json({ error: "Site not found" }, { status: 404 });
  }

  const html = generateSiteHTML(site);

  return new NextResponse(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
