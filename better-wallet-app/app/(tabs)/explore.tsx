import React from 'react';
import { useDeviceMode } from '@/contexts/DeviceModeContext';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { StyleSheet } from 'react-native';

export default function ExploreScreen() {
  const { mode } = useDeviceMode();
  
  // Only show send screen in hot wallet mode
  if (mode === 'hot') {
    const HotSendContent = require('../hot/send').default;
    return <HotSendContent />;
  }

  // For other modes, show placeholder
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Not Available
      </ThemedText>
      <ThemedText style={styles.message}>
        This feature is only available in hot wallet mode.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 16,
  },
  message: {
    textAlign: 'center',
    opacity: 0.7,
  },
});
