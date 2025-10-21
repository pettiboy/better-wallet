import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  RefreshControl,
  ScrollView,
  Alert,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SafeThemedView } from "@/components/safe-themed-view";
import { ThemedButton } from "@/components/themed-button";
import { useDeviceMode } from "@/contexts/DeviceModeContext";
import { getBalance } from "@/services/ethereum";
import { router } from "expo-router";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function HotHomeScreen() {
  const { walletAddress } = useDeviceMode();
  const [balance, setBalance] = useState<string>("0.0");
  const [loading, setLoading] = useState(false);

  const primaryColor = useThemeColor({}, "primary");
  const overlayColor = useThemeColor({}, "overlay");

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
      console.error("Error loading balance:", error);
      Alert.alert(
        "Error",
        "Failed to load balance. Check your internet connection."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!walletAddress) {
    return (
      <SafeThemedView>
        <ScrollView contentContainerStyle={styles.centerContainer}>
          <ThemedText type="title" style={styles.title}>
            Hot Wallet
          </ThemedText>
          <ThemedText style={styles.message}>
            No wallet connected. Please set up your cold wallet first.
          </ThemedText>
        </ScrollView>
      </SafeThemedView>
    );
  }

  return (
    <SafeThemedView>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadBalance} />
        }
      >
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title}>
            Wallet
          </ThemedText>

          <View style={[styles.balanceCard, { backgroundColor: primaryColor }]}>
            <ThemedText
              style={styles.balanceLabel}
              lightColor="rgba(255,255,255,0.8)"
              darkColor="rgba(255,255,255,0.8)"
            >
              Balance
            </ThemedText>
            <ThemedText
              type="title"
              style={styles.balanceAmount}
              lightColor="white"
              darkColor="white"
            >
              {parseFloat(balance).toFixed(4)} ETH
            </ThemedText>
            <ThemedText
              style={styles.network}
              lightColor="rgba(255,255,255,0.7)"
              darkColor="rgba(255,255,255,0.7)"
            >
              Sepolia Testnet
            </ThemedText>
          </View>

          <View
            style={[styles.addressContainer, { backgroundColor: overlayColor }]}
          >
            <ThemedText style={styles.addressLabel}>Address</ThemedText>
            <ThemedText
              style={styles.address}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {walletAddress}
            </ThemedText>
          </View>

          <ThemedButton
            title="Send Transaction"
            variant="success"
            onPress={() => router.push("/hot/send")}
          />

          <View style={[styles.infoSection, { backgroundColor: overlayColor }]}>
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
    </SafeThemedView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  centerContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    marginBottom: 24,
    textAlign: "center",
  },
  balanceCard: {
    padding: 32,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  balanceLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "bold",
  },
  network: {
    fontSize: 12,
    marginTop: 8,
  },
  addressContainer: {
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
    fontFamily: "monospace",
    fontSize: 12,
  },
  message: {
    textAlign: "center",
    marginTop: 32,
  },
  infoSection: {
    padding: 16,
    borderRadius: 12,
    marginTop: 32,
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
