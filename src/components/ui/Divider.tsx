import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export interface DividerProps {
  label?: string;
  style?: ViewStyle;
}

export const Divider = ({ label, style }: DividerProps) => {
  if (label) {
    return (
      <View style={[styles.containerWithLabel, style]}>
        <View style={styles.line} />
        <Text style={styles.label}>{label}</Text>
        <View style={styles.line} />
      </View>
    );
  }

  return <View style={[styles.container, style]} />;
};

const styles = StyleSheet.create({
  container: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
    width: '100%',
  },
  containerWithLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
    width: '100%',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  label: {
    ...typography.caption,
    color: colors.textTertiary,
    paddingHorizontal: spacing.md,
  },
});
