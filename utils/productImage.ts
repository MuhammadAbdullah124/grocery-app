/**
 * Categories are user-managed, not a fixed list, so there's no per-category color map anymore —
 * this just hashes the category name into a small fixed palette for a bit of visual variety
 * (mirrors the same approach on the backend's Product::placeholderImage).
 */
const PLACEHOLDER_COLORS = ['fee2e2', 'dcfce7', 'dbeafe', 'fef3c7', 'e0e7ff', 'fce7f3', 'e5e7eb', 'fae8ff'];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Hex color (no leading #) deterministically derived from a category name. */
export function categoryColor(categoryName: string): string {
  return PLACEHOLDER_COLORS[hashString(categoryName) % PLACEHOLDER_COLORS.length];
}

export function placeholderProductImage(name: string, categoryName: string): string {
  return `https://placehold.co/300x300/${categoryColor(categoryName)}/1f2937.png?text=${encodeURIComponent(name)}&font=roboto`;
}
