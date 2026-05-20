import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert,
  ActionSheetIOS, Platform, ActivityIndicator,
} from 'react-native';
import { UserCircle, Bell, Globe, HelpCircle, MessageSquare, Info, LogOut, MapPin } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ListItem from '../components/ListItem';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, radius, shadows } from '../theme/spacing';

// ── Global Stats Cache ───────────────────────────────────────────────
let cachedStats: { total: number; completed: number; thisMonth: number; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 1000;

// ── Menu Data ────────────────────────────────────────────────────────
const ACCOUNT_MENU = [
  { id: 'edit',  label: 'Edit Profile',               icon: UserCircle, screen: 'EditProfile' },
  { id: 'notif', label: 'Notification Preferences',   icon: Bell,       action: 'notif' },
  { id: 'lang',  label: 'Language / زبان',             icon: Globe,      action: 'lang' },
];

const SUPPORT_MENU = [
  { id: 'help',    label: 'Help Center',   icon: HelpCircle,   action: 'help' },
  { id: 'contact', label: 'Contact Us',    icon: MessageSquare, action: 'contact' },
  { id: 'about',   label: 'About SaathiAI', icon: Info,         action: 'about' },
];

const LEGAL_MENU = [
  { id: 'terms',   label: 'Terms of Service', icon: null, action: 'terms' },
  { id: 'privacy', label: 'Privacy Policy',   icon: null, action: 'privacy' },
];

export default function ProfileScreen({ navigation }: any) {
  const { user, profile, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  const [stats, setStats] = useState({ total: 0, completed: 0, thisMonth: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const displayName = profile?.displayName || user?.email?.split('@')[0] || 'User';
  const email = user?.email || '';
  const city = profile?.city || 'Islamabad';
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Fetch Stats
  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      
      const now = Date.now();
      if (cachedStats && (now - cachedStats.timestamp < CACHE_DURATION)) {
        setStats({ total: cachedStats.total, completed: cachedStats.completed, thisMonth: cachedStats.thisMonth });
        setLoadingStats(false);
        return;
      }

      try {
        const q = query(collection(db, 'bookings'), where('user_id', '==', user.uid));
        const snapshot = await getDocs(q);
        
        let total = 0;
        let completed = 0;
        let thisMonth = 0;
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        snapshot.forEach((doc) => {
          const data = doc.data();
          total++;
          if (data.status === 'completed') completed++;
          
          if (data.created_at) {
            const date = new Date(data.created_at);
            if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
              thisMonth++;
            }
          }
        });

        const newStats = { total, completed, thisMonth, timestamp: now };
        cachedStats = newStats;
        setStats(newStats);
      } catch (e) {
        console.error("Failed to fetch stats for profile:", e);
      } finally {
        setLoadingStats(false);
      }
    }

    fetchStats();
  }, [user]);

  const handleSignOut = async () => {
    if (!confirmSignOut) {
      // First tap: show confirmation state
      setConfirmSignOut(true);
      return;
    }
    // Second tap: actually sign out
    setSigningOut(true);
    setConfirmSignOut(false);
    try {
      await signOut();
    } catch (e) {
      console.error('Sign out error:', e);
      setSigningOut(false);
    }
  };

  const cancelSignOut = () => setConfirmSignOut(false);

  const handleMenuPress = (item: any) => {
    if (item.screen) {
      navigation.navigate(item.screen);
      return;
    }
    switch (item.action) {
      case 'notif':
        if (Platform.OS === 'ios') {
          ActionSheetIOS.showActionSheetWithOptions(
            {
              title: 'Notification Preferences',
              options: ['Dismiss', 'Push Notifications: On', 'Email Reminders: On', 'SMS Alerts: Off'],
              cancelButtonIndex: 0,
              message: 'Manage how SaathiAI sends you updates about your bookings.',
            },
            () => {},
          );
        } else {
          Alert.alert(
            'Notification Preferences',
            '🔔 Push Notifications: Enabled\n📧 Email Reminders: Enabled\n📱 SMS Alerts: Disabled\n\nFull notification settings coming soon.',
          );
        }
        break;

      case 'lang':
        if (Platform.OS === 'ios') {
          ActionSheetIOS.showActionSheetWithOptions(
            {
              title: 'Language / زبان',
              options: ['Dismiss', '🇬🇧 English', '🇵🇰 اردو (Urdu)', '📝 Roman Urdu'],
              cancelButtonIndex: 0,
              message: 'SaathiAI supports mixed Roman Urdu, Urdu, and English input.',
            },
            (i) => {
              if (i === 1) Alert.alert('English Selected', 'App language is set to English.');
              if (i === 2 || i === 3) Alert.alert('Coming Soon', 'Full Urdu UI is on the roadmap!');
            },
          );
        } else {
          Alert.alert(
            'Language / زبان',
            'SaathiAI understands Roman Urdu, Urdu, and English in the chat.\n\nFull multilingual UI coming soon.',
          );
        }
        break;

      case 'help':
        Alert.alert(
          'Help Center',
          '❓ How do I book a service?\nType your request in the chat, e.g. "AC technician chahiye".\n\n❓ Which cities are supported?\nIslamabad, Lahore, and Karachi.\n\n❓ Can I cancel a booking?\nYes — open the booking and tap "Cancel Booking".\n\n❓ How does AI ranking work?\nProviders are scored by distance, rating, availability, and price.',
          [{ text: 'Got it' }],
        );
        break;

      case 'contact':
        Alert.alert(
          'Contact Us',
          '📧 support@saathi.ai\n📞 0800-SAATHI (72-2844)\n\n🕒 Support hours:\nMon – Sat: 9 AM – 9 PM PKT',
          [{ text: 'OK' }],
        );
        break;

      case 'about':
        Alert.alert(
          'About SaathiAI',
          'SaathiAI v1.0\n\nAn AI-powered service booking platform for Pakistan\'s informal economy — connecting users with trusted AC technicians, plumbers, and electricians via natural language.\n\nBuilt with ❤️ for the 2026 AI Hackathon.',
          [{ text: 'Close' }],
        );
        break;

      case 'terms':
        Alert.alert(
          'Terms of Service',
          'By using SaathiAI, you agree to use the platform only for legitimate service bookings. Providers are independent contractors. SaathiAI is not liable for the quality of services rendered.\n\nFull terms at saathi.ai/terms.',
          [{ text: 'OK' }],
        );
        break;

      case 'privacy':
        Alert.alert(
          'Privacy Policy',
          'SaathiAI collects your name, email, city, and booking history to provide personalised service recommendations. Your data is never sold to third parties.\n\nFull policy at saathi.ai/privacy.',
          [{ text: 'OK' }],
        );
        break;

      default:
        break;
    }
  };

  return (
    <View style={s.root}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} bounces={false}>
        
        {/* ── HEADER (Gradient Full Bleed) ───────────────────────── */}
        <LinearGradient 
          colors={[colors.primary, colors.primaryDark]} 
          style={[s.headerGradient, { paddingTop: insets.top + spacing.xl }]}
        >
          <View style={s.avatarContainer}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initials}</Text>
            </View>
          </View>
          <Text style={s.displayName}>{displayName}</Text>
          <Text style={s.email}>{email}</Text>
          
          <View style={s.cityBadge}>
            <MapPin color={colors.textInverse} size={12} />
            <Text style={s.cityText}>{city}</Text>
          </View>
        </LinearGradient>

        {/* ── STATS ROW ──────────────────────────────────────────── */}
        <View style={s.statsWrapper}>
          <View style={s.statsRow}>
            <StatCard label="Total Bookings" value={loadingStats ? '-' : stats.total} />
            <StatCard label="Completed" value={loadingStats ? '-' : stats.completed} />
            <StatCard label="This Month" value={loadingStats ? '-' : stats.thisMonth} />
          </View>
        </View>

        {/* ── MENU SECTIONS ──────────────────────────────────────── */}
        <View style={s.menuSection}>
          <Text style={s.sectionTitle}>Account</Text>
          <View style={s.cardGroup}>
            {ACCOUNT_MENU.map((item, i) => (
              <ListItem 
                key={item.id}
                icon={item.icon ? <item.icon color={colors.primary} size={18} /> : null}
                title={item.label}
                onPress={() => handleMenuPress(item)}
                hideSeparator={i === ACCOUNT_MENU.length - 1}
              />
            ))}
          </View>
        </View>

        <View style={s.menuSection}>
          <Text style={s.sectionTitle}>Support</Text>
          <View style={s.cardGroup}>
            {SUPPORT_MENU.map((item, i) => (
              <ListItem 
                key={item.id}
                icon={item.icon ? <item.icon color={colors.primary} size={18} /> : null}
                title={item.label}
                onPress={() => handleMenuPress(item)}
                hideSeparator={i === SUPPORT_MENU.length - 1}
              />
            ))}
          </View>
        </View>

        <View style={s.menuSection}>
          <Text style={s.sectionTitle}>Legal</Text>
          <View style={s.cardGroup}>
            {LEGAL_MENU.map((item, i) => (
              <ListItem 
                key={item.id}
                icon={item.icon ? <item.icon color={colors.primary} size={18} /> : <View style={{width: 18}} />} // Placeholder for alignment
                title={item.label}
                onPress={() => handleMenuPress(item)}
                hideSeparator={i === LEGAL_MENU.length - 1}
              />
            ))}
          </View>
        </View>

        <View style={[s.menuSection, { marginBottom: spacing.huge }]}>
          {confirmSignOut ? (
            <View style={s.signOutConfirm}>
              <Text style={s.signOutConfirmText}>Sign out of SaathiAI?</Text>
              <View style={s.signOutBtns}>
                <TouchableOpacity style={s.signOutCancel} onPress={cancelSignOut} activeOpacity={0.8}>
                  <Text style={s.signOutCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.signOutConfirmBtn} onPress={handleSignOut} activeOpacity={0.8}>
                  {signingOut
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={s.signOutConfirmBtnText}>Yes, Sign Out</Text>}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={s.cardGroup}>
              <ListItem
                icon={signingOut
                  ? <ActivityIndicator size="small" color={colors.danger} />
                  : <LogOut color={colors.danger} size={18} />}
                title={signingOut ? 'Signing out…' : 'Sign Out'}
                onPress={handleSignOut}
                danger
                hideSeparator
              />
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

// ── Stat Card Component ──────────────────────────────────────────────
function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={s.statCard}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

// ── Styles ───────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  scrollContent: { paddingBottom: spacing.huge },
  
  // Header
  headerGradient: {
    paddingBottom: spacing.xxxl + 20, // Extra space for overlapping stats
    alignItems: 'center',
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  avatarContainer: {
    padding: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 60,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.displayMedium,
    color: colors.primary,
  },
  displayName: {
    ...typography.displayMedium,
    color: colors.textInverse,
    marginBottom: spacing.xs,
  },
  email: {
    ...typography.body,
    color: colors.textInverse,
    opacity: 0.8,
    marginBottom: spacing.md,
  },
  cityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    gap: 4,
  },
  cityText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '600',
  },

  // Stats Row
  statsWrapper: {
    marginTop: -40,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    zIndex: 10,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    ...shadows.sm,
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textTertiary,
    textAlign: 'center',
  },

  // Menu Sections
  menuSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    color: colors.textTertiary,
    marginBottom: spacing.sm,
    paddingLeft: spacing.sm,
  },
  cardGroup: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  // Sign Out inline confirm
  signOutConfirm: {
    backgroundColor: colors.dangerLight,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.danger + '40',
    padding: spacing.lg,
  },
  signOutConfirmText: {
    ...typography.body,
    color: colors.danger,
    fontWeight: '700',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  signOutBtns: { flexDirection: 'row', gap: spacing.sm },
  signOutCancel: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    backgroundColor: colors.background,
    minHeight: 44,
    justifyContent: 'center',
  },
  signOutCancelText: { ...typography.button, color: colors.textSecondary, fontSize: 14 },
  signOutConfirmBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.danger,
    alignItems: 'center',
    minHeight: 44,
    justifyContent: 'center',
  },
  signOutConfirmBtnText: { ...typography.button, color: '#fff', fontSize: 14 },
});
