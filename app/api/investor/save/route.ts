import { NextResponse } from "next/server"

const API = process.env.ML_API_URL || "http://127.0.0.1:8000"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const res = await fetch(`${API}/investor/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(8000),
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data.detail || "Save failed" }, { status: res.status })
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save request failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
