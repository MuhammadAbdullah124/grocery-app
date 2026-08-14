import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { useCartStore } from '@/store/cartStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useStore } from '@/hooks/useStores';
import { useCreateOrder } from '@/hooks/useOrders';
import { formatPrice } from '@/utils/format';
import type { PaymentMethod } from '@/types';

const PAYMENT_OPTIONS: {
  id: PaymentMethod;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { id: 'cash', label: 'Cash', description: 'Customer pays with cash', icon: 'cash-outline' },
  { id: 'card', label: 'Card', description: 'Customer pays by debit or credit card', icon: 'card-outline' },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const discount = useCartStore((state) => state.getDiscount());
  const total = useCartStore((state) => state.getTotal());
  const clearCart = useCartStore((state) => state.clearCart);
  const storeId = useSettingsStore((state) => state.storeId);
  const { data: store } = useStore(storeId);
  const createOrder = useCreateOrder();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');

  const handleCompleteSale = async () => {
    if (items.length === 0) {
      Alert.alert('No items scanned', 'Scan at least one product before completing the sale.');
      return;
    }
    try {
      const order = await createOrder.mutateAsync({
        storeId,
        storeName: store?.name ?? 'FreshCart',
        items,
        paymentMethod,
      });
      clearCart();
      router.replace({ pathname: '/checkout/success', params: { orderId: order.id } });
    } catch {
      Alert.alert('Checkout failed', 'Something went wrong while completing the sale. Please try again.');
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      <StatusBar style="dark" />
      <Header title="Checkout" />
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false}>
        <Text className="text-base font-bold text-gray-900">Sale Summary</Text>
        <View className="mt-3 gap-3">
          {items.map((item) => (
            <View key={item.productId} className="flex-row items-center justify-between">
              <Text className="mr-2 flex-1 text-sm text-gray-600" numberOfLines={1}>
                {item.quantity} x {item.name}
              </Text>
              <Text className="text-sm font-medium text-gray-900">
                {formatPrice((item.discountPrice ?? item.price) * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        <Divider className="my-5" />

        <View className="gap-2">
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500">Subtotal</Text>
            <Text className="text-sm text-gray-900">{formatPrice(subtotal)}</Text>
          </View>
          {discount > 0 ? (
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500">Discount</Text>
              <Text className="text-sm text-primary-600">-{formatPrice(discount)}</Text>
            </View>
          ) : null}
          <View className="flex-row justify-between">
            <Text className="text-base font-bold text-gray-900">Total</Text>
            <Text className="text-base font-bold text-gray-900">{formatPrice(total)}</Text>
          </View>
        </View>

        <Divider className="my-5" />

        <Text className="text-base font-bold text-gray-900">Payment</Text>
        <View className="mt-3 gap-3 pb-6">
          {PAYMENT_OPTIONS.map((option) => {
            const selected = paymentMethod === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => setPaymentMethod(option.id)}
                className={`flex-row items-center rounded-2xl border p-4 ${
                  selected ? 'border-primary-500 bg-primary-50' : 'border-gray-100'
                }`}
              >
                <View
                  className={`h-11 w-11 items-center justify-center rounded-full ${
                    selected ? 'bg-primary-500' : 'bg-gray-100'
                  }`}
                >
                  <Ionicons name={option.icon} size={20} color={selected ? '#ffffff' : '#6b7280'} />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-semibold text-gray-900">{option.label}</Text>
                  <Text className="text-xs text-gray-500">{option.description}</Text>
                </View>
                <Ionicons
                  name={selected ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={selected ? '#1db567' : '#d1d5db'}
                />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View className="border-t border-gray-100 px-5 pb-2 pt-4">
        <Button
          label="Complete Sale"
          size="lg"
          loading={createOrder.isPending}
          onPress={handleCompleteSale}
        />
      </View>
    </SafeAreaView>
  );
}
