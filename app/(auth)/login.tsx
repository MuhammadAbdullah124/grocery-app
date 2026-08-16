import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { useIconColor } from '@/hooks/useIconColor';

export default function LoginScreen() {
  const router = useRouter();
  const iconColor = useIconColor();
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const handleLogin = async () => {
    clearError();
    if (!identifier.trim() || !password.trim()) {
      setFieldError('Please enter your email/phone and password.');
      return;
    }
    setFieldError(null);
    await login({ identifier: identifier.trim(), password });
  };

  return (
    <Screen scroll contentContainerClassName="px-6 pb-10 pt-6">
      <Pressable
        onPress={() => router.back()}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        className="mb-4 h-10 w-10 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
      >
        <Ionicons name="chevron-back" size={22} color={iconColor} />
      </Pressable>
      <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50">Welcome back</Text>
      <Text className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">Log in to start ringing up sales.</Text>

      <View className="mt-8 gap-4">
        <Input
          label="Phone or Email"
          placeholder="you@example.com"
          leftIcon="mail-outline"
          keyboardType="email-address"
          value={identifier}
          onChangeText={setIdentifier}
        />
        <Input
          label="Password"
          placeholder="Enter your password"
          leftIcon="lock-closed-outline"
          isPassword
          value={password}
          onChangeText={setPassword}
        />
        {fieldError || error ? <Text className="text-sm text-red-500 dark:text-red-400">{fieldError ?? error}</Text> : null}

        <Pressable
          onPress={() => Alert.alert('Reset password', 'Password reset will be available once account services are connected.')}
          className="self-end"
        >
          <Text className="text-sm font-medium text-primary-600 dark:text-primary-400">Forgot password?</Text>
        </Pressable>
      </View>

      <View className="mt-6">
        <Button label="Log In" size="lg" loading={isLoading} onPress={handleLogin} />
      </View>

      <Text className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
        Need an account? Contact 0320-8633454 or 0332-8654126
      </Text>
    </Screen>
  );
}
