import { Text, View } from 'react-native';

export type BadgeVariant = 'primary' | 'success' | 'danger' | 'warning' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, { bg: string; text: string }> = {
  primary: { bg: 'bg-primary-100 dark:bg-primary-800', text: 'text-primary-700 dark:text-primary-300' },
  success: { bg: 'bg-green-100 dark:bg-green-800', text: 'text-green-700 dark:text-green-300' },
  danger: { bg: 'bg-red-100 dark:bg-red-800', text: 'text-red-600 dark:text-red-400' },
  warning: { bg: 'bg-amber-100 dark:bg-amber-800', text: 'text-amber-700 dark:text-amber-300' },
  neutral: { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-600 dark:text-gray-300' },
};

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const { bg, text } = variantClasses[variant];
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${bg}`}>
      <Text className={`text-xs font-semibold ${text}`}>{label}</Text>
    </View>
  );
}
