import type { ReactNode } from 'react';
import { ActivityIndicator, Linking, Text, View } from 'react-native';
import { useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '@/components/ui/Button';

interface CameraPermissionGateProps {
  children: ReactNode;
  message?: string;
}

/**
 * Renders the camera permission request/denied UI until access is granted,
 * then renders children. Shared by every screen that needs the camera.
 */
export function CameraPermissionGate({ children, message }: CameraPermissionGateProps) {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <ActivityIndicator color="#ffffff" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white px-8">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-primary-50">
          <Ionicons name="camera-outline" size={36} color="#1db567" />
        </View>
        <Text className="mt-5 text-center text-lg font-bold text-gray-900">Camera access needed</Text>
        <Text className="mt-2 text-center text-sm text-gray-500">
          {message ?? 'FreshCart needs camera access to scan barcodes.'}
        </Text>
        <View className="mt-6 w-full gap-3">
          {permission.canAskAgain ? (
            <Button label="Grant Camera Access" onPress={requestPermission} />
          ) : (
            <Button label="Open Settings" onPress={() => Linking.openSettings()} />
          )}
          <Button label="Not Now" variant="outline" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  return <>{children}</>;
}
