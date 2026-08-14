import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/layout/Screen';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';

export default function RegisterScreen() {
  const router = useRouter();
  const register = useAuthStore((state) => state.register);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const handleRegister = async () => {
    clearError();
    if (!name.trim() || !phone.trim() || !email.trim() || !password.trim()) {
      setFieldError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setFieldError('Passwords do not match.');
      return;
    }
    setFieldError(null);
    await register({ name: name.trim(), phone: phone.trim(), email: email.trim(), password });
  };

  return (
    <Screen scroll contentContainerClassName="pb-10">
      <Header title="Create Account" />
      <View className="px-6 pt-2">
        <Text className="text-sm text-gray-500">Sign up to start scanning and skip the line.</Text>

        <View className="mt-6 gap-4">
          <Input label="Full Name" placeholder="Ahmed Raza" leftIcon="person-outline" value={name} onChangeText={setName} />
          <Input
            label="Phone Number"
            placeholder="+92 300 1234567"
            leftIcon="call-outline"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
          <Input
            label="Email"
            placeholder="you@example.com"
            leftIcon="mail-outline"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Password"
            placeholder="Create a password"
            leftIcon="lock-closed-outline"
            isPassword
            value={password}
            onChangeText={setPassword}
          />
          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            leftIcon="lock-closed-outline"
            isPassword
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          {fieldError || error ? <Text className="text-sm text-red-500">{fieldError ?? error}</Text> : null}
        </View>

        <View className="mt-6">
          <Button label="Create Account" size="lg" loading={isLoading} onPress={handleRegister} />
        </View>

        <View className="mt-8 flex-row items-center justify-center">
          <Text className="text-sm text-gray-500">Already have an account? </Text>
          <Pressable onPress={() => router.push('/(auth)/login')}>
            <Text className="text-sm font-semibold text-primary-600">Log in</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
