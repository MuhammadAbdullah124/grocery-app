import type { ComponentType, ReactElement } from 'react';
import { FlatList, View, type ListRenderItem } from 'react-native';
import type { Product } from '@/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  ListHeaderComponent?: ComponentType<unknown> | ReactElement | null;
  ListEmptyComponent?: ComponentType<unknown> | ReactElement | null;
  contentContainerClassName?: string;
  scrollEnabled?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export function ProductGrid({
  products,
  ListHeaderComponent,
  ListEmptyComponent,
  contentContainerClassName,
  scrollEnabled = true,
  refreshing,
  onRefresh,
}: ProductGridProps) {
  const renderItem: ListRenderItem<Product> = ({ item }) => (
    <View className="w-1/2 p-1.5">
      <ProductCard product={item} />
    </View>
  );

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      numColumns={2}
      showsVerticalScrollIndicator={false}
      scrollEnabled={scrollEnabled}
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={ListEmptyComponent}
      refreshing={refreshing}
      onRefresh={onRefresh}
      contentContainerClassName={`px-3.5 pb-6 ${contentContainerClassName ?? ''}`}
    />
  );
}
