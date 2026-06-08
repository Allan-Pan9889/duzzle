import { Category, Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export type ProductListParams = {
  category?: Category;
  search?: string;
  page?: number;
  limit?: number;
};

export async function getProducts(params: ProductListParams = {}) {
  const { category, search, page = 1, limit = 20 } = params;

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(category ? { category } : {}),
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
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
      },
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total, page, limit };
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      variants: {
        orderBy: [{ size: "asc" }, { color: "asc" }],
      },
    },
  });
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
