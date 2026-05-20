import React, { useState, useEffect } from 'react';
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
import { ArrowLeft, User, Mail, Lock } from 'lucide-react-native';
import { Button, Input } from '../../components/ui';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing, radius } from '../../theme/spacing';
import { useAuth } from '../../contexts/AuthContext';

export default function SignUpScreen({ navigation }: any) {
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [city, setCity] = useState<'Islamabad' | 'Lahore' | 'Karachi'>('Islamabad');
  
  const [errors, setErrors] = useState<{name?: string; email?: string; password?: string; form?: string}>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      validateFields();
    }, 500);
    return () => clearTimeout(timer);
  }, [name, email, password]);

  const validateFields = () => {
    let newErrors: any = {};
    if (name && name.length < 2) newErrors.name = 'Name must be at least 2 characters';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) newErrors.email = 'Please enter a valid email';
    
    if (password) {
      if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      else if (!/\d/.test(password)) newErrors.password = 'Password must contain at least one number';
    }
    
    setErrors(newErrors);
  };

  const isFormValid = name.length >= 2 && email && password && Object.keys(errors).length === 0;

  const handleSignUp = async () => {
    if (!isFormValid) return;
    setIsLoading(true);
    setErrors({});
    try {
      await signUp(email, password, name, city);
      // Navigation will be handled by App.tsx conditionally rendering MainStack
    } catch (err: any) {
      console.error(err);
      setErrors({ form: err.message || 'Failed to create account' });
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

          <Text style={styles.header}>Create your account</Text>
          <Text style={styles.subheader}>Takes less than a minute</Text>

          {errors.form && <Text style={styles.formError}>{errors.form}</Text>}

          <Input
            label="Full Name"
            placeholder="Ali Khan"
            value={name}
            onChangeText={setName}
            leftIcon={<User color={colors.textTertiary} size={20} />}
            error={errors.name}
          />

          <Input
            label="Email"
            placeholder="ali@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail color={colors.textTertiary} size={20} />}
            error={errors.email}
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
            error={errors.password}
          />

          <Text style={styles.label}>City</Text>
          <View style={styles.segmentedControl}>
            {['Islamabad', 'Lahore', 'Karachi'].map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.segmentButton,
                  city === c && styles.segmentButtonActive
                ]}
                onPress={() => setCity(c as any)}
              >
                <Text style={[
                  styles.segmentText,
                  city === c && styles.segmentTextActive
                ]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="Create Account"
            onPress={handleSignUp}
            disabled={!isFormValid || isLoading}
            isLoading={isLoading}
            style={{ marginTop: spacing.xl }}
          />

          <TouchableOpacity style={styles.footerLink} onPress={() => navigation.navigate('SignIn')}>
            <Text style={styles.footerText}>
              Already have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Sign in</Text>
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
  formError: { ...typography.body, color: colors.danger, marginBottom: spacing.md },
  label: { ...typography.label, color: colors.textSecondary, marginBottom: spacing.xs },
  segmentedControl: {
    flexDirection: 'row', backgroundColor: colors.surfaceHover, 
    borderRadius: radius.md, padding: spacing.xs, marginBottom: spacing.lg
  },
  segmentButton: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.sm },
  segmentButtonActive: { backgroundColor: colors.background, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  segmentText: { ...typography.bodySmall, color: colors.textSecondary },
  segmentTextActive: { color: colors.textPrimary, fontWeight: '600' },
  footerLink: { marginTop: 'auto', paddingTop: spacing.xxl, alignItems: 'center' },
  footerText: { ...typography.body, color: colors.textSecondary },
});
