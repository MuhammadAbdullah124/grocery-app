import '../global.css';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000,
    },
  },
});

export default function RootLayout() {
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const restoreSession = useAuthStore((state) => state.restoreSession);
  const darkModeEnabled = useSettingsStore((state) => state.darkModeEnabled);
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    setColorScheme(darkModeEnabled ? 'dark' : 'light');
  }, [darkModeEnabled, setColorScheme]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          {!hasHydrated ? (
            <View className="flex-1 items-center justify-center bg-white">
              <ActivityIndicator color="#1db567" size="large" />
            </View>
          ) : (
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Protected guard={!isAuthenticated}>
                <Stack.Screen name="(auth)" />
              </Stack.Protected>

              <Stack.Protected guard={isAuthenticated}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                  name="scan"
                  options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
                />
                <Stack.Screen name="product/[id]" />
                <Stack.Screen name="cart/index" options={{ presentation: 'modal' }} />
                <Stack.Screen name="checkout" />
                <Stack.Screen name="receipt/[id]" />
                <Stack.Screen name="legal/[slug]" />
              </Stack.Protected>
            </Stack>
          )}
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
