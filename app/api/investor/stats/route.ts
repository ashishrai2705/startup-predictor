import { NextResponse } from "next/server"

const API = process.env.ML_API_URL || "http://127.0.0.1:8000"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const res = await fetch(`${API}/investor/dashboard-stats?${searchParams.toString()}`, {
      signal: AbortSignal.timeout(8000),
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data.detail || "Stats failed" }, { status: res.status })
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Stats request failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
