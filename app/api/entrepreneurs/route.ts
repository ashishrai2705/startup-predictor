import { NextResponse } from "next/server";
import { mockEntrepreneurs } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(mockEntrepreneurs);
}
