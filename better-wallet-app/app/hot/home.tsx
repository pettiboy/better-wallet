import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, RefreshControl, ScrollView, Alert } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useDeviceMode } from '@/contexts/DeviceModeContext';
import { getBalance } from '@/services/ethereum';
import { router } from 'expo-router';

export default function HotHomeScreen() {
  const { walletAddress } = useDeviceMode();
  const [balance, setBalance] = useState<string>('0.0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (walletAddress) {
      loadBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletAddress]);

  const loadBalance = async () => {
    if (!walletAddress) return;
    
    setLoading(true);
    try {
      const bal = await getBalance(walletAddress);
      setBalance(bal);
    } catch (error) {
      console.error('Error loading balance:', error);
      Alert.alert('Error', 'Failed to load balance. Check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  if (!walletAddress) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Hot Wallet
        </ThemedText>
        <ThemedText style={styles.message}>
          No wallet connected. Please set up your cold wallet first.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ScrollView
      style={styles.scrollView}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadBalance} />
      }
    >
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Wallet
        </ThemedText>

        <View style={styles.balanceCard}>
          <ThemedText style={styles.balanceLabel}>Balance</ThemedText>
          <ThemedText type="title" style={styles.balanceAmount}>
            {parseFloat(balance).toFixed(4)} ETH
          </ThemedText>
          <ThemedText style={styles.network}>Sepolia Testnet</ThemedText>
        </View>

        <View style={styles.addressContainer}>
          <ThemedText style={styles.addressLabel}>Address</ThemedText>
          <ThemedText style={styles.address} numberOfLines={1} ellipsizeMode="middle">
            {walletAddress}
          </ThemedText>
        </View>

        <TouchableOpacity
          style={styles.sendButton}
          onPress={() => router.push('/hot/send')}
        >
          <Text style={styles.sendButtonText}>Send Transaction</Text>
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <ThemedText type="subtitle" style={styles.infoTitle}>
            How to Use
          </ThemedText>
          <ThemedText style={styles.infoText}>
            1. Create a transaction on this device
          </ThemedText>
          <ThemedText style={styles.infoText}>
            2. Show the QR code to your cold wallet
          </ThemedText>
          <ThemedText style={styles.infoText}>
            3. Sign it on the cold wallet (offline)
          </ThemedText>
          <ThemedText style={styles.infoText}>
            4. Scan the signed transaction back here
          </ThemedText>
          <ThemedText style={styles.infoText}>
            5. Broadcast to the network
          </ThemedText>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  balanceCard: {
    backgroundColor: '#007AFF',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
  },
  network: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 8,
  },
  addressContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  addressLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 6,
  },
  address: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  sendButton: {
    backgroundColor: '#34C759',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  sendButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  message: {
    textAlign: 'center',
    marginTop: 32,
  },
  infoSection: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 16,
    borderRadius: 12,
  },
  infoTitle: {
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },
});

