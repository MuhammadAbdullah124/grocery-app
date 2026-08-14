import { Image } from 'expo-image';
import { Text, View } from 'react-native';

interface AvatarProps {
  name: string;
  uri?: string | null;
  size?: number;
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/);
  const initials = parts.slice(0, 2).map((part) => part.charAt(0).toUpperCase());
  return initials.join('') || '?';
}

export function Avatar({ name, uri, size = 44 }: AvatarProps) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        contentFit="cover"
        accessibilityLabel={`${name} avatar`}
      />
    );
  }

  return (
    <View
      className="items-center justify-center bg-primary-100"
      style={{ width: size, height: size, borderRadius: size / 2 }}
    >
      <Text className="font-semibold text-primary-700" style={{ fontSize: size * 0.4 }}>
        {initialsFor(name)}
      </Text>
    </View>
  );
}
