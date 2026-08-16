import { useState } from 'react';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';

export default function EditProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const isLoading = useAuthStore((state) => state.isLoading);
  const authError = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [username, setUsername] = useState(user?.username ?? '');
  const [shopName, setShopName] = useState(user?.shopName ?? '');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const handleSubmit = async () => {
    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3) {
      setFieldError('Username must be at least 3 characters.');
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
      setFieldError('Username can only contain letters, numbers, and underscores.');
      return;
    }

    setFieldError(null);
    clearError();
    const ok = await updateProfile({
      username: trimmedUsername,
      shopName: shopName.trim() || null,
    });
    if (ok) {
      router.back();
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
      <StatusBar style="dark" />
      <Header title="Edit Profile" showProfileShortcut={false} />
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerClassName="px-5"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={20}
      >
        <View className="gap-4 pb-10 pt-4">
          <Input
            label="Username"
            placeholder="e.g. ahmed_raza"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
          />
          <Input
            label="Store Name (optional)"
            placeholder="e.g. Ahmed General Store"
            value={shopName}
            onChangeText={setShopName}
          />

          {fieldError || authError ? (
            <Text className="text-sm text-red-500 dark:text-red-400">{fieldError ?? authError}</Text>
          ) : null}

          <Button label="Save Changes" size="lg" loading={isLoading} onPress={handleSubmit} />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
