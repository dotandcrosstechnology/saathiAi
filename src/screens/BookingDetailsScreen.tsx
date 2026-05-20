import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert,
  Platform, ActivityIndicator,
} from 'react-native';
import {
  ArrowLeft, CheckCircle, Clock, AlertCircle, Hourglass, XCircle,
  Star, Phone, MessageCircle, MapPin, Navigation, Copy, ChevronRight,
  Zap, Droplets, Wind,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


import { Booking } from '../types';
import { cancelBooking } from '../services/bookings';
import { formatFull, formatRelative } from '../utils/dateFormat';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, radius, shadows } from '../theme/spacing';

// ── Status hero config ───────────────────────────────────────────────
const STATUS_HERO: Record<string, { Icon: any; color: string; bg: string; label: string }> = {
  confirmed:   { Icon: CheckCircle, color: colors.accent,       bg: colors.accentLight,  label: 'Confirmed' },
  reminded:    { Icon: Clock,       color: colors.info,         bg: '#DBEAFE',           label: 'Reminded' },
  in_progress: { Icon: Hourglass,   color: colors.warning,      bg: colors.warningLight,  label: 'In Progress' },
  completed:   { Icon: CheckCircle, color: colors.textTertiary, bg: colors.surface,       label: 'Completed' },
  cancelled:   { Icon: XCircle,     color: colors.danger,       bg: colors.dangerLight,   label: 'Cancelled' },
};

function serviceLabel(type: string): string {
  switch (type) {
    case 'electrician':   return 'Electrician';
    case 'plumber':       return 'Plumber';
    case 'ac_technician': return 'AC Technician';
    default:              return type;
  }
}

function ServiceIcon({ type, size = 18 }: { type: string; size?: number }) {
  const c = colors.primary;
  switch (type) {
    case 'electrician':   return <Zap color={c} size={size} />;
    case 'plumber':       return <Droplets color={c} size={size} />;
    case 'ac_technician': return <Wind color={c} size={size} />;
    default:              return <Zap color={c} size={size} />;
  }
}

// ── Section card wrapper ─────────────────────────────────────────────
function Section({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <View style={s.section}>
      {title && <Text style={s.sectionTitle}>{title}</Text>}
      {children}
    </View>
  );
}

// ── Info row ─────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, right }: {
  icon: React.ReactNode; label: string; value: string; right?: React.ReactNode;
}) {
  return (
    <View style={s.infoRow}>
      {icon}
      <View style={s.infoContent}>
        <Text style={s.infoLabel}>{label}</Text>
        <Text style={s.infoValue}>{value}</Text>
      </View>
      {right}
    </View>
  );
}

