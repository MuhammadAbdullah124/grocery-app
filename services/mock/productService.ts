import { delay } from '@/lib/delay';
import { ApiRequestError } from '@/types';
import type { Product, ProductInput } from '@/types';
import * as productStore from './productStore';

export async function getProducts(): Promise<Product[]> {
  await delay();
  return productStore.getAllProducts();
}

export async function getProduct(id: string): Promise<Product> {
  await delay();
  const products = await productStore.getAllProducts();
  const product = products.find((p) => p.id === id);
  if (!product) {
    throw new ApiRequestError('Product not found', 'NOT_FOUND');
  }
  return product;
}

export async function getProductByBarcode(barcode: string): Promise<Product | null> {
  await delay(300);
  const products = await productStore.getAllProducts();
  return products.find((p) => p.barcode === barcode) ?? null;
}

export async function searchProducts(query: string): Promise<Product[]> {
  await delay();
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];
  const products = await productStore.getAllProducts();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(normalized) ||
      p.brand.toLowerCase().includes(normalized) ||
      p.category.toLowerCase().includes(normalized),
  );
}

export async function getDeals(): Promise<Product[]> {
  await delay();
  const products = await productStore.getAllProducts();
  return products.filter((p) => p.discountPrice !== null);
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  await delay();
  const products = await productStore.getAllProducts();
  return products.filter((p) => p.categoryId === categoryId);
}

export async function createProduct(input: ProductInput): Promise<Product> {
  await delay();
  return productStore.createProduct(input);
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  await delay();
  return productStore.updateProduct(id, input);
}

export async function deleteProduct(id: string): Promise<void> {
  await delay();
  return productStore.deleteProduct(id);
}
