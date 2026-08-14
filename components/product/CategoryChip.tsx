import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { ProductCategory } from '@/types';
import { categoryMeta } from '@/constants/theme';

interface CategoryChipProps {
  category: ProductCategory;
  selected?: boolean;
  onPress: () => void;
}

export function CategoryChip({ category, selected = false, onPress }: CategoryChipProps) {
  const meta = categoryMeta[category];

  return (
    <Pressable onPress={onPress} className="mr-4 items-center" style={{ width: 72 }}>
      <View
        className={`h-14 w-14 items-center justify-center rounded-2xl ${selected ? 'bg-primary-500' : ''}`}
        style={!selected ? { backgroundColor: meta.color } : undefined}
      >
        <Ionicons name={meta.icon} size={24} color={selected ? '#ffffff' : '#374151'} />
      </View>
      <Text
        numberOfLines={1}
        className={`mt-1.5 text-xs ${selected ? 'font-semibold text-primary-600' : 'text-gray-600'}`}
      >
        {meta.label}
      </Text>
    </Pressable>
  );
}
