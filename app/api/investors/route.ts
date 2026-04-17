import { NextResponse } from "next/server";
import { mockInvestors } from "@/lib/mock-data";

export async function GET() {
  return NextResponse.json(mockInvestors);
}
