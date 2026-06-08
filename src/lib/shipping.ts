export function calcShipping(
  subtotal: number,
  threshold: number,
  baseFee: number,
): number {
  return subtotal >= threshold ? 0 : baseFee;
}

export async function getShippingSettings() {
  const { prisma } = await import("./prisma");
  const settings = await prisma.siteSettings.findUnique({
    where: { id: "default" },
  });

  return {
    freeShippingThreshold: settings?.freeShippingThreshold ?? 999,
    baseShippingFee: settings?.baseShippingFee ?? 79,
  };
}
