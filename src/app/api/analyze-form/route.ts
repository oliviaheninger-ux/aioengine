import { analyzeForm } from "@/lib/analyzeForm";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const source = typeof body.source === "string" ? body.source : "";

    if (!source.trim()) {
      return Response.json(
        { error: "Please paste form code to analyze." },
        { status: 400 }
      );
    }

    const report = analyzeForm(source);

    return Response.json(report);
  } catch {
    return Response.json(
      { error: "Could not analyze the form code." },
      { status: 500 }
    );
  }
}