import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const apiUrl = process.env.ML_API_URL || "http://127.0.0.1:8000";
    const response = await fetch(`${apiUrl}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      // 60s timeout for Gemini
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("FastAPI /analyze error:", response.status, errorText);
      let errorMessage = `Analysis failed (${response.status})`;
      try {
        const parsed = JSON.parse(errorText);
        errorMessage = parsed.detail || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      return NextResponse.json({ error: errorMessage }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Analyze API error:", error);
    const message = error instanceof Error ? error.message : "Analysis request failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
