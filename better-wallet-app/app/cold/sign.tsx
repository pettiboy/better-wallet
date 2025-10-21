import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { QRScanner } from '@/components/QRScanner';
import { QRDisplay } from '@/components/QRDisplay';
import { signTransaction, loadPrivateKey } from '@/services/wallet';
import { ethers } from 'ethers';

export default function SignScreen() {
  const [scanning, setScanning] = useState(false);
  const [unsignedTx, setUnsignedTx] = useState<ethers.TransactionRequest | null>(null);
  const [signedTx, setSignedTx] = useState<string | null>(null);

  const handleScan = async (data: string) => {
    try {
      // Parse the unsigned transaction from QR code
      const tx = JSON.parse(data);
      setUnsignedTx(tx);
      setScanning(false);
    } catch {
      Alert.alert('Error', 'Invalid transaction QR code');
      setScanning(false);
    }
  };

  const handleSign = async () => {
    if (!unsignedTx) return;

    try {
      const privateKey = await loadPrivateKey();
      
      if (!privateKey) {
        Alert.alert('Error', 'No private key found. Please set up wallet first.');
        return;
      }

      const signed = await signTransaction(unsignedTx, privateKey);
      setSignedTx(signed);
      
      Alert.alert('Success', 'Transaction signed! Show this QR code to your hot wallet.');
    } catch (error) {
      console.error('Error signing transaction:', error);
      Alert.alert('Error', 'Failed to sign transaction');
    }
  };

  const handleReset = () => {
    setUnsignedTx(null);
    setSignedTx(null);
  };

  if (scanning) {
    return (
      <QRScanner
        title="Scan Unsigned Transaction"
        onScan={handleScan}
        onClose={() => setScanning(false)}
      />
    );
  }

  if (signedTx) {
    return (
      <ThemedView style={styles.container}>
        <QRDisplay
          data={signedTx}
          title="Signed Transaction"
          description="Scan this with your hot wallet to broadcast"
          size={280}
        />
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Sign Another Transaction</Text>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (unsignedTx) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Review Transaction
        </ThemedText>
        
        <View style={styles.detailsContainer}>
          <DetailRow label="To" value={unsignedTx.to as string} />
          <DetailRow 
            label="Amount" 
            value={`${ethers.formatEther(unsignedTx.value || 0)} ETH`} 
          />
          <DetailRow 
            label="Gas Limit" 
            value={unsignedTx.gasLimit?.toString() || 'N/A'} 
          />
          <DetailRow 
            label="Chain ID" 
            value={unsignedTx.chainId?.toString() || 'N/A'} 
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.signButton]} 
            onPress={handleSign}
          >
            <Text style={styles.buttonText}>Sign Transaction</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]} 
            onPress={handleReset}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>
        Sign Transaction
      </ThemedText>
      
      <ThemedText style={styles.instructions}>
        Scan the QR code from your hot wallet to sign a transaction
      </ThemedText>

      <TouchableOpacity 
        style={styles.scanButton} 
        onPress={() => setScanning(true)}
      >
        <Text style={styles.scanButtonText}>Scan Transaction QR</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <ThemedText style={styles.detailLabel}>{label}:</ThemedText>
      <ThemedText style={styles.detailValue} numberOfLines={1} ellipsizeMode="middle">
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  instructions: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  detailsContainer: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailLabel: {
    fontWeight: '600',
    marginRight: 8,
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  signButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF3B30',
  },
  cancelButtonText: {
    color: '#FF3B30',
    fontSize: 18,
    fontWeight: '600',
  },
  resetButton: {
    marginTop: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

