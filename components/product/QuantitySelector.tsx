import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuantitySelectorProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md';
}

export function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max = 99,
  size = 'md',
}: QuantitySelectorProps) {
  const buttonSize = size === 'sm' ? 30 : 38;
  const isMin = quantity <= min;
  const isMax = quantity >= max;

  return (
    <View className="flex-row items-center rounded-full bg-gray-100">
      <Pressable
        onPress={onDecrease}
        disabled={isMin}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Decrease quantity"
        className={`items-center justify-center rounded-full ${isMin ? 'opacity-40' : ''}`}
        style={{ width: buttonSize, height: buttonSize }}
      >
        <Ionicons name="remove" size={size === 'sm' ? 16 : 18} color="#111827" />
      </Pressable>
      <Text className={`text-center font-semibold text-gray-900 ${size === 'sm' ? 'text-sm w-6' : 'text-base w-8'}`}>
        {quantity}
      </Text>
      <Pressable
        onPress={onIncrease}
        disabled={isMax}
        hitSlop={6}
        accessibilityRole="button"
        accessibilityLabel="Increase quantity"
        className={`items-center justify-center rounded-full ${isMax ? 'opacity-40' : ''}`}
        style={{ width: buttonSize, height: buttonSize }}
      >
        <Ionicons name="add" size={size === 'sm' ? 16 : 18} color="#111827" />
      </Pressable>
    </View>
  );
}
