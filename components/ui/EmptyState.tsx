import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export function EmptyState({ icon = 'basket-outline', title, description, actionLabel, onAction, children }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <View className="mb-4 h-20 w-20 items-center justify-center rounded-full bg-primary-50">
        <Ionicons name={icon} size={36} color="#1db567" />
      </View>
      <Text className="text-center text-lg font-semibold text-gray-900">{title}</Text>
      {description ? (
        <Text className="mt-1.5 text-center text-sm text-gray-500">{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <View className="mt-6 w-full max-w-xs">
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
      {children}
    </View>
  );
}
