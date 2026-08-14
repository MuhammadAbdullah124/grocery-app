import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '@/components/layout/Screen';
import { Button } from '@/components/ui/Button';
import { APP_DESCRIPTION, APP_NAME } from '@/constants/config';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <Screen edges={['top', 'bottom', 'left', 'right']}>
      <View className="flex-1 items-center justify-between px-8 py-10">
        <View className="flex-1 items-center justify-center">
          <View className="h-24 w-24 items-center justify-center rounded-3xl bg-primary-500">
            <Ionicons name="basket" size={48} color="#ffffff" />
          </View>
          <Text className="mt-6 text-3xl font-bold text-gray-900">{APP_NAME}</Text>
          <Text className="mt-3 max-w-xs text-center text-base leading-6 text-gray-500">
            {APP_DESCRIPTION}
          </Text>
        </View>

        <View className="w-full gap-3">
          <View className="flex-row items-center justify-center gap-8 pb-4">
            <View className="items-center gap-2">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary-50">
                <Ionicons name="scan-outline" size={22} color="#129253" />
              </View>
              <Text className="text-xs text-gray-500">Scan</Text>
            </View>
            <View className="items-center gap-2">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary-50">
                <Ionicons name="cart-outline" size={22} color="#129253" />
              </View>
              <Text className="text-xs text-gray-500">Bag</Text>
            </View>
            <View className="items-center gap-2">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary-50">
                <Ionicons name="qr-code-outline" size={22} color="#129253" />
              </View>
              <Text className="text-xs text-gray-500">Go</Text>
            </View>
          </View>
          <Button label="Continue" size="lg" onPress={() => router.push('/(auth)/login')} />
        </View>
      </View>
    </Screen>
  );
}
