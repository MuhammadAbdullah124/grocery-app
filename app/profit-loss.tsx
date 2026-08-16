import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Header } from '@/components/layout/Header';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useProfitLoss } from '@/hooks/useOrders';
import { formatPrice } from '@/utils/format';
import type { ProfitLossTotals } from '@/types';

type RangeFilter = 'today' | 'week' | 'month';

const RANGE_OPTIONS: { id: RangeFilter; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
];

function BreakdownRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text
        className={`text-sm ${bold ? 'font-bold text-gray-900 dark:text-gray-50' : 'text-gray-500 dark:text-gray-400'}`}
      >
        {label}
      </Text>
      <Text
        className={`text-sm ${bold ? 'font-bold text-gray-900 dark:text-gray-50' : 'font-semibold text-gray-700 dark:text-gray-300'}`}
      >
        {value}
      </Text>
    </View>
  );
}

export default function ProfitLossScreen() {
  const router = useRouter();
  const [range, setRange] = useState<RangeFilter>('week');
  const profitLossQuery = useProfitLoss();

  const totals: ProfitLossTotals | undefined = profitLossQuery.data?.[range];
  const profitColor =
    totals && totals.profit > 0
      ? 'text-green-600 dark:text-green-400'
      : totals && totals.profit < 0
        ? 'text-red-500 dark:text-red-400'
        : 'text-gray-900 dark:text-gray-50';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
      <StatusBar style="dark" />
      <Header title="Profit & Loss" subtitle="Revenue minus cost of goods sold" />

      {profitLossQuery.isError ? (
        <ErrorState description="We couldn't load your profit & loss." onAction={() => profitLossQuery.refetch()} />
      ) : (
        <ScrollView
          className="flex-1 px-5"
          contentContainerStyle={{ paddingTop: 4, paddingBottom: 32, gap: 16 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={profitLossQuery.isRefetching} onRefresh={() => profitLossQuery.refetch()} />
          }
        >
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

          {profitLossQuery.isLoading || !profitLossQuery.data ? (
            <View className="gap-4">
              <Skeleton height={160} radius={16} />
              <Skeleton height={220} radius={16} />
            </View>
          ) : (
            <>
              {profitLossQuery.data.hasIncompleteCostData ? (
                <Pressable
                  onPress={() => router.push('/inventory')}
                  className="flex-row items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 dark:border-amber-900 dark:bg-amber-950"
                >
                  <Ionicons name="alert-circle-outline" size={18} color="#d97706" />
                  <Text className="flex-1 text-xs leading-4 text-amber-800 dark:text-amber-300">
                    Some products don&apos;t have a cost price set, so profit may be overstated. Tap to add cost
                    prices in Inventory.
                  </Text>
                </Pressable>
              ) : null}

              <View className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
                <BreakdownRow label="Revenue" value={formatPrice(totals?.revenue ?? 0)} />
                <BreakdownRow label="Cost of Goods Sold" value={`- ${formatPrice(totals?.cost ?? 0)}`} />
                <View className="my-1 h-px bg-gray-100 dark:bg-gray-800" />
                <View className="flex-row items-center justify-between py-2">
                  <Text className="text-base font-bold text-gray-900 dark:text-gray-50">Net Profit</Text>
                  <Text className={`text-base font-bold ${profitColor}`}>{formatPrice(totals?.profit ?? 0)}</Text>
                </View>
                <Text className="text-right text-xs text-gray-400 dark:text-gray-500">
                  {(totals?.marginPercent ?? 0).toFixed(1)}% margin
                </Text>
              </View>

              <View>
                <Text className="mb-2 text-sm font-semibold text-gray-900 dark:text-gray-50">
                  Top Products by Profit
                </Text>
                {profitLossQuery.data.topProducts.length === 0 ? (
                  <View className="items-center rounded-2xl border border-gray-100 dark:border-gray-800 p-6">
                    <Text className="text-sm text-gray-400 dark:text-gray-500">
                      Completed sales will show your most profitable products here.
                    </Text>
                  </View>
                ) : (
                  <View className="gap-2">
                    {profitLossQuery.data.topProducts.map((product, index) => (
                      <View
                        key={product.productId}
                        className="flex-row items-center rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3.5"
                      >
                        <View className="mr-3 h-7 w-7 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                          <Text className="text-xs font-bold text-gray-500 dark:text-gray-400">{index + 1}</Text>
                        </View>
                        <View className="flex-1">
                          <Text className="text-sm font-semibold text-gray-900 dark:text-gray-50" numberOfLines={1}>
                            {product.name}
                          </Text>
                          <Text className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
                            {product.quantitySold} sold
                          </Text>
                        </View>
                        <Text
                          className={`text-sm font-bold ${
                            product.profit >= 0
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-red-500 dark:text-red-400'
                          }`}
                        >
                          {formatPrice(product.profit)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
