import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: ReactNode;
  padded?: boolean;
}

export function Card({ children, padded = true, className, ...viewProps }: CardProps) {
  return (
    <View
      className={`rounded-2xl border border-gray-100 bg-white ${padded ? 'p-4' : ''} ${className ?? ''}`}
      style={{
        shadowColor: '#000',
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
      }}
      {...viewProps}
    >
      {children}
    </View>
  );
}
