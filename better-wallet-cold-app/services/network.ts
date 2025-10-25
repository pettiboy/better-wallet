import NetInfo from "@react-native-community/netinfo";
import { Platform } from "react-native";

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
  isOffline: boolean;
  activeConnections: string[];
}

/**
 * Check if device is completely offline (no WiFi, cellular, or Bluetooth)
 */
export async function isDeviceOffline(): Promise<boolean> {
  try {
    const netInfo = await NetInfo.fetch();

    // Check if device is connected to any network
    if (netInfo.isConnected && netInfo.isInternetReachable) {
      return true;
      // return false;
    }

    // Additional check for airplane mode
    if (netInfo.type === "none" || netInfo.type === "unknown") {
      return true;
    }

    return !netInfo.isConnected;
  } catch (error) {
    console.error("Error checking network status:", error);
    // If we can't check, assume offline for security
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
