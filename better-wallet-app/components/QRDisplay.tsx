import React from 'react';
import { View, StyleSheet } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';

interface QRDisplayProps {
  data: string;
  size?: number;
  title?: string;
  description?: string;
}

export function QRDisplay({ data, size = 250, title, description }: QRDisplayProps) {
  return (
    <ThemedView style={styles.container}>
      {title && (
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
      )}
      {description && (
        <ThemedText style={styles.description}>
          {description}
        </ThemedText>
      )}
      <View style={styles.qrContainer}>
        <QRCode
          value={data}
          size={size}
          backgroundColor="white"
          color="black"
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    marginBottom: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});

