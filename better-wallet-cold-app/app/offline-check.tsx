import React, { useState, useEffect } from "react";
import { View, StyleSheet, Text, TouchableOpacity, Alert } from "react-native";
import { SafeThemedView } from "@/components/safe-themed-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import {
  getNetworkStatus,
  subscribeToNetworkChanges,
  type NetworkStatus,
} from "@/services/network";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function OfflineCheckScreen() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(
    null
  );
  const [isChecking, setIsChecking] = useState(true);

  const dangerColor = useThemeColor({}, "danger");
  const warningColor = useThemeColor({}, "warning");
  const overlayColor = useThemeColor({}, "overlay");

  useEffect(() => {
    checkNetworkStatus();

    // Subscribe to network changes
    const unsubscribe = subscribeToNetworkChanges((status) => {
      setNetworkStatus(status);
      setIsChecking(false);
    });

    return unsubscribe;
  }, []);

  const checkNetworkStatus = async () => {
    setIsChecking(true);
    try {
      const status = await getNetworkStatus();
      setNetworkStatus(status);
    } catch (error) {
      console.error("Error checking network status:", error);
      Alert.alert("Error", "Failed to check network status");
    } finally {
      setIsChecking(false);
    }
  };

  const handleRetry = () => {
    checkNetworkStatus();
  };

  const isOffline = networkStatus?.isOffline ?? false;
  const activeConnections = networkStatus?.activeConnections ?? [];

  return (
    <SafeThemedView style={styles.container}>
      <View style={styles.content}>
        {/* Warning Icon */}
        <View style={[styles.iconContainer, { backgroundColor: dangerColor }]}>
          <Text style={styles.warningIcon}>⚠️</Text>
        </View>

        {/* Main Message */}
        <ThemedText type="title" style={styles.title}>
          Airplane Mode Required
        </ThemedText>

        <ThemedText style={styles.message}>
          For security, this cold wallet can only run offline. Please enable
          airplane mode and disable Wi-Fi, cellular data, and Bluetooth.
        </ThemedText>

        {/* Network Status */}
        {!isChecking && (
          <View
            style={[styles.statusContainer, { backgroundColor: overlayColor }]}
          >
            <ThemedText type="subtitle" style={styles.statusTitle}>
              Current Status
            </ThemedText>

            {isOffline ? (
              <View style={styles.offlineStatus}>
                <Text style={styles.checkmark}>✅</Text>
                <ThemedText style={styles.statusText}>
                  Device is offline - Safe to proceed
                </ThemedText>
              </View>
            ) : (
              <View style={styles.onlineStatus}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <ThemedText style={styles.statusText}>
                  Active connections detected:
                </ThemedText>
                {activeConnections.map((connection, index) => (
                  <ThemedText key={index} style={styles.connectionItem}>
                    • {connection}
                  </ThemedText>
                ))}
              </View>
            )}
          </View>
        )}

        {/* Loading State */}
        {isChecking && (
          <View style={styles.loadingContainer}>
            <ThemedText style={styles.loadingText}>
              Checking network status...
            </ThemedText>
          </View>
        )}

        {/* Instructions */}
        <View
          style={[
            styles.instructionsContainer,
            { backgroundColor: overlayColor },
          ]}
        >
          <ThemedText type="subtitle" style={styles.instructionsTitle}>
            How to enable airplane mode:
          </ThemedText>
          <ThemedText style={styles.instructionItem}>
            1. Open Control Center (swipe down from top-right)
          </ThemedText>
          <ThemedText style={styles.instructionItem}>
            2. Tap the airplane icon
          </ThemedText>
          <ThemedText style={styles.instructionItem}>
            3. Ensure Wi-Fi and Bluetooth are also disabled
          </ThemedText>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <ThemedButton
            title="Retry Check"
            variant="primary"
            onPress={handleRetry}
            style={styles.retryButton}
          />

          {isOffline && (
            <ThemedButton
              title="Continue to App"
              variant="success"
              onPress={() => {
                // This will be handled by the parent navigation
                // The app will check this screen's result
              }}
              style={styles.continueButton}
            />
          )}
        </View>
      </View>
    </SafeThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  warningIcon: {
    fontSize: 40,
  },
  title: {
    textAlign: "center",
    marginBottom: 16,
  },
  message: {
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
    opacity: 0.8,
  },
  statusContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    width: "100%",
    maxWidth: 400,
  },
  statusTitle: {
    marginBottom: 12,
    textAlign: "center",
  },
  offlineStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  onlineStatus: {
    alignItems: "center",
  },
  checkmark: {
    fontSize: 24,
    marginRight: 8,
  },
  statusText: {
    textAlign: "center",
    fontWeight: "600",
  },
  connectionItem: {
    marginTop: 4,
    color: "#ff4444",
    fontWeight: "600",
  },
  loadingContainer: {
    padding: 20,
    marginBottom: 24,
  },
  loadingText: {
    textAlign: "center",
    opacity: 0.7,
  },
  instructionsContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 32,
    width: "100%",
    maxWidth: 400,
  },
  instructionsTitle: {
    marginBottom: 12,
    textAlign: "center",
  },
  instructionItem: {
    marginBottom: 8,
    lineHeight: 20,
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
    gap: 12,
  },
  retryButton: {
    marginBottom: 8,
  },
  continueButton: {
    backgroundColor: "#28a745",
  },
});
