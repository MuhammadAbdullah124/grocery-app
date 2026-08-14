import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, Text, View } from 'react-native';
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScannerOverlay } from '@/components/scanner/ScannerOverlay';
import { Button } from '@/components/ui/Button';
import { useCartStore } from '@/store/cartStore';

const BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'qr'] as const;

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
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

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#ffffff" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-8">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-primary-50">
          <Ionicons name="camera-outline" size={36} color="#1db567" />
        </View>
        <Text className="mt-5 text-center text-lg font-bold text-gray-900">Camera access needed</Text>
        <Text className="mt-2 text-center text-sm text-gray-500">
          FreshCart needs camera access to scan product barcodes at checkout.
        </Text>
        <View className="mt-6 w-full gap-3">
          {permission.canAskAgain ? (
            <Button label="Grant Camera Access" onPress={requestPermission} />
          ) : (
            <Button label="Open Settings" onPress={() => Linking.openSettings()} />
          )}
          <Button label="Not Now" variant="outline" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return (
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
  );
}
