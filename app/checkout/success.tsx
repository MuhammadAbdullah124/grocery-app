import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useOrder } from '@/hooks/useOrders';
import { formatPrice } from '@/utils/format';

export default function CheckoutSuccessScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const orderQuery = useOrder(orderId);

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="flex-1 items-center justify-center px-8">
        <View className="h-24 w-24 items-center justify-center rounded-full bg-primary-50">
          <Ionicons name="checkmark-circle" size={56} color="#1db567" />
        </View>
        <Text className="mt-6 text-2xl font-bold text-gray-900">Sale completed!</Text>
        <Text className="mt-2 text-center text-sm text-gray-500">
          Give the customer their digital receipt.
        </Text>

        {orderQuery.isLoading ? (
          <Skeleton width={240} height={72} radius={16} className="mt-6" />
        ) : orderQuery.data ? (
          <View className="mt-6 w-full rounded-2xl border border-gray-100 p-4">
            <View className="flex-row justify-between">
              <Text className="text-sm text-gray-500">Order Number</Text>
              <Text className="text-sm font-semibold text-gray-900">{orderQuery.data.orderNumber}</Text>
            </View>
            <View className="mt-2 flex-row justify-between">
              <Text className="text-sm text-gray-500">Total Paid</Text>
              <Text className="text-sm font-semibold text-gray-900">{formatPrice(orderQuery.data.total)}</Text>
            </View>
          </View>
        ) : null}
      </View>

      <View className="gap-3 px-8 pb-4">
        <Button label="Done" size="lg" onPress={() => router.replace('/(tabs)')} />
        <Button
          label="View Receipt"
          variant="outline"
          size="lg"
          onPress={() => router.replace(`/receipt/${orderId}`)}
        />
      </View>
    </SafeAreaView>
  );
}
