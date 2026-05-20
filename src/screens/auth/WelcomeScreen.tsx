import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles } from 'lucide-react-native';
import { Button } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export default function WelcomeScreen({ navigation }: any) {
  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Sparkles color={colors.textInverse} size={64} />
          </View>
          <Text style={styles.title}>SaathiAI</Text>
          <Text style={styles.tagline}>Your AI service companion for Pakistan</Text>
        </View>

        <View style={styles.footerContainer}>
          <Button
            title="Create Account"
            variant="ghost"
            style={{ backgroundColor: colors.textInverse, marginBottom: spacing.md }}
            textStyle={{ color: colors.primary }}
            onPress={() => navigation.navigate('SignUp')}
          />
          <Button
            title="I have an account"
            variant="ghost"
            textStyle={{ color: colors.textInverse }}
            onPress={() => navigation.navigate('SignIn')}
          />
          <Text style={styles.footerText}>
            By continuing you agree to our Terms
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
  },
  logoContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.displayLarge,
    color: colors.textInverse,
    marginBottom: spacing.sm,
  },
  tagline: {
    ...typography.bodyLarge,
    color: colors.textInverse,
    textAlign: 'center',
    opacity: 0.8,
  },
  footerContainer: {
    padding: spacing.xxl,
  },
  footerText: {
    ...typography.caption,
    color: colors.textInverse,
    textAlign: 'center',
    opacity: 0.6,
    marginTop: spacing.xl,
  },
});
