import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useIconColor } from '@/hooks/useIconColor';

interface ProfileShortcutProps {
  size?: number;
}

/**
 * One-tap link to /(tabs)/profile, shown on browsing/detail screens so
 * profile is reachable from anywhere. Deliberately left off focused-task
 * screens (checkout, scan, add/edit forms, pickers) so there's no easy way
 * to navigate away mid-task.
 */
export function ProfileShortcut({ size = 40 }: ProfileShortcutProps) {
  const router = useRouter();
  const iconColor = useIconColor();

  return (
    <Pressable
      onPress={() => router.push('/(tabs)/profile')}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Open profile"
      className="items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
      style={{ width: size, height: size }}
    >
      <Ionicons name="person-circle-outline" size={Math.round(size * 0.55)} color={iconColor} />
    </Pressable>
  );
}
