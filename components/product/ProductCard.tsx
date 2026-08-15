import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { Product } from '@/types';
import { formatPrice, formatUnit } from '@/utils/format';
import { useCartStore } from '@/store/cartStore';
import { QuantitySelector } from './QuantitySelector';

interface ProductCardProps {
  product: Product;
}

function ProductCardBase({ product }: ProductCardProps) {
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
      className="w-full overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
    >
      <View className="aspect-square w-full bg-gray-50 dark:bg-gray-800">
        <Image
          source={{ uri: product.image }}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
          transition={150}
        />
        {hasDiscount ? (
          <View className="absolute left-2 top-2 rounded-full bg-red-500 px-2 py-0.5">
            <Text className="text-[11px] font-bold text-white">{product.discountPercentage}% OFF</Text>
          </View>
        ) : null}
        {outOfStock ? (
          <View className="absolute inset-0 items-center justify-center bg-white/70 dark:bg-gray-900/70">
            <Text className="text-xs font-semibold text-gray-600 dark:text-gray-300">Out of stock</Text>
          </View>
        ) : null}
      </View>

      <View className="p-3">
        <Text className="text-sm font-medium text-gray-900 dark:text-gray-50" numberOfLines={1}>
          {product.name}
        </Text>
        <Text className="mt-0.5 text-xs text-gray-400 dark:text-gray-500" numberOfLines={1}>
          {product.brand} · {formatUnit(product.unit)}
        </Text>

        <View className="mt-2 flex-row items-center justify-between">
          <View>
            {hasDiscount ? (
              <View className="flex-row items-center gap-1.5">
                <Text className="text-sm font-bold text-gray-900 dark:text-gray-50">{formatPrice(product.discountPrice as number)}</Text>
              </View>
            ) : (
              <Text className="text-sm font-bold text-gray-900 dark:text-gray-50">{formatPrice(product.price)}</Text>
            )}
            {hasDiscount ? (
              <Text className="text-xs text-gray-400 dark:text-gray-500 line-through">{formatPrice(product.price)}</Text>
            ) : null}
          </View>

          {!outOfStock &&
            (quantity > 0 ? (
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
                className="h-8 w-8 items-center justify-center rounded-full bg-primary-500"
              >
                <Ionicons name="add" size={18} color="#ffffff" />
              </Pressable>
            ))}
        </View>
      </View>
    </Pressable>
  );
}

export const ProductCard = memo(ProductCardBase);
