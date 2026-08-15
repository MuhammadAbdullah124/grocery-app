import { Text, View } from 'react-native';
import { formatPrice } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';

interface CartSummaryProps {
  itemCount: number;
  subtotal: number;
  discount: number;
  total: number;
  actionLabel?: string;
  onAction?: () => void;
  loading?: boolean;
}

export function CartSummary({
  itemCount,
  subtotal,
  discount,
  total,
  actionLabel = 'Checkout',
  onAction,
  loading = false,
}: CartSummaryProps) {
  return (
    <View className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 pb-2 pt-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm text-gray-500 dark:text-gray-400">Subtotal</Text>
        <Text className="text-sm font-medium text-gray-900 dark:text-gray-50">{formatPrice(subtotal)}</Text>
      </View>
      {discount > 0 ? (
        <View className="mt-2 flex-row items-center justify-between">
          <Text className="text-sm text-gray-500 dark:text-gray-400">Discount</Text>
          <Text className="text-sm font-medium text-primary-600 dark:text-primary-400">-{formatPrice(discount)}</Text>
        </View>
      ) : null}

      <Divider className="my-3" />

      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-base font-bold text-gray-900 dark:text-gray-50">Estimated total</Text>
          <Text className="text-xs text-gray-400 dark:text-gray-500">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </Text>
        </View>
        <Text className="text-xl font-bold text-gray-900 dark:text-gray-50">{formatPrice(total)}</Text>
      </View>

      {onAction ? (
        <View className="mt-4">
          <Button label={actionLabel} size="lg" onPress={onAction} loading={loading} />
        </View>
      ) : null}
    </View>
  );
}
