import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiRequestError } from '@/types';
import type { Product, ProductInput } from '@/types';
import { generateId } from '@/utils/id';
import { computeDiscountPercentage } from '@/utils/pricing';
import { placeholderProductImage } from '@/utils/productImage';
import { MOCK_PRODUCTS } from './products.data';

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

function toProduct(id: string, input: ProductInput): Product {
  return {
    id,
    barcode: input.barcode,
    name: input.name,
    brand: input.brand,
    description: input.description,
    category: input.category,
    price: input.price,
    discountPrice: input.discountPrice,
    discountPercentage: computeDiscountPercentage(input.price, input.discountPrice),
    image: input.image?.trim() || placeholderProductImage(input.name, input.category),
    stock: input.stock,
    unit: input.unit,
  };
}

export async function getAllProducts(): Promise<Product[]> {
  return readProducts();
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const products = await readProducts();
  if (products.some((p) => p.barcode === input.barcode)) {
    throw new ApiRequestError('A product with this barcode already exists.', 'DUPLICATE_BARCODE');
  }

  const product = toProduct(generateId('product'), input);
  await writeProducts([...products, product]);
  return product;
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  const products = await readProducts();
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) {
    throw new ApiRequestError('Product not found', 'NOT_FOUND');
  }
  if (products.some((p) => p.barcode === input.barcode && p.id !== id)) {
    throw new ApiRequestError('A product with this barcode already exists.', 'DUPLICATE_BARCODE');
  }

  const updated = toProduct(id, input);
  products[index] = updated;
  await writeProducts(products);
  return updated;
}

export async function deleteProduct(id: string): Promise<void> {
  const products = await readProducts();
  await writeProducts(products.filter((p) => p.id !== id));
}
