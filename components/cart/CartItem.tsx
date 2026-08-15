import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import type { CartItem as CartItemType } from '@/types';
import { formatPrice, formatUnit } from '@/utils/format';
import { useCartStore } from '@/store/cartStore';
import { QuantitySelector } from '@/components/product/QuantitySelector';

interface CartItemProps {
  item: CartItemType;
}

function CartItemBase({ item }: CartItemProps) {
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const unitPrice = item.discountPrice ?? item.price;
  const subtotal = unitPrice * item.quantity;

  return (
    <View className="border-b border-gray-100 dark:border-gray-800 py-4">
      <View className="flex-row">
        <View className="h-16 w-16 overflow-hidden rounded-xl bg-gray-50 dark:bg-gray-800">
          <Image source={{ uri: item.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        </View>

        <View className="ml-3 flex-1">
          <View className="flex-row items-start justify-between">
            <Text className="mr-2 flex-1 text-sm font-medium text-gray-900 dark:text-gray-50" numberOfLines={2}>
              {item.name}
            </Text>
            <Pressable
              onPress={() => removeItem(item.productId)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Remove ${item.name} from cart`}
            >
              <Ionicons name="trash-outline" size={18} color="#dc2626" />
            </Pressable>
          </View>
          <Text className="mt-0.5 text-xs text-gray-400 dark:text-gray-500" numberOfLines={1}>
            {item.brand} · {formatUnit(item.unit)}
          </Text>
          <View className="mt-1.5 flex-row items-center gap-2">
            <Text className="text-sm font-bold text-gray-900 dark:text-gray-50">{formatPrice(unitPrice)}</Text>
            {item.discountPrice !== null ? (
              <Text className="text-xs text-gray-400 dark:text-gray-500 line-through">{formatPrice(item.price)}</Text>
            ) : null}
          </View>
        </View>
      </View>

      <View className="mt-3 flex-row items-center justify-between pl-[76px]">
        <QuantitySelector
          size="sm"
          quantity={item.quantity}
          max={item.stock}
          onIncrease={() => increaseQuantity(item.productId)}
          onDecrease={() => decreaseQuantity(item.productId)}
        />
        <Text className="text-base font-bold text-gray-900 dark:text-gray-50">{formatPrice(subtotal)}</Text>
      </View>
    </View>
  );
}

export const CartItem = memo(CartItemBase);
