import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

type AuditRequest = {
  url?: unknown;
};

const USER_AGENT = "aioengine-diagnostic-bot/1.0";
const REQUEST_TIMEOUT_MS = 8_000;

function normalizeUrl(value: unknown): URL {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("A website URL is required.");
  }

  const trimmedUrl = value.trim();
  const urlWithProtocol = /^https?:\/\//i.test(trimmedUrl)
    ? trimmedUrl
    : `https://${trimmedUrl}`;

  const parsedUrl = new URL(urlWithProtocol);

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are supported.");
  }

  return parsedUrl;
}

async function checkFile(origin: string, path: string): Promise<boolean> {
  const fileUrl = new URL(path, origin);

  try {
    const headResponse = await fetch(fileUrl, {
      method: "HEAD",
      headers: {
        "User-Agent": USER_AGENT,
      },
      redirect: "follow",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });

    if (headResponse.ok) {
      return true;
    }

    // Some servers reject HEAD requests even when the file exists.
    const getResponse = await fetch(fileUrl, {
      method: "GET",
      headers: {
        "User-Agent": USER_AGENT,
      },
      redirect: "follow",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });

    return getResponse.ok;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AuditRequest;
    const parsedUrl = normalizeUrl(body.url);
    const origin = parsedUrl.origin;

    const [hasRobots, hasLlms] = await Promise.all([
      checkFile(origin, "/robots.txt"),
      checkFile(origin, "/llms.txt"),
    ]);

    let hasSchema = false;

    try {
      const htmlResponse = await fetch(origin, {
        method: "GET",
        headers: {
          "User-Agent": USER_AGENT,
        },
        redirect: "follow",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        cache: "no-store",
      });

      if (htmlResponse.ok) {
        const html = await htmlResponse.text();
        const $ = cheerio.load(html);

        $('script[type="application/ld+json"]').each((_, element) => {
          const content = $(element).html();

          if (
            content &&
            (content.includes("LocalBusiness") ||
              content.includes("Organization"))
          ) {
            hasSchema = true;
          }
        });
      }
    } catch {
      console.log("Schema scrape failed, continuing audit.");
    }

    let score = 0;

    if (hasRobots) score += 20;
    if (hasLlms) score += 40;
    if (hasSchema) score += 40;

    return NextResponse.json({
      success: true,
      data: {
        score,
        robotsTxt: hasRobots,
        llmsTxt: hasLlms,
        schema: hasSchema,
        checkedUrl: origin,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The audit failed.";

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      {
        status: 400,
      },
    );
  }
}