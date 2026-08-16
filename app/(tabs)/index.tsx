import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductGrid } from '@/components/product/ProductGrid';
import { CategoryChip } from '@/components/product/CategoryChip';
import { useCategories } from '@/hooks/useCategories';

import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useProducts, useDeals } from '@/hooks/useProducts';
import { useIconColor } from '@/hooks/useIconColor';
import { getGreeting } from '@/utils/greeting';

export default function HomeScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const cartCount = useCartStore((state) => state.getItemCount());
  const iconColor = useIconColor();

  const productsQuery = useProducts();
  const dealsQuery = useDeals();
  const categoriesQuery = useCategories();

  const popularProducts = useMemo(() => (productsQuery.data ?? []).slice(0, 10), [productsQuery.data]);
  const greeting = getGreeting();

  if (productsQuery.isError) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
        <StatusBar style="dark" />
        <ErrorState
          description="We couldn't load products. Pull to refresh or try again."
          onAction={() => productsQuery.refetch()}
        />
      </SafeAreaView>
    );
  }

  const listHeader = (
    <View>
      <View className="flex-row items-center justify-between px-5 pt-3">
        <View className="mr-3 flex-1">
          <Text className="text-sm text-gray-500 dark:text-gray-400">{greeting},</Text>
          <Text className="text-xl font-bold text-gray-900 dark:text-gray-50" numberOfLines={1}>
            {user?.name ?? 'Guest'}
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/(tabs)/profile')}
          accessibilityRole="button"
          accessibilityLabel="Open profile"
        >
          <Avatar name={user?.name ?? 'Guest'} uri={user?.avatar} size={48} />
        </Pressable>
      </View>

      <Pressable
        onPress={() => router.push('/(tabs)/search')}
        className="mx-5 mt-5 h-[52px] flex-row items-center rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4"
        accessibilityRole="button"
        accessibilityLabel="Search products"
      >
        <Ionicons name="search" size={20} color="#9ca3af" />
        <Text className="ml-2.5 text-base text-gray-400 dark:text-gray-500">Search products...</Text>
      </Pressable>

      <View className="mx-5 mt-5 flex-row gap-3">
        <Pressable
          onPress={() => router.push('/scan')}
          className="flex-[1.3] rounded-3xl bg-primary-500 p-5"
          style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="Scan a product"
        >
          <Ionicons name="scan" size={30} color="#ffffff" />
          <Text className="mt-3 text-base font-bold text-white">Scan Product</Text>
          <Text className="mt-0.5 text-xs text-white/80">Add items instantly</Text>
        </Pressable>
        <Pressable
          onPress={() => router.push('/cart')}
          className="flex-1 rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5"
          style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="View cart"
        >
          <View className="flex-row items-center justify-between">
            <Ionicons name="cart-outline" size={26} color={iconColor} />
            {cartCount > 0 ? <Badge label={String(cartCount)} variant="primary" /> : null}
          </View>
          <Text className="mt-3 text-base font-bold text-gray-900 dark:text-gray-50">Current Sale</Text>
          <Text className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">
            {cartCount} {cartCount === 1 ? 'item' : 'items'}
          </Text>
        </Pressable>
      </View>

      {categoriesQuery.data && categoriesQuery.data.length > 0 ? (
        <View className="mt-7">
          <Text className="px-5 text-base font-bold text-gray-900 dark:text-gray-50">Categories</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3 pl-5"
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {categoriesQuery.data.map((category) => (
              <CategoryChip
                key={category.id}
                category={category}
                onPress={() => router.push({ pathname: '/(tabs)/search', params: { categoryId: category.id } })}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View className="mt-7">
        <Text className="px-5 text-base font-bold text-gray-900 dark:text-gray-50">Active Discounts</Text>
        {dealsQuery.isLoading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3 pl-5">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} width={150} height={190} radius={16} className="mr-3" />
            ))}
          </ScrollView>
        ) : dealsQuery.data && dealsQuery.data.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3 pl-5"
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {dealsQuery.data.map((product) => (
              <View key={product.id} style={{ width: 150 }} className="mr-3">
                <ProductCard product={product} />
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text className="mt-3 px-5 text-sm text-gray-400 dark:text-gray-500">No deals right now — check back soon.</Text>
        )}
      </View>

      <Text className="mt-7 px-5 text-base font-bold text-gray-900 dark:text-gray-50">Quick Add</Text>
    </View>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
      <StatusBar style="dark" />
      <ProductGrid
        products={popularProducts}
        ListHeaderComponent={listHeader}
        refreshing={productsQuery.isRefetching}
        onRefresh={() => {
          productsQuery.refetch();
          dealsQuery.refetch();
        }}
        ListEmptyComponent={
          productsQuery.isLoading ? (
            <View className="flex-row flex-wrap px-3.5">
              {[1, 2, 3, 4].map((i) => (
                <View key={i} className="w-1/2 p-1.5">
                  <Skeleton height={190} radius={16} />
                </View>
              ))}
            </View>
          ) : (
            <EmptyState icon="basket-outline" title="No products available" description="Please check back later." />
          )
        }
      />
    </SafeAreaView>
  );
}
