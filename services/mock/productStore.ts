import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiRequestError } from '@/types';
import type { Product, ProductInput } from '@/types';
import { generateId } from '@/utils/id';
import { computeDiscountPercentage } from '@/utils/pricing';
import { placeholderProductImage } from '@/utils/productImage';
import { MOCK_PRODUCTS } from './products.data';
import { getCategories } from './categoryStore';
import { getUnits } from './unitStore';

const PRODUCTS_KEY = 'freshcart:products';

async function readProducts(): Promise<Product[]> {
  const raw = await AsyncStorage.getItem(PRODUCTS_KEY);
  if (!raw) return MOCK_PRODUCTS;
  try {
    return JSON.parse(raw) as Product[];
  } catch {
    return MOCK_PRODUCTS;
  }
}

async function writeProducts(products: Product[]): Promise<void> {
  await AsyncStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

async function toProduct(id: string, input: ProductInput): Promise<Product> {
  const [categories, units] = await Promise.all([getCategories(), getUnits()]);
  const category = categories.find((c) => c.id === input.categoryId);
  const unit = units.find((u) => u.id === input.unitId);
  if (!category) throw new ApiRequestError('Category not found', 'NOT_FOUND');
  if (!unit) throw new ApiRequestError('Unit not found', 'NOT_FOUND');

  return {
    id,
    barcode: input.barcode?.trim() || null,
    name: input.name,
    brand: input.brand,
    description: input.description,
    category: category.name,
    categoryId: category.id,
    purchasePrice: input.purchasePrice ?? null,
    price: input.price,
    discountPrice: input.discountPrice,
    discountPercentage: computeDiscountPercentage(input.price, input.discountPrice),
    image: input.image?.trim() || placeholderProductImage(input.name, category.name),
    stock: input.stock,
    unit: unit.name,
    unitId: unit.id,
  };
}

export async function getAllProducts(): Promise<Product[]> {
  return readProducts();
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const products = await readProducts();
  if (input.barcode?.trim() && products.some((p) => p.barcode === input.barcode?.trim())) {
    throw new ApiRequestError('A product with this barcode already exists.', 'DUPLICATE_BARCODE');
  }

  const product = await toProduct(generateId('product'), input);
  await writeProducts([...products, product]);
  return product;
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  const products = await readProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new ApiRequestError('Product not found', 'NOT_FOUND');
  }
  if (input.barcode?.trim() && products.some((p) => p.barcode === input.barcode?.trim() && p.id !== id)) {
    throw new ApiRequestError('A product with this barcode already exists.', 'DUPLICATE_BARCODE');
  }

  const updated = await toProduct(id, input);
  products[index] = updated;
  await writeProducts(products);
  return updated;
}

export async function deleteProduct(id: string): Promise<void> {
  const products = await readProducts();
  await writeProducts(products.filter((p) => p.id !== id));
}

/** Mock-mode mirror of PurchaseController::store's row-locked stock increment. */
export async function incrementStock(id: string, quantity: number): Promise<void> {
  const products = await readProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return;
  products[index] = { ...products[index], stock: products[index].stock + quantity };
  await writeProducts(products);
}
