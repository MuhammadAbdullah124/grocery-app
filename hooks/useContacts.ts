import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { contactsApi } from '@/services/api';
import type { ContactsFilter } from '@/services/api/contacts';
import type { ContactInput } from '@/types';

export function useContacts(filter?: ContactsFilter) {
  return useQuery({
    queryKey: ['contacts', filter?.type ?? null, filter?.q ?? ''],
    queryFn: () => contactsApi.getContacts(filter),
  });
}

export function useContact(id: string | undefined) {
  return useQuery({
    queryKey: ['contact', id],
    queryFn: () => contactsApi.getContact(id as string),
    enabled: !!id,
  });
}

export function useContactsSummary() {
  return useQuery({
    queryKey: ['contacts', 'summary'],
    queryFn: contactsApi.getContactsSummary,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ContactInput) => contactsApi.createContact(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ContactInput }) => contactsApi.updateContact(id, input),
    onSuccess: (contact) => {
      queryClient.setQueryData(['contact', contact.id], contact);
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contactsApi.deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
}
