import { NextResponse } from "next/server"

const API = process.env.ML_API_URL || "http://127.0.0.1:8000"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const res = await fetch(`${API}/investor/pipeline/update-stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: text }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update pipeline"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
