import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, MapPin, Clock, ShieldCheck, Lightbulb } from 'lucide-react-native';
import { Provider } from '../types';

interface Props {
  provider: Provider;
  justification: string;
  onConfirm: () => void;
}

export default function ProviderCard({ provider, justification, onConfirm }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{provider.name}</Text>
        {provider.verified && (
          <View style={styles.badge}>
            <ShieldCheck color="#16A34A" size={14} style={{ marginRight: 4 }} />
            <Text style={styles.badgeText}>Verified</Text>
          </View>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <View style={styles.iconRow}>
            <Star color="#F59E0B" size={16} fill="#F59E0B" style={{ marginRight: 4 }} />
            <Text style={styles.statValue}>{provider.rating.toFixed(1)}</Text>
          </View>
          <Text style={styles.statLabel}>{provider.jobs_completed} jobs</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>₨ {provider.hourly_rate_pkr}</Text>
          <Text style={styles.statLabel}>per hour</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <View style={styles.iconRow}>
          <MapPin color="#64748B" size={16} style={{ marginRight: 6 }} />
          <Text style={styles.infoText}>{provider.area}, {provider.city}</Text>
        </View>
        {provider['distance_km' as keyof Provider] !== undefined && (
          <Text style={styles.infoText}>{(provider['distance_km' as keyof Provider] as number).toFixed(1)} km away</Text>
        )}
      </View>
      
      <View style={styles.infoRow}>
        <View style={styles.iconRow}>
          <Clock color="#64748B" size={16} style={{ marginRight: 6 }} />
          <Text style={styles.infoText}>Available: {new Date(provider.available_slots[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
      </View>

      <View style={styles.justificationBox}>
        <Lightbulb color="#166534" size={16} style={{ marginRight: 8, marginTop: 2 }} />
        <Text style={styles.justificationText}>{justification}</Text>
      </View>

      <TouchableOpacity onPress={onConfirm} style={styles.buttonWrapper}>
        <LinearGradient colors={['#10B981', '#059669']} style={styles.button}>
          <Text style={styles.buttonText}>Confirm Booking</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 19,
    fontWeight: '800',
    color: '#1E293B',
    flex: 1,
    letterSpacing: 0.2,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statBox: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  justificationBox: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  justificationText: {
    flex: 1,
    fontSize: 13,
    color: '#166534',
    fontStyle: 'italic',
    lineHeight: 20,
    fontWeight: '500',
  },
  buttonWrapper: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  button: {
    minHeight: 48,
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
