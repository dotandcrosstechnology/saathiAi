import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  CheckCircle, Star, MapPin, Calendar, Clock, Sparkles,
  Shield, Bell,
} from 'lucide-react-native';
import { Booking, Provider } from '../types';

export default function ReceiptScreen({ route, navigation }: any) {
  const booking: Booking | undefined = route?.params?.booking;
  const provider: (Provider & { score?: number; justification?: string; distance_km?: number }) | undefined =
    route?.params?.provider;

  // Derive display values — prefer live booking/provider data, fall back gracefully
  const providerName  = provider?.name    || (booking?.receipt_data?.provider_name as string) || 'Provider';
  const scheduledTime = booking?.scheduled_iso || (booking?.receipt_data?.time as string) || '';
  const pricePerHour  = provider?.hourly_rate_pkr || (booking?.receipt_data?.price as number) || 0;
  const bookingId     = booking?.booking_id || (booking?.receipt_data?.booking_id as string) || '—';
  const serviceType   = booking?.service_type?.replace(/_/g, ' ') || 'Service';
  const areaLabel     = provider ? `${provider.area}, ${provider.city}` : '';
  const ratingVal     = provider?.rating;
  const isVerified    = provider?.verified;
  const scorePercent  = provider?.score ? Math.round(provider.score * 100) : null;

  const timeFormatted = scheduledTime
    ? new Date(scheduledTime).toLocaleString('en-PK', {
        weekday: 'long', day: 'numeric', month: 'long',
        hour: 'numeric', minute: '2-digit', hour12: true,
      })
    : '—';

  return (
    <LinearGradient colors={['#1F3A5F', '#16A34A']} style={styles.container}>
      <SafeAreaView style={styles.safe}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.ticket}>
            {/* ── TOP ── */}
            <View style={styles.ticketTop}>
              <View style={styles.successRing}>
                <CheckCircle color="#10B981" size={44} strokeWidth={2} />
              </View>

              <Text style={styles.title}>Booking Confirmed!</Text>
              <Text style={styles.subtitle}>
                SaathiAI has scheduled your {serviceType}.
              </Text>

              {/* AI-match badge */}
              {scorePercent && (
                <View style={styles.matchBadge}>
                  <Sparkles color="#7C3AED" size={12} />
                  <Text style={styles.matchBadgeText}>AI Match Score: {scorePercent}%</Text>
                </View>
              )}
            </View>

            {/* ── DIVIDER ── */}
            <View style={styles.dividerContainer}>
              <View style={styles.cutoutLeft} />
              <View style={styles.dashedLine} />
              <View style={styles.cutoutRight} />
            </View>

            {/* ── BOTTOM ── */}
            <View style={styles.ticketBottom}>

              {/* Provider name + verified */}
              <View style={styles.providerRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.providerName}>{providerName}</Text>
                  <Text style={styles.serviceLabel}>{serviceType}</Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  {isVerified && (
                    <View style={styles.verifiedPill}>
                      <Shield color="#15803D" size={11} />
                      <Text style={styles.verifiedText}>Verified</Text>
                    </View>
                  )}
                  {ratingVal && (
                    <View style={styles.ratingRow}>
                      <Star color="#F59E0B" size={13} fill="#F59E0B" />
                      <Text style={styles.ratingText}>{ratingVal.toFixed(1)}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Details grid */}
              <View style={styles.detailsBox}>
                {[
                  { icon: Calendar, label: 'Scheduled',  value: timeFormatted },
                  { icon: Clock,    label: 'Rate',        value: `Rs ${pricePerHour.toLocaleString()} / hr` },
                  ...(areaLabel ? [{ icon: MapPin, label: 'Location', value: areaLabel }] : []),
                  { icon: Bell,     label: 'Reminder',    value: '1 hour before arrival' },
                  { icon: Sparkles, label: 'Booking ID',  value: bookingId },
                ].map(({ icon: Icon, label, value }, i, arr) => (
                  <View key={label} style={[styles.detailRow, i === arr.length - 1 && styles.lastRow]}>
                    <View style={styles.detailLeft}>
                      <Icon color="#94A3B8" size={14} />
                      <Text style={styles.detailLabel}>{label}</Text>
                    </View>
                    <Text style={styles.detailValue} numberOfLines={2}>{value}</Text>
                  </View>
                ))}
              </View>

              {/* Justification from AI */}
              {provider?.justification && (
                <View style={styles.justifBox}>
                  <Sparkles color="#7C3AED" size={12} />
                  <Text style={styles.justifText}>{provider.justification}</Text>
                </View>
              )}

              <Text style={styles.footnote}>
                🔔 A reminder notification has been scheduled for 1 hour before your appointment.
              </Text>

              <TouchableOpacity
                onPress={() => navigation.popToTop()}
                style={styles.doneBtn}
                activeOpacity={0.85}
              >
                <LinearGradient colors={['#1F3A5F', '#2C5282']} style={styles.doneBtnGradient}>
                  <Text style={styles.doneBtnText}>Done</Text>
                </LinearGradient>
              </TouchableOpacity>

            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },

  ticket: {
    backgroundColor: '#fff',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
  },

  // Top section
  ticketTop: {
    padding: 32, alignItems: 'center', backgroundColor: '#fff',
  },
  successRing: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#10B981', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25, shadowRadius: 10, elevation: 6,
  },
  title: {
    fontSize: 26, fontWeight: '900', color: '#0F172A',
    marginBottom: 6, letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 15, color: '#64748B', fontWeight: '500', textAlign: 'center',
  },
  matchBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginTop: 12,
  },
  matchBadgeText: { fontSize: 12, fontWeight: '700', color: '#7C3AED' },

  // Divider
  dividerContainer: {
    flexDirection: 'row', alignItems: 'center', height: 30,
    backgroundColor: '#fff', position: 'relative', zIndex: 10,
  },
  cutoutLeft: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#1F3A5F',
    position: 'absolute', left: -15,
  },
  cutoutRight: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#16A34A',
    position: 'absolute', right: -15,
  },
  dashedLine: {
    flex: 1, height: 1.5,
    borderWidth: 1, borderColor: '#E2E8F0',
    borderStyle: 'dashed', marginHorizontal: 15,
  },

  // Bottom section
  ticketBottom: { padding: 24, backgroundColor: '#fff' },

  providerRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    marginBottom: 18, gap: 8,
  },
  providerName: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginBottom: 2 },
  serviceLabel: { fontSize: 13, color: '#64748B', fontWeight: '500', textTransform: 'capitalize' },
  verifiedPill: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12,
  },
  verifiedText: { fontSize: 11, fontWeight: '700', color: '#15803D' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { fontSize: 13, fontWeight: '700', color: '#0F172A' },

  detailsBox: {
    backgroundColor: '#F8FAFC', borderRadius: 16, padding: 4,
    borderWidth: 1, borderColor: '#F1F5F9', marginBottom: 18,
  },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 12,
    borderBottomWidth: 1, borderBottomColor: '#E2E8F0',
  },
  lastRow: { borderBottomWidth: 0 },
  detailLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailLabel: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  detailValue: { fontSize: 13, fontWeight: '700', color: '#0F172A', maxWidth: '55%', textAlign: 'right' },

  justifBox: {
    flexDirection: 'row', gap: 8, alignItems: 'flex-start',
    backgroundColor: '#F5F3FF', borderRadius: 12, padding: 12, marginBottom: 16,
    borderLeftWidth: 3, borderLeftColor: '#7C3AED',
  },
  justifText: { flex: 1, fontSize: 13, color: '#4C1D95', fontStyle: 'italic', lineHeight: 18 },

  footnote: {
    fontSize: 12, color: '#94A3B8', fontStyle: 'italic',
    marginBottom: 20, textAlign: 'center', lineHeight: 18,
  },

  doneBtn: {
    shadowColor: '#1F3A5F', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
  },
  doneBtnGradient: {
    borderRadius: 16, paddingVertical: 16, alignItems: 'center',
  },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});
