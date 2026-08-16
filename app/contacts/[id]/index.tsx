import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Header } from '@/components/layout/Header';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { LedgerTransactionRow } from '@/components/khata/LedgerTransactionRow';
import { useContact } from '@/hooks/useContacts';
import { useDeleteLedgerTransaction, useLedgerTransactions } from '@/hooks/useLedgerTransactions';
import { ApiRequestError } from '@/types';
import type { LedgerTransaction } from '@/types';
import { formatPrice } from '@/utils/format';

export default function ContactDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const contactQuery = useContact(id);
  const transactionsQuery = useLedgerTransactions(id);
  const deleteTransaction = useDeleteLedgerTransaction(id ?? '');

  const handleTransactionPress = (transaction: LedgerTransaction) => {
    if (transaction.orderId !== null || transaction.purchaseId !== null) {
      Alert.alert('Auto-generated entry', 'This entry was created automatically from a sale or purchase and can\'t be edited or deleted here.');
      return;
    }
    Alert.alert('Entry options', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete Entry',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTransaction.mutateAsync(transaction.id);
          } catch (error) {
            const message = error instanceof ApiRequestError ? error.message : 'Please try again.';
            Alert.alert('Could not delete entry', message);
          }
        },
      },
    ]);
  };

  if (contactQuery.isLoading) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
        <StatusBar style="dark" />
        <Header title="Contact" />
        <View className="px-5 pt-4 gap-3">
          <Skeleton height={140} radius={24} />
          <Skeleton height={260} radius={16} />
        </View>
      </SafeAreaView>
    );
  }

  if (contactQuery.isError || !contactQuery.data) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
        <StatusBar style="dark" />
        <Header title="Contact" />
        <ErrorState title="Contact not found" description="This contact may have been removed." />
      </SafeAreaView>
    );
  }

  const contact = contactQuery.data;
  const balanceColor =
    contact.balance > 0
      ? 'text-green-600 dark:text-green-400'
      : contact.balance < 0
        ? 'text-red-500 dark:text-red-400'
        : 'text-gray-400 dark:text-gray-500';
  const balanceCaption = contact.balance > 0 ? 'to receive' : contact.balance < 0 ? 'to pay' : 'settled up';

  return (
    <SafeAreaView edges={['top', 'bottom', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
      <StatusBar style="dark" />
      <Header
        title={contact.name}
        subtitle={contact.type.charAt(0).toUpperCase() + contact.type.slice(1)}
        right={
          <Pressable
            onPress={() => router.push(`/contacts/${contact.id}/edit`)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Edit contact"
          >
            <Ionicons name="pencil-outline" size={20} color="#1db567" />
          </Pressable>
        }
      />

      <FlatList
        data={transactionsQuery.data ?? []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <LedgerTransactionRow transaction={item} onPress={handleTransactionPress} />}
        contentContainerStyle={{ padding: 20, paddingTop: 4, gap: 10 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View className="mb-5 items-center rounded-3xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <Avatar name={contact.name} size={56} />
            {contact.phone ? (
              <Text className="mt-3 text-sm text-gray-500 dark:text-gray-400">{contact.phone}</Text>
            ) : null}
            <Text className={`mt-3 text-3xl font-bold ${balanceColor}`}>{formatPrice(Math.abs(contact.balance))}</Text>
            <Text className="mt-1 text-sm text-gray-400 dark:text-gray-500">{balanceCaption}</Text>
            {contact.notes ? (
              <Text className="mt-4 text-center text-xs text-gray-400 dark:text-gray-500">{contact.notes}</Text>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          transactionsQuery.isLoading ? (
            <View className="gap-2.5">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height={76} radius={16} />
              ))}
            </View>
          ) : (
            <EmptyState icon="receipt-outline" title="No entries yet" description="Record a transaction to get started." />
          )
        }
      />

      <View className="flex-row gap-3 border-t border-gray-100 dark:border-gray-800 px-5 pb-2 pt-4">
        <Button
          label="You Got"
          variant="outline"
          fullWidth={false}
          className="flex-1"
          onPress={() => router.push(`/contacts/${contact.id}/entry?entryType=you_got`)}
        />
        <Button
          label="You Gave"
          fullWidth={false}
          className="flex-1"
          onPress={() => router.push(`/contacts/${contact.id}/entry?entryType=you_gave`)}
        />
      </View>
    </SafeAreaView>
  );
}
