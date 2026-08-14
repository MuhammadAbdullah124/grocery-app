import { Pressable, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  toggle?: { value: boolean; onValueChange: (value: boolean) => void };
}

export function SettingsRow({ icon, label, value, onPress, toggle }: SettingsRowProps) {
  const content = (
    <View className="flex-row items-center px-4 py-3.5">
      <View className="h-9 w-9 items-center justify-center rounded-full bg-gray-100">
        <Ionicons name={icon} size={18} color="#374151" />
      </View>
      <Text className="ml-3 flex-1 text-sm font-medium text-gray-900">{label}</Text>
      {toggle ? (
        <Switch
          value={toggle.value}
          onValueChange={toggle.onValueChange}
          trackColor={{ false: '#e5e7eb', true: '#1db567' }}
          thumbColor="#ffffff"
        />
      ) : (
        <View className="flex-row items-center">
          {value ? <Text className="mr-2 text-sm text-gray-400">{value}</Text> : null}
          {onPress ? <Ionicons name="chevron-forward" size={18} color="#9ca3af" /> : null}
        </View>
      )}
    </View>
  );

  if (toggle || !onPress) {
    return content;
  }

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
      {content}
    </Pressable>
  );
}
