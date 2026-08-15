import { Stack } from 'expo-router';

export default function ScanLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="result" options={{ presentation: 'modal' }} />
      <Stack.Screen name="capture" options={{ presentation: 'fullScreenModal' }} />
    </Stack>
  );
}
