import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, Star } from 'lucide-react-native';
import { Provider } from '../types';

interface Props {
  fallbackProvider: Provider;
  explanation: string;
  onAccept: () => void;
  onCancel: () => void;
}

export default function FallbackCard({ fallbackProvider, explanation, onAccept, onCancel }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.warningHeader}>
        <AlertTriangle color="#F59E0B" size={20} style={styles.warningIcon} />
        <Text style={styles.warningTitle}>Slot No Longer Available</Text>
      </View>
      
      <Text style={styles.explanationText}>{explanation}</Text>

      <View style={styles.providerInfo}>
        <Text style={styles.providerName}>{fallbackProvider.name}</Text>
        <View style={styles.providerDetailsRow}>
          <Star color="#F59E0B" size={14} fill="#F59E0B" style={{ marginRight: 4 }} />
          <Text style={styles.providerDetails}>{fallbackProvider.rating.toFixed(1)}  •  ₨ {fallbackProvider.hourly_rate_pkr}/hr</Text>
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onCancel}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onAccept} style={styles.acceptBtnWrapper}>
          <LinearGradient colors={['#F59E0B', '#D97706']} style={styles.buttonAccept}>
            <Text style={styles.acceptBtnText}>Yes, book this instead</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  warningIcon: {
    marginRight: 8,
  },
  warningTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#D97706',
    letterSpacing: 0.2,
  },
  explanationText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '500',
  },
  providerInfo: {
    backgroundColor: '#FFFBEB',
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  providerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 4,
  },
  providerDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerDetails: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  cancelBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flex: 0.35,
  },
  cancelBtnText: {
    color: '#64748B',
    fontWeight: '700',
    fontSize: 15,
  },
  acceptBtnWrapper: {
    flex: 0.6,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonAccept: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
});
