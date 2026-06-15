import { Category } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { isValidProductCategory } from "@/lib/categories";
import { getProducts } from "@/lib/products";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const category = searchParams.get("category") as Category | null;
    const search = searchParams.get("search") || searchParams.get("q") || undefined;
    const subCategory = searchParams.get("subCategory") || undefined;
    const minPriceRaw = searchParams.get("minPrice");
    const maxPriceRaw = searchParams.get("maxPrice");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const minPrice = minPriceRaw ? parseInt(minPriceRaw, 10) : undefined;
    const maxPrice = maxPriceRaw ? parseInt(maxPriceRaw, 10) : undefined;

    if (category && !isValidProductCategory(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const result = await getProducts({
      category: category || undefined,
      search,
      subCategory,
      minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Products API error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
