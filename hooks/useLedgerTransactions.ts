import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ledgerTransactionsApi } from '@/services/api';
import type { UpdateLedgerTransactionInput } from '@/services/api/ledgerTransactions';
import type { LedgerTransactionInput } from '@/types';

export function useLedgerTransactions(contactId: string | undefined) {
  return useQuery({
    queryKey: ['ledgerTransactions', contactId],
    queryFn: () => ledgerTransactionsApi.getLedgerTransactions(contactId),
    enabled: !!contactId,
  });
}

/** A ledger mutation always invalidates the contact too — its balance just changed. */
function invalidateContact(queryClient: ReturnType<typeof useQueryClient>, contactId: string) {
  queryClient.invalidateQueries({ queryKey: ['ledgerTransactions', contactId] });
  queryClient.invalidateQueries({ queryKey: ['contact', contactId] });
  queryClient.invalidateQueries({ queryKey: ['contacts'] });
}

export function useCreateLedgerTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LedgerTransactionInput) => ledgerTransactionsApi.createLedgerTransaction(input),
    onSuccess: (transaction) => invalidateContact(queryClient, transaction.contactId),
  });
}

export function useUpdateLedgerTransaction(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateLedgerTransactionInput) => ledgerTransactionsApi.updateLedgerTransaction(id, input),
    onSuccess: (transaction) => invalidateContact(queryClient, transaction.contactId),
  });
}

export function useDeleteLedgerTransaction(contactId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => ledgerTransactionsApi.deleteLedgerTransaction(id),
    onSuccess: () => invalidateContact(queryClient, contactId),
  });
}
