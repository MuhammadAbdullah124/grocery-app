import { Pressable, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/services/api';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  ProductScannerResultFound,
  ProductScannerResultNotFound,
} from '@/components/product/ProductScannerResult';
import { useCartStore } from '@/store/cartStore';

export default function ScanResultScreen() {
  const { barcode } = useLocalSearchParams<{ barcode: string }>();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);

  const productQuery = useQuery({
    queryKey: ['product', 'barcode', barcode],
    queryFn: () => productsApi.getProductByBarcode(barcode as string),
    enabled: !!barcode,
  });

  const handleAddToCart = (quantity: number) => {
    if (!productQuery.data) return;
    addItem(productQuery.data, quantity);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'bottom']}>
      <View className="flex-row justify-end px-5 pt-2">
        <Pressable
          onPress={() => router.dismissAll()}
          hitSlop={10}
          className="h-9 w-9 items-center justify-center rounded-full bg-gray-100"
          accessibilityRole="button"
          accessibilityLabel="Cancel scanning"
        >
          <Ionicons name="close" size={20} color="#111827" />
        </Pressable>
      </View>

      {productQuery.isLoading ? (
        <View className="items-center px-5 pt-4">
          <Skeleton width={112} height={112} radius={20} />
          <Skeleton width={160} height={18} radius={6} className="mt-4" />
          <Skeleton width={100} height={14} radius={6} className="mt-2" />
        </View>
      ) : productQuery.data ? (
        <ProductScannerResultFound
          product={productQuery.data}
          onAddToCart={handleAddToCart}
          onScanAnother={() => router.back()}
        />
      ) : (
        <ProductScannerResultNotFound
          barcode={barcode as string}
          onTryAgain={() => router.back()}
          onSearchManually={() => router.dismissTo('/(tabs)/search')}
        />
      )}
    </SafeAreaView>
  );
}
