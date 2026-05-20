import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, ImageSourcePropType } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { radius } from '../../theme/spacing';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  src?: ImageSourcePropType | { uri: string };
  initials?: string;
  size?: AvatarSize;
  style?: ViewStyle;
}

export const Avatar = ({ src, initials, size = 'md', style }: AvatarProps) => {
  const getDimensions = () => {
    switch (size) {
      case 'sm': return 32;
      case 'lg': return 64;
      case 'md':
      default: return 48;
    }
  };

  const dim = getDimensions();
  const fontStyle = size === 'sm' ? typography.caption : size === 'lg' ? typography.h2 : typography.h3;

  return (
    <View style={[styles.container, { width: dim, height: dim, borderRadius: dim / 2 }, style]}>
      {src ? (
        <Image source={src as ImageSourcePropType} style={{ width: dim, height: dim, borderRadius: dim / 2 }} />
      ) : (
        <Text style={[fontStyle, { color: colors.primary }]}>
          {initials?.substring(0, 2).toUpperCase() || '?'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceHover,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
