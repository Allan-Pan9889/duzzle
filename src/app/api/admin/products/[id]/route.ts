import { Category } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (typeof body.name === "string") data.name = body.name.trim();
    if (typeof body.description === "string") data.description = body.description;
    if (body.price !== undefined) data.price = parseInt(String(body.price), 10);
    if (body.compareAtPrice !== undefined) {
      data.compareAtPrice = body.compareAtPrice
        ? parseInt(String(body.compareAtPrice), 10)
        : null;
    }
    if (body.category && ["WOMEN", "MEN"].includes(body.category)) {
      data.category = body.category as Category;
    }
    if (Array.isArray(body.images)) {
      data.images = body.images.filter((i: unknown) => typeof i === "string");
    }
    if (typeof body.isActive === "boolean") data.isActive = body.isActive;

    const product = await prisma.product.update({
      where: { id },
      data,
      include: { variants: true },
    });

    if (Array.isArray(body.variants)) {
      for (const v of body.variants) {
        if (typeof v.id === "string" && v.stock !== undefined) {
          await prisma.productVariant.update({
            where: { id: v.id },
            data: { stock: parseInt(String(v.stock), 10) },
          });
        }
      }
    }

    const updated = await prisma.product.findUnique({
      where: { id },
      include: { variants: true },
    });

    return NextResponse.json({ product: updated ?? product });
  } catch (error) {
    console.error("Admin product update error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
