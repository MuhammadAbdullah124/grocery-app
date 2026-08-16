import { Tabs } from 'expo-router';
import { TabBar } from '@/components/layout/TabBar';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...props} />}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
      <Tabs.Screen name="khata" options={{ title: 'Khata' }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders' }} />
      {/* No tab button — reached via the avatar in the Home header instead. */}
      <Tabs.Screen name="profile" options={{ title: 'Profile', href: null }} />
    </Tabs>
  );
}
