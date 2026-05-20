import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export interface ScreenWrapperProps {
  children: React.ReactNode;
  title: string;
  rightAction?: React.ReactNode;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
}

export const ScreenWrapper = ({ 
  children, 
  title, 
  rightAction, 
  style, 
  contentContainerStyle 
}: ScreenWrapperProps) => {
  return (
    <SafeAreaView style={[styles.safeArea, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
      </View>
      <View style={[styles.content, contentContainerStyle]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: 44,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
  title: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  rightAction: {
    position: 'absolute',
    right: spacing.md,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: colors.surface,
  },
});
