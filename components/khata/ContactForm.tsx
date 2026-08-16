import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { ContactInput, ContactType } from '@/types';

const TYPE_OPTIONS: { id: ContactType; label: string }[] = [
  { id: 'customer', label: 'Customer' },
  { id: 'supplier', label: 'Supplier' },
  { id: 'other', label: 'Other' },
];

interface ContactFormProps {
  initialValues?: ContactInput;
  onSubmit: (input: ContactInput) => void;
  submitLabel: string;
  isSubmitting?: boolean;
  error?: string | null;
  /** Opening balance is create-only — hidden entirely when editing. */
  showOpeningBalance?: boolean;
}

export function ContactForm({
  initialValues,
  onSubmit,
  submitLabel,
  isSubmitting,
  error,
  showOpeningBalance = true,
}: ContactFormProps) {
  const [name, setName] = useState(initialValues?.name ?? '');
  const [phone, setPhone] = useState(initialValues?.phone ?? '');
  const [type, setType] = useState<ContactType>(initialValues?.type ?? 'customer');
  const [notes, setNotes] = useState(initialValues?.notes ?? '');
  const [openingBalance, setOpeningBalance] = useState(
    initialValues?.openingBalance != null ? String(initialValues.openingBalance) : '',
  );
  const [fieldError, setFieldError] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!name.trim()) {
      setFieldError('Enter a name.');
      return;
    }

    let openingBalanceNum: number | undefined;
    if (showOpeningBalance && openingBalance.trim()) {
      openingBalanceNum = Number(openingBalance);
      if (!Number.isFinite(openingBalanceNum)) {
        setFieldError('Enter a valid opening balance.');
        return;
      }
    }

    setFieldError(null);
    onSubmit({
      name: name.trim(),
      phone: phone.trim() || undefined,
      type,
      notes: notes.trim() || undefined,
      openingBalance: openingBalanceNum,
    });
  };

  return (
    <KeyboardAwareScrollView
      className="flex-1"
      contentContainerClassName="px-5"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      enableOnAndroid
      extraScrollHeight={20}
    >
        <View className="gap-4 py-4 pb-10">
          <Input label="Name" placeholder="e.g. Ali Khan" value={name} onChangeText={setName} />
          <Input
            label="Phone (optional)"
            placeholder="e.g. 03001234567"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />

          <View>
            <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">Type</Text>
            <View className="flex-row gap-2">
              {TYPE_OPTIONS.map((option) => {
                const selected = type === option.id;
                return (
                  <Pressable
                    key={option.id}
                    onPress={() => setType(option.id)}
                    className={`flex-1 items-center rounded-2xl border py-3 ${
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

          {showOpeningBalance ? (
            <Input
              label="Opening Balance (optional)"
              placeholder="0"
              keyboardType="numbers-and-punctuation"
              value={openingBalance}
              onChangeText={setOpeningBalance}
            />
          ) : null}
          {showOpeningBalance ? (
            <Text className="-mt-2 text-xs text-gray-400 dark:text-gray-500">
              Positive = they already owed you. Negative = you already owed them. Leave blank for 0.
            </Text>
          ) : null}

          <View>
            <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">Notes (optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Anything worth remembering about this contact"
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-base text-gray-900 dark:text-gray-50"
              style={{ minHeight: 84 }}
            />
          </View>

          {fieldError || error ? <Text className="text-sm text-red-500 dark:text-red-400">{fieldError ?? error}</Text> : null}

          <Button label={submitLabel} size="lg" loading={isSubmitting} onPress={handleSubmit} />
        </View>
    </KeyboardAwareScrollView>
  );
}
