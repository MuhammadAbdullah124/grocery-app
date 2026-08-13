export const colors = {
  primary: '#1db567',
  primaryDark: '#129253',
  primaryLight: '#d6f9e1',
  background: '#ffffff',
  surface: '#f7f8f7',
  border: '#e5e7eb',
  text: '#111827',
  textMuted: '#6b7280',
  danger: '#dc2626',
  warning: '#d97706',
  success: '#16a34a',
} as const;

export const categoryMeta: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  fruits: { label: 'Fruits', icon: 'apple', color: '#fee2e2' },
  vegetables: { label: 'Vegetables', icon: 'carrot', color: '#dcfce7' },
  dairy: { label: 'Dairy', icon: 'milk', color: '#dbeafe' },
  bakery: { label: 'Bakery', icon: 'croissant', color: '#fef3c7' },
  beverages: { label: 'Beverages', icon: 'cup-soda', color: '#e0e7ff' },
  snacks: { label: 'Snacks', icon: 'popcorn', color: '#fce7f3' },
  household: { label: 'Household', icon: 'spray-can', color: '#e5e7eb' },
  personal_care: { label: 'Personal Care', icon: 'sparkles', color: '#fae8ff' },
};
