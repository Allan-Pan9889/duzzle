import { Category, Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { isValidProductCategory } from "@/lib/categories";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";

const SIZES = ["S", "M", "L", "XL"];

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search")?.trim() || undefined;
    const category = searchParams.get("category") as Category | null;
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

    const where: Prisma.ProductWhereInput = {
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { slug: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(category && isValidProductCategory(category) ? { category } : {}),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          variants: { select: { stock: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const result = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: p.category,
      price: p.price,
      isActive: p.isActive,
      isDemo: p.isDemo,
      stock: p.variants.reduce((sum, v) => sum + v.stock, 0),
    }));

    return NextResponse.json({
      products: result,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const description = typeof body.description === "string" ? body.description : "";
    const price = parseInt(String(body.price), 10);
    const compareAtPrice = body.compareAtPrice
      ? parseInt(String(body.compareAtPrice), 10)
      : null;
    const category = body.category as Category;
    const images = Array.isArray(body.images)
      ? body.images.filter((i: unknown) => typeof i === "string" && i.trim())
      : [];
    const stock = parseInt(String(body.stock ?? 10), 10);
    const isActive = body.isActive !== false;

    if (!name || !Number.isFinite(price) || price <= 0) {
      return NextResponse.json({ error: "Name and valid price required" }, { status: 400 });
    }

    if (!isValidProductCategory(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    let slug = slugify(name);
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) slug = `${slug}-${Date.now()}`;

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price,
        compareAtPrice,
        category,
        images,
        isActive,
        isDemo: false,
        variants: {
          create: SIZES.map((size) => ({
            size,
            sku: `${slug}-${size}`.toUpperCase(),
            stock,
          })),
        },
      },
      include: { variants: true },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Admin product create error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
