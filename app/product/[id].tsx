import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { QuantitySelector } from '@/components/product/QuantitySelector';
import { useProduct } from '@/hooks/useProducts';
import { useCartStore } from '@/store/cartStore';
import { formatPrice, formatUnit } from '@/utils/format';
import { categoryMeta } from '@/constants/theme';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const productQuery = useProduct(id);
  const addItem = useCartStore((state) => state.addItem);
  const cartCount = useCartStore((state) => state.getItemCount());
  const [quantity, setQuantity] = useState(1);

  if (productQuery.isLoading) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
        <StatusBar style="dark" />
        <View className="px-5 pt-3">
          <Skeleton height={280} radius={24} />
          <Skeleton height={20} width={180} radius={6} className="mt-5" />
          <Skeleton height={14} width={120} radius={6} className="mt-2" />
          <Skeleton height={28} width={100} radius={6} className="mt-4" />
        </View>
      </SafeAreaView>
    );
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
        <StatusBar style="dark" />
        <View className="flex-row items-center px-5 pt-3">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </Pressable>
        </View>
        <ErrorState
          title="Product not found"
          description="This product may no longer be available."
          actionLabel="Go Back"
          onAction={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  const product = productQuery.data;
  const hasDiscount = product.discountPrice !== null;
  const outOfStock = product.stock <= 0;
  const unitPrice = hasDiscount ? (product.discountPrice as number) : product.price;

  const handleAddToCart = () => {
    addItem(product, quantity);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.back();
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      <StatusBar style="dark" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="px-5 pt-3">
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <Ionicons name="chevron-back" size={22} color="#111827" />
            </Pressable>
            <Pressable
              onPress={() => router.push('/cart')}
              className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
              accessibilityRole="button"
              accessibilityLabel="View cart"
            >
              <Ionicons name="cart-outline" size={20} color="#111827" />
              {cartCount > 0 ? (
                <View className="absolute -right-1 -top-1 h-4 w-4 items-center justify-center rounded-full bg-primary-500">
                  <Text className="text-[10px] font-bold text-white">{cartCount}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>

          <View className="mt-4 aspect-square w-full overflow-hidden rounded-3xl bg-gray-50">
            <Image source={{ uri: product.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          </View>

          <View className="mt-5 flex-row items-center gap-2">
            <Badge label={categoryMeta[product.category]?.label ?? product.category} variant="neutral" />
            <Badge label={outOfStock ? 'Out of stock' : 'Available'} variant={outOfStock ? 'danger' : 'success'} />
          </View>

          <Text className="mt-3 text-2xl font-bold text-gray-900">{product.name}</Text>
          <Text className="mt-1 text-sm text-gray-500">
            {product.brand} · {formatUnit(product.unit)}
          </Text>

          <View className="mt-3 flex-row items-center gap-3">
            <Text className="text-2xl font-bold text-primary-600">{formatPrice(unitPrice)}</Text>
            {hasDiscount ? (
              <>
                <Text className="text-base text-gray-400 line-through">{formatPrice(product.price)}</Text>
                <Badge label={`${product.discountPercentage}% OFF`} variant="danger" />
              </>
            ) : null}
          </View>

          <Divider className="my-5" />

          <Text className="text-base font-bold text-gray-900">Description</Text>
          <Text className="mt-2 text-sm leading-6 text-gray-500">{product.description}</Text>

          <Divider className="my-5" />

          <View className="flex-row items-center justify-between">
            <Text className="text-sm text-gray-500">Barcode</Text>
            <Text className="text-sm font-medium text-gray-900">{product.barcode}</Text>
          </View>
          <View className="mt-3 flex-row items-center justify-between">
            <Text className="text-sm text-gray-500">Stock</Text>
            <Text className="text-sm font-medium text-gray-900">
              {outOfStock ? 'Out of stock' : `${product.stock} ${formatUnit(product.unit)} available`}
            </Text>
          </View>

          <View style={{ height: 140 }} />
        </View>
      </ScrollView>

      {!outOfStock ? (
        <View className="border-t border-gray-100 bg-white px-5 pb-2 pt-4">
          <View className="flex-row items-center justify-between">
            <QuantitySelector
              quantity={quantity}
              onIncrease={() => setQuantity((q) => Math.min(q + 1, product.stock))}
              onDecrease={() => setQuantity((q) => Math.max(q - 1, 1))}
              max={product.stock}
            />
            <Text className="text-lg font-bold text-gray-900">{formatPrice(unitPrice * quantity)}</Text>
          </View>
          <View className="mt-3">
            <Button label="Add to Cart" size="lg" onPress={handleAddToCart} leftIcon="cart-outline" />
          </View>
        </View>
      ) : (
        <View className="border-t border-gray-100 bg-white px-5 py-4">
          <Button label="Out of Stock" size="lg" disabled onPress={() => {}} />
        </View>
      )}
    </SafeAreaView>
  );
}
