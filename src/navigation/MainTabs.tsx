import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MessageCircle, Calendar, User } from 'lucide-react-native';

import ChatScreen from '../screens/ChatScreen';
import BookingsScreen from '../screens/BookingsScreen';
import ProfileScreen from '../screens/ProfileScreen';

import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const Tab = createBottomTabNavigator();

// ── Animated tab icon with scale transition ──────────────────────────
interface TabIconProps {
  IconComponent: typeof MessageCircle;
  focused: boolean;
  color: string;
  size: number;
  badge?: number;
}

const TabIcon = ({ IconComponent, focused, color, size, badge }: TabIconProps) => {
  const scaleAnim = useRef(new Animated.Value(focused ? 1.1 : 1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: focused ? 1.1 : 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [focused, scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <IconComponent color={color} size={size} strokeWidth={focused ? 2.5 : 2} />
      {badge !== undefined && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      )}
    </Animated.View>
  );
};

// ── Main Tab Navigator ───────────────────────────────────────────────
interface MainTabsProps {
  unreadBookingsCount?: number;
}

export default function MainTabs({ unreadBookingsCount = 0 }: MainTabsProps) {
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = 64 + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: {
          ...typography.caption,
          fontWeight: '600',
          marginTop: -2,
        },
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          height: TAB_BAR_HEIGHT,
          paddingTop: 8,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          // Inverted shadow (top edge)
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
            },
            android: {
              elevation: 8,
            },
          }),
        },
      }}
    >
      <Tab.Screen
        name="ChatTab"
        component={ChatScreen}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              IconComponent={MessageCircle}
              focused={focused}
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tab.Screen
        name="BookingsTab"
        component={BookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              IconComponent={Calendar}
              focused={focused}
              color={color}
              size={size}
              badge={unreadBookingsCount}
            />
          ),
        }}
      />

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              IconComponent={User}
              focused={focused}
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// ── Styles ───────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: -6,
    right: -10,
    backgroundColor: colors.danger,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.background,
  },
  badgeText: {
    color: colors.textInverse,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 12,
  },
});
