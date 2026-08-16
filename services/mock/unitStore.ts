import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiRequestError } from '@/types';
import type { Unit } from '@/types';
import { generateId } from '@/utils/id';
import { MOCK_UNITS } from './units.data';

const UNITS_KEY = 'freshcart:units';

async function readUnits(): Promise<Unit[]> {
  const raw = await AsyncStorage.getItem(UNITS_KEY);
  if (!raw) return MOCK_UNITS;
  try {
    return JSON.parse(raw) as Unit[];
  } catch {
    return MOCK_UNITS;
  }
}

async function writeUnits(units: Unit[]): Promise<void> {
  await AsyncStorage.setItem(UNITS_KEY, JSON.stringify(units));
}

export async function getUnits(): Promise<Unit[]> {
  const units = await readUnits();
  return [...units].sort((a, b) => a.name.localeCompare(b.name));
}

export async function createUnit(name: string): Promise<Unit> {
  const trimmed = name.trim();
  const units = await readUnits();
  if (units.some((u) => u.name.toLowerCase() === trimmed.toLowerCase())) {
    throw new ApiRequestError('A unit with this name already exists.', 'DUPLICATE_UNIT');
  }

  const unit: Unit = { id: generateId('unit'), name: trimmed };
  await writeUnits([...units, unit]);
  return unit;
}

export async function deleteUnit(id: string): Promise<void> {
  const units = await readUnits();
  await writeUnits(units.filter((u) => u.id !== id));
}
