import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { ReceiptQRCode } from '@/components/order/ReceiptQRCode';
import { Receipt } from '@/components/order/Receipt';
import { useOrder } from '@/hooks/useOrders';

export default function ReceiptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const orderQuery = useOrder(id);

  if (orderQuery.isLoading) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
        <StatusBar style="dark" />
        <Header title="Receipt" />
        <View className="px-5 pt-4">
          <Skeleton height={260} radius={24} />
          <Skeleton height={200} radius={24} className="mt-4" />
        </View>
      </SafeAreaView>
    );
  }

  if (orderQuery.isError || !orderQuery.data) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
        <StatusBar style="dark" />
        <Header title="Receipt" />
        <ErrorState title="Receipt not found" description="We couldn't find this sale." />
      </SafeAreaView>
    );
  }

  const order = orderQuery.data;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      <StatusBar style="dark" />
      <Header title={order.orderNumber} subtitle="Digital Receipt" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="items-center rounded-3xl bg-primary-50 p-5">
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={20} color="#129253" />
            <Text className="ml-2 text-sm font-bold text-primary-700">Sale completed</Text>
          </View>
          <Text className="mt-1 text-center text-xs text-gray-500">
            Show or send this receipt to the customer.
          </Text>
        </View>

        <View className="mt-5 items-center">
          <ReceiptQRCode value={order.orderNumber} />
          <Text className="mt-3 text-sm font-medium text-gray-500">{order.orderNumber}</Text>
        </View>

        <View className="mt-6">
          <Receipt order={order} />
        </View>
      </ScrollView>

      <View className="border-t border-gray-100 px-5 pb-2 pt-4">
        <Button label="Done" size="lg" onPress={() => router.dismissTo('/(tabs)')} />
      </View>
    </SafeAreaView>
  );
}
