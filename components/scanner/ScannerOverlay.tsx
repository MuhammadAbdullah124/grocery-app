import { Text, View, useWindowDimensions } from 'react-native';
import { ScannerFrame } from './ScannerFrame';

interface ScannerOverlayProps {
  active?: boolean;
  message?: string;
  frameSize?: number;
}

export function ScannerOverlay({
  active = true,
  message = 'Align the barcode within the frame',
  frameSize = 260,
}: ScannerOverlayProps) {
  const { height } = useWindowDimensions();
  const verticalPadding = Math.max((height - frameSize) / 2 - 70, 40);

  return (
    <View className="absolute inset-0" pointerEvents="none">
      <View style={{ height: verticalPadding }} className="bg-black/55" />
      <View style={{ height: frameSize, flexDirection: 'row' }}>
        <View className="flex-1 bg-black/55" />
        <ScannerFrame size={frameSize} active={active} />
        <View className="flex-1 bg-black/55" />
      </View>
      <View className="flex-1 items-center bg-black/55 px-10 pt-8">
        <Text className="text-center text-base font-medium text-white">{message}</Text>
      </View>
    </View>
  );
}
