/**
 * One-time migration: merge duplicate size+color variants into one variant per size,
 * then schema can drop color columns.
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function mergeCartItems(fromId: string, toId: string): Promise<void> {
  const items = await prisma.cartItem.findMany({ where: { variantId: fromId } });
  for (const item of items) {
    const existing = await prisma.cartItem.findUnique({
      where: { userId_variantId: { userId: item.userId, variantId: toId } },
    });
    if (existing) {
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + item.quantity },
      });
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { variantId: toId },
      });
    }
  }
}

async function main(): Promise<void> {
  const products = await prisma.product.findMany({
    include: { variants: true },
  });

  let merged = 0;
  let removed = 0;

  for (const product of products) {
    const bySize = new Map<string, typeof product.variants>();
    for (const variant of product.variants) {
      const group = bySize.get(variant.size) ?? [];
      group.push(variant);
      bySize.set(variant.size, group);
    }

    for (const [, group] of bySize) {
      if (group.length <= 1) continue;

      const [keep, ...duplicates] = group;
      const totalStock = group.reduce((sum, v) => sum + v.stock, 0);

      await prisma.productVariant.update({
        where: { id: keep.id },
        data: { stock: totalStock },
      });

      for (const dup of duplicates) {
        await prisma.orderItem.updateMany({
          where: { variantId: dup.id },
          data: { variantId: keep.id },
        });
        await mergeCartItems(dup.id, keep.id);
        await prisma.productVariant.delete({ where: { id: dup.id } });
        removed++;
      }

      merged++;
    }
  }

  console.log(`Merged ${merged} size groups; removed ${removed} duplicate color variants.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
