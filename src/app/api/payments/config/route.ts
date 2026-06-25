import { NextResponse } from "next/server";
import { isSabpaisaConfigured } from "@/lib/sabpaisa";

export async function GET() {
  return NextResponse.json({
    sabpaisaAvailable: isSabpaisaConfigured(),
  });
}
