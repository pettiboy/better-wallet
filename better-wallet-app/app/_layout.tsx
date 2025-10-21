import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { DeviceModeProvider } from '@/contexts/DeviceModeContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <DeviceModeProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          <Stack.Screen name="cold/sign" options={{ title: 'Sign Transaction' }} />
          <Stack.Screen name="cold/settings" options={{ title: 'Settings' }} />
          <Stack.Screen name="hot/home" options={{ title: 'Wallet' }} />
          <Stack.Screen name="hot/send" options={{ title: 'Send' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </DeviceModeProvider>
  );
}
