import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiRequestError } from '@/types';
import type { Category } from '@/types';
import { generateId } from '@/utils/id';
import { MOCK_CATEGORIES } from './categories.data';

const CATEGORIES_KEY = 'freshcart:categories';

async function readCategories(): Promise<Category[]> {
  const raw = await AsyncStorage.getItem(CATEGORIES_KEY);
  if (!raw) return MOCK_CATEGORIES;
  try {
    return JSON.parse(raw) as Category[];
  } catch {
    return MOCK_CATEGORIES;
  }
}

async function writeCategories(categories: Category[]): Promise<void> {
  await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
}

export async function getCategories(): Promise<Category[]> {
  const categories = await readCategories();
  return [...categories].sort((a, b) => a.name.localeCompare(b.name));
}

export async function createCategory(name: string): Promise<Category> {
  const trimmed = name.trim();
  const categories = await readCategories();
  if (categories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
    throw new ApiRequestError('A category with this name already exists.', 'DUPLICATE_CATEGORY');
  }

  const category: Category = { id: generateId('category'), name: trimmed };
  await writeCategories([...categories, category]);
  return category;
}

export async function deleteCategory(id: string): Promise<void> {
  const categories = await readCategories();
  await writeCategories(categories.filter((c) => c.id !== id));
}
