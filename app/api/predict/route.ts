import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const apiUrl = process.env.ML_API_URL || "http://127.0.0.1:8000";
    const response = await fetch(`${apiUrl}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("FastAPI error:", response.status, errorText);
      return NextResponse.json(
        { error: `FastAPI returned ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error("Prediction API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Prediction failed" },
      { status: 500 }
    );
  }
}
