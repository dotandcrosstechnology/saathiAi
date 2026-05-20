import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, Alert,
} from 'react-native';
import { Calendar, Clock, XCircle, Filter } from 'lucide-react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { ScreenWrapper } from '../components/ui/ScreenWrapper';
import BookingCard from '../components/BookingCard';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToBookings, cancelBooking, BookingFilter } from '../services/bookings';
import { Booking } from '../types';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, radius } from '../theme/spacing';

// ── Segment tabs ─────────────────────────────────────────────────────
const SEGMENTS: { key: BookingFilter; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'past', label: 'Past' },
  { key: 'cancelled', label: 'Cancelled' },
];

// ── Empty state config per segment ───────────────────────────────────
const EMPTY: Record<BookingFilter, { Icon: any; title: string; sub: string; cta?: string }> = {
  upcoming: {
    Icon: Calendar,
    title: 'No upcoming bookings',
    sub: 'Head to Chat to book a service',
    cta: 'Book a service',
  },
  past: {
    Icon: Clock,
    title: 'No past bookings',
    sub: 'Your completed bookings will appear here',
  },
  cancelled: {
    Icon: XCircle,
    title: 'No cancelled bookings',
    sub: "Good news — nothing's been cancelled!",
  },
};

// ── Segmented Control ────────────────────────────────────────────────
function SegmentedControl({
  active, onChange,
}: { active: BookingFilter; onChange: (f: BookingFilter) => void }) {
  return (
    <View style={s.segRow}>
      {SEGMENTS.map(({ key, label }) => {
        const isActive = key === active;
        return (
          <TouchableOpacity
            key={key}
            style={[s.seg, isActive && s.segActive]}
            onPress={() => onChange(key)}
            activeOpacity={0.7}
          >
            <Text style={[s.segText, isActive && s.segTextActive]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ── Empty component ──────────────────────────────────────────────────
function EmptyState({ filter, onCta }: { filter: BookingFilter; onCta?: () => void }) {
  const cfg = EMPTY[filter];
  const Icon = cfg.Icon;
  return (
    <View style={s.empty}>
      <View style={s.emptyCircle}>
        <Icon color={colors.textTertiary} size={48} strokeWidth={1.5} />
      </View>
      <Text style={s.emptyTitle}>{cfg.title}</Text>
      <Text style={s.emptySub}>{cfg.sub}</Text>
      {cfg.cta && onCta && (
        <TouchableOpacity style={s.ctaBtn} onPress={onCta} activeOpacity={0.8}>
          <Text style={s.ctaBtnText}>{cfg.cta}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ═════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═════════════════════════════════════════════════════════════════════
export default function BookingsScreen({ navigation }: any) {
  const { user } = useAuth();
  const nav = useNavigation<any>();
  const [filter, setFilter] = useState<BookingFilter>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Re-subscribe every time screen focuses or filter changes.
  // This picks up local changes (cancel) even without Firestore.
  useFocusEffect(
    useCallback(() => {
      if (!user) { setBookings([]); setLoading(false); return; }
      setLoading(true);

      const unsub = subscribeToBookings(
        user.uid,
        filter,
        (data) => { setBookings(data); setLoading(false); setRefreshing(false); },
        () => { setLoading(false); setRefreshing(false); },
      );

      return unsub;
    }, [user, filter]),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (!user) { setRefreshing(false); return; }
    subscribeToBookings(
      user.uid, filter,
      (data) => { setBookings(data); setRefreshing(false); },
      () => setRefreshing(false),
    );
  }, [user, filter]);

  const goToChat = () => {
    nav.navigate('ChatTab');
  };

  return (
    <ScreenWrapper
      title="My Bookings"
      rightAction={
        <TouchableOpacity>
          <Filter color={colors.textSecondary} size={20} />
        </TouchableOpacity>
      }
    >
      {/* Segmented control */}
      <SegmentedControl active={filter} onChange={setFilter} />

      {/* Loading */}
      {loading ? (
        <View style={s.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.booking_id}
          renderItem={({ item }) => (
            <BookingCard
              booking={item}
              onPress={() => navigation.navigate('BookingDetails', { booking: item })}
              onCancel={async () => {
                // Direct cancel — confirmed via long-press action sheet in BookingCard
                try {
                  await cancelBooking(item.booking_id);
                } catch {
                  Alert.alert('Error', 'Could not cancel booking. Please try again.');
                }
              }}
            />
          )}
          contentContainerStyle={s.list}
          ListEmptyComponent={<EmptyState filter={filter} onCta={filter === 'upcoming' ? goToChat : undefined} />}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}
    </ScreenWrapper>
  );
}

// ═════════════════════════════════════════════════════════════════════
// STYLES
// ═════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  // Segmented control
  segRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  seg: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.sm,
  },
  segActive: {
    backgroundColor: colors.background,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  segText: { ...typography.caption, color: colors.textTertiary, fontWeight: '600' },
  segTextActive: { color: colors.primary, fontWeight: '700' },

  // List
  list: { padding: spacing.lg, paddingBottom: 100 },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80 },

  // Empty
  empty: { alignItems: 'center', paddingTop: 80 },
  emptyCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyTitle: { ...typography.h2, color: colors.textPrimary, marginBottom: spacing.sm },
  emptySub: { ...typography.body, color: colors.textTertiary, textAlign: 'center', marginBottom: spacing.xxl },
  ctaBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    minHeight: 48,
    justifyContent: 'center',
  },
  ctaBtnText: { ...typography.button, color: colors.textInverse },
});
