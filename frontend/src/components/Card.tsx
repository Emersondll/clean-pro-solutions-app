import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { theme } from '../theme/theme';

interface CardProps extends ViewProps {
  variant?: 'elevated' | 'outlined' | 'flat';
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'elevated', 
  style, 
  ...rest 
}) => {
  return (
    <View 
      style={[
        styles.card,
        variant === 'elevated' ? theme.shadows.sm : null,
        variant === 'outlined' ? styles.outlined : null,
        variant === 'flat' ? styles.flat : null,
        style
      ]} 
      {...rest}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
  },
  outlined: {
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  flat: {
    backgroundColor: theme.colors.background,
  },
});
