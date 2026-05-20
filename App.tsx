import React, { useEffect, useState } from 'react';
import { Platform, View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as ScreenOrientation from 'expo-screen-orientation';
import { 
  useFonts,
  Inter_400Regular, 
  Inter_500Medium, 
  Inter_600SemiBold, 
  Inter_700Bold 
} from '@expo-google-fonts/inter';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import NetInfo from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';

import { AuthProvider } from './src/contexts/AuthContext';
import RootNavigator from './src/navigation/RootNavigator';
import { colors } from './src/theme/colors';
import { typography } from './src/theme/typography';

// Custom navigation theme
const SaathiTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.background,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.danger,
  },
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

function OfflineBanner() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(!!state.isConnected);
    });
    return unsubscribe;
  }, []);

  if (isConnected) return null;

  return (
    <View style={s.offlineBanner}>
      <WifiOff color="#fff" size={16} />
      <Text style={s.offlineText}>No internet connection</Text>
    </View>
  );
}

function AppBootstrap() {
  useEffect(() => {
    async function setup() {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#16A34A',
        });
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        return;
      }
      
      try {
        await Notifications.getExpoPushTokenAsync({ projectId: "saathiai-demo" });
      } catch (e) {}
    }

    setup();
  }, []);

  return <RootNavigator />;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.surface }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <NavigationContainer theme={SaathiTheme}>
          <StatusBar style="dark" />
          <OfflineBanner />
          <AppBootstrap />
        </NavigationContainer>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

const s = StyleSheet.create({
  offlineBanner: {
    backgroundColor: colors.danger,
    paddingTop: Platform.OS === 'ios' ? 50 : 20, // Avoid safe area mostly
    paddingBottom: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    zIndex: 9999,
  },
  offlineText: {
    ...typography.caption,
    color: '#fff',
    fontWeight: '600',
  },
});
