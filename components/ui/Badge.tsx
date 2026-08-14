import { Text, View } from 'react-native';

export type BadgeVariant = 'primary' | 'success' | 'danger' | 'warning' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, { bg: string; text: string }> = {
  primary: { bg: 'bg-primary-100', text: 'text-primary-700' },
  success: { bg: 'bg-green-100', text: 'text-green-700' },
  danger: { bg: 'bg-red-100', text: 'text-red-600' },
  warning: { bg: 'bg-amber-100', text: 'text-amber-700' },
  neutral: { bg: 'bg-gray-100', text: 'text-gray-600' },
};

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const { bg, text } = variantClasses[variant];
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${bg}`}>
      <Text className={`text-xs font-semibold ${text}`}>{label}</Text>
    </View>
  );
}
