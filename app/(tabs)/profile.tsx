import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Header } from '@/components/layout/Header';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { SettingsRow } from '@/components/ui/SettingsRow';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { APP_NAME } from '@/constants/config';

export default function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { setColorScheme } = useColorScheme();

  const notificationsEnabled = useSettingsStore((state) => state.notificationsEnabled);
  const setNotificationsEnabled = useSettingsStore((state) => state.setNotificationsEnabled);
  const darkModeEnabled = useSettingsStore((state) => state.darkModeEnabled);
  const setDarkModeEnabled = useSettingsStore((state) => state.setDarkModeEnabled);

  const handleToggleDarkMode = (value: boolean) => {
    setDarkModeEnabled(value);
    setColorScheme(value ? 'dark' : 'light');
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
      <StatusBar style="dark" />
      <Header title="Profile" showProfileShortcut={false} />
      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingTop: 4, paddingBottom: 32, gap: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => router.push('/profile/edit')}
          className="flex-row items-center rounded-2xl border border-gray-100 dark:border-gray-800 p-4"
          accessibilityRole="button"
          accessibilityLabel="Edit profile"
        >
          <Avatar name={user?.name ?? 'Guest'} uri={user?.avatar} size={56} />
          <View className="ml-4 flex-1">
            <Text className="text-base font-bold text-gray-900 dark:text-gray-50" numberOfLines={1}>
              {user?.name ?? 'Guest'}
            </Text>
            {user?.shopName ? (
              <Text className="mt-0.5 text-xs font-medium text-primary-600 dark:text-primary-400" numberOfLines={1}>
                {user.shopName}
              </Text>
            ) : null}
            <Text className="mt-0.5 text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
              {user?.username ? `@${user.username}` : user?.email}
            </Text>
            <Text className="mt-0.5 text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
              {user?.phone}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
        </Pressable>

        <View>
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Store Management
          </Text>
          <View className="rounded-2xl border border-gray-100 dark:border-gray-800">
            <SettingsRow
              icon="cube-outline"
              label="Inventory"
              onPress={() => router.push('/inventory')}
            />
            <Divider />
            <SettingsRow
              icon="cart-outline"
              label="Purchases"
              onPress={() => router.push('/purchases')}
            />
          </View>
        </View>

        <View>
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Preferences
          </Text>
          <View className="rounded-2xl border border-gray-100 dark:border-gray-800">
            <SettingsRow
              icon="notifications-outline"
              label="Notifications"
              toggle={{ value: notificationsEnabled, onValueChange: setNotificationsEnabled }}
            />
            <Divider />
            <SettingsRow
              icon="moon-outline"
              label="Dark Mode"
              toggle={{ value: darkModeEnabled, onValueChange: handleToggleDarkMode }}
            />
          </View>
        </View>

        <View>
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Support</Text>
          <View className="rounded-2xl border border-gray-100 dark:border-gray-800">
            <SettingsRow icon="help-circle-outline" label="Help" onPress={() => router.push('/legal/help')} />
            <Divider />
            <SettingsRow
              icon="document-text-outline"
              label="Terms of Service"
              onPress={() => router.push('/legal/terms')}
            />
            <Divider />
            <SettingsRow
              icon="shield-checkmark-outline"
              label="Privacy Policy"
              onPress={() => router.push('/legal/privacy')}
            />
          </View>
        </View>

        <View>
          <Button label="Log Out" variant="outline" onPress={handleLogout} />
          <Text className="mt-4 text-center text-xs text-gray-300 dark:text-gray-600">{APP_NAME} v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
