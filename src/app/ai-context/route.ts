import { NextResponse } from "next/server";
import { siteConfig } from "../../siteconfig";

// This ensures your route is fast and doesn't rely on heavy server-side rendering
export const runtime = "edge";

export async function GET() {
  return NextResponse.json({
    status: "active",
    engine: "AIO Engine",
    timestamp: new Date().toISOString(),
    data: siteConfig,
  });
}