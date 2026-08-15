import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Order, PaymentMethod } from '@/types';
import { formatDate, formatPrice } from '@/utils/format';
import { Badge } from '@/components/ui/Badge';

const paymentLabel: Record<PaymentMethod, string> = {
  cash: 'Cash',
  card: 'Card',
};

interface OrderCardProps {
  order: Order;
}

function OrderCardBase({ order }: OrderCardProps) {
  const router = useRouter();
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Pressable
      onPress={() => router.push(`/receipt/${order.id}`)}
      className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-bold text-gray-900 dark:text-gray-50">{order.orderNumber}</Text>
        <Badge label={paymentLabel[order.paymentMethod]} variant="neutral" />
      </View>
      <Text className="mt-1 text-xs text-gray-400 dark:text-gray-500">{formatDate(order.createdAt)}</Text>
      <View className="mt-3 flex-row items-center justify-between">
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </Text>
        <Text className="text-base font-bold text-gray-900 dark:text-gray-50">{formatPrice(order.total)}</Text>
      </View>
    </Pressable>
  );
}

export const OrderCard = memo(OrderCardBase);
