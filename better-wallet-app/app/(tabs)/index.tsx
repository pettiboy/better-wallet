import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ScrollView, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useDeviceMode } from '@/contexts/DeviceModeContext';
import { QRScanner } from '@/components/QRScanner';
import { QRDisplay } from '@/components/QRDisplay';
import { generateWallet, storePrivateKey, hasWallet, loadPrivateKey, getAddress } from '@/services/wallet';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { mode, setMode, setWalletAddress } = useDeviceMode();

  // Setup mode
  if (mode === 'setup') {
    return <SetupScreen onSetupComplete={setMode} onAddressSet={setWalletAddress} />;
  }

  // Cold wallet mode
  if (mode === 'cold') {
    return <ColdHomeScreen />;
  }

  // Hot wallet mode
  if (mode === 'hot') {
    return <HotHomeScreenWrapper />;
  }

  return null;
}

function SetupScreen({ 
  onSetupComplete, 
  onAddressSet 
}: { 
  onSetupComplete: (mode: 'hot' | 'cold') => void;
  onAddressSet: (address: string) => void;
}) {
  const [scanning, setScanning] = useState(false);

  const handleColdWallet = async () => {
    try {
      // Check if wallet already exists
      const exists = await hasWallet();
      
      if (exists) {
        Alert.alert(
          'Wallet Exists',
          'A wallet already exists on this device. Continue?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Continue', 
              onPress: async () => {
                const privateKey = await loadPrivateKey();
                if (privateKey) {
                  const address = getAddress(privateKey);
                  onAddressSet(address);
                }
                onSetupComplete('cold');
              }
            },
          ]
        );
        return;
      }

      // Generate new wallet
      const wallet = await generateWallet();
      await storePrivateKey(wallet.privateKey, wallet.mnemonic);
      onAddressSet(wallet.address);
      
      Alert.alert(
        'Wallet Created',
        `Your wallet has been created securely. Address: ${wallet.address.substring(0, 10)}...`,
        [{ text: 'OK', onPress: () => onSetupComplete('cold') }]
      );
    } catch (error) {
      console.error('Error setting up cold wallet:', error);
      Alert.alert('Error', 'Failed to create wallet');
    }
  };

  const handleHotWallet = () => {
    setScanning(true);
  };

  const handleScan = (data: string) => {
    setScanning(false);
    
    // The scanned data should be an Ethereum address
    if (data.startsWith('0x') && data.length === 42) {
      onAddressSet(data);
      onSetupComplete('hot');
      Alert.alert('Success', `Connected to wallet: ${data.substring(0, 10)}...`);
    } else {
      Alert.alert('Error', 'Invalid address QR code');
    }
  };

  if (scanning) {
    return (
      <QRScanner
        title="Scan Cold Wallet Address"
        onScan={handleScan}
        onClose={() => setScanning(false)}
      />
    );
  }

  return (
    <ScrollView style={styles.scrollView}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Better Wallet
        </ThemedText>

        <ThemedText style={styles.subtitle}>
          Turn your smartphone into an air-gapped hardware wallet
        </ThemedText>

        <View style={styles.explanationBox}>
          <ThemedText type="subtitle" style={styles.explanationTitle}>
            How It Works
          </ThemedText>
          <ThemedText style={styles.explanationText}>
            • <ThemedText type="defaultSemiBold">Cold Wallet:</ThemedText> Stores private keys offline, signs transactions
          </ThemedText>
          <ThemedText style={styles.explanationText}>
            • <ThemedText type="defaultSemiBold">Hot Wallet:</ThemedText> Connects to blockchain, broadcasts transactions
          </ThemedText>
          <ThemedText style={styles.explanationText}>
            • Communication via QR codes only
          </ThemedText>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.coldButton} onPress={handleColdWallet}>
            <Text style={styles.buttonIcon}>🔒</Text>
            <Text style={styles.buttonTitle}>Cold Wallet</Text>
            <Text style={styles.buttonSubtitle}>Store keys offline (Old Phone)</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.hotButton} onPress={handleHotWallet}>
            <Text style={styles.buttonIcon}>📱</Text>
            <Text style={styles.buttonTitle}>Hot Wallet</Text>
            <Text style={styles.buttonSubtitle}>Connect to blockchain (Main Phone)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.securityNote}>
          <ThemedText style={styles.securityText}>
            ⚠️ For maximum security, use a dedicated offline device as your cold wallet
          </ThemedText>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

function ColdHomeScreen() {
  const { walletAddress } = useDeviceMode();
  const [showQR, setShowQR] = useState(false);

  const handleShowAddress = () => {
    setShowQR(true);
  };

  if (showQR && walletAddress) {
    return (
      <ThemedView style={styles.container}>
        <QRDisplay
          data={walletAddress}
          title="Your Wallet Address"
          description="Scan this with your hot wallet"
          size={280}
        />
        <TouchableOpacity style={styles.button} onPress={() => setShowQR(false)}>
          <Text style={styles.buttonText}>Hide QR Code</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Cold Wallet
      </ThemedText>

      <View style={styles.offlineIndicator}>
        <ThemedText style={styles.offlineText}>✈️ OFFLINE MODE</ThemedText>
      </View>

      <View style={styles.addressContainer}>
        <ThemedText style={styles.addressLabel}>Your Address:</ThemedText>
        <ThemedText style={styles.address}>{walletAddress}</ThemedText>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={handleShowAddress}
        >
          <Text style={styles.primaryButtonText}>Show Address QR</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => router.push('/cold/sign')}
        >
          <Text style={styles.primaryButtonText}>Sign Transaction</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => router.push('/cold/settings')}
        >
          <Text style={styles.secondaryButtonText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

function HotHomeScreenWrapper() {
  // Import the hot home screen component
  const HotHomeContent = require('../hot/home').default;
  return <HotHomeContent />;
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  explanationBox: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
  },
  explanationTitle: {
    marginBottom: 12,
  },
  explanationText: {
    marginBottom: 8,
    lineHeight: 22,
  },
  buttonContainer: {
    gap: 16,
    marginBottom: 24,
  },
  coldButton: {
    backgroundColor: '#FF9500',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  hotButton: {
    backgroundColor: '#007AFF',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  buttonTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  buttonSubtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textAlign: 'center',
  },
  securityNote: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 8,
  },
  securityText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  offlineIndicator: {
    backgroundColor: '#FF9500',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  offlineText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
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
  actionButtons: {
    gap: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
