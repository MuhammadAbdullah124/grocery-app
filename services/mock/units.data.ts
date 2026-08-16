import type { Unit } from '@/types';

/** Slug is only used internally by mock fixtures to cross-reference products.data.ts. */
export const MOCK_UNITS: (Unit & { slug: string })[] = [
  { id: 'unit-pc', slug: 'pc', name: 'pc' },
  { id: 'unit-kg', slug: 'kg', name: 'kg' },
  { id: 'unit-g', slug: 'g', name: 'g' },
  { id: 'unit-l', slug: 'l', name: 'L' },
  { id: 'unit-ml', slug: 'ml', name: 'mL' },
  { id: 'unit-dozen', slug: 'dozen', name: 'dozen' },
  { id: 'unit-pack', slug: 'pack', name: 'pack' },
];
