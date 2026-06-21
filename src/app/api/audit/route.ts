import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export const runtime = "nodejs";

type AuditRequest = {
  url?: unknown;
};

type AuditCheck = {
  id: string;
  label: string;
  passed: boolean;
  weight: number;
  detail: string;
};

const USER_AGENT = "aioengine-diagnostic-bot/1.0";
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 3;
const MAX_HTML_LENGTH = 2_000_000;

function isPrivateIpAddress(address: string): boolean {
  const normalizedAddress = address.toLowerCase();

  if (normalizedAddress.startsWith("::ffff:")) {
    return isPrivateIpAddress(normalizedAddress.slice(7));
  }

  const version = isIP(normalizedAddress);

  if (version === 4) {
    const parts = normalizedAddress.split(".").map(Number);
    const [first, second] = parts;

    return (
      first === 0 ||
      first === 10 ||
      first === 127 ||
      (first === 100 && second >= 64 && second <= 127) ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168) ||
      (first === 198 && (second === 18 || second === 19)) ||
      first >= 224
    );
  }

  if (version === 6) {
    return (
      normalizedAddress === "::" ||
      normalizedAddress === "::1" ||
      normalizedAddress.startsWith("fc") ||
      normalizedAddress.startsWith("fd") ||
      normalizedAddress.startsWith("fe8") ||
      normalizedAddress.startsWith("fe9") ||
      normalizedAddress.startsWith("fea") ||
      normalizedAddress.startsWith("feb")
    );
  }

  return false;
}

async function assertPublicUrl(url: URL): Promise<void> {
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs are supported.");
  }

  const hostname = url.hostname.toLowerCase();

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local")
  ) {
    throw new Error("Local and private websites cannot be audited.");
  }

  const addresses = await lookup(hostname, {
    all: true,
    verbatim: true,
  });

  if (
    addresses.length === 0 ||
    addresses.some(({ address }) => isPrivateIpAddress(address))
  ) {
    throw new Error("Local and private websites cannot be audited.");
  }
}

function normalizeUrl(value: unknown): URL {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Enter a website URL.");
  }

  const trimmedUrl = value.trim();

  const urlWithProtocol = /^https?:\/\//i.test(trimmedUrl)
    ? trimmedUrl
    : `https://${trimmedUrl}`;

  const parsedUrl = new URL(urlWithProtocol);

  parsedUrl.hash = "";

  return parsedUrl;
}

async function safeFetch(
  initialUrl: URL,
  init: RequestInit = {},
): Promise<{ response: Response; finalUrl: URL }> {
  let currentUrl = new URL(initialUrl);

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount++) {
    await assertPublicUrl(currentUrl);

    const response = await fetch(currentUrl, {
      ...init,
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      headers: {
        "User-Agent": USER_AGENT,
        ...init.headers,
      },
    });

    if (
      response.status >= 300 &&
      response.status < 400 &&
      response.headers.has("location")
    ) {
      const location = response.headers.get("location");

      if (!location) {
        return {
          response,
          finalUrl: currentUrl,
        };
      }

      await response.body?.cancel();
      currentUrl = new URL(location, currentUrl);
      continue;
    }

    return {
      response,
      finalUrl: currentUrl,
    };
  }

  throw new Error("The website redirected too many times.");
}

