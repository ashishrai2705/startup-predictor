import { NextResponse } from "next/server";
import { mockMessages } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(mockMessages);
}

export async function POST(request: Request) {
  const json = await request.json();
  return NextResponse.json({ success: true, message: "Sent successfully" });
}
