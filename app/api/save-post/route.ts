import { NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"

const COLLECTION = "saved_posts"

// ─── POST /api/save-post ───────────────────────────────────────────────────
// Body: { userId, postId, startupData }
// Toggles save state — adds if not saved, removes if already saved.
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, postId, startupData } = body

    if (!userId || !postId) {
      return NextResponse.json({ error: "userId and postId are required" }, { status: 400 })
    }

    const db = await getDb()
    const col = db.collection(COLLECTION)

    const existing = await col.findOne({ userId, postId })

    if (existing) {
      // Already saved → remove (toggle off)
      await col.deleteOne({ userId, postId })
      return NextResponse.json({ saved: false, message: "Removed from Saved Posts" })
    } else {
      // Not saved → add (toggle on)
      await col.insertOne({
        userId,
        postId,
        startupData: startupData ?? {},
        savedAt: new Date(),
      })
      return NextResponse.json({ saved: true, message: "Saved to your library" })
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Save failed"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ─── GET /api/save-post?userId=<id> ──────────────────────────────────────────
// Returns all saved startups for the given user.
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 })
    }

    const db = await getDb()
    const col = db.collection(COLLECTION)

    const docs = await col
      .find({ userId })
      .sort({ savedAt: -1 })
      .toArray()

    const saved = docs.map((d) => ({
      postId: d.postId,
      savedAt: d.savedAt,
      startupData: d.startupData,
    }))

    return NextResponse.json(saved)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch saved posts"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
