import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { Product } from '@/types';
import { formatPrice, formatUnit } from '@/utils/format';
import { useCartStore } from '@/store/cartStore';
import { QuantitySelector } from './QuantitySelector';

interface ProductListItemProps {
  product: Product;
}

function ProductListItemBase({ product }: ProductListItemProps) {
  const router = useRouter();
  const quantity = useCartStore((state) => state.items.find((i) => i.productId === product.id)?.quantity ?? 0);
  const addItem = useCartStore((state) => state.addItem);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);

  const hasDiscount = product.discountPrice !== null;
  const outOfStock = product.stock <= 0;

  return (
    <Pressable
      onPress={() => router.push(`/product/${product.id}`)}
      className="flex-row items-center rounded-2xl border border-gray-100 bg-white p-3"
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
    >
      <View className="h-16 w-16 overflow-hidden rounded-xl bg-gray-50">
        <Image source={{ uri: product.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
      </View>

      <View className="ml-3 flex-1">
        <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
          {product.name}
        </Text>
        <Text className="mt-0.5 text-xs text-gray-400" numberOfLines={1}>
          {product.brand} · {formatUnit(product.unit)}
        </Text>
        <View className="mt-1 flex-row items-center gap-2">
          <Text className="text-sm font-bold text-gray-900">
            {formatPrice(hasDiscount ? (product.discountPrice as number) : product.price)}
          </Text>
          {hasDiscount ? (
            <Text className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</Text>
          ) : null}
        </View>
      </View>

      {outOfStock ? (
        <Text className="text-xs font-semibold text-gray-400">Out of stock</Text>
      ) : quantity > 0 ? (
        <QuantitySelector
          size="sm"
          quantity={quantity}
          onIncrease={() => increaseQuantity(product.id)}
          onDecrease={() => decreaseQuantity(product.id)}
        />
      ) : (
        <Pressable
          onPress={() => addItem(product, 1)}
          accessibilityRole="button"
          accessibilityLabel={`Add ${product.name} to cart`}
          className="h-9 w-9 items-center justify-center rounded-full bg-primary-500"
        >
          <Ionicons name="add" size={18} color="#ffffff" />
        </Pressable>
      )}
    </Pressable>
  );
}

export const ProductListItem = memo(ProductListItemBase);
