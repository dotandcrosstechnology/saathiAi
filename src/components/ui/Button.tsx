import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator, 
  StyleSheet, 
  ViewStyle, 
  TextStyle, 
  TouchableOpacityProps 
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export const Button = ({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  style,
  textStyle,
  icon,
  ...rest
}: ButtonProps) => {
  const getVariantStyles = (): { bg: string; text: string; border?: string } => {
    switch (variant) {
      case 'secondary':
        return { bg: colors.surfaceHover, text: colors.textPrimary };
      case 'ghost':
        return { bg: 'transparent', text: colors.primary };
      case 'danger':
        return { bg: colors.danger, text: colors.textInverse };
      case 'primary':
      default:
        return { bg: colors.primary, text: colors.textInverse };
    }
  };

  const getSizeStyles = (): { padY: number; padX: number; font: any } => {
    switch (size) {
      case 'sm':
        return { padY: spacing.sm, padX: spacing.md, font: typography.bodySmall };
      case 'lg':
        return { padY: spacing.lg, padX: spacing.xxl, font: typography.button };
      case 'md':
      default:
        return { padY: spacing.md, padX: spacing.lg, font: typography.button };
    }
  };

  const vs = getVariantStyles();
  const ss = getSizeStyles();

  const isDisabled = disabled || isLoading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={isDisabled}
      style={[
        styles.container,
        {
          backgroundColor: vs.bg,
          paddingVertical: ss.padY,
          paddingHorizontal: ss.padX,
          borderColor: vs.border || vs.bg,
          borderWidth: vs.border ? 1 : 0,
          opacity: isDisabled ? 0.6 : 1,
        },
        style,
      ]}
      {...rest}
    >
      {isLoading ? (
        <ActivityIndicator color={vs.text} size="small" />
      ) : (
        <>
          {icon && <React.Fragment>{icon}</React.Fragment>}
          <Text
            style={[
              ss.font,
              { color: vs.text, marginLeft: icon ? spacing.sm : 0 },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
});
