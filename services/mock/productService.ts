import { delay } from '@/lib/delay';
import { ApiRequestError } from '@/types';
import type { Product, ProductCategory } from '@/types';
import { MOCK_PRODUCTS } from './products.data';

export async function getProducts(): Promise<Product[]> {
  await delay();
  return MOCK_PRODUCTS;
}

export async function getProduct(id: string): Promise<Product> {
  await delay();
  const product = MOCK_PRODUCTS.find((p) => p.id === id);
  if (!product) {
    throw new ApiRequestError('Product not found', 'NOT_FOUND');
  }
  return product;
}

export async function getProductByBarcode(barcode: string): Promise<Product | null> {
  await delay(Math.min(300, 300));
  return MOCK_PRODUCTS.find((p) => p.barcode === barcode) ?? null;
}

export async function searchProducts(query: string): Promise<Product[]> {
  await delay();
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  return MOCK_PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(normalized) ||
      p.brand.toLowerCase().includes(normalized) ||
      p.category.toLowerCase().includes(normalized),
  );
}

export async function getDeals(): Promise<Product[]> {
  await delay();
  return MOCK_PRODUCTS.filter((p) => p.discountPrice !== null);
}

export async function getProductsByCategory(category: ProductCategory): Promise<Product[]> {
  await delay();
  return MOCK_PRODUCTS.filter((p) => p.category === category);
}
