import { useEffect, useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { KeyboardAwareFlatList } from 'react-native-keyboard-aware-scroll-view';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useContacts, useCreateContact } from '@/hooks/useContacts';
import { useContactPickerStore } from '@/store/contactPickerStore';
import { ApiRequestError } from '@/types';
import type { Contact, ContactType } from '@/types';

const typeBadgeVariant: Record<ContactType, 'primary' | 'neutral'> = {
  customer: 'primary',
  supplier: 'neutral',
  other: 'neutral',
};

/**
 * Shared contact picker, pushed from checkout (paying by credit) and from
 * new-purchase (choosing a supplier). Unfiltered by type on purpose — a
 * flexible ledger shouldn't force a sale to only be recorded against
 * "customer"-typed contacts or a purchase against "supplier"-typed ones.
 */
export default function ContactPickerScreen() {
  const { defaultType } = useLocalSearchParams<{ defaultType?: ContactType }>();
  const router = useRouter();
  const setSelectedContact = useContactPickerStore((state) => state.setSelectedContact);

  const [inputValue, setInputValue] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');

  useEffect(() => {
    const handle = setTimeout(() => setDebouncedQuery(inputValue.trim()), 300);
    return () => clearTimeout(handle);
  }, [inputValue]);

  const contactsQuery = useContacts(debouncedQuery ? { q: debouncedQuery } : undefined);
  const createContact = useCreateContact();

  const handleSelect = (contact: Contact) => {
    setSelectedContact(contact);
    router.back();
  };

  const handleAddNew = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    try {
      const contact = await createContact.mutateAsync({
        name: trimmed,
        phone: newPhone.trim() || undefined,
        type: defaultType ?? 'customer',
      });
      handleSelect(contact);
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : 'Please try again.';
      Alert.alert('Could not add contact', message);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
      <StatusBar style="dark" />
      <Header title="Select Contact" showProfileShortcut={false} />

      <View className="px-5 pt-2">
        <Input placeholder="Search contacts..." leftIcon="search" value={inputValue} onChangeText={setInputValue} />
      </View>

      {contactsQuery.isError ? (
        <ErrorState description="We couldn't load contacts." onAction={() => contactsQuery.refetch()} />
      ) : (
        <KeyboardAwareFlatList
          data={contactsQuery.data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 20, gap: 10 }}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid
          extraScrollHeight={20}
          renderItem={({ item }: { item: Contact }) => (
            <Pressable
              onPress={() => handleSelect(item)}
              className="flex-row items-center rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3"
              style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
            >
              <Avatar name={item.name} size={40} />
              <View className="ml-3 flex-1">
                <Text className="text-sm font-semibold text-gray-900 dark:text-gray-50" numberOfLines={1}>
                  {item.name}
                </Text>
                {item.phone ? (
                  <Text className="mt-0.5 text-xs text-gray-400 dark:text-gray-500" numberOfLines={1}>
                    {item.phone}
                  </Text>
                ) : null}
              </View>
              <Badge label={item.type} variant={typeBadgeVariant[item.type]} />
            </Pressable>
          )}
          ListEmptyComponent={
            contactsQuery.isLoading ? (
              <View className="gap-2.5">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} height={64} radius={16} />
                ))}
              </View>
            ) : (
              <EmptyState icon="people-outline" title="No contacts found" description="Add a new one below." />
            )
          }
          ListFooterComponent={
            <View className="mt-2">
              {isAdding ? (
                <View className="gap-2 rounded-2xl border border-gray-100 dark:border-gray-800 p-3">
                  <Input placeholder="Name" value={newName} onChangeText={setNewName} autoFocus />
                  <Input placeholder="Phone (optional)" keyboardType="phone-pad" value={newPhone} onChangeText={setNewPhone} />
                  <View className="flex-row gap-2">
                    <Pressable
                      onPress={handleAddNew}
                      disabled={createContact.isPending}
                      className="h-11 flex-1 items-center justify-center rounded-2xl bg-primary-500"
                    >
                      <Text className="text-sm font-semibold text-white">
                        {createContact.isPending ? 'Adding…' : 'Add & Select'}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        setIsAdding(false);
                        setNewName('');
                        setNewPhone('');
                      }}
                      className="h-11 w-11 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800"
                    >
                      <Ionicons name="close" size={20} color="#6b7280" />
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Pressable
                  onPress={() => {
                    setIsAdding(true);
                    setNewName(inputValue);
                  }}
                  className="flex-row items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 py-3.5"
                >
                  <Ionicons name="add" size={18} color="#1db567" />
                  <Text className="ml-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400">
                    Add New Contact
                  </Text>
                </Pressable>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
