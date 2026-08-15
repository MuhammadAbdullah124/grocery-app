import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useProducts } from '@/hooks/useProducts';
import { formatPrice, formatUnit } from '@/utils/format';

export default function InventoryScreen() {
  const router = useRouter();
  const productsQuery = useProducts();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const products = productsQuery.data ?? [];
    const term = query.trim().toLowerCase();
    if (!term) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.brand.toLowerCase().includes(term) ||
        (p.barcode?.includes(term) ?? false),
    );
  }, [productsQuery.data, query]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
      <StatusBar style="dark" />
      <Header
        title="Inventory"
        subtitle={productsQuery.data ? `${productsQuery.data.length} products` : undefined}
        right={
          <Pressable
            onPress={() => router.push('/inventory/new')}
            className="h-10 w-10 items-center justify-center rounded-full bg-primary-500"
            accessibilityRole="button"
            accessibilityLabel="Add product"
          >
            <Ionicons name="add" size={22} color="#ffffff" />
          </Pressable>
        }
      />

      <View className="px-5 pb-2">
        <Input
          placeholder="Search by name, brand, or barcode"
          leftIcon="search"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {productsQuery.isError ? (
        <ErrorState description="We couldn't load your products." onAction={() => productsQuery.refetch()} />
      ) : productsQuery.isLoading ? (
        <View className="gap-3 px-5 pt-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={76} radius={16} />
          ))}
        </View>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="cube-outline"
          title={query ? 'No matching products' : 'No products yet'}
          description={query ? 'Try a different search term.' : 'Add your first product to get started.'}
          actionLabel={query ? undefined : 'Add Product'}
          onAction={query ? undefined : () => router.push('/inventory/new')}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, gap: 12 }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/inventory/${item.id}`)}
              className="flex-row items-center rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3"
              style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
            >
              <View className="h-14 w-14 overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800">
                <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-medium text-gray-900 dark:text-gray-50" numberOfLines={1}>
                  {item.name}
                </Text>
                <Text className="mt-0.5 text-xs text-gray-400 dark:text-gray-500" numberOfLines={1}>
                  {item.brand}
                  {item.barcode ? ` · ${item.barcode}` : ''}
                </Text>
                <View className="mt-1 flex-row items-center gap-2">
                  <Text className="text-sm font-bold text-gray-900 dark:text-gray-50">
                    {formatPrice(item.discountPrice ?? item.price)}
                  </Text>
                  <Text className="text-xs text-gray-400 dark:text-gray-500">
                    Stock: {item.stock} {formatUnit(item.unit)}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}
