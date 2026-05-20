import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors } from '../../theme/colors';
import { radius, spacing, shadows } from '../../theme/spacing';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export const Card = ({ children, style, ...rest }: CardProps) => {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
});
