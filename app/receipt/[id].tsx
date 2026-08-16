import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Print from 'expo-print';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { Receipt } from '@/components/order/Receipt';
import { useOrder } from '@/hooks/useOrders';
import { buildInvoiceHtml } from '@/utils/invoiceTemplate';

export default function ReceiptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const orderQuery = useOrder(id);
  const [isPrinting, setIsPrinting] = useState(false);

  if (orderQuery.isLoading) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
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
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
        <StatusBar style="dark" />
        <Header title="Receipt" />
        <ErrorState title="Receipt not found" description="We couldn't find this sale." />
      </SafeAreaView>
    );
  }

  const order = orderQuery.data;

  const handlePrint = async () => {
    setIsPrinting(true);
    try {
      await Print.printAsync({ html: buildInvoiceHtml(order) });
    } catch {
      // Most rejections here are just the user closing the print sheet without
      // printing — not worth surfacing as an error.
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
      <StatusBar style="dark" />
      <Header title={order.orderNumber} subtitle="Digital Receipt" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="items-center rounded-3xl bg-primary-50 dark:bg-primary-900 p-5">
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={20} color="#129253" />
            <Text className="ml-2 text-sm font-bold text-primary-700 dark:text-primary-300">Sale completed</Text>
          </View>
          <Text className="mt-1 text-center text-xs text-gray-500 dark:text-gray-400">
            Show or send this receipt to the customer.
          </Text>
        </View>

        <View className="mt-6">
          <Receipt order={order} />
        </View>
      </ScrollView>

      <View className="gap-3 border-t border-gray-100 dark:border-gray-800 px-5 pb-2 pt-4">
        <Button
          label="Print Invoice"
          variant="outline"
          size="lg"
          leftIcon="print-outline"
          loading={isPrinting}
          onPress={handlePrint}
        />
        <Button label="Done" size="lg" onPress={() => router.dismissTo('/(tabs)')} />
      </View>
    </SafeAreaView>
  );
}
