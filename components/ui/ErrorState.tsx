import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'Please try again in a moment.',
  actionLabel = 'Try Again',
  onAction,
}: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-900">
        <Ionicons name="alert-circle-outline" size={36} color="#dc2626" />
      </View>
      <Text className="text-center text-lg font-semibold text-gray-900 dark:text-gray-50">{title}</Text>
      <Text className="mt-1.5 text-center text-sm text-gray-500 dark:text-gray-400">{description}</Text>
      {onAction ? (
        <View className="mt-6 w-full max-w-xs">
          <Button label={actionLabel} variant="outline" onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}
