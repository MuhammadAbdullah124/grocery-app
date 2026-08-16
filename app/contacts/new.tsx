import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Header } from '@/components/layout/Header';
import { ContactForm } from '@/components/khata/ContactForm';
import { useCreateContact } from '@/hooks/useContacts';
import { ApiRequestError } from '@/types';
import type { ContactInput } from '@/types';

export default function NewContactScreen() {
  const router = useRouter();
  const createContact = useCreateContact();

  const handleSubmit = async (input: ContactInput) => {
    try {
      await createContact.mutateAsync(input);
      router.back();
    } catch (error) {
      const message = error instanceof ApiRequestError ? error.message : 'Something went wrong. Please try again.';
      Alert.alert('Could not add contact', message);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-white dark:bg-black">
      <StatusBar style="dark" />
      <Header title="Add Contact" showProfileShortcut={false} />
      <ContactForm submitLabel="Add Contact" isSubmitting={createContact.isPending} onSubmit={handleSubmit} />
    </SafeAreaView>
  );
}
