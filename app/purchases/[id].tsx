import { Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Header } from '@/components/layout/Header';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Badge } from '@/components/ui/Badge';
import { Divider } from '@/components/ui/Divider';
import { usePurchase } from '@/hooks/usePurchases';
import { formatDateTime, formatPrice } from '@/utils/format';
import type { PurchasePaymentMethod } from '@/types';

const paymentLabel: Record<PurchasePaymentMethod, string> = {
  cash: 'Cash',
  card: 'Card',
  credit: 'Credit',
};

export default function PurchaseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const purchaseQuery = usePurchase(id);

  if (purchaseQuery.isLoading) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
        <StatusBar style="dark" />
        <Header title="Purchase" />
        <View className="px-5 pt-4">
          <Skeleton height={260} radius={24} />
        </View>
      </SafeAreaView>
    );
  }

  if (purchaseQuery.isError || !purchaseQuery.data) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
        <StatusBar style="dark" />
        <Header title="Purchase" />
        <ErrorState title="Purchase not found" description="This purchase may have been removed." />
      </SafeAreaView>
    );
  }

  const purchase = purchaseQuery.data;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
      <StatusBar style="dark" />
      <Header title={purchase.purchaseNumber} subtitle={formatDateTime(purchase.createdAt)} />
      <View className="flex-1 px-5 pt-2">
        <View className="rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-500 dark:text-gray-400">Supplier</Text>
            <Text className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              {purchase.contact?.name ?? '—'}
            </Text>
          </View>
          <View className="mt-2 flex-row items-center justify-between">
            <Text className="text-sm text-gray-500 dark:text-gray-400">Payment</Text>
            <Badge label={paymentLabel[purchase.paymentMethod]} variant={purchase.paymentMethod === 'credit' ? 'warning' : 'neutral'} />
          </View>

          <Divider className="my-4" />

          <View className="gap-3">
            {purchase.items.map((item, index) => (
              <View key={`${item.productId ?? item.name}-${index}`} className="flex-row items-start justify-between">
                <View className="mr-3 flex-1">
                  <Text className="text-sm font-medium text-gray-900 dark:text-gray-50" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="text-xs text-gray-400 dark:text-gray-500">
                    {item.quantity} {item.unit} x {formatPrice(item.costPrice)}
                  </Text>
                </View>
                <Text className="text-sm font-semibold text-gray-900 dark:text-gray-50">{formatPrice(item.subtotal)}</Text>
              </View>
            ))}
          </View>

          <Divider className="my-4" />

          <View className="flex-row items-center justify-between">
            <Text className="text-base font-bold text-gray-900 dark:text-gray-50">Total</Text>
            <Text className="text-base font-bold text-gray-900 dark:text-gray-50">{formatPrice(purchase.total)}</Text>
          </View>

          {purchase.notes ? (
            <Text className="mt-4 text-xs text-gray-400 dark:text-gray-500">{purchase.notes}</Text>
          ) : null}
        </View>
      </View>
    </SafeAreaView>
  );
}
