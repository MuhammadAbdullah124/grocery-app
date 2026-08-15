import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'home',
  search: 'search',
  orders: 'stats-chart',
  profile: 'person',
};

const labels: Record<string, string> = {
  index: 'Home',
  search: 'Search',
  orders: 'Accounting',
  profile: 'Profile',
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const leftRoutes = state.routes.slice(0, 2);
  const rightRoutes = state.routes.slice(2);

  const renderTab = (route: (typeof state.routes)[number]) => {
    const routeIndex = state.routes.findIndex((r) => r.key === route.key);
    const isFocused = state.index === routeIndex;
    const label = labels[route.name] ?? route.name;
    const icon = icons[route.name] ?? 'ellipse';

    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <Pressable
        key={route.key}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={isFocused ? { selected: true } : {}}
        accessibilityLabel={label}
        className="flex-1 items-center justify-center py-2"
      >
        <Ionicons name={icon} size={22} color={isFocused ? '#1db567' : '#9ca3af'} />
        <Text className={`mt-1 text-xs ${isFocused ? 'font-semibold text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}>
          {label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={{ paddingBottom: insets.bottom }} className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
      <View className="flex-row items-center">
        {leftRoutes.map(renderTab)}
        <View style={{ width: 76 }} />
        {rightRoutes.map(renderTab)}
      </View>

      <Pressable
        onPress={() => router.push('/scan')}
        accessibilityRole="button"
        accessibilityLabel="Scan a product"
        className="absolute items-center justify-center rounded-full bg-primary-500"
        style={{
          width: 62,
          height: 62,
          top: -26,
          left: '50%',
          marginLeft: -31,
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        }}
      >
        <Ionicons name="scan" size={28} color="#ffffff" />
      </Pressable>
    </View>
  );
}
