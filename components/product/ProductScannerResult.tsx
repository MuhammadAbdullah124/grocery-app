import { useState } from 'react';
import { Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '@/types';
import { formatPrice, formatUnit } from '@/utils/format';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { QuantitySelector } from './QuantitySelector';

interface FoundProps {
  product: Product;
  onAddToCart: (quantity: number) => void;
  onScanAnother: () => void;
}

export function ProductScannerResultFound({ product, onAddToCart, onScanAnother }: FoundProps) {
  const [quantity, setQuantity] = useState(1);
  const outOfStock = product.stock <= 0;
  const hasDiscount = product.discountPrice !== null;

  return (
    <View className="px-5 pb-2 pt-1">
      <View className="items-center">
        <View className="h-28 w-28 overflow-hidden rounded-2xl bg-gray-50">
          <Image source={{ uri: product.image }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        </View>
        <Text className="mt-3 text-lg font-bold text-gray-900">{product.name}</Text>
        <Text className="text-sm text-gray-400">
          {product.brand} · {formatUnit(product.unit)}
        </Text>

        <View className="mt-2 flex-row items-center gap-2">
          <Text className="text-xl font-bold text-primary-600">
            {formatPrice(hasDiscount ? (product.discountPrice as number) : product.price)}
          </Text>
          {hasDiscount ? (
            <Text className="text-sm text-gray-400 line-through">{formatPrice(product.price)}</Text>
          ) : null}
        </View>

        <View className="mt-2">
          <Badge
            label={outOfStock ? 'Out of stock' : 'Available'}
            variant={outOfStock ? 'danger' : 'success'}
          />
        </View>
      </View>

      {!outOfStock ? (
        <View className="mt-5 items-center">
          <QuantitySelector
            quantity={quantity}
            onIncrease={() => setQuantity((q) => Math.min(q + 1, product.stock))}
            onDecrease={() => setQuantity((q) => Math.max(q - 1, 1))}
            max={product.stock}
          />
        </View>
      ) : null}

      <View className="mt-6 gap-3">
        <Button
          label="Add to Cart"
          disabled={outOfStock}
          onPress={() => onAddToCart(quantity)}
          leftIcon="cart-outline"
        />
        <Button label="Scan Another" variant="outline" onPress={onScanAnother} />
      </View>
    </View>
  );
}

interface NotFoundProps {
  barcode: string;
  onTryAgain: () => void;
  onSearchManually: () => void;
}

export function ProductScannerResultNotFound({ barcode, onTryAgain, onSearchManually }: NotFoundProps) {
  return (
    <View className="items-center px-5 pb-2 pt-1">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-amber-50">
        <Ionicons name="barcode-outline" size={36} color="#d97706" />
      </View>
      <Text className="mt-4 text-lg font-bold text-gray-900">Product not found</Text>
      <Text className="mt-1 text-center text-sm text-gray-500">
        We couldn't find a product for barcode {barcode}. Try scanning again or search for it manually.
      </Text>

      <View className="mt-6 w-full gap-3">
        <Button label="Try Again" onPress={onTryAgain} leftIcon="scan-outline" />
        <Button label="Search Manually" variant="outline" onPress={onSearchManually} leftIcon="search-outline" />
      </View>
    </View>
  );
}
