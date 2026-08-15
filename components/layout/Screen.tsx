import type { ReactNode } from 'react';
import { ScrollView, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  edges?: Edge[];
  className?: string;
  contentContainerClassName?: string;
  scrollProps?: ScrollViewProps;
}

export function Screen({
  children,
  scroll = false,
  edges = ['top', 'left', 'right'],
  className,
  contentContainerClassName,
  scrollProps,
}: ScreenProps) {
  return (
    <SafeAreaView edges={edges} className={`flex-1 bg-white dark:bg-black ${className ?? ''}`}>
      <StatusBar style="dark" />
      {scroll ? (
        <ScrollView
          className="flex-1"
          contentContainerClassName={contentContainerClassName}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          {...scrollProps}
        >
          {children}
        </ScrollView>
      ) : (
        <View className={`flex-1 ${contentContainerClassName ?? ''}`}>{children}</View>
      )}
    </SafeAreaView>
  );
}
