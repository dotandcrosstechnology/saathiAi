import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';

export type BadgeVariant = 'verified' | 'status' | 'count';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export const Badge = ({ label, variant = 'status', style }: BadgeProps) => {
  const getStyles = () => {
    switch (variant) {
      case 'verified':
        return { bg: colors.accentLight, text: colors.accent };
      case 'count':
        return { bg: colors.danger, text: colors.textInverse };
      case 'status':
      default:
        return { bg: colors.surfaceHover, text: colors.textSecondary };
    }
  };

  const st = getStyles();

  return (
    <View style={[styles.container, { backgroundColor: st.bg }, style]}>
      <Text style={[styles.text, { color: st.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.caption,
    fontWeight: '700',
  },
});
