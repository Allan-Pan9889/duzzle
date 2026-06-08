import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await requireAdmin();

    const settings = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });

    return NextResponse.json({
      settings: settings ?? {
        freeShippingThreshold: 999,
        baseShippingFee: 79,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const freeShippingThreshold = parseInt(String(body.freeShippingThreshold), 10);
    const baseShippingFee = parseInt(String(body.baseShippingFee), 10);

    if (!Number.isFinite(freeShippingThreshold) || !Number.isFinite(baseShippingFee)) {
      return NextResponse.json({ error: "Invalid values" }, { status: 400 });
    }

    const settings = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: { freeShippingThreshold, baseShippingFee },
      create: { id: "default", freeShippingThreshold, baseShippingFee },
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Admin settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
