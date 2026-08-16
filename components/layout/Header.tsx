import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useIconColor } from '@/hooks/useIconColor';
import { ProfileShortcut } from './ProfileShortcut';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  right?: ReactNode;
  /** Off by default only on focused-task screens (checkout, forms, pickers) — see ProfileShortcut. */
  showProfileShortcut?: boolean;
}

export function Header({
  title,
  subtitle,
  showBack = true,
  onBack,
  right,
  showProfileShortcut = true,
}: HeaderProps) {
  const router = useRouter();
  const iconColor = useIconColor();

  return (
    <View className="flex-row items-center justify-between px-5 py-3">
      <View className="flex-row items-center flex-1">
        {showBack ? (
          <Pressable
            onPress={onBack ?? (() => router.back())}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
          >
            <Ionicons name="chevron-back" size={22} color={iconColor} />
          </Pressable>
        ) : null}
        <View className="flex-1">
          <Text className="text-lg font-bold text-gray-900 dark:text-gray-50" numberOfLines={1}>
            {title}
          </Text>
          {subtitle ? (
            <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>
      {right || showProfileShortcut ? (
        <View className="ml-3 flex-row items-center gap-2">
          {right}
          {showProfileShortcut ? <ProfileShortcut /> : null}
        </View>
      ) : null}
    </View>
  );
}
