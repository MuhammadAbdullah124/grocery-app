import { forwardRef, useState } from 'react';
import { Text, TextInput, View, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, leftIcon, isPassword, className, ...textInputProps }, ref) => {
    const [secure, setSecure] = useState(isPassword);

    return (
      <View className="w-full">
        {label ? <Text className="mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-200">{label}</Text> : null}
        <View
          className={`flex-row items-center rounded-2xl border bg-white dark:bg-gray-900 px-4 h-[52px] ${
            error ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'
          }`}
        >
          {leftIcon ? (
            <Ionicons name={leftIcon} size={20} color="#9ca3af" style={{ marginRight: 10 }} />
          ) : null}
          <TextInput
            ref={ref}
            className={`flex-1 text-base text-gray-900 dark:text-gray-50 ${className ?? ''}`}
            placeholderTextColor="#9ca3af"
            secureTextEntry={secure}
            autoCapitalize="none"
            {...textInputProps}
          />
          {isPassword ? (
            <Pressable
              onPress={() => setSecure((prev) => !prev)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={secure ? 'Show password' : 'Hide password'}
            >
              <Ionicons name={secure ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9ca3af" />
            </Pressable>
          ) : null}
        </View>
        {error ? <Text className="mt-1 text-sm text-red-500 dark:text-red-400">{error}</Text> : null}
      </View>
    );
  },
);

Input.displayName = 'Input';
