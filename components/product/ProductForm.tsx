import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CategoryChip } from './CategoryChip';
import { CATEGORY_ORDER } from '@/constants/categories';
import { computeDiscountPercentage } from '@/utils/pricing';
import { placeholderProductImage } from '@/utils/productImage';
import { useScannedProductStore } from '@/store/scannedProductStore';
import type { ProductCategory, ProductInput, ProductUnit } from '@/types';

const FIELD_LABELS: Record<string, string> = {
  barcode: 'Barcode',
  name: 'Name',
  brand: 'Brand',
  description: 'Description',
  category: 'Category',
  price: 'Price',
  discountPrice: 'Discount price',
  stock: 'Stock',
  unit: 'Unit',
  image: 'Image',
};

const UNIT_OPTIONS: { id: ProductUnit; label: string }[] = [
  { id: 'pc', label: 'pc' },
  { id: 'kg', label: 'kg' },
  { id: 'g', label: 'g' },
  { id: 'l', label: 'L' },
  { id: 'ml', label: 'mL' },
  { id: 'dozen', label: 'dozen' },
  { id: 'pack', label: 'pack' },
];

interface ProductFormProps {
  initialValues?: ProductInput;
  onSubmit: (input: ProductInput) => void;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
}

export function ProductForm({ initialValues, onSubmit, submitLabel, isSubmitting, error }: ProductFormProps) {
  const router = useRouter();
  const scannedProduct = useScannedProductStore((state) => state.scannedProduct);
  const setScannedProduct = useScannedProductStore((state) => state.setScannedProduct);

  const [barcode, setBarcode] = useState(initialValues?.barcode ?? '');
  const [name, setName] = useState(initialValues?.name ?? '');
  const [brand, setBrand] = useState(initialValues?.brand ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [category, setCategory] = useState<ProductCategory>(initialValues?.category ?? 'fruits');
  const [price, setPrice] = useState(initialValues ? String(initialValues.price) : '');
  const [discountPrice, setDiscountPrice] = useState(
    initialValues?.discountPrice != null ? String(initialValues.discountPrice) : '',
  );
  const [stock, setStock] = useState(initialValues ? String(initialValues.stock) : '');
  const [unit, setUnit] = useState<ProductUnit>(initialValues?.unit ?? 'pc');
  const [image, setImage] = useState(initialValues?.image ?? '');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [autoFilledFrom, setAutoFilledFrom] = useState<string[] | null>(null);

  useEffect(() => {
    if (!scannedProduct) return;
    const filled: string[] = [];

    if (scannedProduct.barcode) {
      setBarcode(scannedProduct.barcode);
      filled.push('barcode');
    }
    // Only backfill the rest when the field is still blank/default, so a scan never
    // clobbers what the user already typed by hand.
    if (scannedProduct.name && !name.trim()) {
      setName(scannedProduct.name);
      filled.push('name');
    }
    if (scannedProduct.brand && !brand.trim()) {
      setBrand(scannedProduct.brand);
      filled.push('brand');
    }
    if (scannedProduct.description && !description.trim()) {
      setDescription(scannedProduct.description);
      filled.push('description');
    }
    if (scannedProduct.category) {
      setCategory(scannedProduct.category);
      filled.push('category');
    }
    if (scannedProduct.price != null && !price.trim()) {
      setPrice(String(scannedProduct.price));
      filled.push('price');
    }
    if (scannedProduct.discountPrice != null && !discountPrice.trim()) {
      setDiscountPrice(String(scannedProduct.discountPrice));
      filled.push('discountPrice');
    }
    if (scannedProduct.stock != null && !stock.trim()) {
      setStock(String(scannedProduct.stock));
      filled.push('stock');
    }
    if (scannedProduct.unit) {
      setUnit(scannedProduct.unit);
      filled.push('unit');
    }
    if (scannedProduct.image && !image.trim()) {
      setImage(scannedProduct.image);
      filled.push('image');
    }

    setAutoFilledFrom(filled.length > 1 ? filled : null);
    setScannedProduct(null);
    // Only ever react to a fresh scan landing in the store, not to every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scannedProduct, setScannedProduct]);

  const trimmedImage = image.trim();
  const previewImage = trimmedImage || (name.trim() ? placeholderProductImage(name.trim(), category) : null);
  const priceNum = Number(price);
  const discountNum = discountPrice.trim() ? Number(discountPrice) : null;
  const showDiscountHint =
    discountNum !== null && Number.isFinite(priceNum) && priceNum > 0 && discountNum > 0 && discountNum < priceNum;

  const handleSubmit = () => {
    const stockNum = Number(stock);

    if (!name.trim() || !brand.trim() || !description.trim()) {
      setFieldError('Please fill in all required fields.');
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setFieldError('Enter a valid price.');
      return;
    }
    if (!Number.isFinite(stockNum) || stockNum < 0) {
      setFieldError('Enter a valid stock quantity.');
      return;
    }
    if (discountNum !== null && (!Number.isFinite(discountNum) || discountNum <= 0 || discountNum >= priceNum)) {
      setFieldError('Discount price must be less than the regular price.');
      return;
    }

    setFieldError(null);
    onSubmit({
      barcode: barcode.trim() || undefined,
      name: name.trim(),
      brand: brand.trim(),
      description: description.trim(),
      category,
      price: priceNum,
      discountPrice: discountNum,
      stock: stockNum,
      unit,
      image: trimmedImage || undefined,
    });
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
    >
      <ScrollView className="flex-1 px-5" showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View className="items-center py-4">
          <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-gray-50 dark:bg-gray-800">
            {previewImage ? (
              <Image source={{ uri: previewImage }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            ) : (
              <Text className="text-xs text-gray-400 dark:text-gray-500">Preview</Text>
            )}
          </View>
        </View>

        <View className="gap-4 pb-10">
          {autoFilledFrom ? (
            <View className="rounded-2xl bg-primary-50 dark:bg-primary-900 px-4 py-2.5">
              <Text className="text-xs font-medium text-primary-700 dark:text-primary-300">
                Auto-filled from scan: {autoFilledFrom.map((f) => FIELD_LABELS[f] ?? f).join(', ')}
              </Text>
            </View>
          ) : null}

          <View className="flex-row items-end gap-2">
            <View className="flex-1">
              <Input
                label="Barcode (optional)"
                placeholder="e.g. 6190000000017"
                keyboardType="numeric"
                value={barcode}
                onChangeText={setBarcode}
              />
            </View>
            <Pressable
              onPress={() => router.push('/scan/capture')}
              className="h-[52px] w-[52px] items-center justify-center rounded-2xl bg-primary-500"
              accessibilityRole="button"
              accessibilityLabel="Scan barcode or QR code"
            >
              <Ionicons name="scan" size={22} color="#ffffff" />
            </Pressable>
          </View>
          <Input label="Product Name" placeholder="e.g. Red Apple" value={name} onChangeText={setName} />
          <Input label="Brand" placeholder="e.g. Farm Fresh" value={brand} onChangeText={setBrand} />

          <View>
            <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Short description shown on the product page"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-base text-gray-900 dark:text-gray-50"
              style={{ minHeight: 84 }}
            />
          </View>

          <View>
            <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
              {CATEGORY_ORDER.map((c) => (
                <CategoryChip key={c} category={c} selected={category === c} onPress={() => setCategory(c)} />
              ))}
            </ScrollView>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input label="Price (Rs.)" placeholder="0" keyboardType="numeric" value={price} onChangeText={setPrice} />
            </View>
            <View className="flex-1">
              <Input
                label="Discount Price"
                placeholder="Optional"
                keyboardType="numeric"
                value={discountPrice}
                onChangeText={setDiscountPrice}
              />
            </View>
          </View>
          {showDiscountHint ? (
            <Text className="-mt-2 text-xs font-medium text-primary-600 dark:text-primary-400">
              {computeDiscountPercentage(priceNum, discountNum)}% off
            </Text>
          ) : null}

          <Input label="Stock Quantity" placeholder="0" keyboardType="numeric" value={stock} onChangeText={setStock} />

          <View>
            <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">Unit</Text>
            <View className="flex-row flex-wrap gap-2">
              {UNIT_OPTIONS.map((option) => {
                const selected = unit === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setUnit(option.id)}
                    className={`rounded-full border px-4 py-2 ${
                      selected ? 'border-primary-500 bg-primary-50 dark:bg-primary-900' : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Text className={`text-sm ${selected ? 'font-semibold text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-300'}`}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Input
            label="Image URL"
            placeholder="Leave blank to auto-generate"
            value={image}
            onChangeText={setImage}
            autoCapitalize="none"
          />

          {fieldError || error ? <Text className="text-sm text-red-500 dark:text-red-400">{fieldError ?? error}</Text> : null}

          <Button label={submitLabel} size="lg" loading={isSubmitting} onPress={handleSubmit} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
