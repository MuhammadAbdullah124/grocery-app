import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CategoryChip } from './CategoryChip';
import { ProductImagePicker } from './ProductImagePicker';
import { computeDiscountPercentage } from '@/utils/pricing';
import { placeholderProductImage } from '@/utils/productImage';
import { useScannedProductStore } from '@/store/scannedProductStore';
import { useCategories, useCreateCategory } from '@/hooks/useCategories';
import { useUnits, useCreateUnit } from '@/hooks/useUnits';
import type { ProductInput } from '@/types';

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

  const categoriesQuery = useCategories();
  const unitsQuery = useUnits();
  const createCategory = useCreateCategory();
  const createUnit = useCreateUnit();

  const [barcode, setBarcode] = useState(initialValues?.barcode ?? '');
  const [name, setName] = useState(initialValues?.name ?? '');
  const [brand, setBrand] = useState(initialValues?.brand ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [categoryId, setCategoryId] = useState(initialValues?.categoryId ?? '');
  const [purchasePrice, setPurchasePrice] = useState(
    initialValues?.purchasePrice != null ? String(initialValues.purchasePrice) : '',
  );
  const [price, setPrice] = useState(initialValues ? String(initialValues.price) : '');
  const [discountPrice, setDiscountPrice] = useState(
    initialValues?.discountPrice != null ? String(initialValues.discountPrice) : '',
  );
  const [stock, setStock] = useState(initialValues ? String(initialValues.stock) : '');
  const [unitId, setUnitId] = useState(initialValues?.unitId ?? '');
  const [image, setImage] = useState(initialValues?.image ?? '');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [autoFilledFrom, setAutoFilledFrom] = useState<string[] | null>(null);

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [newUnitName, setNewUnitName] = useState('');

  // Default to the first available category/unit once they've loaded, for a brand new product
  // that hasn't had one picked yet — editing an existing product already has initialValues.
  useEffect(() => {
    if (!categoryId && categoriesQuery.data && categoriesQuery.data.length > 0) {
      setCategoryId(categoriesQuery.data[0].id);
    }
  }, [categoryId, categoriesQuery.data]);

  useEffect(() => {
    if (!unitId && unitsQuery.data && unitsQuery.data.length > 0) {
      setUnitId(unitsQuery.data[0].id);
    }
  }, [unitId, unitsQuery.data]);

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
    if (scannedProduct.categoryName) {
      const match = categoriesQuery.data?.find(
        (c) => c.name.toLowerCase() === scannedProduct.categoryName?.toLowerCase(),
      );
      if (match) {
        setCategoryId(match.id);
        filled.push('category');
      }
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
    if (scannedProduct.unitName) {
      const match = unitsQuery.data?.find((u) => u.name.toLowerCase() === scannedProduct.unitName?.toLowerCase());
      if (match) {
        setUnitId(match.id);
        filled.push('unit');
      }
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

  const selectedCategory = categoriesQuery.data?.find((c) => c.id === categoryId);
  const trimmedImage = image.trim();
  const placeholderPreview =
    name.trim() && selectedCategory ? placeholderProductImage(name.trim(), selectedCategory.name) : null;
  const priceNum = Number(price);
  const purchasePriceNum = purchasePrice.trim() ? Number(purchasePrice) : null;
  const discountNum = discountPrice.trim() ? Number(discountPrice) : null;
  const showDiscountHint =
    discountNum !== null && Number.isFinite(priceNum) && priceNum > 0 && discountNum > 0 && discountNum < priceNum;

  const handleAddCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) return;
    try {
      const category = await createCategory.mutateAsync(trimmed);
      setCategoryId(category.id);
      setNewCategoryName('');
      setIsAddingCategory(false);
    } catch {
      setFieldError('Could not add that category. It may already exist.');
    }
  };

  const handleAddUnit = async () => {
    const trimmed = newUnitName.trim();
    if (!trimmed) return;
    try {
      const unit = await createUnit.mutateAsync(trimmed);
      setUnitId(unit.id);
      setNewUnitName('');
      setIsAddingUnit(false);
    } catch {
      setFieldError('Could not add that unit. It may already exist.');
    }
  };

  const handleSubmit = () => {
    const stockNum = Number(stock);

    if (!name.trim() || !brand.trim() || !description.trim()) {
      setFieldError('Please fill in all required fields.');
      return;
    }
    if (!categoryId) {
      setFieldError('Choose or add a category.');
      return;
    }
    if (!unitId) {
      setFieldError('Choose or add a unit.');
      return;
    }
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      setFieldError('Enter a valid selling price.');
      return;
    }
    if (purchasePriceNum !== null && (!Number.isFinite(purchasePriceNum) || purchasePriceNum < 0)) {
      setFieldError('Enter a valid purchase price.');
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
      categoryId,
      purchasePrice: purchasePriceNum,
      price: priceNum,
      discountPrice: discountNum,
      stock: stockNum,
      unitId,
      image: trimmedImage || undefined,
    });
  };

  return (
    <KeyboardAwareScrollView
      className="flex-1"
      contentContainerClassName="px-5"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      extraScrollHeight={20}
    >
        <ProductImagePicker
          imageUri={trimmedImage || null}
          placeholderUri={placeholderPreview}
          onChange={(url) => setImage(url ?? '')}
        />

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
              {(categoriesQuery.data ?? []).map((c) => (
                <CategoryChip key={c.id} category={c} selected={categoryId === c.id} onPress={() => setCategoryId(c.id)} />
              ))}
              <Pressable onPress={() => setIsAddingCategory(true)} className="mr-4 items-center" style={{ width: 72 }}>
                <View className="h-14 w-14 items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
                  <Ionicons name="add" size={22} color="#9ca3af" />
                </View>
                <Text numberOfLines={1} className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                  Add New
                </Text>
              </Pressable>
            </ScrollView>
            {isAddingCategory ? (
              <View className="mt-3 flex-row items-center gap-2">
                <View className="flex-1">
                  <Input
                    placeholder="e.g. Frozen Foods"
                    value={newCategoryName}
                    onChangeText={setNewCategoryName}
                    autoFocus
                  />
                </View>
                <Pressable
                  onPress={handleAddCategory}
                  disabled={createCategory.isPending}
                  className="h-[52px] w-[52px] items-center justify-center rounded-2xl bg-primary-500"
                  accessibilityRole="button"
                  accessibilityLabel="Confirm new category"
                >
                  <Ionicons name="checkmark" size={22} color="#ffffff" />
                </Pressable>
                <Pressable
                  onPress={() => {
                    setIsAddingCategory(false);
                    setNewCategoryName('');
                  }}
                  className="h-[52px] w-[52px] items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800"
                  accessibilityRole="button"
                  accessibilityLabel="Cancel"
                >
                  <Ionicons name="close" size={22} color="#6b7280" />
                </Pressable>
              </View>
            ) : null}
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Input
                label="Purchase Price (Rs.)"
                placeholder="Optional"
                keyboardType="numeric"
                value={purchasePrice}
                onChangeText={setPurchasePrice}
              />
            </View>
            <View className="flex-1">
              <Input
                label="Selling Price (Rs.)"
                placeholder="0"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>
          </View>
          <View className="flex-row gap-3">
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
            <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">
              Unit <Text className="text-gray-400 dark:text-gray-500">(e.g. pc, kg, 250ml, dozen)</Text>
            </Text>
            <View className="flex-row flex-wrap gap-2">
              {(unitsQuery.data ?? []).map((u) => {
                const selected = unitId === u.id;
                return (
                  <Pressable
                    key={u.id}
                    onPress={() => setUnitId(u.id)}
                    className={`rounded-full border px-4 py-2 ${
                      selected ? 'border-primary-500 bg-primary-50 dark:bg-primary-900' : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Text className={`text-sm ${selected ? 'font-semibold text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-300'}`}>
                      {u.name}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                onPress={() => setIsAddingUnit(true)}
                className="rounded-full border-2 border-dashed border-gray-300 dark:border-gray-700 px-4 py-2"
              >
                <Text className="text-sm text-gray-500 dark:text-gray-400">+ Add New</Text>
              </Pressable>
            </View>
            {isAddingUnit ? (
              <View className="mt-3 flex-row items-center gap-2">
                <View className="flex-1">
                  <Input placeholder="e.g. 250ml" value={newUnitName} onChangeText={setNewUnitName} autoFocus />
                </View>
                <Pressable
                  onPress={handleAddUnit}
                  disabled={createUnit.isPending}
                  className="h-[52px] w-[52px] items-center justify-center rounded-2xl bg-primary-500"
                  accessibilityRole="button"
                  accessibilityLabel="Confirm new unit"
                >
                  <Ionicons name="checkmark" size={22} color="#ffffff" />
                </Pressable>
                <Pressable
                  onPress={() => {
                    setIsAddingUnit(false);
                    setNewUnitName('');
                  }}
                  className="h-[52px] w-[52px] items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800"
                  accessibilityRole="button"
                  accessibilityLabel="Cancel"
                >
                  <Ionicons name="close" size={22} color="#6b7280" />
                </Pressable>
              </View>
            ) : null}
          </View>

          {fieldError || error ? <Text className="text-sm text-red-500 dark:text-red-400">{fieldError ?? error}</Text> : null}

          <Button label={submitLabel} size="lg" loading={isSubmitting} onPress={handleSubmit} />
        </View>
    </KeyboardAwareScrollView>
  );
}
