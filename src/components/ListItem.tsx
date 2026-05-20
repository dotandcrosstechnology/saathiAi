import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';

interface ListItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  rightElement?: React.ReactNode;
  onPress: () => void;
  danger?: boolean;
  style?: ViewStyle;
  hideSeparator?: boolean;
}

export default function ListItem({
  icon,
  title,
  subtitle,
  rightElement,
  onPress,
  danger = false,
  style,
  hideSeparator = false,
}: ListItemProps) {
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, danger && styles.iconContainerDanger]}>
        {icon}
      </View>
      <View style={styles.content}>
        <Text style={[styles.title, danger && styles.titleDanger]}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <View style={styles.right}>
        {rightElement || <ChevronRight color={colors.textTertiary} size={20} />}
      </View>
      {!hideSeparator && <View style={styles.separator} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  iconContainerDanger: {
    backgroundColor: colors.dangerLight,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  titleDanger: {
    color: colors.danger,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  right: {
    marginLeft: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    position: 'absolute',
    bottom: 0,
    left: spacing.lg + 32 + spacing.md, // Align with text
    right: 0,
    height: 1,
    backgroundColor: colors.border,
  },
});
