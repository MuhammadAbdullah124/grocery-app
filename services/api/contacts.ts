import { config } from '@/constants/config';
import type { Contact, ContactInput, ContactsSummary, ContactType } from '@/types';
import { apiClient } from './client';
import * as mockContactStore from '@/services/mock/contactStore';

export interface ContactsFilter {
  type?: ContactType;
  q?: string;
}

export async function getContacts(filter?: ContactsFilter): Promise<Contact[]> {
  if (config.useMockApi) return mockContactStore.getContacts(filter);
  return apiClient.get<Contact[]>('/contacts', { type: filter?.type, q: filter?.q });
}

export async function getContact(id: string): Promise<Contact> {
  if (config.useMockApi) return mockContactStore.getContact(id);
  return apiClient.get<Contact>(`/contacts/${id}`);
}

export async function getContactsSummary(): Promise<ContactsSummary> {
  if (config.useMockApi) return mockContactStore.getContactsSummary();
  return apiClient.get<ContactsSummary>('/contacts/summary');
}

export async function createContact(input: ContactInput): Promise<Contact> {
  if (config.useMockApi) return mockContactStore.createContact(input);
  return apiClient.post<Contact>('/contacts', input);
}

export async function updateContact(id: string, input: ContactInput): Promise<Contact> {
  if (config.useMockApi) return mockContactStore.updateContact(id, input);
  return apiClient.put<Contact>(`/contacts/${id}`, input);
}

export async function deleteContact(id: string): Promise<void> {
  if (config.useMockApi) return mockContactStore.deleteContact(id);
  await apiClient.delete<void>(`/contacts/${id}`);
}
