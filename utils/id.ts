export function generateId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 10).toUpperCase();
  const timePart = Date.now().toString(36).slice(-4).toUpperCase();
  return `${prefix}-${timePart}${random}`;
}

export function generateOrderNumber(): string {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `ORDER-${random}`;
}
