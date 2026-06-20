export const runtime = "edge"; export async function GET() { return new Response("# AIO Engine\nAI optimization infrastructure for developers.", { headers: { "Content-Type": "text/markdown" } }); }
