import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Header } from '@/components/layout/Header';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useContact } from '@/hooks/useContacts';
import { useCreateLedgerTransaction } from '@/hooks/useLedgerTransactions';
import { ApiRequestError } from '@/types';
import type { LedgerCategory, LedgerEntryType } from '@/types';

const CATEGORY_OPTIONS: { id: LedgerCategory; label: string }[] = [
  { id: 'sale', label: 'Sale' },
  { id: 'purchase', label: 'Purchase' },
  { id: 'payment', label: 'Payment' },
  { id: 'other', label: 'Other' },
];

/** Same you_gave/you_got math either way — only the copy shown differs by contact type. */
function entryCopy(entryType: LedgerEntryType, contactType: string | undefined): { title: string; hint: string } {
  const isSupplier = contactType === 'supplier';
  if (entryType === 'you_gave') {
    return isSupplier
      ? { title: 'You Gave', hint: 'Money you paid them — reduces what you owe.' }
      : { title: 'You Gave', hint: 'Sold on credit — increases what they owe you.' };
  }
  return isSupplier
    ? { title: 'You Got', hint: 'Bought on credit — increases what you owe them.' }
    : { title: 'You Got', hint: 'Payment received — reduces what they owe you.' };
}

export default function LedgerEntryScreen() {
  const { id, entryType: initialEntryType } = useLocalSearchParams<{ id: string; entryType?: LedgerEntryType }>();
  const router = useRouter();
  const contactQuery = useContact(id);
  const createEntry = useCreateLedgerTransaction();

  const [entryType, setEntryType] = useState<LedgerEntryType>(initialEntryType === 'you_got' ? 'you_got' : 'you_gave');
  const [amountInput, setAmountInput] = useState('');
  const [category, setCategory] = useState<LedgerCategory>('other');
  const [note, setNote] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);

  const copy = entryCopy(entryType, contactQuery.data?.type);

  const handleSubmit = async () => {
    if (!id) return;
    const amount = Number(amountInput);
    if (!amountInput.trim() || !Number.isFinite(amount) || amount <= 0) {
      setFieldError('Enter a valid amount.');
      return;
    }
    setFieldError(null);

    try {
      await createEntry.mutateAsync({
        contactId: id,
        entryType,
        amount,
        category,
        note: note.trim() || undefined,
      });
      router.back();
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : 'Something went wrong. Please try again.';
      Alert.alert('Could not save entry', message);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
      <StatusBar style="dark" />
      <Header title="New Entry" subtitle={contactQuery.data?.name} showProfileShortcut={false} />
      <KeyboardAwareScrollView
        className="flex-1"
        contentContainerClassName="px-5"
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid
        extraScrollHeight={20}
      >
        <View className="gap-4 py-4 pb-10">
          <View className="flex-row gap-2">
            {(['you_gave', 'you_got'] as LedgerEntryType[]).map((option) => {
              const selected = entryType === option;
              const label = option === 'you_gave' ? 'You Gave' : 'You Got';
              return (
                <Pressable
                  key={option}
                  onPress={() => setEntryType(option)}
                  className={`flex-1 items-center rounded-2xl border py-3 ${
                    selected
                      ? option === 'you_gave'
                        ? 'border-green-500 bg-green-50 dark:bg-green-900'
                        : 'border-red-400 bg-red-50 dark:bg-red-900'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      selected
                        ? option === 'you_gave'
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-red-600 dark:text-red-400'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text className="-mt-2 text-xs text-gray-400 dark:text-gray-500">{copy.hint}</Text>

          <Input
            label="Amount (Rs.)"
            placeholder="0"
            keyboardType="numeric"
            value={amountInput}
            onChangeText={setAmountInput}
            autoFocus
          />

          <View>
            <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">Category</Text>
            <View className="flex-row flex-wrap gap-2">
              {CATEGORY_OPTIONS.map((option) => {
                const selected = category === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setCategory(option.id)}
                    className={`rounded-full border px-4 py-2 ${
                      selected ? 'border-primary-500 bg-primary-50 dark:bg-primary-900' : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        selected ? 'font-semibold text-primary-700 dark:text-primary-300' : 'text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View>
            <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">Note (optional)</Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="e.g. Advance for Eid stock"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-base text-gray-900 dark:text-gray-50"
              style={{ minHeight: 60 }}
            />
          </View>

          {fieldError ? <Text className="text-sm text-red-500 dark:text-red-400">{fieldError}</Text> : null}

          <Button label="Save Entry" size="lg" loading={createEntry.isPending} onPress={handleSubmit} />
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
