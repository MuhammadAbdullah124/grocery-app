import { Text, View } from 'react-native';
import type { Order } from '@/types';
import { formatDateTime, formatPrice } from '@/utils/format';
import { Divider } from '@/components/ui/Divider';
import { APP_NAME } from '@/constants/config';

const paymentLabels: Record<Order['paymentMethod'], string> = {
  cash: 'Cash',
  card: 'Card',
  credit: 'Credit (Khata)',
};

interface ReceiptProps {
  order: Order;
}

export function Receipt({ order }: ReceiptProps) {
  return (
    <View className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
      <View className="items-center">
        <Text className="text-lg font-bold text-gray-900 dark:text-gray-50">{order.storeName || APP_NAME}</Text>
        <Text className="mt-1 text-xs text-gray-400 dark:text-gray-500">{order.orderNumber}</Text>
        <Text className="text-xs text-gray-400 dark:text-gray-500">{formatDateTime(order.createdAt)}</Text>
      </View>

      <Divider className="my-4" />

      <View className="gap-3">
        {order.items.map((item) => (
          <View key={item.productId} className="flex-row items-start justify-between">
            <View className="mr-3 flex-1">
              <Text className="text-sm font-medium text-gray-900 dark:text-gray-50" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="text-xs text-gray-400 dark:text-gray-500">
                {item.quantity} x {formatPrice(item.discountPrice ?? item.price)}
              </Text>
            </View>
            <Text className="text-sm font-semibold text-gray-900 dark:text-gray-50">{formatPrice(item.subtotal)}</Text>
          </View>
        ))}
      </View>

      <Divider className="my-4" />

      <View className="gap-2">
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-500 dark:text-gray-400">Subtotal</Text>
          <Text className="text-sm text-gray-900 dark:text-gray-50">{formatPrice(order.subtotal)}</Text>
        </View>
        {order.discount > 0 ? (
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500 dark:text-gray-400">Discount</Text>
            <Text className="text-sm text-primary-600 dark:text-primary-400">-{formatPrice(order.discount)}</Text>
          </View>
        ) : null}
        <View className="flex-row justify-between">
          <Text className="text-base font-bold text-gray-900 dark:text-gray-50">Total</Text>
          <Text className="text-base font-bold text-gray-900 dark:text-gray-50">{formatPrice(order.total)}</Text>
        </View>
      </View>

      <Divider className="my-4" />

      <View className="gap-2">
        <View className="flex-row justify-between">
          <Text className="text-sm text-gray-500 dark:text-gray-400">Payment Method</Text>
          <Text className="text-sm font-medium text-gray-900 dark:text-gray-50">{paymentLabels[order.paymentMethod]}</Text>
        </View>
        {order.paymentMethod === 'cash' && order.cashReceived !== null ? (
          <>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500 dark:text-gray-400">Cash Received</Text>
              <Text className="text-sm font-medium text-gray-900 dark:text-gray-50">{formatPrice(order.cashReceived)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500 dark:text-gray-400">Change Given</Text>
              <Text className="text-sm font-medium text-gray-900 dark:text-gray-50">{formatPrice(order.changeDue ?? 0)}</Text>
            </View>
          </>
        ) : null}
        {order.paymentMethod === 'credit' && order.contact ? (
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500 dark:text-gray-400">Owed By</Text>
            <Text className="text-sm font-medium text-gray-900 dark:text-gray-50">{order.contact.name}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}
