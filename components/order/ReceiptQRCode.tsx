import { View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

interface ReceiptQRCodeProps {
  value: string;
  size?: number;
}

export function ReceiptQRCode({ value, size = 220 }: ReceiptQRCodeProps) {
  return (
    <View className="items-center justify-center rounded-3xl border border-gray-100 bg-white p-6">
      <QRCode value={value} size={size} color="#111827" backgroundColor="#ffffff" />
    </View>
  );
}
