import { useCallback, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import { CameraView, type BarcodeScanningResult } from 'expo-camera';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraPermissionGate } from '@/components/scanner/CameraPermissionGate';
import { ScannerOverlay } from '@/components/scanner/ScannerOverlay';
import { useScannedProductStore } from '@/store/scannedProductStore';
import { parseScannedCode } from '@/utils/scannedCodeParser';

const BARCODE_TYPES = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'qr'] as const;

/**
 * Standalone "scan and return" screen — unlike app/scan/index.tsx this does
 * not look up a product. It parses whatever the code contains (a QR may
 * encode more than just a barcode — see parseScannedCode) and hands the
 * recognized fields back to whichever screen pushed it (e.g. the Add/Edit
 * Product form) via useScannedProductStore, then goes back.
 */
export default function CaptureBarcodeScreen() {
  const router = useRouter();
  const hasScannedRef = useRef(false);
  const setScannedProduct = useScannedProductStore((state) => state.setScannedProduct);

  useFocusEffect(
    useCallback(() => {
      hasScannedRef.current = false;
    }, []),
  );

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (hasScannedRef.current) return;
    hasScannedRef.current = true;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setScannedProduct(parseScannedCode(result.data, result.type).fields);
    router.back();
  };

  return (
    <CameraPermissionGate message="FreshCart needs camera access to scan a product's barcode.">
      <View className="flex-1 bg-black">
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{ barcodeTypes: [...BARCODE_TYPES] }}
        />
        <ScannerOverlay message="Align the product's barcode within the frame" />

        <SafeAreaView className="absolute inset-x-0 top-0" edges={['top']}>
          <View className="flex-row items-center justify-between px-5 pt-2">
            <Pressable
              onPress={() => router.back()}
              className="h-10 w-10 items-center justify-center rounded-full bg-black/40"
              accessibilityRole="button"
              accessibilityLabel="Cancel"
            >
              <Ionicons name="close" size={22} color="#ffffff" />
            </Pressable>
            <Text className="text-base font-semibold text-white">Scan Barcode</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </View>
    </CameraPermissionGate>
  );
}
