import React, { useState, useEffect } from "react";
import { View, StyleSheet, ActivityIndicator } from "react-native";
import { SafeThemedView } from "@/components/safe-themed-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import {
  getNetworkStatus,
  subscribeToNetworkChanges,
  type NetworkStatus,
} from "@/services/network";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Ionicons } from "@expo/vector-icons";
import { BorderWidth, Shadows, Spacing } from "@/constants/theme";

export default function OfflineCheckScreen() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus | null>(
    null
  );
  const [isChecking, setIsChecking] = useState(true);

  const dangerColor = useThemeColor({}, "danger");
  const successColor = useThemeColor({}, "success");
  const overlayColor = useThemeColor({}, "overlay");
  const borderColor = useThemeColor({}, "border");

  useEffect(() => {
    checkNetworkStatus();

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
    <SafeThemedView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.content}>
        {/* Warning Icon */}
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: dangerColor,
              borderColor,
              borderWidth: BorderWidth.thick,
              ...Shadows.large,
            },
          ]}
        >
          <Ionicons name="warning" size={64} color="#fff" />
        </View>

        {/* Main Message */}
        <ThemedText type="title" style={styles.title}>
          AIRPLANE MODE REQUIRED
        </ThemedText>

        <ThemedText style={styles.message}>
          For security, this cold wallet can only run offline. Please enable
          airplane mode and disable Wi-Fi, cellular data, and Bluetooth.
        </ThemedText>

        {/* Network Status */}
        {!isChecking && (
          <View
            style={[
              styles.statusContainer,
              {
                backgroundColor: isOffline ? successColor : dangerColor,
                borderColor,
                borderWidth: BorderWidth.thick,
                ...Shadows.medium,
              },
            ]}
          >
            <ThemedText type="subtitle" style={styles.statusTitle}>
              CURRENT STATUS
            </ThemedText>

            {isOffline ? (
              <View style={styles.offlineStatus}>
                <Ionicons name="checkmark-circle" size={32} color="#fff" />
                <ThemedText style={styles.statusText}>
                  Device is offline - Safe to proceed
                </ThemedText>
              </View>
            ) : (
              <View style={styles.onlineStatus}>
                <Ionicons name="warning" size={32} color="#fff" />
                <View style={styles.onlineTextContainer}>
                  <ThemedText style={styles.statusText}>
                    Active connections detected:
                  </ThemedText>
                  {activeConnections.map((connection, index) => (
                    <ThemedText key={index} style={styles.connectionItem}>
                      • {connection}
                    </ThemedText>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* Loading State */}
        {isChecking && (
          <View
            style={[
              styles.loadingContainer,
              {
                backgroundColor: overlayColor,
                borderColor,
                borderWidth: BorderWidth.thick,
                ...Shadows.small,
              },
            ]}
          >
            <ActivityIndicator size="large" color={borderColor} />
            <ThemedText style={styles.loadingText}>
              Checking network status...
            </ThemedText>
          </View>
        )}

        {/* Instructions */}
        <View
          style={[
            styles.instructionsContainer,
            {
              backgroundColor: overlayColor,
              borderColor,
              borderWidth: BorderWidth.thick,
              ...Shadows.small,
            },
          ]}
        >
          <ThemedText type="subtitle" style={styles.instructionsTitle}>
            HOW TO ENABLE AIRPLANE MODE:
          </ThemedText>

          <View style={styles.instructionItem}>
            <ThemedText style={styles.instructionNumber}>1</ThemedText>
            <ThemedText style={styles.instructionText}>
              Open Control Center (swipe down from top-right)
            </ThemedText>
          </View>

          <View style={styles.instructionItem}>
            <ThemedText style={styles.instructionNumber}>2</ThemedText>
            <ThemedText style={styles.instructionText}>
              Tap the airplane icon
            </ThemedText>
          </View>

          <View style={styles.instructionItem}>
            <ThemedText style={styles.instructionNumber}>3</ThemedText>
            <ThemedText style={styles.instructionText}>
              Ensure Wi-Fi and Bluetooth are also disabled
            </ThemedText>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <ThemedButton
            title="Retry Check"
            variant="primary"
            onPress={handleRetry}
            loading={isChecking}
            style={styles.retryButton}
          />
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
    padding: Spacing.lg,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 0,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
    fontWeight: "800",
    fontSize: 24,
  },
  message: {
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 24,
    fontSize: 15,
    fontWeight: "600",
    maxWidth: 400,
  },
  statusContainer: {
    padding: Spacing.lg,
    borderRadius: 0,
    marginBottom: Spacing.lg,
    width: "100%",
    maxWidth: 400,
  },
  statusTitle: {
    marginBottom: Spacing.md,
    textAlign: "center",
    fontWeight: "800",
    fontSize: 18,
    color: "#fff",
  },
  offlineStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  onlineStatus: {
    alignItems: "center",
    gap: Spacing.sm,
  },
  onlineTextContainer: {
    alignItems: "center",
  },
  statusText: {
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
    color: "#fff",
  },
  connectionItem: {
    marginTop: 4,
    fontWeight: "700",
    fontSize: 14,
    color: "#fff",
  },
  loadingContainer: {
    padding: Spacing.lg,
    borderRadius: 0,
    marginBottom: Spacing.lg,
    alignItems: "center",
    gap: Spacing.md,
    width: "100%",
    maxWidth: 400,
  },
  loadingText: {
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  instructionsContainer: {
    padding: Spacing.lg,
    borderRadius: 0,
    marginBottom: Spacing.xl,
    width: "100%",
    maxWidth: 400,
  },
  instructionsTitle: {
    marginBottom: Spacing.md,
    textAlign: "center",
    fontWeight: "800",
    fontSize: 16,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  instructionNumber: {
    width: 24,
    fontWeight: "800",
    fontSize: 16,
  },
  instructionText: {
    flex: 1,
    lineHeight: 20,
    fontSize: 14,
    fontWeight: "600",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
    gap: Spacing.sm,
  },
  retryButton: {
    width: "100%",
  },
});
