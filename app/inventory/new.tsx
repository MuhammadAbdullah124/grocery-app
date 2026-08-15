import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Header } from '@/components/layout/Header';
import { ProductForm } from '@/components/product/ProductForm';
import { useCreateProduct } from '@/hooks/useProducts';
import { ApiRequestError } from '@/types';
import type { ProductInput } from '@/types';

export default function NewProductScreen() {
  const router = useRouter();
  const createProduct = useCreateProduct();

  const handleSubmit = async (input: ProductInput) => {
    try {
      await createProduct.mutateAsync(input);
      router.back();
    } catch (error) {
      const message =
        error instanceof ApiRequestError ? error.message : 'Something went wrong. Please try again.';
      Alert.alert('Could not add product', message);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
      <StatusBar style="dark" />
      <Header title="Add Product" />
      <ProductForm submitLabel="Add Product" isSubmitting={createProduct.isPending} onSubmit={handleSubmit} />
    </SafeAreaView>
  );
}
