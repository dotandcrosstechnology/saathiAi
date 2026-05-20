import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { ArrowLeft, Mail, Lock } from 'lucide-react-native';
import { Button, Input } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { useAuth } from '../../contexts/AuthContext';

export default function SignInScreen({ navigation }: any) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    try {
      await signIn(email, password);
      // Navigation handled by App.tsx
    } catch (err: any) {
      console.error(err);
      let message = 'Failed to sign in';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-email' || err.code === 'auth/invalid-credential') {
        message = 'No account found with this email, or wrong password.';
      } else if (err.code === 'auth/wrong-password') {
        message = 'Wrong password';
      }
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <ArrowLeft color={colors.textPrimary} size={24} />
          </TouchableOpacity>

          <Text style={styles.header}>Welcome back</Text>
          <Text style={styles.subheader}>Sign in to continue</Text>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <Input
            label="Email"
            placeholder="ali@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail color={colors.textTertiary} size={20} />}
          />

          <Input
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            leftIcon={<Lock color={colors.textTertiary} size={20} />}
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Text style={{ color: colors.primary, ...typography.caption }}>
                  {showPassword ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
            }
          />

          <Button
            title="Sign In"
            onPress={handleSignIn}
            disabled={isLoading || !email || !password}
            isLoading={isLoading}
            style={{ marginTop: spacing.xl }}
          />

          <TouchableOpacity style={styles.footerLink} onPress={() => navigation.navigate('SignUp')}>
            <Text style={styles.footerText}>
              Don't have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Create one</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  scrollContent: { padding: spacing.xl, flexGrow: 1 },
  backButton: { marginBottom: spacing.xl },
  header: { ...typography.h1, color: colors.textPrimary, marginBottom: spacing.xs },
  subheader: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xxl },
  errorText: { ...typography.body, color: colors.danger, marginBottom: spacing.md },
  footerLink: { marginTop: 'auto', paddingTop: spacing.xxl, alignItems: 'center' },
  footerText: { ...typography.body, color: colors.textSecondary },
});
