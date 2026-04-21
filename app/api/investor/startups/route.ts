import { NextResponse } from "next/server"

const API = process.env.ML_API_URL || "http://127.0.0.1:8000"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const params = new URLSearchParams()
    
    const stage = searchParams.get("stage")
    const industry = searchParams.get("industry")
    const minScore = searchParams.get("minScore")
    const risk = searchParams.get("risk")
    const search = searchParams.get("search")

    if (stage) params.set("stage", stage)
    if (industry) params.set("industry", industry)
    if (minScore) params.set("min_score", minScore)
    if (risk) params.set("risk", risk)
    if (search) params.set("search", search)

    const res = await fetch(`${API}/startups?${params.toString()}`, {
      signal: AbortSignal.timeout(10000),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: text }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch startups"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
