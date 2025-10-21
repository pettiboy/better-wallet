import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert, ScrollView } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { QRDisplay } from '@/components/QRDisplay';
import { loadPrivateKey, loadMnemonic, getAddress } from '@/services/wallet';
import { useDeviceMode } from '@/contexts/DeviceModeContext';

export default function SettingsScreen() {
  const [address, setAddress] = useState<string>('');
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [mnemonic, setMnemonic] = useState<string>('');
  const { walletAddress } = useDeviceMode();

  useEffect(() => {
    loadWalletInfo();
  }, []);

  const loadWalletInfo = async () => {
    try {
      const privateKey = await loadPrivateKey();
      if (privateKey) {
        const addr = getAddress(privateKey);
        setAddress(addr);
      }
    } catch (error) {
      console.error('Error loading wallet info:', error);
    }
  };

  const handleShowMnemonic = async () => {
    try {
      const mnemonicPhrase = await loadMnemonic();
      if (mnemonicPhrase) {
        setMnemonic(mnemonicPhrase);
        setShowMnemonic(true);
      } else {
        Alert.alert('Error', 'No recovery phrase found');
      }
    } catch {
      Alert.alert('Error', 'Failed to load recovery phrase');
    }
  };

  const handleHideMnemonic = () => {
    setShowMnemonic(false);
    setMnemonic('');
  };

  return (
    <ScrollView style={styles.scrollView}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Cold Wallet Settings
        </ThemedText>

        <View style={styles.warningContainer}>
          <ThemedText style={styles.warningIcon}>⚠️</ThemedText>
          <ThemedText style={styles.warningText}>
            KEEP THIS DEVICE OFFLINE
          </ThemedText>
          <ThemedText style={styles.warningSubtext}>
            Never connect this device to the internet while storing private keys
          </ThemedText>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Your Address
          </ThemedText>
          <ThemedText style={styles.address}>{address || walletAddress}</ThemedText>
        </View>

        {(address || walletAddress) && (
          <QRDisplay
            data={address || walletAddress || ''}
            title="Wallet Address QR"
            description="Scan this with your hot wallet"
            size={220}
          />
        )}

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Recovery Phrase
          </ThemedText>
          
          {!showMnemonic ? (
            <TouchableOpacity
              style={styles.button}
              onPress={handleShowMnemonic}
            >
              <Text style={styles.buttonText}>Show Recovery Phrase</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.mnemonicContainer}>
              <ThemedText style={styles.mnemonicWarning}>
                ⚠️ Keep this safe and private!
              </ThemedText>
              <View style={styles.mnemonicBox}>
                {mnemonic.split(' ').map((word, index) => (
                  <View key={index} style={styles.mnemonicWord}>
                    <ThemedText style={styles.mnemonicWordNumber}>
                      {index + 1}.
                    </ThemedText>
                    <ThemedText style={styles.mnemonicWordText}>{word}</ThemedText>
                  </View>
                ))}
              </View>
              <TouchableOpacity
                style={[styles.button, styles.hideButton]}
                onPress={handleHideMnemonic}
              >
                <Text style={styles.buttonText}>Hide Recovery Phrase</Text>
              </TouchableOpacity>
            </View>
          )}
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
  warningContainer: {
    backgroundColor: '#FF9500',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  warningIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  warningText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  warningSubtext: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  address: {
    fontFamily: 'monospace',
    fontSize: 12,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  hideButton: {
    backgroundColor: '#FF3B30',
    marginTop: 16,
  },
  mnemonicContainer: {
    marginTop: 8,
  },
  mnemonicWarning: {
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '600',
  },
  mnemonicBox: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mnemonicWord: {
    width: '50%',
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  mnemonicWordNumber: {
    fontWeight: '600',
    marginRight: 6,
    opacity: 0.5,
  },
  mnemonicWordText: {
    fontFamily: 'monospace',
  },
});

