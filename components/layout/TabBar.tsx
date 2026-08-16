import { useState } from 'react';
import { Pressable, Text, View, type LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'home',
  search: 'search',
  khata: 'book',
  orders: 'stats-chart',
};

const labels: Record<string, string> = {
  index: 'Home',
  search: 'Search',
  khata: 'Khata',
  orders: 'Accounting',
};

const FAB_GAP_WIDTH = 76;
const FAB_SIZE = 62;

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [barWidth, setBarWidth] = useState(0);

  // `profile` is registered with `href: null` so it stays navigable (the Home
  // header's avatar links to it) without getting a bottom-tab button. Expo
  // Router doesn't strip hidden routes out of `state.routes` for a *custom*
  // tabBar like this one, so it has to be filtered out here explicitly —
  // `labels` doubles as the allowlist of what actually gets a tab button.
  const visibleRoutes = state.routes.filter((route) => route.name in labels);

  // A naive even 2-and-2 split (the old `slice(0,2)`/`slice(2)`) only keeps
  // the floating scan button centered on the gap when routes split evenly.
  // With an odd tab count a 2-left/3-right style split is uneven, so the
  // FAB's position is computed from the two blocks' actual measured widths
  // instead of assumed to be screen-center — this stays correct regardless.
  const splitIndex = Math.floor(visibleRoutes.length / 2);
  const leftRoutes = visibleRoutes.slice(0, splitIndex);
  const rightRoutes = visibleRoutes.slice(splitIndex);
  const totalTabs = leftRoutes.length + rightRoutes.length;

  const tabsWidth = Math.max(barWidth - FAB_GAP_WIDTH, 0);
  const leftBlockWidth = totalTabs > 0 ? (leftRoutes.length / totalTabs) * tabsWidth : 0;
  const gapCenterX = leftBlockWidth + FAB_GAP_WIDTH / 2;

  const handleLayout = (event: LayoutChangeEvent) => {
    setBarWidth(event.nativeEvent.layout.width);
  };

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
    <View
      onLayout={handleLayout}
      style={{ paddingBottom: insets.bottom }}
      className="border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
    >
      <View className="flex-row items-center">
        {leftRoutes.map(renderTab)}
        <View style={{ width: FAB_GAP_WIDTH }} />
        {rightRoutes.map(renderTab)}
      </View>

      <Pressable
        onPress={() => router.push('/scan')}
        accessibilityRole="button"
        accessibilityLabel="Scan a product"
        className="absolute items-center justify-center rounded-full bg-primary-500"
        style={{
          width: FAB_SIZE,
          height: FAB_SIZE,
          top: -26,
          left: barWidth > 0 ? gapCenterX - FAB_SIZE / 2 : '50%',
          marginLeft: barWidth > 0 ? 0 : -(FAB_SIZE / 2),
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
