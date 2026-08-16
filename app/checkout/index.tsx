import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Input } from '@/components/ui/Input';
import { useCartStore } from '@/store/cartStore';
import { useSelectedStore } from '@/hooks/useSelectedStore';
import { useCreateOrder } from '@/hooks/useOrders';
import { useContactPickerStore } from '@/store/contactPickerStore';
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
  { id: 'credit', label: 'Credit', description: 'Add to a customer\'s Khata tab', icon: 'book-outline' },
];

export default function CheckoutScreen() {
  const router = useRouter();
  const items = useCartStore((state) => state.items);
  const subtotal = useCartStore((state) => state.getSubtotal());
  const discount = useCartStore((state) => state.getDiscount());
  const total = useCartStore((state) => state.getTotal());
  const clearCart = useCartStore((state) => state.clearCart);
  const { store } = useSelectedStore();
  const createOrder = useCreateOrder();
  const selectedContact = useContactPickerStore((state) => state.selectedContact);
  const setSelectedContact = useContactPickerStore((state) => state.setSelectedContact);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashReceivedInput, setCashReceivedInput] = useState('');

  // contactPickerStore is shared with the new-purchase flow — clear any
  // stale pick left over from an abandoned visit there so it never silently
  // leaks in here. Only runs once per fresh navigation to checkout.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setSelectedContact(null), []);

  const cashReceived = Number(cashReceivedInput);
  const hasValidCash = cashReceivedInput.trim() !== '' && Number.isFinite(cashReceived);
  const changeDue = useMemo(
    () => (hasValidCash ? cashReceived - total : null),
    [hasValidCash, cashReceived, total],
  );

  const handleCompleteSale = async () => {
    if (items.length === 0) {
      Alert.alert('No items scanned', 'Scan at least one product before completing the sale.');
      return;
    }
    if (!store) {
      Alert.alert('No store selected', 'Please select a store before completing the sale.');
      return;
    }
    if (paymentMethod === 'cash' && (!hasValidCash || changeDue === null || changeDue < 0)) {
      Alert.alert('Not enough cash entered', 'Enter a cash amount that covers the total.');
      return;
    }
    if (paymentMethod === 'credit' && !selectedContact) {
      Alert.alert('Select a customer', 'Choose or add a contact to record this credit sale.');
      return;
    }
    try {
      const order = await createOrder.mutateAsync({
        storeId: store.id,
        storeName: store.name,
        items,
        paymentMethod,
        cashReceived: paymentMethod === 'cash' ? cashReceived : undefined,
        contactId: paymentMethod === 'credit' ? selectedContact?.id : undefined,
      });
      clearCart();
      setSelectedContact(null);
      router.replace({ pathname: '/checkout/success', params: { orderId: order.id } });
    } catch {
      Alert.alert('Checkout failed', 'Something went wrong while completing the sale. Please try again.');
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
      <StatusBar style="dark" />
      <Header title="Checkout" showProfileShortcut={false} />
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerClassName="px-5"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={20}
      >
        <Text className="text-base font-bold text-gray-900 dark:text-gray-50">Sale Summary</Text>
        <View className="mt-3 gap-3">
          {items.map((item) => (
            <View key={item.productId} className="flex-row items-center justify-between">
              <Text className="mr-2 flex-1 text-sm text-gray-600 dark:text-gray-300" numberOfLines={1}>
                {item.quantity} x {item.name}
              </Text>
              <Text className="text-sm font-medium text-gray-900 dark:text-gray-50">
                {formatPrice((item.discountPrice ?? item.price) * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        <Divider className="my-5" />

        <View className="gap-2">
          <View className="flex-row justify-between">
            <Text className="text-sm text-gray-500 dark:text-gray-400">Subtotal</Text>
            <Text className="text-sm text-gray-900 dark:text-gray-50">{formatPrice(subtotal)}</Text>
          </View>
          {discount > 0 ? (
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500 dark:text-gray-400">Discount</Text>
              <Text className="text-sm text-primary-600 dark:text-primary-400">-{formatPrice(discount)}</Text>
            </View>
          ) : null}
          <View className="flex-row justify-between">
            <Text className="text-base font-bold text-gray-900 dark:text-gray-50">Total</Text>
            <Text className="text-base font-bold text-gray-900 dark:text-gray-50">{formatPrice(total)}</Text>
          </View>
        </View>

        <Divider className="my-5" />

        <Text className="text-base font-bold text-gray-900 dark:text-gray-50">Payment</Text>
        <View className="mt-3 gap-3 pb-6">
          {PAYMENT_OPTIONS.map((option) => {
            const selected = paymentMethod === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => setPaymentMethod(option.id)}
                className={`flex-row items-center rounded-2xl border p-4 ${
                  selected ? 'border-primary-500 bg-primary-50 dark:bg-primary-900' : 'border-gray-100 dark:border-gray-800'
                }`}
              >
                <View
                  className={`h-11 w-11 items-center justify-center rounded-full ${
                    selected ? 'bg-primary-500' : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  <Ionicons name={option.icon} size={20} color={selected ? '#ffffff' : '#6b7280'} />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-semibold text-gray-900 dark:text-gray-50">{option.label}</Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400">{option.description}</Text>
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

        {paymentMethod === 'credit' ? (
          <View className="pb-6">
            <Pressable
              onPress={() => router.push({ pathname: '/contact-picker', params: { defaultType: 'customer' } })}
              className="h-[52px] flex-row items-center justify-between rounded-2xl border border-gray-200 dark:border-gray-700 px-4"
            >
              <Text className={selectedContact ? 'text-base text-gray-900 dark:text-gray-50' : 'text-base text-gray-400'}>
                {selectedContact?.name ?? 'Select a customer'}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </Pressable>
          </View>
        ) : null}

        {paymentMethod === 'cash' ? (
          <View className="pb-6">
            <View className="flex-row items-end gap-2">
              <View className="flex-1">
                <Input
                  label="Cash Received"
                  placeholder="0"
                  keyboardType="numeric"
                  value={cashReceivedInput}
                  onChangeText={setCashReceivedInput}
                />
              </View>
              <Pressable
                onPress={() => setCashReceivedInput(String(total))}
                className="h-[52px] items-center justify-center rounded-2xl border border-gray-200 dark:border-gray-700 px-4"
              >
                <Text className="text-sm font-semibold text-primary-600 dark:text-primary-400">Exact</Text>
              </Pressable>
            </View>
            {changeDue !== null ? (
              <View className="mt-3 flex-row items-center justify-between rounded-2xl bg-gray-50 dark:bg-gray-900 px-4 py-3">
                <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {changeDue >= 0 ? 'Change Due' : 'Still Owed'}
                </Text>
                <Text
                  className={`text-base font-bold ${
                    changeDue >= 0 ? 'text-gray-900 dark:text-gray-50' : 'text-red-500 dark:text-red-400'
                  }`}
                >
                  {formatPrice(Math.abs(changeDue))}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </KeyboardAwareScrollView>

      <View className="border-t border-gray-100 dark:border-gray-800 px-5 pb-2 pt-4">
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
