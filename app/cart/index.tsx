import { Alert, FlatList, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Header } from '@/components/layout/Header';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCartStore } from '@/store/cartStore';

export default function CartScreen() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const discount = useCartStore((state) => state.getDiscount());
  const total = useCartStore((state) => state.getTotal());
  const itemCount = useCartStore((state) => state.getItemCount());
  const clearCart = useCartStore((state) => state.clearCart);

  const confirmClearCart = () => {
    Alert.alert('Clear sale', 'Remove all items from this sale?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearCart },
    ]);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      <StatusBar style="dark" />
      <Header
        title="Current Sale"
        subtitle={itemCount > 0 ? `${itemCount} ${itemCount === 1 ? 'item' : 'items'}` : undefined}
        right={
          items.length > 0 ? (
            <Text onPress={confirmClearCart} className="text-sm font-medium text-red-500">
              Clear
            </Text>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon="cart-outline"
          title="No items in this sale yet"
          description="Scan a product to add it to the sale."
          actionLabel="Scan Product"
          onAction={() => router.push('/scan')}
        />
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => item.productId}
            renderItem={({ item }) => <CartItem item={item} />}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            showsVerticalScrollIndicator={false}
          />
          <CartSummary
            itemCount={itemCount}
            subtotal={subtotal}
            discount={discount}
            total={total}
            onAction={() => router.push('/checkout')}
          />
        </>
      )}
    </SafeAreaView>
  );
}