async function fetchTextResource(
  resourceUrl: URL,
): Promise<{ exists: boolean; text: string }> {
  try {
    const { response } = await safeFetch(resourceUrl, {
      method: "GET",
      headers: {
        Accept: "text/plain,text/html,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    if (!response.ok) {
      return {
        exists: false,
        text: "",
      };
    }

    const text = await response.text();

    return {
      exists: true,
      text: text.slice(0, MAX_HTML_LENGTH),
    };
  } catch {
    return {
      exists: false,
      text: "",
    };
  }
}

async function resourceExists(resourceUrl: URL): Promise<boolean> {
  try {
    const { response } = await safeFetch(resourceUrl, {
      method: "GET",
    });

    await response.body?.cancel();

    return response.ok;
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AuditRequest;
    const requestedUrl = normalizeUrl(body.url);

    const { response: homepageResponse, finalUrl } = await safeFetch(
      requestedUrl,
      {
        method: "GET",
        headers: {
          Accept: "text/html,application/xhtml+xml",
        },
      },
    );

    if (!homepageResponse.ok) {
      throw new Error(
        `The website returned status ${homepageResponse.status}.`,
      );
    }

    const contentType = homepageResponse.headers.get("content-type") ?? "";

    if (!contentType.includes("text/html")) {
      throw new Error("The submitted URL did not return an HTML webpage.");
    }

    const html = (await homepageResponse.text()).slice(0, MAX_HTML_LENGTH);
    const $ = cheerio.load(html);

    const origin = finalUrl.origin;

    const robotsUrl = new URL("/robots.txt", origin);
    const llmsUrl = new URL("/llms.txt", origin);

    const [robotsResource, llmsResource] = await Promise.all([
      fetchTextResource(robotsUrl),
      fetchTextResource(llmsUrl),
    ]);

    const declaredSitemapMatch = robotsResource.text.match(
      /^sitemap:\s*(\S+)/im,
    );

    const sitemapUrl = declaredSitemapMatch?.[1]
      ? new URL(declaredSitemapMatch[1], origin)
      : new URL("/sitemap.xml", origin);

    const hasSitemap = await resourceExists(sitemapUrl);

    const pageTitle = $("title").first().text().trim();

    const metaDescription =
      $('meta[name="description"]').first().attr("content")?.trim() ?? "";

    const canonicalUrl =
      $('link[rel="canonical"]').first().attr("href")?.trim() ?? "";

    let hasSchema = false;
    const schemaTypes = new Set<string>();

    $('script[type="application/ld+json"]').each((_, element) => {
      const content = $(element).html()?.trim();

      if (!content) {
        return;
      }

      try {
        const parsedSchema = JSON.parse(content) as unknown;
        hasSchema = true;

        const inspectSchema = (value: unknown): void => {
          if (Array.isArray(value)) {
            value.forEach(inspectSchema);
            return;
          }

          if (!value || typeof value !== "object") {
            return;
          }

          const record = value as Record<string, unknown>;
          const schemaType = record["@type"];

          if (typeof schemaType === "string") {
            schemaTypes.add(schemaType);
          }

          if (Array.isArray(schemaType)) {
            schemaType.forEach((type) => {
              if (typeof type === "string") {
                schemaTypes.add(type);
              }
            });
          }

          if (record["@graph"]) {
            inspectSchema(record["@graph"]);
          }
        };

        inspectSchema(parsedSchema);
      } catch {
        // Invalid JSON-LD does not count as valid structured data.
      }
    });

    const checks: AuditCheck[] = [
      {
        id: "homepage",
        label: "Homepage accessible",
        passed: true,
        weight: 10,
        detail: `Loaded ${finalUrl.href}`,
      },
      {
        id: "robots",
        label: "Robots.txt",
        passed: robotsResource.exists,
        weight: 15,
        detail: robotsResource.exists
          ? "A robots.txt file was detected."
          : "No robots.txt file was found.",
      },
      {
        id: "llms",
        label: "LLMs.txt",
        passed: llmsResource.exists,
        weight: 20,
        detail: llmsResource.exists
          ? "An llms.txt file was detected."
          : "No llms.txt file was found.",
      },
      {
        id: "sitemap",
        label: "XML sitemap",
        passed: hasSitemap,
        weight: 15,
        detail: hasSitemap
          ? `A sitemap was detected at ${sitemapUrl.href}`
          : "No accessible sitemap was found.",
      },
      {
        id: "schema",
        label: "Structured data",
        passed: hasSchema,
        weight: 15,
        detail: hasSchema
          ? `Valid JSON-LD detected${
              schemaTypes.size > 0
                ? `: ${Array.from(schemaTypes).join(", ")}`
                : "."
            }`
          : "No valid JSON-LD structured data was detected.",
      },
      {
        id: "title",
        label: "Page title",
        passed: pageTitle.length > 0,
        weight: 10,
        detail: pageTitle || "No page title was detected.",
      },
      {
        id: "description",
        label: "Meta description",
        passed: metaDescription.length > 0,
        weight: 10,
        detail:
          metaDescription || "No meta description was detected.",
      },
      {
        id: "canonical",
        label: "Canonical URL",
        passed: canonicalUrl.length > 0,
        weight: 5,
        detail: canonicalUrl || "No canonical URL was detected.",
      },
    ];

    const score = checks.reduce(
      (total, check) => total + (check.passed ? check.weight : 0),
      0,
    );

    return NextResponse.json({
      success: true,
      data: {
        score,
        checkedUrl: finalUrl.href,
        checkedAt: new Date().toISOString(),
        checks,

        // Kept for compatibility with the current homepage.
        robotsTxt: robotsResource.exists,
        llmsTxt: llmsResource.exists,
        schema: hasSchema,
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