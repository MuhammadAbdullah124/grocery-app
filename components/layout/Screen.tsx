import type { ReactNode } from 'react';
import { View, type ScrollViewProps } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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
        <KeyboardAwareScrollView
          className="flex-1"
          contentContainerClassName={contentContainerClassName}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          enableOnAndroid
          extraScrollHeight={20}
          {...scrollProps}
        >
          {children}
        </KeyboardAwareScrollView>
      ) : (
        <View className={`flex-1 ${contentContainerClassName ?? ''}`}>{children}</View>
      )}
    </SafeAreaView>
  );
}
