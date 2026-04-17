import { NextResponse } from "next/server";
import { mockPosts } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(mockPosts);
}

export async function POST(request: Request) {
  const json = await request.json();
  const newPost = {
    ...json,
    id: `post-${Date.now()}`,
    timestamp: "Just now",
  };
  return NextResponse.json({ success: true, post: newPost });
}
