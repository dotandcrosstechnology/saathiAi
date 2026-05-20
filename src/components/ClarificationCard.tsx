import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, MapPin } from 'lucide-react-native';

interface Props {
  question: string;
  onProvide: (text: string) => void;
}

export default function ClarificationCard({ question, onProvide }: Props) {
  const [text, setText] = useState('');

  return (
    <View style={styles.card}>
      <Text style={styles.questionText}>{question}</Text>
      
      <View style={styles.chipsContainer}>
        <TouchableOpacity style={styles.chip} onPress={() => onProvide('Gulberg, Lahore')}>
          <MapPin color="#4F46E5" size={14} style={{ marginRight: 6 }} />
          <Text style={styles.chipText}>Gulberg, Lahore</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.chip} onPress={() => onProvide('G-13, Islamabad')}>
          <MapPin color="#4F46E5" size={14} style={{ marginRight: 6 }} />
          <Text style={styles.chipText}>G-13, Islamabad</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Type your area..."
          placeholderTextColor="#94A3B8"
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity 
          style={styles.sendBtn}
          onPress={() => text.trim() && onProvide(text)}
          disabled={!text.trim()}
        >
          <LinearGradient
            colors={text.trim() ? ['#4F46E5', '#7C3AED'] : ['#E2E8F0', '#E2E8F0']}
            style={styles.sendGradient}
          >
            <Send color={text.trim() ? "#FFF" : "#94A3B8"} size={16} />
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
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  questionText: {
    fontSize: 15,
    color: '#1E293B',
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '500',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    minHeight: 44,
  },
  chipText: {
    color: '#4F46E5',
    fontWeight: '600',
    fontSize: 13,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 48,
    fontSize: 14,
    color: '#334155',
    marginRight: 8,
  },
  sendBtn: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  sendGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
