import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { LedgerTransaction } from '@/types';
import { formatDate, formatPrice } from '@/utils/format';
import { Badge } from '@/components/ui/Badge';

const categoryLabel: Record<LedgerTransaction['category'], string> = {
  sale: 'Sale',
  purchase: 'Purchase',
  payment: 'Payment',
  other: 'Other',
};

interface LedgerTransactionRowProps {
  transaction: LedgerTransaction;
  onPress?: (transaction: LedgerTransaction) => void;
}

function LedgerTransactionRowBase({ transaction, onPress }: LedgerTransactionRowProps) {
  const isGave = transaction.entryType === 'you_gave';
  const locked = transaction.orderId !== null || transaction.purchaseId !== null;

  return (
    <Pressable
      onPress={onPress ? () => onPress(transaction) : undefined}
      disabled={!onPress}
      className="flex-row items-center rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3.5"
      style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
    >
      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className={`text-sm font-bold ${isGave ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
            {isGave ? 'You Gave' : 'You Got'}
          </Text>
          <Badge label={categoryLabel[transaction.category]} variant="neutral" />
          {locked ? <Badge label="Auto" variant="primary" /> : null}
        </View>
        {transaction.note ? (
          <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400" numberOfLines={2}>
            {transaction.note}
          </Text>
        ) : null}
        <Text className="mt-1 text-xs text-gray-400 dark:text-gray-500">{formatDate(transaction.occurredAt)}</Text>
      </View>
      <Text className={`text-sm font-bold ${isGave ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
        {isGave ? '+' : '-'}
        {formatPrice(transaction.amount)}
      </Text>
    </Pressable>
  );
}

export const LedgerTransactionRow = memo(LedgerTransactionRowBase);
