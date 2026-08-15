import { Alert, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Header } from '@/components/layout/Header';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { ProductForm } from '@/components/product/ProductForm';
import { useProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useProducts';
import { ApiRequestError } from '@/types';
import type { ProductInput } from '@/types';

export default function EditProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const productQuery = useProduct(id);
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const handleSubmit = async (input: ProductInput) => {
    if (!id) return;
    try {
      await updateProduct.mutateAsync({ id, input });
      router.back();
    } catch (error) {
      const message =
        error instanceof ApiRequestError ? error.message : 'Something went wrong. Please try again.';
      Alert.alert('Could not update product', message);
    }
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert('Delete product', 'This cannot be undone. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteProduct.mutateAsync(id);
            router.back();
          } catch {
            Alert.alert('Could not delete product', 'Please try again.');
          }
        },
      },
    ]);
  };

  if (productQuery.isLoading) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
        <StatusBar style="dark" />
        <Header title="Edit Product" />
        <View className="px-5 pt-4">
          <Skeleton height={200} radius={16} />
        </View>
      </SafeAreaView>
    );
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
        <StatusBar style="dark" />
        <Header title="Edit Product" />
        <ErrorState title="Product not found" description="This product may have been removed." />
      </SafeAreaView>
    );
  }

  const product = productQuery.data;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
      <StatusBar style="dark" />
      <Header
        title="Edit Product"
        right={
          <Pressable onPress={handleDelete} disabled={deleteProduct.isPending} hitSlop={8}>
            <Text className="text-sm font-medium text-red-500 dark:text-red-400">
              {deleteProduct.isPending ? 'Deleting…' : 'Delete'}
            </Text>
          </Pressable>
        }
      />
      <ProductForm
        submitLabel="Save Changes"
        isSubmitting={updateProduct.isPending}
        onSubmit={handleSubmit}
        initialValues={{
          barcode: product.barcode ?? undefined,
          name: product.name,
          brand: product.brand,
          description: product.description,
          category: product.category,
          price: product.price,
          discountPrice: product.discountPrice,
          stock: product.stock,
          unit: product.unit,
          image: product.image,
        }}
      />
    </SafeAreaView>
  );
}
