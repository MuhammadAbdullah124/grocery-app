import { useEffect, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { ProfileShortcut } from '@/components/layout/ProfileShortcut';
import { CategoryChip } from '@/components/product/CategoryChip';
import { ProductListItem } from '@/components/product/ProductListItem';
import { useProducts, useProductsByCategory, useSearchProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import type { Product } from '@/types';

export default function SearchScreen() {
  const params = useLocalSearchParams<{ categoryId?: string }>();
  const [inputValue, setInputValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const categoriesQuery = useCategories();

  useEffect(() => {
    if (params.categoryId) {
      setSelectedCategoryId(params.categoryId);
    }
  }, [params.categoryId]);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(inputValue.trim()), 300);
    return () => clearTimeout(handle);
  }, [inputValue]);

  const isSearching = debouncedQuery.length > 0;

  const searchQuery = useSearchProducts(debouncedQuery);
  const categoryQuery = useProductsByCategory(!isSearching ? selectedCategoryId : null);
  const allProductsQuery = useProducts();

  const activeQuery = isSearching ? searchQuery : selectedCategoryId ? categoryQuery : allProductsQuery;
  const results: Product[] =
    isSearching && selectedCategoryId
      ? (activeQuery.data ?? []).filter((product) => product.categoryId === selectedCategoryId)
      : (activeQuery.data ?? []);

  const hasFilters = inputValue.length > 0 || selectedCategoryId !== null;

  const header = (
    <View>
      <View className="flex-row items-center justify-between px-5 pt-3">
        <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50">Search</Text>
        <View className="flex-row items-center gap-2">
          {hasFilters ? (
            <Pressable
              onPress={() => {
                setInputValue('');
                setSelectedCategoryId(null);
              }}
              className="flex-row items-center rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1.5"
              accessibilityRole="button"
              accessibilityLabel="Clear filters"
            >
              <Ionicons name="close" size={14} color="#6b7280" />
              <Text className="ml-1 text-xs font-medium text-gray-500 dark:text-gray-400">Clear</Text>
            </Pressable>
          ) : null}
          <ProfileShortcut />
        </View>
      </View>

      <View className="px-5 pt-4">
        <Input
          placeholder="Search products..."
          leftIcon="search"
          value={inputValue}
          onChangeText={setInputValue}
          returnKeyType="search"
        />
      </View>

      {categoriesQuery.data && categoriesQuery.data.length > 0 ? (
        <View className="mt-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pl-5"
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {categoriesQuery.data.map((category) => (
              <CategoryChip
                key={category.id}
                category={category}
                selected={selectedCategoryId === category.id}
                onPress={() => setSelectedCategoryId((prev) => (prev === category.id ? null : category.id))}
              />
            ))}
          </ScrollView>
        </View>
      ) : null}

      {activeQuery.isLoading ? null : (
        <Text className="mt-5 px-5 text-sm text-gray-400 dark:text-gray-500">
          {results.length} {results.length === 1 ? 'result' : 'results'}
        </Text>
      )}
    </View>
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
      <StatusBar style="dark" />
      {activeQuery.isError ? (
        <>
          {header}
          <ErrorState
            description="We couldn't load results. Please try again."
            onAction={() => activeQuery.refetch()}
          />
        </>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="px-5 py-1.5">
              <ProductListItem product={item} />
            </View>
          )}
          ListHeaderComponent={header}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={
            activeQuery.isLoading ? (
              <View className="mt-4 gap-3 px-5">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} height={84} radius={16} />
                ))}
              </View>
            ) : (
              <EmptyState
                icon="search-outline"
                title="No results found"
                description={
                  isSearching
                    ? `We couldn't find anything for "${debouncedQuery}".`
                    : 'Try a different category or search term.'
                }
              />
            )
          }
        />
      )}
    </SafeAreaView>
  );
}
