import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import type { Order, OrderStatus } from '@/types';
import { formatDate, formatPrice } from '@/utils/format';
import { Badge, type BadgeVariant } from '@/components/ui/Badge';

const statusVariant: Record<OrderStatus, BadgeVariant> = {
  pending: 'warning',
  verified: 'success',
  rejected: 'danger',
  completed: 'primary',
};

const statusLabel: Record<OrderStatus, string> = {
  pending: 'Pending',
  verified: 'Verified',
  rejected: 'Rejected',
  completed: 'Completed',
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
      className="rounded-2xl border border-gray-100 bg-white p-4"
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-bold text-gray-900">{order.orderNumber}</Text>
        <Badge label={statusLabel[order.status]} variant={statusVariant[order.status]} />
      </View>
      <Text className="mt-1 text-xs text-gray-400">{formatDate(order.createdAt)}</Text>
      <View className="mt-3 flex-row items-center justify-between">
        <Text className="text-sm text-gray-500">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </Text>
        <Text className="text-base font-bold text-gray-900">{formatPrice(order.total)}</Text>
      </View>
    </Pressable>
  );
}

export const OrderCard = memo(OrderCardBase);