// ═════════════════════════════════════════════════════════════════════
export default function BookingDetailsScreen({ navigation, route }: any) {
  const booking: Booking | undefined = route.params?.booking;

  if (!booking) {
    return (
      <SafeAreaView style={s.root}>
        <Text style={s.errText}>Booking not found</Text>
      </SafeAreaView>
    );
  }

  const receipt = booking.receipt_data as any;
  const hero = STATUS_HERO[booking.status] || STATUS_HERO.confirmed;
  const HeroIcon = hero.Icon;
  const provName = receipt?.provider_name || 'Service Provider';
  const rating = receipt?.rating || 4.8;
  const hourly = receipt?.hourly_rate_pkr || 1500;
  const hours = receipt?.estimated_hours || 2;
  const total = receipt?.total_pkr || hourly * hours;
  const area = receipt?.area || 'G-13';
  const city = receipt?.city || 'Islamabad';
  const address = receipt?.full_address || `${area}, ${city}`;

  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const copyId = async () => {
    Alert.alert('Booking ID', booking.booking_id);
  };

  const doCancel = async () => {
    setCancelling(true);
    try {
      await cancelBooking(booking.booking_id);
      navigation.goBack();
    } catch {
      setCancelling(false);
      setConfirmCancel(false);
    }
  };

  return (
    <SafeAreaView style={s.root}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <ArrowLeft color={colors.textPrimary} size={22} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Booking Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Hero status ───────────────────────────────────────── */}
        <View style={[s.heroCard, { borderColor: hero.color + '30' }]}>
          <View style={[s.heroCircle, { backgroundColor: hero.bg }]}>
            <HeroIcon color={hero.color} size={36} />
          </View>
          <Text style={[s.heroLabel, { color: hero.color }]}>{hero.label}</Text>
          <Text style={s.heroService}>{serviceLabel(booking.service_type)} Service</Text>
        </View>

        {/* ── Provider section ──────────────────────────────────── */}
        <Section title="PROVIDER">
          <View style={s.provRow}>
            <View style={s.provAvatar}>
              <Text style={s.provInitial}>{provName[0]}</Text>
            </View>
            <View style={s.provInfo}>
              <Text style={s.provName}>{provName}</Text>
              <View style={s.ratingRow}>
                <Star color={colors.warning} size={14} fill={colors.warning} />
                <Text style={s.ratingText}>{rating.toFixed(1)}</Text>
              </View>
            </View>
          </View>
          <View style={s.actionBtns}>
            <TouchableOpacity style={s.actionBtn} activeOpacity={0.7}>
              <Phone color={colors.primary} size={18} />
              <Text style={s.actionBtnText}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.actionBtn} activeOpacity={0.7}>
              <MessageCircle color={colors.primary} size={18} />
              <Text style={s.actionBtnText}>Message</Text>
            </TouchableOpacity>
          </View>
        </Section>

        {/* ── Service details ──────────────────────────────────── */}
        <Section title="SERVICE DETAILS">
          <InfoRow
            icon={<ServiceIcon type={booking.service_type} />}
            label="Service Type"
            value={serviceLabel(booking.service_type)}
          />
          <InfoRow
            icon={<Clock color={colors.textTertiary} size={18} />}
            label="Scheduled"
            value={formatFull(booking.scheduled_iso)}
          />
          <InfoRow
            icon={<Hourglass color={colors.textTertiary} size={18} />}
            label="Estimated Duration"
            value={`${hours} hour${hours > 1 ? 's' : ''}`}
          />
        </Section>

        {/* ── Location ─────────────────────────────────────────── */}
        <Section title="LOCATION">
          <InfoRow
            icon={<MapPin color={colors.textTertiary} size={18} />}
            label="Address"
            value={address}
            right={
              <TouchableOpacity style={s.dirBtn} activeOpacity={0.7}>
                <Navigation color={colors.primary} size={14} />
                <Text style={s.dirText}>Directions</Text>
              </TouchableOpacity>
            }
          />
        </Section>

        {/* ── Price breakdown ──────────────────────────────────── */}
        <Section title="PRICE BREAKDOWN">
          <View style={s.priceRow}>
            <Text style={s.priceLabel}>Base service rate</Text>
            <Text style={s.priceVal}>Rs {hourly.toLocaleString()}/hr</Text>
          </View>
          <View style={s.priceRow}>
            <Text style={s.priceLabel}>Estimated hours</Text>
            <Text style={s.priceVal}>{hours}</Text>
          </View>
          <View style={s.priceDivider} />
          <View style={s.priceRow}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={s.totalVal}>Rs {total.toLocaleString()}</Text>
          </View>
        </Section>

        {/* ── Booking ID ───────────────────────────────────────── */}
        <TouchableOpacity style={s.idRow} onPress={copyId} activeOpacity={0.6}>
          <Text style={s.idLabel}>Booking ID</Text>
          <View style={s.idVal}>
            <Text style={s.idText}>{booking.booking_id}</Text>
            <Copy color={colors.textTertiary} size={14} />
          </View>
        </TouchableOpacity>

        {/* ── Trace link — only shown when trace is available ──── */}
        {receipt?.trace && (
          <TouchableOpacity
            style={s.traceLink}
            onPress={() => navigation.navigate('Trace', { trace: receipt.trace })}
            activeOpacity={0.7}
          >
            <Text style={s.traceLinkText}>View Agent Reasoning Trace</Text>
            <ChevronRight color={colors.primary} size={16} />
          </TouchableOpacity>
        )}

      </ScrollView>

      {/* ── Bottom action bar ──────────────────────────────────── */}
      {booking.status !== 'completed' && booking.status !== 'cancelled' && (
        <View style={s.bottomBar}>
          {confirmCancel ? (
            <View style={s.confirmRow}>
              <Text style={s.confirmText}>Cancel this booking?</Text>
              <View style={s.confirmBtns}>
                <TouchableOpacity
                  style={s.keepBtn}
                  onPress={() => setConfirmCancel(false)}
                  activeOpacity={0.7}
                  disabled={cancelling}
                >
                  <Text style={s.keepBtnText}>Keep</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={s.confirmCancelBtn}
                  onPress={doCancel}
                  activeOpacity={0.7}
                  disabled={cancelling}
                >
                  {cancelling
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <Text style={s.confirmCancelBtnText}>Yes, Cancel</Text>}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={s.cancelBtn}
              onPress={() => setConfirmCancel(true)}
              activeOpacity={0.7}
            >
              <Text style={s.cancelBtnText}>Cancel Booking</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

// ═════════════════════════════════════════════════════════════════════
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.surface },
  header: { height: 44, backgroundColor: colors.background, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.md },
  backBtn: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { ...typography.h2, color: colors.textPrimary },
  errText: { ...typography.body, color: colors.textTertiary, textAlign: 'center', marginTop: 100 },
  scroll: { padding: spacing.lg, paddingBottom: 120 },

  // Hero
  heroCard: { backgroundColor: colors.background, borderRadius: radius.lg, padding: spacing.xxl, alignItems: 'center', marginBottom: spacing.lg, borderWidth: 1, ...shadows.sm },
  heroCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  heroLabel: { ...typography.label, marginBottom: spacing.xs },
  heroService: { ...typography.h2, color: colors.textPrimary },

  // Section
  section: { backgroundColor: colors.background, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, ...shadows.sm },
  sectionTitle: { ...typography.label, color: colors.textTertiary, marginBottom: spacing.lg },

  // Provider
  provRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  provAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginRight: spacing.md },
  provInitial: { fontSize: 20, fontWeight: '700', color: colors.textInverse },
  provInfo: { flex: 1 },
  provName: { ...typography.h3, color: colors.textPrimary },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  ratingText: { ...typography.body, fontWeight: '600', color: colors.textPrimary },
  actionBtns: { flexDirection: 'row', gap: spacing.sm },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, minHeight: 44 },
  actionBtnText: { ...typography.body, color: colors.primary, fontWeight: '600' },

  // Info rows
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.lg },
  infoContent: { flex: 1 },
  infoLabel: { ...typography.caption, color: colors.textTertiary },
  infoValue: { ...typography.body, color: colors.textPrimary, fontWeight: '500', marginTop: 2 },
  dirBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.full, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  dirText: { ...typography.caption, color: colors.primary, fontWeight: '600' },

  // Price
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  priceLabel: { ...typography.body, color: colors.textSecondary },
  priceVal: { ...typography.body, color: colors.textPrimary, fontWeight: '500' },
  priceDivider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.sm },
  totalLabel: { ...typography.h3, color: colors.textPrimary },
  totalVal: { ...typography.h2, color: colors.primary },

  // Booking ID
  idRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.background, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  idLabel: { ...typography.caption, color: colors.textTertiary },
  idVal: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  idText: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, color: colors.textSecondary },

  // Trace link
  traceLink: { flexDirection: 'row', alignSelf: 'center', alignItems: 'center', gap: 4, paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, backgroundColor: colors.surface, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.xl, minHeight: 44 },
  traceLinkText: { ...typography.caption, color: colors.primary, fontWeight: '700' },

  // Bottom bar
  bottomBar: { backgroundColor: colors.background, borderTopWidth: 1, borderTopColor: colors.border, padding: spacing.lg },
  cancelBtn: { borderWidth: 1.5, borderColor: colors.danger, borderRadius: radius.md, paddingVertical: spacing.md, alignItems: 'center', minHeight: 48 },
  cancelBtnText: { ...typography.button, color: colors.danger },

  // Inline confirm
  confirmRow: { gap: spacing.sm },
  confirmText: { ...typography.body, color: colors.danger, fontWeight: '700', textAlign: 'center', marginBottom: spacing.xs },
  confirmBtns: { flexDirection: 'row', gap: spacing.sm },
  keepBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.borderStrong, alignItems: 'center', backgroundColor: colors.surface, minHeight: 44, justifyContent: 'center' },
  keepBtnText: { ...typography.button, color: colors.textSecondary, fontSize: 14 },
  confirmCancelBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, backgroundColor: colors.danger, alignItems: 'center', minHeight: 44, justifyContent: 'center' },
  confirmCancelBtnText: { ...typography.button, color: '#fff', fontSize: 14 },
});
