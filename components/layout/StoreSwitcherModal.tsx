import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Store } from '@/types';
import { useIconColor } from '@/hooks/useIconColor';

interface StoreSwitcherModalProps {
  visible: boolean;
  stores: Store[];
  selectedStoreId: string;
  onSelect: (storeId: string) => void;
  onClose: () => void;
}

export function StoreSwitcherModal({
  visible,
  stores,
  selectedStoreId,
  onSelect,
  onClose,
}: StoreSwitcherModalProps) {
  const iconColor = useIconColor();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} accessibilityLabel="Close" />
        <View className="rounded-t-3xl bg-white dark:bg-gray-900 px-5 pb-10 pt-5">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-lg font-bold text-gray-900 dark:text-gray-50">Select Store</Text>
            <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" accessibilityLabel="Close">
              <Ionicons name="close" size={22} color={iconColor} />
            </Pressable>
          </View>
          <FlatList
            data={stores}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View className="h-2" />}
            renderItem={({ item }) => {
              const selected = item.id === selectedStoreId;
              return (
                <Pressable
                  onPress={() => {
                    onSelect(item.id);
                    onClose();
                  }}
                  className={`flex-row items-center justify-between rounded-2xl border p-4 ${
                    selected ? 'border-primary-500 bg-primary-50 dark:bg-primary-900' : 'border-gray-100 dark:border-gray-800'
                  }`}
                >
                  <View className="flex-1 pr-3">
                    <Text className="text-sm font-semibold text-gray-900 dark:text-gray-50">{item.name}</Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400">
                      {item.address}, {item.city}
                    </Text>
                  </View>
                  {selected ? <Ionicons name="checkmark-circle" size={22} color="#1db567" /> : null}
                </Pressable>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}
