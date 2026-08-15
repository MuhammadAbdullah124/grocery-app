export function computeDiscountPercentage(price: number, discountPrice: number | null): number | null {
  if (discountPrice === null) return null;
  return Math.round(((price - discountPrice) / price) * 100);
}
