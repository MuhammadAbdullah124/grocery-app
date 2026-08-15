import { Text, View } from 'react-native';

interface StatTileProps {
  label: string;
  value: string;
  caption: string;
}

export function StatTile({ label, value, caption }: StatTileProps) {
  return (
    <View className="flex-1 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
      <Text className="text-xs font-medium text-gray-500 dark:text-gray-400" numberOfLines={1}>
        {label}
      </Text>
      <Text className="mt-1.5 text-lg font-bold text-gray-900 dark:text-gray-50" numberOfLines={1}>
        {value}
      </Text>
      <Text className="mt-0.5 text-xs text-gray-400 dark:text-gray-500" numberOfLines={1}>
        {caption}
      </Text>
    </View>
  );
}
