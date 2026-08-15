import { ActivityIndicator, Pressable, Text, View, type PressableProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { forwardRef } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<PressableProps, 'children'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
}

const containerVariantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary-500',
  secondary: 'bg-primary-100 dark:bg-primary-800',
  outline: 'bg-transparent border-2 border-primary-500',
  ghost: 'bg-transparent',
  danger: 'bg-red-600',
};

const textVariantClasses: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-primary-700 dark:text-primary-300',
  outline: 'text-primary-600 dark:text-primary-400',
  ghost: 'text-primary-600 dark:text-primary-400',
  danger: 'text-white',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-10 px-4 rounded-xl',
  md: 'h-12 px-5 rounded-2xl',
  lg: 'h-14 px-6 rounded-2xl',
};

const textSizeClasses: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

const iconColor: Record<ButtonVariant, string> = {
  primary: '#ffffff',
  secondary: '#107444',
  outline: '#129253',
  ghost: '#129253',
  danger: '#ffffff',
};

export const Button = forwardRef<View, ButtonProps>(
  (
    {
      label,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled = false,
      fullWidth = true,
      leftIcon,
      rightIcon,
      className,
      ...pressableProps
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <Pressable
        ref={ref}
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        disabled={isDisabled}
        className={`flex-row items-center justify-center ${sizeClasses[size]} ${containerVariantClasses[variant]} ${
          fullWidth ? 'w-full' : ''
        } ${isDisabled ? 'opacity-50' : ''} ${className ?? ''}`}
        style={({ pressed }) => [{ opacity: pressed && !isDisabled ? 0.85 : 1 }]}
        {...pressableProps}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? '#ffffff' : '#129253'} />
        ) : (
          <>
            {leftIcon ? (
              <Ionicons name={leftIcon} size={20} color={iconColor[variant]} style={{ marginRight: 8 }} />
            ) : null}
            <Text className={`font-semibold ${textSizeClasses[size]} ${textVariantClasses[variant]}`}>
              {label}
            </Text>
            {rightIcon ? (
              <Ionicons name={rightIcon} size={20} color={iconColor[variant]} style={{ marginLeft: 8 }} />
            ) : null}
          </>
        )}
      </Pressable>
    );
  },
);

Button.displayName = 'Button';
