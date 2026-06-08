/** Local demo assets change often; skip Next image cache to avoid stale picsum thumbnails. */
export function isLocalDemoAsset(src: string): boolean {
  return src.startsWith("/demo/");
}

export function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function calcDiscount(price: number, compareAtPrice?: number | null): number {
  if (!compareAtPrice || compareAtPrice <= price) return 0;
  return Math.round(((compareAtPrice - price) / compareAtPrice) * 100);
}
