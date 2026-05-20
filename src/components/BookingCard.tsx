import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActionSheetIOS, Platform, Alert,
} from 'react-native';
import { Zap, Droplets, Wind, ChevronRight } from 'lucide-react-native';
import { Booking } from '../types';
import { formatRelative } from '../utils/dateFormat';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, radius, shadows } from '../theme/spacing';

// ── Status config ────────────────────────────────────────────────────
const STATUS = {
  confirmed:   { label: 'Confirmed',   color: colors.accent,  bg: colors.accentLight },
  reminded:    { label: 'Reminded',    color: colors.info,    bg: '#DBEAFE' },
  in_progress: { label: 'In Progress', color: colors.warning, bg: colors.warningLight },
  completed:   { label: 'Completed',   color: colors.textTertiary, bg: colors.surface },
  cancelled:   { label: 'Cancelled',   color: colors.danger,  bg: colors.dangerLight },
} as const;

// ── Service icon ─────────────────────────────────────────────────────
function ServiceIcon({ type }: { type: string }) {
  const size = 18;
  const color = colors.primary;
  switch (type) {
    case 'electrician':  return <Zap color={color} size={size} />;
    case 'plumber':      return <Droplets color={color} size={size} />;
    case 'ac_technician': return <Wind color={color} size={size} />;
    default:             return <Zap color={color} size={size} />;
  }
}

// ── Service label ────────────────────────────────────────────────────
function serviceLabel(type: string): string {
  switch (type) {
    case 'electrician':   return 'Electrician';
    case 'plumber':       return 'Plumber';
    case 'ac_technician': return 'AC Technician';
    default:              return type;
  }
}

// ── Action sheet on long press ───────────────────────────────────────
function showActions(onCancel?: () => void) {
  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      { options: ['Dismiss', 'Cancel Booking'], destructiveButtonIndex: 1, cancelButtonIndex: 0 },
      (i) => { if (i === 1) onCancel?.(); },
    );
  } else {
    Alert.alert('Booking Actions', '', [
      { text: 'Cancel Booking', style: 'destructive', onPress: () => onCancel?.() },
      { text: 'Dismiss', style: 'cancel' },
    ]);
  }
}

// ── Component ────────────────────────────────────────────────────────
interface Props {
  booking: Booking;
  providerName?: string;
  price?: number;
  onPress: () => void;
  onCancel?: () => void;
}

export default function BookingCard({ booking, providerName, price, onPress, onCancel }: Props) {
  const st = STATUS[booking.status] || STATUS.confirmed;
  const receipt = booking.receipt_data as any;
  const name = providerName || receipt?.provider_name || 'Service Provider';
  const amount = price || receipt?.total_pkr || receipt?.hourly_rate_pkr || 1500;
  const canCancel = booking.status !== 'completed' && booking.status !== 'cancelled';

  return (
    <TouchableOpacity
      style={s.card}
      onPress={onPress}
      onLongPress={canCancel ? () => showActions(onCancel) : undefined}
      activeOpacity={0.7}
      delayLongPress={400}
    >
      {/* Top row: provider + status */}
      <View style={s.topRow}>
        <Text style={s.provName} numberOfLines={1}>{name}</Text>
        <View style={[s.pill, { backgroundColor: st.bg }]}>
          <Text style={[s.pillText, { color: st.color }]}>{st.label}</Text>
        </View>
      </View>

      {/* Service type */}
      <View style={s.serviceRow}>
        <ServiceIcon type={booking.service_type} />
        <Text style={s.serviceText}>{serviceLabel(booking.service_type)}</Text>
      </View>

      {/* Date/time */}
      <Text style={s.dateText}>{formatRelative(booking.scheduled_iso)}</Text>

      {/* Divider */}
      <View style={s.divider} />

      {/* Bottom: price + arrow */}
      <View style={s.bottomRow}>
        <Text style={s.price}>Rs {amount.toLocaleString()}</Text>
        <View style={s.tapHint}>
          <Text style={s.tapText}>View details</Text>
          <ChevronRight color={colors.textTertiary} size={14} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ── Styles ───────────────────────────────────────────────────────────
const s = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  provName: { ...typography.h3, color: colors.textPrimary, flex: 1, marginRight: spacing.sm },
  pill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  pillText: { ...typography.caption, fontWeight: '700' },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  serviceText: { ...typography.body, color: colors.textSecondary },
  dateText: { ...typography.bodySmall, color: colors.textTertiary, marginBottom: spacing.md },
  divider: { height: 1, backgroundColor: colors.border },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  price: { ...typography.h3, color: colors.primary },
  tapHint: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  tapText: { ...typography.caption, color: colors.textTertiary },
});
