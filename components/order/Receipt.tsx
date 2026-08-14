import { Text, View } from 'react-native';
import type { Order } from '@/types';
import { formatDateTime, formatPrice } from '@/utils/format';
import { Divider } from '@/components/ui/Divider';
import { APP_NAME } from '@/constants/config';

const paymentLabels: Record<Order['paymentMethod'], string> = {
  counter: 'Pay at Checkout Counter',
  cash: 'Cash',
  card: 'Card',
};

interface ReceiptProps {
  order: Order;
}

export function Receipt({ order }: ReceiptProps) {
  return (
    <View className="rounded-3xl border border-gray-100 bg-white p-5">
      <View className="items-center">
        <Text className="text-lg font-bold text-gray-900">{order.storeName || APP_NAME}</Text>
        <Text className="mt-1 text-xs text-gray-400">{order.orderNumber}</Text>
        <Text className="text-xs text-gray-400">{formatDateTime(order.createdAt)}</Text>
      </View>

      <Divider className="my-4" />

      <View className="gap-3">
        {order.items.map((item) => (
          <View key={item.productId} className="flex-row items-start justify-between">
            <View className="mr-3 flex-1">
              <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="text-xs text-gray-400">
                {item.quantity} x {formatPrice(item.discountPrice ?? item.price)}
              </Text>
            </View>
            <Text className="text-sm font-semibold text-gray-900">{formatPrice(item.subtotal)}</Text>
          </View>
        ))}
      </View>

      <Divider className="my-4" />

      <View className="gap-2">
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-500">Subtotal</Text>
          <Text className="text-sm text-gray-900">{formatPrice(order.subtotal)}</Text>
        </View>
        {order.discount > 0 ? (
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500">Discount</Text>
            <Text className="text-sm text-primary-600">-{formatPrice(order.discount)}</Text>
          </View>
        ) : null}
        <View className="flex-row justify-between">
          <Text className="text-base font-bold text-gray-900">Total</Text>
          <Text className="text-base font-bold text-gray-900">{formatPrice(order.total)}</Text>
        </View>
      </View>

      <Divider className="my-4" />

      <View className="flex-row justify-between">
        <Text className="text-sm text-gray-500">Payment Method</Text>
        <Text className="text-sm font-medium text-gray-900">{paymentLabels[order.paymentMethod]}</Text>
      </View>
    </View>
  );
}
