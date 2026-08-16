import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { Contact } from '@/types';
import { formatPrice } from '@/utils/format';
import { Avatar } from '@/components/ui/Avatar';
import { useIconColor } from '@/hooks/useIconColor';

interface ContactRowProps {
  contact: Contact;
}

function ContactRowBase({ contact }: ContactRowProps) {
  const router = useRouter();
  const iconColor = useIconColor();
  const balanceColor =
    contact.balance > 0
      ? 'text-green-600 dark:text-green-400'
      : contact.balance < 0
        ? 'text-red-500 dark:text-red-400'
        : 'text-gray-400 dark:text-gray-500';
  const balanceCaption = contact.balance > 0 ? 'to receive' : contact.balance < 0 ? 'to pay' : 'settled';

  return (
    <Pressable
      onPress={() => router.push(`/contacts/${contact.id}`)}
      className="flex-row items-center rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3"
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
    >
      <Avatar name={contact.name} size={44} />
      <View className="ml-3 flex-1">
        <Text className="text-sm font-bold text-gray-900 dark:text-gray-50" numberOfLines={1}>
          {contact.name}
        </Text>
        <Text className="mt-0.5 text-xs text-gray-400 dark:text-gray-500" numberOfLines={1}>
          {contact.phone ?? contact.type}
        </Text>
      </View>
      <View className="items-end">
        <Text className={`text-sm font-bold ${balanceColor}`}>{formatPrice(Math.abs(contact.balance))}</Text>
        <Text className="mt-0.5 text-xs text-gray-400 dark:text-gray-500">{balanceCaption}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={iconColor} style={{ marginLeft: 8 }} />
    </Pressable>
  );
}

export const ContactRow = memo(ContactRowBase);
