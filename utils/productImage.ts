import { categoryMeta } from '@/constants/theme';
import type { ProductCategory } from '@/types';

export function placeholderProductImage(name: string, category: ProductCategory): string {
  const bg = (categoryMeta[category]?.color ?? '#e5e7eb').replace('#', '');
  return `https://placehold.co/300x300/${bg}/1f2937.png?text=${encodeURIComponent(name)}&font=roboto`;
}
