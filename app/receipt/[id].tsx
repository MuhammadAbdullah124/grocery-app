import { useEffect, useRef } from 'react';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
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
import { useOrder, useVerifyOrderExit } from '@/hooks/useOrders';
import type { OrderStatus } from '@/types';

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; description: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  pending: {
    label: 'Waiting for verification',
    description: 'Show this QR code to the store employee at the exit.',
    color: '#d97706',
    bg: '#fef3c7',
    icon: 'time-outline',
  },
  verified: {
    label: 'Verified',
    description: 'Your exit has been verified. Thanks for shopping with us!',
    color: '#16a34a',
    bg: '#dcfce7',
    icon: 'checkmark-circle',
  },
  rejected: {
    label: 'Verification failed',
    description: 'Please see a store employee for assistance.',
    color: '#dc2626',
    bg: '#fee2e2',
    icon: 'close-circle',
  },
  completed: {
    label: 'Completed',
    description: 'This order has been completed.',
    color: '#129253',
    bg: '#d6f9e1',
    icon: 'checkmark-done-circle',
  },
};

export default function ReceiptScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const orderQuery = useOrder(id);
  const verifyExit = useVerifyOrderExit();
  const hasTriggeredVerification = useRef(false);

  useEffect(() => {
    const order = orderQuery.data;
    if (order && order.status === 'pending' && !hasTriggeredVerification.current) {
      hasTriggeredVerification.current = true;
      const timer = setTimeout(() => {
        verifyExit.mutate(order.id);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [orderQuery.data, verifyExit]);

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
        <ErrorState title="Receipt not found" description="We couldn't find this order." />
      </SafeAreaView>
    );
  }

  const order = orderQuery.data;
  const status = STATUS_CONFIG[order.status];
  const isVerifying = verifyExit.isPending;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      <StatusBar style="dark" />
      <Header title={order.orderNumber} subtitle="Digital Receipt" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="items-center rounded-3xl p-5" style={{ backgroundColor: status.bg }}>
          <View className="flex-row items-center">
            {isVerifying ? (
              <ActivityIndicator color={status.color} />
            ) : (
              <Ionicons name={status.icon} size={20} color={status.color} />
            )}
            <Text className="ml-2 text-sm font-bold" style={{ color: status.color }}>
              {status.label}
            </Text>
          </View>
          <Text className="mt-1 text-center text-xs text-gray-500">{status.description}</Text>
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
