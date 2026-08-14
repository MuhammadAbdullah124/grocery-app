import { useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { SettingsRow } from '@/components/ui/SettingsRow';
import { StoreSwitcherModal } from '@/components/layout/StoreSwitcherModal';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useStores } from '@/hooks/useStores';
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
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const storeId = useSettingsStore((state) => state.storeId);
  const setStoreId = useSettingsStore((state) => state.setStoreId);

  const { data: stores } = useStores();
  const selectedStore = stores?.find((s) => s.id === storeId);

  const [storeModalVisible, setStoreModalVisible] = useState(false);

  const handleToggleDarkMode = (value: boolean) => {
    setDarkModeEnabled(value);
    setColorScheme(value ? 'dark' : 'light');
  };

  const handleChangeLanguage = () => {
    Alert.alert('Language', 'Choose your preferred language', [
      { text: 'English', onPress: () => setLanguage('en') },
      { text: 'اردو (Urdu)', onPress: () => setLanguage('ur') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => logout() },
    ]);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white">
      <StatusBar style="dark" />
      <View className="flex-1 px-5 pt-3" style={{ gap: 24 }}>
        <Text className="text-2xl font-bold text-gray-900">Profile</Text>

        <View className="flex-row items-center rounded-2xl border border-gray-100 p-4">
          <Avatar name={user?.name ?? 'Guest'} uri={user?.avatar} size={56} />
          <View className="ml-4 flex-1">
            <Text className="text-base font-bold text-gray-900" numberOfLines={1}>
              {user?.name ?? 'Guest'}
            </Text>
            <Text className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
              {user?.email}
            </Text>
            <Text className="mt-0.5 text-xs text-gray-500" numberOfLines={1}>
              {user?.phone}
            </Text>
          </View>
        </View>

        <View>
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
            Preferences
          </Text>
          <View className="rounded-2xl border border-gray-100">
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
            <Divider />
            <SettingsRow
              icon="language-outline"
              label="Language"
              value={language === 'en' ? 'English' : 'اردو'}
              onPress={handleChangeLanguage}
            />
            <Divider />
            <SettingsRow
              icon="storefront-outline"
              label="Store"
              value={selectedStore?.name}
              onPress={() => setStoreModalVisible(true)}
            />
          </View>
        </View>

        <View>
          <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Support</Text>
          <View className="rounded-2xl border border-gray-100">
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

        <View className="mt-auto pb-4">
          <Button label="Log Out" variant="outline" onPress={handleLogout} />
          <Text className="mt-4 text-center text-xs text-gray-300">{APP_NAME} v1.0.0</Text>
        </View>
      </View>

      <StoreSwitcherModal
        visible={storeModalVisible}
        stores={stores ?? []}
        selectedStoreId={storeId}
        onSelect={setStoreId}
        onClose={() => setStoreModalVisible(false)}
      />
    </SafeAreaView>
  );
}
