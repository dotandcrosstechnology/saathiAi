import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { ArrowLeft, User, MapPin, Phone, Check } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, radius, shadows } from '../theme/spacing';

const CITIES: Array<'Islamabad' | 'Lahore' | 'Karachi'> = ['Islamabad', 'Lahore', 'Karachi'];

export default function EditProfileScreen({ navigation }: any) {
  const { profile, updateProfile } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [city, setCity] = useState<'Islamabad' | 'Lahore' | 'Karachi'>(
    profile?.city || 'Islamabad',
  );
  const [phone, setPhone] = useState(profile?.phoneNumber || '');
  const [saving, setSaving] = useState(false);

  const isDirty =
    displayName.trim() !== (profile?.displayName || '') ||
    city !== (profile?.city || 'Islamabad') ||
    phone.trim() !== (profile?.phoneNumber || '');

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Name Required', 'Please enter your display name.');
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim(),
        city,
        phoneNumber: phone.trim() || undefined,
      });
      navigation.goBack();
    } catch {
      Alert.alert('Error', 'Could not save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back} activeOpacity={0.7}>
          <ArrowLeft color={colors.textPrimary} size={22} />
        </TouchableOpacity>
        <Text style={s.title}>Edit Profile</Text>
        <TouchableOpacity
          onPress={handleSave}
          style={[s.saveBtn, (!isDirty || saving) && s.saveBtnOff]}
          disabled={!isDirty || saving}
          activeOpacity={0.8}
        >
          {saving
            ? <ActivityIndicator size="small" color="#fff" />
            : <Text style={s.saveBtnText}>Save</Text>}
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled">

          {/* Avatar placeholder */}
          <View style={s.avatarSection}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>
                {displayName.trim()
                  ? displayName.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
                  : '?'}
              </Text>
            </View>
          </View>

          {/* Fields */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Personal Info</Text>

            <View style={s.fieldGroup}>
              <View style={s.field}>
                <View style={s.fieldIcon}>
                  <User color={colors.primary} size={16} />
                </View>
                <View style={s.fieldBody}>
                  <Text style={s.fieldLabel}>Full Name</Text>
                  <TextInput
                    style={s.fieldInput}
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="Your display name"
                    placeholderTextColor={colors.textTertiary}
                    returnKeyType="next"
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={[s.field, s.fieldLast]}>
                <View style={s.fieldIcon}>
                  <Phone color={colors.primary} size={16} />
                </View>
                <View style={s.fieldBody}>
                  <Text style={s.fieldLabel}>Phone Number (optional)</Text>
                  <TextInput
                    style={s.fieldInput}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+92 300 0000000"
                    placeholderTextColor={colors.textTertiary}
                    keyboardType="phone-pad"
                    returnKeyType="done"
                  />
                </View>
              </View>
            </View>
          </View>

          {/* City picker */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>City</Text>
            <View style={s.fieldGroup}>
              {CITIES.map((c, i) => (
                <TouchableOpacity
                  key={c}
                  style={[
                    s.cityRow,
                    i === CITIES.length - 1 && s.fieldLast,
                    city === c && s.cityRowActive,
                  ]}
                  onPress={() => setCity(c)}
                  activeOpacity={0.7}
                >
                  <View style={s.fieldIcon}>
                    <MapPin color={city === c ? colors.accent : colors.primary} size={16} />
                  </View>
                  <Text style={[s.cityLabel, city === c && s.cityLabelActive]}>{c}</Text>
                  {city === c && <Check color={colors.accent} size={18} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Account info (read-only) */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Account</Text>
            <View style={s.fieldGroup}>
              <View style={[s.field, s.fieldLast, { opacity: 0.6 }]}>
                <View style={s.fieldBody}>
                  <Text style={s.fieldLabel}>Email</Text>
                  <Text style={s.fieldReadOnly}>{profile?.email || '—'}</Text>
                </View>
              </View>
            </View>
            <Text style={s.hint}>Email cannot be changed.</Text>
          </View>

          {/* Full-width save button */}
          <TouchableOpacity
            style={[s.bigSaveBtn, (!isDirty || saving) && s.bigSaveBtnOff]}
            onPress={handleSave}
            disabled={!isDirty || saving}
            activeOpacity={0.85}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={s.bigSaveBtnText}>Save Changes</Text>}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },

  header: {
    height: 56, backgroundColor: colors.background,
    borderBottomWidth: 1, borderBottomColor: colors.border,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  back: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  title: { ...typography.h2, color: colors.textPrimary },
  saveBtn: {
    backgroundColor: colors.primary, paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm, borderRadius: radius.full, minHeight: 36,
    justifyContent: 'center', minWidth: 64, alignItems: 'center',
  },
  saveBtnOff: { backgroundColor: colors.border },
  saveBtnText: { ...typography.caption, color: '#fff', fontWeight: '700' },

  scroll: { padding: spacing.lg, paddingBottom: 80 },

  avatarSection: { alignItems: 'center', marginBottom: spacing.xxl },
  avatar: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    ...shadows.md,
  },
  avatarText: { fontSize: 30, fontWeight: '800', color: '#fff' },

  section: { marginBottom: spacing.xl },
  sectionLabel: { ...typography.label, color: colors.textTertiary, marginBottom: spacing.sm, paddingLeft: spacing.xs },

  fieldGroup: {
    backgroundColor: colors.background, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.border, overflow: 'hidden', ...shadows.sm,
  },
  field: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  fieldLast: { borderBottomWidth: 0 },
  fieldIcon: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  fieldBody: { flex: 1 },
  fieldLabel: { ...typography.caption, color: colors.textTertiary, marginBottom: 3 },
  fieldInput: {
    ...typography.body, color: colors.textPrimary,
    padding: 0, minHeight: 24,
  },
  fieldReadOnly: { ...typography.body, color: colors.textSecondary },

  cityRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  cityRowActive: { backgroundColor: colors.accentLight },
  cityLabel: { ...typography.body, color: colors.textPrimary, flex: 1 },
  cityLabelActive: { fontWeight: '700', color: colors.accent },

  hint: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.xs, paddingLeft: spacing.sm },

  bigSaveBtn: {
    backgroundColor: colors.primary, borderRadius: radius.lg,
    paddingVertical: spacing.lg, alignItems: 'center',
    marginTop: spacing.md, minHeight: 52, justifyContent: 'center',
    ...shadows.md,
  },
  bigSaveBtnOff: { backgroundColor: colors.borderStrong },
  bigSaveBtnText: { ...typography.button, color: '#fff' },
});
