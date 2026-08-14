import { CURRENCY_SYMBOL } from '@/constants/config';

export function formatPrice(amount: number): string {
  const rounded = Math.round(amount);
  return `${CURRENCY_SYMBOL} ${rounded.toLocaleString('en-PK')}`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString('en-PK', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatUnit(unit: string): string {
  const map: Record<string, string> = {
    pc: 'pc',
    kg: 'kg',
    g: 'g',
    l: 'L',
    ml: 'mL',
    dozen: 'dozen',
    pack: 'pack',
  };
  return map[unit] ?? unit;
}
