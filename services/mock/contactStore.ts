import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiRequestError } from '@/types';
import type { Contact, ContactInput, ContactsSummary, ContactType } from '@/types';
import { generateId } from '@/utils/id';
import { formatPrice } from '@/utils/format';

const CONTACTS_KEY = 'freshcart:contacts';

async function readContacts(): Promise<Contact[]> {
  const raw = await AsyncStorage.getItem(CONTACTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Contact[];
  } catch {
    return [];
  }
}

async function writeContacts(contacts: Contact[]): Promise<void> {
  await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(contacts));
}

export interface ContactsFilter {
  type?: ContactType;
  q?: string;
}

export async function getContacts(filter?: ContactsFilter): Promise<Contact[]> {
  let contacts = await readContacts();
  if (filter?.type) {
    contacts = contacts.filter((c) => c.type === filter.type);
  }
  if (filter?.q) {
    const term = filter.q.trim().toLowerCase();
    contacts = contacts.filter(
      (c) => c.name.toLowerCase().includes(term) || (c.phone ?? '').toLowerCase().includes(term),
    );
  }
  return [...contacts].sort((a, b) => a.name.localeCompare(b.name));
}

export async function getContact(id: string): Promise<Contact> {
  const contacts = await readContacts();
  const contact = contacts.find((c) => c.id === id);
  if (!contact) throw new ApiRequestError('Contact not found', 'NOT_FOUND');
  return contact;
}

export async function getContactsSummary(): Promise<ContactsSummary> {
  const contacts = await readContacts();
  const totalReceivable = contacts.filter((c) => c.balance > 0).reduce((sum, c) => sum + c.balance, 0);
  const totalPayable = Math.abs(contacts.filter((c) => c.balance < 0).reduce((sum, c) => sum + c.balance, 0));
  return { totalReceivable, totalPayable, contactsCount: contacts.length };
}

export async function createContact(input: ContactInput): Promise<Contact> {
  const contacts = await readContacts();
  const openingBalance = input.openingBalance ?? 0;
  const contact: Contact = {
    id: generateId('contact'),
    name: input.name.trim(),
    phone: input.phone?.trim() || null,
    type: input.type,
    notes: input.notes?.trim() || null,
    openingBalance,
    balance: openingBalance,
    createdAt: new Date().toISOString(),
  };
  await writeContacts([...contacts, contact]);
  return contact;
}

export async function updateContact(id: string, input: ContactInput): Promise<Contact> {
  const contacts = await readContacts();
  const index = contacts.findIndex((c) => c.id === id);
  if (index === -1) throw new ApiRequestError('Contact not found', 'NOT_FOUND');

  const updated: Contact = {
    ...contacts[index],
    name: input.name.trim(),
    phone: input.phone?.trim() || null,
    type: input.type,
    notes: input.notes?.trim() || null,
  };
  contacts[index] = updated;
  await writeContacts(contacts);
  return updated;
}

export async function deleteContact(id: string): Promise<void> {
  const contacts = await readContacts();
  const contact = contacts.find((c) => c.id === id);
  if (!contact) return;

  if (contact.balance !== 0) {
    throw new ApiRequestError(
      `This contact still has an outstanding balance of ${formatPrice(Math.abs(contact.balance))}. Settle it before deleting.`,
      'HAS_BALANCE',
    );
  }

  await writeContacts(contacts.filter((c) => c.id !== id));
}

/**
 * Mock-mode mirror of the backend's LedgerTransaction::booted() model-event
 * balance maintenance — mock mode has no model events, so every ledger
 * create/update/delete must call this directly to keep contacts.balance in
 * sync (see ledgerTransactionStore.ts).
 */
export async function adjustBalance(id: string, delta: number): Promise<void> {
  const contacts = await readContacts();
  const index = contacts.findIndex((c) => c.id === id);
  if (index === -1) return;
  contacts[index] = { ...contacts[index], balance: contacts[index].balance + delta };
  await writeContacts(contacts);
}
