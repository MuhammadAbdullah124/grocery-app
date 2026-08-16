import type { Category } from '@/types';

/** Slug is only used internally by mock fixtures to cross-reference products.data.ts. */
export const MOCK_CATEGORIES: (Category & { slug: string })[] = [
  { id: 'cat-fruits', slug: 'fruits', name: 'Fruits' },
  { id: 'cat-vegetables', slug: 'vegetables', name: 'Vegetables' },
  { id: 'cat-dairy', slug: 'dairy', name: 'Dairy' },
  { id: 'cat-bakery', slug: 'bakery', name: 'Bakery' },
  { id: 'cat-beverages', slug: 'beverages', name: 'Beverages' },
  { id: 'cat-snacks', slug: 'snacks', name: 'Snacks' },
  { id: 'cat-household', slug: 'household', name: 'Household' },
  { id: 'cat-personal_care', slug: 'personal_care', name: 'Personal Care' },
];
