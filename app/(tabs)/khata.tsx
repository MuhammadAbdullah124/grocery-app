import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Input } from '@/components/ui/Input';
import { StatTile } from '@/components/accounting/StatTile';
import { ProfileShortcut } from '@/components/layout/ProfileShortcut';
import { ContactRow } from '@/components/khata/ContactRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useContacts, useContactsSummary } from '@/hooks/useContacts';
import { formatPrice } from '@/utils/format';
import type { ContactType } from '@/types';

type TypeFilter = ContactType | 'all';

const TYPE_OPTIONS: { id: TypeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'customer', label: 'Customers' },
  { id: 'supplier', label: 'Suppliers' },
  { id: 'other', label: 'Other' },
];

export default function KhataScreen() {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [query, setQuery] = useState('');

  const summaryQuery = useContactsSummary();
  const contactsQuery = useContacts(
    useMemo(() => ({ type: typeFilter === 'all' ? undefined : typeFilter, q: query || undefined }), [typeFilter, query]),
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
      <StatusBar style="dark" />
      <View className="flex-row items-center justify-between px-5 pb-2 pt-3">
        <View>
          <Text className="text-2xl font-bold text-gray-900 dark:text-gray-50">Khata</Text>
          <Text className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Who owes you, who you owe.</Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => router.push('/contacts/new')}
            className="h-10 w-10 items-center justify-center rounded-full bg-primary-500"
            accessibilityRole="button"
            accessibilityLabel="Add contact"
          >
            <Ionicons name="add" size={22} color="#ffffff" />
          </Pressable>
          <ProfileShortcut />
        </View>
      </View>

      {summaryQuery.isError || contactsQuery.isError ? (
        <ErrorState
          description="We couldn't load your Khata."
          onAction={() => {
            summaryQuery.refetch();
            contactsQuery.refetch();
          }}
        />
      ) : (
        <FlatList
          data={contactsQuery.data ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ContactRow contact={item} />}
          contentContainerStyle={{ padding: 20, paddingTop: 4, gap: 10 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshing={contactsQuery.isRefetching}
          onRefresh={() => {
            summaryQuery.refetch();
            contactsQuery.refetch();
          }}
          ListHeaderComponent={
            <View className="mb-5 gap-4">
              {summaryQuery.isLoading ? (
                <View className="flex-row gap-3">
                  <Skeleton height={78} radius={16} className="flex-1" />
                  <Skeleton height={78} radius={16} className="flex-1" />
                </View>
              ) : summaryQuery.data ? (
                <View className="flex-row gap-3">
                  <StatTile
                    label="To Receive"
                    value={formatPrice(summaryQuery.data.totalReceivable)}
                    caption="Owed to you"
                  />
                  <StatTile
                    label="To Pay"
                    value={formatPrice(summaryQuery.data.totalPayable)}
                    caption="You owe"
                  />
                </View>
              ) : null}

              <Input
                placeholder="Search contacts..."
                leftIcon="search"
                value={query}
                onChangeText={setQuery}
                autoCapitalize="none"
              />

              <View className="flex-row gap-2">
                {TYPE_OPTIONS.map((option) => {
                  const selected = typeFilter === option.id;
                  return (
                    <Pressable
                      key={option.id}
                      onPress={() => setTypeFilter(option.id)}
                      className={`rounded-full border px-3.5 py-1.5 ${
                        selected
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                          : 'border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      <Text
                        className={`text-xs ${
                          selected
                            ? 'font-semibold text-primary-700 dark:text-primary-300'
                            : 'text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          }
          ListEmptyComponent={
            contactsQuery.isLoading ? (
              <View className="gap-2.5">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} height={76} radius={16} />
                ))}
              </View>
            ) : query || typeFilter !== 'all' ? (
              <EmptyState icon="search-outline" title="No matches" description="Try a different search or filter." />
            ) : (
              <EmptyState
                icon="book-outline"
                title="No contacts yet"
                description="Add a customer or supplier to start tracking credit."
                actionLabel="Add Contact"
                onAction={() => router.push('/contacts/new')}
              />
            )
          }
        />
      )}
    </SafeAreaView>
  );
}
