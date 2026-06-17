import { Category, Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export type ProductListParams = {
  category?: Category;
  subCategory?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
};

export async function getProducts(params: ProductListParams = {}) {
  const {
    category,
    subCategory,
    search,
    minPrice,
    maxPrice,
    page = 1,
    limit = 20,
  } = params;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(category ? { category } : {}),
    ...(subCategory ? { subCategory } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          price: {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          },
        }
      : {}),
  };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        slug: true,
        name: true,
        price: true,
        compareAtPrice: true,
        images: true,
        category: true,
        subCategory: true,
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      variants: {
        orderBy: { size: "asc" },
        select: {
          id: true,
          size: true,
          stock: true,
        },
      },
    },
  });
}

export async function getNewArrivalsForHome() {
  const select = {
    id: true,
    slug: true,
    name: true,
    price: true,
    compareAtPrice: true,
    images: true,
    category: true,
    createdAt: true,
  } as const;

  const [women, men, kids] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, category: "WOMEN" },
      orderBy: { createdAt: "desc" },
      take: 3,
      select,
    }),
    prisma.product.findMany({
      where: { isActive: true, category: "MEN" },
      orderBy: { createdAt: "desc" },
      take: 3,
      select,
    }),
    prisma.product.findMany({
      where: { isActive: true, category: "KIDS" },
      orderBy: { createdAt: "desc" },
      take: 2,
      select,
    }),
  ]);

  return [...women, ...men, ...kids];
}

export async function getLatestProducts(limit = 8) {
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,
      compareAtPrice: true,
      images: true,
    },
  });
}

export async function getPriceBounds(category?: Category) {
  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(category ? { category } : {}),
  };

  const agg = await prisma.product.aggregate({
    where,
    _min: { price: true },
    _max: { price: true },
  });

  return {
    min: agg._min.price ?? 100,
    max: agg._max.price ?? 10000,
  };
}
