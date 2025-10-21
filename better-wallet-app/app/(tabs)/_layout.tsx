import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDeviceMode } from '@/contexts/DeviceModeContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { mode, isLoading } = useDeviceMode();

  if (isLoading) {
    return null;
  }

  // Setup mode - only show the index (setup) screen
  if (mode === 'setup') {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Setup',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            href: null, // Hide this tab in setup mode
          }}
        />
      </Tabs>
    );
  }

  // Cold wallet mode - show different tabs
  if (mode === 'cold') {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            href: null, // Hide in cold mode
          }}
        />
      </Tabs>
    );
  }

  // Hot wallet mode
  if (mode === 'hot') {
    return (
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Wallet',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="wallet.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Send',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
          }}
        />
      </Tabs>
    );
  }

  return null;
}
