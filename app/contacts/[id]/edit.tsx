import { Alert, Pressable, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Header } from '@/components/layout/Header';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { ContactForm } from '@/components/khata/ContactForm';
import { useContact, useUpdateContact, useDeleteContact } from '@/hooks/useContacts';
import { ApiRequestError } from '@/types';
import type { ContactInput } from '@/types';

export default function EditContactScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const contactQuery = useContact(id);
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();

  const handleSubmit = async (input: ContactInput) => {
    if (!id) return;
    try {
      await updateContact.mutateAsync({ id, input });
      router.back();
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : 'Something went wrong. Please try again.';
      Alert.alert('Could not update contact', message);
    }
  };

  const handleDelete = () => {
    if (!id) return;
    Alert.alert('Delete contact', 'This cannot be undone. Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteContact.mutateAsync(id);
            router.dismissTo('/(tabs)/khata');
          } catch (error) {
            const message =
              error instanceof ApiRequestError ? error.message : 'Please try again.';
            Alert.alert('Could not delete contact', message);
          }
        },
      },
    ]);
  };

  if (contactQuery.isLoading) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
        <StatusBar style="dark" />
        <Header title="Edit Contact" showProfileShortcut={false} />
        <View className="px-5 pt-4">
          <Skeleton height={200} radius={16} />
        </View>
      </SafeAreaView>
    );
  }

  if (contactQuery.isError || !contactQuery.data) {
    return (
      <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
        <StatusBar style="dark" />
        <Header title="Edit Contact" showProfileShortcut={false} />
        <ErrorState title="Contact not found" description="This contact may have been removed." />
      </SafeAreaView>
    );
  }

  const contact = contactQuery.data;

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
      <StatusBar style="dark" />
      <Header
        title="Edit Contact"
        showProfileShortcut={false}
        right={
          <Pressable onPress={handleDelete} disabled={deleteContact.isPending} hitSlop={8}>
            <Text className="text-sm font-medium text-red-500 dark:text-red-400">
              {deleteContact.isPending ? 'Deleting…' : 'Delete'}
            </Text>
          </Pressable>
        }
      />
      <ContactForm
        submitLabel="Save Changes"
        isSubmitting={updateContact.isPending}
        onSubmit={handleSubmit}
        showOpeningBalance={false}
        initialValues={{
          name: contact.name,
          phone: contact.phone ?? undefined,
          type: contact.type,
          notes: contact.notes ?? undefined,
        }}
      />
    </SafeAreaView>
  );
}
