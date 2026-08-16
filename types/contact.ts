export type ContactType = 'customer' | 'supplier' | 'other';

export interface Contact {
  id: string;
  name: string;
  phone: string | null;
  type: ContactType;
  notes: string | null;
  /** Signed. Positive = they owed the shop when this contact was added. */
  openingBalance: number;
  /**
   * Signed running balance. Positive = the contact owes the shop
   * (receivable). Negative = the shop owes the contact (payable).
   */
  balance: number;
  createdAt: string;
}

export interface ContactInput {
  name: string;
  phone?: string;
  type: ContactType;
  notes?: string;
  /** Only used on create — immutable afterwards. */
  openingBalance?: number;
}

export interface ContactsSummary {
  totalReceivable: number;
  totalPayable: number;
  contactsCount: number;
}
