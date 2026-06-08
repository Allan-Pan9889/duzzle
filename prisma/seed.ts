import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      freeShippingThreshold: 999,
      baseShippingFee: 79,
    },
  });

  const passwordHash = await bcrypt.hash(
    process.env.ADMIN_PASSWORD || "admin123",
    10,
  );

  await prisma.admin.upsert({
    where: { email: process.env.ADMIN_EMAIL || "admin@duzzle.com" },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || "admin@duzzle.com",
      passwordHash,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
