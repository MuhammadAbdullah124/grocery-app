import { FlatList, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { OrderCard } from '@/components/order/OrderCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useOrders } from '@/hooks/useOrders';

export default function OrdersScreen() {
  const router = useRouter();
  const ordersQuery = useOrders();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="px-5 pb-2 pt-3">
        <Text className="text-2xl font-bold text-gray-900">Sales History</Text>
      </View>

      {ordersQuery.isError ? (
        <ErrorState description="We couldn't load your sales." onAction={() => ordersQuery.refetch()} />
      ) : ordersQuery.isLoading ? (
        <View className="gap-3 px-5 pt-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={96} radius={16} />
          ))}
        </View>
      ) : ordersQuery.data && ordersQuery.data.length > 0 ? (
        <FlatList
          data={ordersQuery.data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <OrderCard order={item} />}
          contentContainerStyle={{ padding: 20, gap: 12 }}
          showsVerticalScrollIndicator={false}
          refreshing={ordersQuery.isRefetching}
          onRefresh={() => ordersQuery.refetch()}
        />
      ) : (
        <EmptyState
          icon="receipt-outline"
          title="No sales yet"
          description="Completed sales will show up here."
          actionLabel="Scan Product"
          onAction={() => router.push('/scan')}
        />
      )}
    </SafeAreaView>
  );
}
