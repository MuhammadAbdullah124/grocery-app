import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { useSearchProducts } from '@/hooks/useProducts';
import { useCreatePurchase } from '@/hooks/usePurchases';
import { useContactPickerStore } from '@/store/contactPickerStore';
import { ApiRequestError } from '@/types';
import { formatPrice } from '@/utils/format';
import type { Product, PurchaseItemInput, PurchasePaymentMethod } from '@/types';

const PAYMENT_OPTIONS: { id: PurchasePaymentMethod; label: string }[] = [
  { id: 'cash', label: 'Cash' },
  { id: 'card', label: 'Card' },
  { id: 'credit', label: 'Credit' },
];

interface DraftItem extends PurchaseItemInput {
  key: string;
}

export default function NewPurchaseScreen() {
  const router = useRouter();
  const selectedContact = useContactPickerStore((state) => state.selectedContact);
  const setSelectedContact = useContactPickerStore((state) => state.setSelectedContact);
  const createPurchase = useCreatePurchase();

  const [paymentMethod, setPaymentMethod] = useState<PurchasePaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<DraftItem[]>([]);
  const [fieldError, setFieldError] = useState<string | null>(null);

  const [productQuery, setProductQuery] = useState('');
  const [debouncedProductQuery, setDebouncedProductQuery] = useState('');
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null);
  const [pendingQuantity, setPendingQuantity] = useState('1');
  const [pendingCost, setPendingCost] = useState('');

  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customUnit, setCustomUnit] = useState('');
  const [customCost, setCustomCost] = useState('');
  const [customQuantity, setCustomQuantity] = useState('1');

  // contactPickerStore is shared with checkout's credit-payment flow — clear
  // any stale pick left over from an abandoned visit to either screen, so it
  // never silently leaks into this one. Only runs once per fresh navigation
  // here (this screen stays mounted while the picker is pushed on top of it).
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => setSelectedContact(null), []);

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedProductQuery(productQuery.trim()), 300);
    return () => clearTimeout(handle);
  }, [productQuery]);

  const searchResults = useSearchProducts(debouncedProductQuery);

  const total = items.reduce((sum, item) => sum + item.costPrice * item.quantity, 0);

  const handlePickContact = () => {
    router.push({ pathname: '/contact-picker', params: { defaultType: 'supplier' } });
  };

  const handleSelectProduct = (product: Product) => {
    setPendingProduct(product);
    setPendingCost(String(product.price));
    setPendingQuantity('1');
    setProductQuery('');
  };

  const handleAddPendingProduct = () => {
    if (!pendingProduct) return;
    const quantity = Number(pendingQuantity);
    const costPrice = Number(pendingCost);
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(costPrice) || costPrice < 0) {
      setFieldError('Enter a valid quantity and cost for this item.');
      return;
    }
    setFieldError(null);
    setItems((prev) => [
      ...prev,
      {
        key: `${pendingProduct.id}-${Date.now()}`,
        productId: pendingProduct.id,
        name: pendingProduct.name,
        unit: pendingProduct.unit,
        costPrice,
        quantity,
      },
    ]);
    setPendingProduct(null);
    setPendingCost('');
    setPendingQuantity('1');
  };

  const handleAddCustomItem = () => {
    const quantity = Number(customQuantity);
    const costPrice = Number(customCost);
    if (!customName.trim() || !customUnit.trim()) {
      setFieldError('Enter a name and unit for this item.');
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(costPrice) || costPrice < 0) {
      setFieldError('Enter a valid quantity and cost for this item.');
      return;
    }
    setFieldError(null);
    setItems((prev) => [
      ...prev,
      {
        key: `custom-${Date.now()}`,
        name: customName.trim(),
        unit: customUnit.trim(),
        costPrice,
        quantity,
      },
    ]);
    setCustomName('');
    setCustomUnit('');
    setCustomCost('');
    setCustomQuantity('1');
    setIsAddingCustom(false);
  };

  const handleRemoveItem = (key: string) => {
    setItems((prev) => prev.filter((item) => item.key !== key));
  };

  const handleSubmit = async () => {
    if (!selectedContact) {
      setFieldError('Pick the supplier this purchase is from.');
      return;
    }
    if (items.length === 0) {
      setFieldError('Add at least one item.');
      return;
    }
    setFieldError(null);

    try {
      await createPurchase.mutateAsync({
        contactId: selectedContact.id,
        paymentMethod,
        notes: notes.trim() || undefined,
        items: items.map(({ key: _key, ...item }) => item),
      });
      setSelectedContact(null);
      router.back();
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : 'Something went wrong. Please try again.';
      Alert.alert('Could not record purchase', message);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
      <StatusBar style="dark" />
      <Header title="New Purchase" showProfileShortcut={false} />
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerClassName="px-5"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={20}
      >
          <View className="gap-4 py-4 pb-10">
            <View>
              <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">Supplier</Text>
              <Pressable
                onPress={handlePickContact}
                className="h-[52px] flex-row items-center justify-between rounded-2xl border border-gray-200 dark:border-gray-700 px-4"
              >
                <Text className={selectedContact ? 'text-base text-gray-900 dark:text-gray-50' : 'text-base text-gray-400'}>
                  {selectedContact?.name ?? 'Select a supplier'}
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
              </Pressable>
            </View>

            <Divider />

            <Text className="text-sm font-semibold text-gray-900 dark:text-gray-50">Items</Text>

            {items.length > 0 ? (
              <View className="gap-2">
                {items.map((item) => (
                  <View
                    key={item.key}
                    className="flex-row items-center justify-between rounded-2xl border border-gray-100 dark:border-gray-800 p-3"
                  >
                    <View className="mr-3 flex-1">
                      <Text className="text-sm font-medium text-gray-900 dark:text-gray-50" numberOfLines={1}>
                        {item.name}
                      </Text>
                      <Text className="text-xs text-gray-400 dark:text-gray-500">
                        {item.quantity} {item.unit} x {formatPrice(item.costPrice)} = {formatPrice(item.costPrice * item.quantity)}
                      </Text>
                    </View>
                    <Pressable onPress={() => handleRemoveItem(item.key)} hitSlop={8}>
                      <Ionicons name="close-circle" size={22} color="#ef4444" />
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : null}

            <Input placeholder="Search products to add..." leftIcon="search" value={productQuery} onChangeText={setProductQuery} />

            {debouncedProductQuery && !pendingProduct ? (
              <View className="gap-2">
                {(searchResults.data ?? []).slice(0, 5).map((product) => (
                  <Pressable
                    key={product.id}
                    onPress={() => handleSelectProduct(product)}
                    className="flex-row items-center justify-between rounded-2xl border border-gray-100 dark:border-gray-800 p-3"
                  >
                    <Text className="flex-1 text-sm text-gray-900 dark:text-gray-50" numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text className="text-xs text-gray-400 dark:text-gray-500">{formatPrice(product.price)}</Text>
                  </Pressable>
                ))}
                {searchResults.data?.length === 0 && !searchResults.isLoading ? (
                  <Text className="text-xs text-gray-400 dark:text-gray-500">No matching products.</Text>
                ) : null}
              </View>
            ) : null}

            {pendingProduct ? (
              <View className="gap-2 rounded-2xl border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900 p-3">
                <Text className="text-sm font-semibold text-gray-900 dark:text-gray-50">{pendingProduct.name}</Text>
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Input label="Quantity" keyboardType="numeric" value={pendingQuantity} onChangeText={setPendingQuantity} />
                  </View>
                  <View className="flex-1">
                    <Input label="Cost Price" keyboardType="numeric" value={pendingCost} onChangeText={setPendingCost} />
                  </View>
                </View>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={handleAddPendingProduct}
                    className="h-11 flex-1 items-center justify-center rounded-2xl bg-primary-500"
                  >
                    <Text className="text-sm font-semibold text-white">Add Item</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setPendingProduct(null)}
                    className="h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800"
                  >
                    <Ionicons name="close" size={20} color="#6b7280" />
                  </Pressable>
                </View>
              </View>
            ) : null}

            {isAddingCustom ? (
              <View className="gap-2 rounded-2xl border border-gray-100 dark:border-gray-800 p-3">
                <Input placeholder="Item name (not in catalog)" value={customName} onChangeText={setCustomName} />
                <View className="flex-row gap-2">
                  <View className="flex-1">
                    <Input placeholder="Unit (e.g. carton)" value={customUnit} onChangeText={setCustomUnit} />
                  </View>
                  <View className="flex-1">
                    <Input placeholder="Quantity" keyboardType="numeric" value={customQuantity} onChangeText={setCustomQuantity} />
                  </View>
                  <View className="flex-1">
                    <Input placeholder="Cost" keyboardType="numeric" value={customCost} onChangeText={setCustomCost} />
                  </View>
                </View>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={handleAddCustomItem}
                    className="h-11 flex-1 items-center justify-center rounded-2xl bg-primary-500"
                  >
                    <Text className="text-sm font-semibold text-white">Add Item</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setIsAddingCustom(false)}
                    className="h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800"
                  >
                    <Ionicons name="close" size={20} color="#6b7280" />
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => setIsAddingCustom(true)}
                className="flex-row items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 py-3"
              >
                <Ionicons name="add" size={16} color="#9ca3af" />
                <Text className="ml-1.5 text-sm text-gray-500 dark:text-gray-400">Add item not in catalog</Text>
              </Pressable>
            )}

            <Divider />

            <View>
              <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">Payment Method</Text>
              <View className="flex-row gap-2">
                {PAYMENT_OPTIONS.map((option) => {
                  const selected = paymentMethod === option.id;
                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => setPaymentMethod(option.id)}
                      className={`flex-1 items-center rounded-2xl border py-3 ${
                        selected ? 'border-primary-500 bg-primary-50 dark:bg-primary-900' : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <Text
                        className={`text-sm ${
                          selected ? 'font-semibold text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              {paymentMethod === 'credit' ? (
                <Text className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  Adds the total to this supplier's balance — you'll owe them.
                </Text>
              ) : null}
            </View>

            <View>
              <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">Notes (optional)</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                placeholder="Anything worth remembering about this purchase"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-base text-gray-900 dark:text-gray-50"
                style={{ minHeight: 60 }}
              />
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-base font-bold text-gray-900 dark:text-gray-50">Total</Text>
              <Text className="text-base font-bold text-gray-900 dark:text-gray-50">{formatPrice(total)}</Text>
            </View>

            {fieldError ? <Text className="text-sm text-red-500 dark:text-red-400">{fieldError}</Text> : null}

            <Button label="Record Purchase" size="lg" loading={createPurchase.isPending} onPress={handleSubmit} />
          </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
