import NetInfo from "@react-native-community/netinfo";
import { Platform } from "react-native";

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  isOffline: boolean;
  activeConnections: string[];
}

const DEBUG_MODE = true;

/**
 * Check if device is completely offline (no WiFi, cellular)
 */
export async function isDeviceOffline(): Promise<boolean> {
  if (DEBUG_MODE) {
    return true;
  }

  try {
    const netInfo = await NetInfo.fetch();
    console.log("netInfo", netInfo);

    // For cold wallet security: If ANY connection exists, device is NOT offline
    if (netInfo.isConnected) {
      return false; // Device has a network connection - NOT offline
    }

    // Explicitly check for dangerous connection types
    // Even if isConnected is false, check the type to be sure
    const dangerousTypes = [
      "wifi",
      "cellular",
      "bluetooth",
      "ethernet",
      "wimax",
      "vpn",
      "other",
    ];

    if (netInfo.type && dangerousTypes.includes(netInfo.type)) {
      return false; // Dangerous network type detected - NOT offline
    }

    // Only consider truly offline if:
    // 1. Not connected AND
    // 2. Type is "none" or "unknown"
    if (netInfo.type === "none" || netInfo.type === "unknown") {
      return true; // Device is truly OFFLINE
    }

    // If we're not sure, be conservative - consider it online for security
    return false;
  } catch (error) {
    console.error("Error checking network status:", error);
    // If we can't check, assume offline for security (fail-safe)
    return true;
  }
}

/**
 * Get detailed network status for display
 */
export async function getNetworkStatus(): Promise<NetworkStatus> {
  try {
    const netInfo = await NetInfo.fetch();

    const activeConnections: string[] = [];

    if (netInfo.isConnected) {
      switch (netInfo.type) {
        case "wifi":
          activeConnections.push("WiFi");
          break;
        case "cellular":
          activeConnections.push("Cellular Data");
          break;
        case "bluetooth":
          activeConnections.push("Bluetooth");
          break;
        case "ethernet":
          activeConnections.push("Ethernet");
          break;
        case "wimax":
          activeConnections.push("WiMAX");
          break;
        case "vpn":
          activeConnections.push("VPN");
          break;
        default:
          if (
            netInfo.type &&
            netInfo.type !== "none" &&
            netInfo.type !== "unknown"
          ) {
            activeConnections.push(netInfo.type);
          }
      }
    }

    return {
      isConnected: netInfo.isConnected || false,
      isInternetReachable: netInfo.isInternetReachable,
      type: netInfo.type,
      isOffline: !netInfo.isConnected || netInfo.isInternetReachable === false,
      activeConnections,
    };
  } catch (error) {
    console.error("Error getting network status:", error);
    return {
      isConnected: false,
      isInternetReachable: false,
      type: "unknown",
      isOffline: true,
      activeConnections: [],
    };
  }
}

/**
 * Subscribe to network changes for real-time monitoring
 */
export function subscribeToNetworkChanges(
  callback: (status: NetworkStatus) => void
): () => void {
  const unsubscribe = NetInfo.addEventListener((state) => {
    const activeConnections: string[] = [];

    if (state.isConnected) {
      switch (state.type) {
        case "wifi":
          activeConnections.push("WiFi");
          break;
        case "cellular":
          activeConnections.push("Cellular Data");
          break;
        case "bluetooth":
          activeConnections.push("Bluetooth");
          break;
        case "ethernet":
          activeConnections.push("Ethernet");
          break;
        case "wimax":
          activeConnections.push("WiMAX");
          break;
        case "vpn":
          activeConnections.push("VPN");
          break;
        default:
          if (state.type && state.type !== "none" && state.type !== "unknown") {
            activeConnections.push(state.type);
          }
      }
    }

    const status: NetworkStatus = {
      isConnected: state.isConnected || false,
      isInternetReachable: state.isInternetReachable,
      type: state.type,
      isOffline: !state.isConnected || state.isInternetReachable === false,
      activeConnections,
    };

    callback(status);
  });

  return unsubscribe;
}

/**
 * Check if airplane mode is enabled (iOS only)
 */
export async function isAirplaneModeEnabled(): Promise<boolean> {
  if (Platform.OS !== "ios") {
    // On Android, we can't directly check airplane mode
    // We rely on network connectivity checks instead
    return false;
  }

  try {
    const netInfo = await NetInfo.fetch();
    // On iOS, if type is 'none' and we're not connected, likely airplane mode
    return netInfo.type === "none" && !netInfo.isConnected;
  } catch (error) {
    console.error("Error checking airplane mode:", error);
    return false;
  }
}
