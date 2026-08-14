import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: ReactNode;
}

export function Header({ title, subtitle, showBack = true, onBack, right }: HeaderProps) {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between px-5 py-3">
      <View className="flex-row items-center flex-1">
        {showBack ? (
          <Pressable
            onPress={onBack ?? (() => router.back())}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100"
          >
            <Ionicons name="chevron-back" size={22} color="#111827" />
          </Pressable>
        ) : null}
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-xs text-gray-500" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {right ? <View className="ml-3">{right}</View> : null}
    </View>
  );
}
