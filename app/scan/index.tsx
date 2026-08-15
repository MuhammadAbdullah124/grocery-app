import { useCallback, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CameraView, type BarcodeScanningResult } from 'expo-camera';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraPermissionGate } from '@/components/scanner/CameraPermissionGate';
import { ScannerOverlay } from '@/components/scanner/ScannerOverlay';
import { useCartStore } from '@/store/cartStore';

const BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'qr'] as const;

export default function ScanScreen() {
  const router = useRouter();
  const [torchOn, setTorchOn] = useState(false);
  const hasScannedRef = useRef(false);
  const cartCount = useCartStore((state) => state.getItemCount());

  useFocusEffect(
    useCallback(() => {
      hasScannedRef.current = false;
    }, []),
  );

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (hasScannedRef.current) return;
    hasScannedRef.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    router.push({ pathname: '/scan/result', params: { barcode: result.data } });
  };

  return (
    <CameraPermissionGate message="FreshCart needs camera access to scan product barcodes at checkout.">
      <View className="flex-1 bg-black">
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          enableTorch={torchOn}
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
        />
        <ScannerOverlay />

        <SafeAreaView className="absolute inset-x-0 top-0" edges={['top']}>
          <View className="flex-row items-center justify-between px-5 pt-2">
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-black/40"
              accessibilityRole="button"
              accessibilityLabel="Close scanner"
            >
              <Ionicons name="close" size={22} color="#ffffff" />
            </Pressable>
            <Text className="text-base font-semibold text-white">Scan Barcode</Text>
            <Pressable
              onPress={() => setTorchOn((prev) => !prev)}
              className="h-10 w-10 items-center justify-center rounded-full bg-black/40"
              accessibilityRole="button"
              accessibilityLabel="Toggle flashlight"
            >
              <Ionicons name={torchOn ? 'flash' : 'flash-off'} size={20} color="#ffffff" />
            </Pressable>
          </View>
        </SafeAreaView>

        <SafeAreaView className="absolute inset-x-0 bottom-0" edges={['bottom']}>
          <Pressable
            onPress={() => router.push('/cart')}
            className="mx-5 mb-4 flex-row items-center justify-center rounded-2xl bg-white/95 py-3.5"
            accessibilityRole="button"
            accessibilityLabel="View cart"
          >
            <Ionicons name="cart-outline" size={18} color="#111827" />
            <Text className="ml-2 text-sm font-semibold text-gray-900">
              Current Sale{cartCount > 0 ? ` (${cartCount})` : ''}
            </Text>
          </Pressable>
        </SafeAreaView>
      </View>
    </CameraPermissionGate>
  );
}
