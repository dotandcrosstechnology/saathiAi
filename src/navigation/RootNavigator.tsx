import React, { useState, useEffect } from 'react';
import { DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

import { useAuth } from '../contexts/AuthContext';
import { db } from '../services/firebase';
import { colors } from '../theme/colors';

// Auth screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import SignInScreen from '../screens/auth/SignInScreen';
import LoadingScreen from '../screens/auth/LoadingScreen';

// Main tabs
import MainTabs from './MainTabs';

// Modal screens (above tabs)
import ReceiptScreen from '../screens/ReceiptScreen';
import TraceScreen from '../screens/TraceScreen';
import BookingDetailsScreen from '../screens/BookingDetailsScreen';
import ProviderDetailsScreen from '../screens/ProviderDetailsScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

const Stack = createNativeStackNavigator();



// ── Auth Stack ───────────────────────────────────────────────────────
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
    </Stack.Navigator>
  );
}

// ── Main Stack (Tabs + Modals) ───────────────────────────────────────
function MainStack() {
  const { user } = useAuth();
  const [unreadBookingsCount, setUnreadBookingsCount] = useState(0);

  // Listen to confirmed bookings not yet viewed for badge count
  useEffect(() => {
    if (!user) return;

    try {
      const bookingsRef = collection(db, 'bookings');
      const q = query(
        bookingsRef,
        where('userId', '==', user.uid),
        where('status', '==', 'confirmed'),
        where('viewed', '==', false)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          setUnreadBookingsCount(snapshot.size);
        },
        (error) => {
          // Silently handle — query may fail if index doesn't exist
          console.log('Bookings badge query error (expected if no index):', error.message);
          setUnreadBookingsCount(0);
        }
      );

      return unsubscribe;
    } catch (e) {
      console.log('Bookings badge setup error:', e);
    }
  }, [user]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs">
        {() => <MainTabs unreadBookingsCount={unreadBookingsCount} />}
      </Stack.Screen>

      {/* Modal screens above tabs */}
      <Stack.Screen
        name="Receipt"
        component={ReceiptScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Trace"
        component={TraceScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="BookingDetails"
        component={BookingDetailsScreen}
        options={{ presentation: 'card', animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ProviderDetails"
        component={ProviderDetailsScreen}
        options={{ presentation: 'card', animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ presentation: 'card', animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}

// ── Root Navigator ───────────────────────────────────────────────────
export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      {!user ? <AuthStack /> : <MainStack />}
      <StatusBar style={!user ? 'light' : 'dark'} />
    </>
  );
}
