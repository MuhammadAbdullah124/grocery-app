import { FlatList, Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Header } from '@/components/layout/Header';
import { PurchaseCard } from '@/components/khata/PurchaseCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePurchases } from '@/hooks/usePurchases';

export default function PurchasesScreen() {
  const router = useRouter();
  const purchasesQuery = usePurchases();

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
      <StatusBar style="dark" />
      <Header
        title="Purchases"
        subtitle="Stock bought from suppliers"
        right={
          <Pressable
            onPress={() => router.push('/purchases/new')}
            className="h-10 w-10 items-center justify-center rounded-full bg-primary-500"
            accessibilityRole="button"
            accessibilityLabel="New purchase"
          >
            <Ionicons name="add" size={22} color="#ffffff" />
          </Pressable>
        }
      />

      {purchasesQuery.isError ? (
        <ErrorState description="We couldn't load purchases." onAction={() => purchasesQuery.refetch()} />
      ) : (
        <FlatList
          data={purchasesQuery.data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PurchaseCard purchase={item} />}
          contentContainerStyle={{ padding: 20, paddingTop: 4, gap: 12 }}
          showsVerticalScrollIndicator={false}
          refreshing={purchasesQuery.isRefetching}
          onRefresh={() => purchasesQuery.refetch()}
          ListEmptyComponent={
            purchasesQuery.isLoading ? (
              <View className="gap-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} height={96} radius={16} />
                ))}
              </View>
            ) : (
              <EmptyState
                icon="cart-outline"
                title="No purchases yet"
                description="Record stock bought from a supplier."
                actionLabel="New Purchase"
                onAction={() => router.push('/purchases/new')}
              />
            )
          }
        />
      )}
    </SafeAreaView>
  );
}
