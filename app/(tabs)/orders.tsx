import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { OrderCard } from '@/components/order/OrderCard';
import { StatTile } from '@/components/accounting/StatTile';
import { RevenueChart } from '@/components/accounting/RevenueChart';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { ProfileShortcut } from '@/components/layout/ProfileShortcut';
import { useOrders, useSalesSummary } from '@/hooks/useOrders';
import { formatPrice } from '@/utils/format';

type RangeFilter = 'today' | 'week' | 'month' | 'all';

const RANGE_OPTIONS: { id: RangeFilter; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'Week' },
  { id: 'month', label: 'Month' },
  { id: 'all', label: 'All' },
];

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function rangeFrom(range: RangeFilter): string | undefined {
  const today = new Date();
  if (range === 'today') return toDateKey(today);
  if (range === 'week') {
    const start = new Date(today);
    start.setDate(start.getDate() - 6);
    return toDateKey(start);
  }
  if (range === 'month') return toDateKey(new Date(today.getFullYear(), today.getMonth(), 1));
  return undefined;
}

export default function AccountingScreen() {
  const router = useRouter();
  const [range, setRange] = useState<RangeFilter>('week');
  const summaryQuery = useSalesSummary();
  const ordersQuery = useOrders(useMemo(() => ({ from: rangeFrom(range) }), [range]));

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
      <StatusBar style="dark" />
      <View className="flex-row items-center justify-between px-5 pb-2 pt-3">
        <View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50">Accounting</Text>
          <Text className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Your sales, at a glance.</Text>
        </View>
        <ProfileShortcut />
      </View>

      {summaryQuery.isError || ordersQuery.isError ? (
        <ErrorState
          description="We couldn't load your sales."
          onAction={() => {
            summaryQuery.refetch();
            ordersQuery.refetch();
          }}
        />
      ) : (
        <FlatList
          data={ordersQuery.data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <OrderCard order={item} />}
          contentContainerStyle={{ padding: 20, paddingTop: 4, gap: 12 }}
          showsVerticalScrollIndicator={false}
          refreshing={ordersQuery.isRefetching}
          onRefresh={() => {
            summaryQuery.refetch();
            ordersQuery.refetch();
          }}
          ListHeaderComponent={
            <View className="mb-5 gap-4">
              {summaryQuery.isLoading ? (
                <View className="gap-3">
                  <View className="flex-row gap-3">
                    <Skeleton height={78} radius={16} className="flex-1" />
                    <Skeleton height={78} radius={16} className="flex-1" />
                    <Skeleton height={78} radius={16} className="flex-1" />
                  </View>
                  <Skeleton height={190} radius={16} />
                </View>
              ) : summaryQuery.data ? (
                <>
                  <View className="flex-row gap-3">
                    <StatTile
                      label="Today"
                      value={formatPrice(summaryQuery.data.today.revenue)}
                      caption={`${summaryQuery.data.today.orders} ${summaryQuery.data.today.orders === 1 ? 'sale' : 'sales'}`}
                    />
                    <StatTile
                      label="This Week"
                      value={formatPrice(summaryQuery.data.week.revenue)}
                      caption={`${summaryQuery.data.week.orders} ${summaryQuery.data.week.orders === 1 ? 'sale' : 'sales'}`}
                    />
                    <StatTile
                      label="This Month"
                      value={formatPrice(summaryQuery.data.month.revenue)}
                      caption={`${summaryQuery.data.month.orders} ${summaryQuery.data.month.orders === 1 ? 'sale' : 'sales'}`}
                    />
                  </View>
                  <RevenueChart series={summaryQuery.data.series} />
                </>
              ) : null}

              <View>
                <Text className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-50">Recent Sales</Text>
                <View className="flex-row gap-2">
                  {RANGE_OPTIONS.map((option) => {
                    const selected = range === option.id;
                    return (
                      <Pressable
                        key={option.id}
                        onPress={() => setRange(option.id)}
                        className={`rounded-full border px-3.5 py-1.5 ${
                          selected
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <Text
                          className={`text-xs ${
                            selected
                              ? 'font-semibold text-primary-700 dark:text-primary-300'
                              : 'text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
          }
          ListEmptyComponent={
            ordersQuery.isLoading ? (
              <View className="gap-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} height={96} radius={16} />
                ))}
              </View>
            ) : (
              <EmptyState
                icon="receipt-outline"
                title="No sales yet"
                description="Completed sales in this range will show up here."
                actionLabel="Scan Product"
                onAction={() => router.push('/scan')}
              />
            )
          }
        />
      )}
    </SafeAreaView>
  );
}
