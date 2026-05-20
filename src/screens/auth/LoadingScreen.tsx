import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Sparkles } from 'lucide-react-native';
import { colors } from '../../theme/colors';

export default function LoadingScreen() {
  return (
    <View style={styles.container}>
      <Sparkles color={colors.primary} size={48} style={{ marginBottom: 24 }} />
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
