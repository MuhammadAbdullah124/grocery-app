import { useColorScheme } from 'nativewind';

/** Matches the app's `text-gray-900 dark:text-gray-50` primary-ink pairing, for icons that can't take a className. */
export function useIconColor(): string {
  const { colorScheme } = useColorScheme();
  return colorScheme === 'dark' ? '#f9fafb' : '#111827';
}
