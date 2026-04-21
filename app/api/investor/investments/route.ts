import { NextResponse } from "next/server"

const API = process.env.ML_API_URL || "http://127.0.0.1:8000"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const res = await fetch(`${API}/investor/investments?${searchParams.toString()}`)

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: text }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch investments"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
