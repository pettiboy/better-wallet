import * as LocalAuthentication from "expo-local-authentication";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BIOMETRIC_ENABLED_KEY = "biometric_auth_enabled";

export type BiometricType =
  | "fingerprint"
  | "facial"
  | "iris"
  | "voice"
  | "none";

export interface BiometricInfo {
  isAvailable: boolean;
  isEnrolled: boolean;
  supportedTypes: BiometricType[];
  hasHardware: boolean;
}

/**
 * Check if biometric authentication is available and enrolled
 */
export async function getBiometricInfo(): Promise<BiometricInfo> {
  try {
    const isAvailable = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes =
      await LocalAuthentication.supportedAuthenticationTypesAsync();

    // Map supported types to our BiometricType
    const mappedTypes: BiometricType[] = supportedTypes.map((type) => {
      switch (type) {
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          return "fingerprint";
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          return "facial";
        case LocalAuthentication.AuthenticationType.IRIS:
          return "iris";
        default:
          return "none";
      }
    });

    return {
      isAvailable,
      isEnrolled,
      supportedTypes: mappedTypes,
      hasHardware: isAvailable,
    };
  } catch (error) {
    console.error("Error checking biometric info:", error);
    return {
      isAvailable: false,
      isEnrolled: false,
      supportedTypes: [],
      hasHardware: false,
    };
  }
}

/**
 * Authenticate user with biometric or device PIN/pattern
 */
export async function authenticateUser(reason?: string): Promise<boolean> {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: reason || "Authenticate to sign transaction",
      fallbackLabel: "Use PIN",
      cancelLabel: "Cancel",
    });

    return result.success;
  } catch (error) {
    console.error("Biometric authentication error:", error);
    return false;
  }
}

/**
 * Get user-friendly authentication type name
 */
export function getAuthenticationTypeName(
  biometricInfo: BiometricInfo
): string {
  if (!biometricInfo.isAvailable || !biometricInfo.isEnrolled) {
    return "Not Available";
  }

  if (biometricInfo.supportedTypes.includes("facial")) {
    return "Face ID";
  }

  if (biometricInfo.supportedTypes.includes("fingerprint")) {
    return "Fingerprint";
  }

  if (biometricInfo.supportedTypes.includes("iris")) {
    return "Iris";
  }

  return "Device PIN/Pattern";
}

/**
 * Check if biometric authentication is enabled in settings
 */
export async function isBiometricEnabled(): Promise<boolean> {
  try {
    const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY);
    return enabled === "true";
  } catch (error) {
    console.error("Error reading biometric setting:", error);
    return false;
  }
}

/**
 * Set biometric authentication preference
 */
export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, enabled.toString());
  } catch (error) {
    console.error("Error saving biometric setting:", error);
    throw error;
  }
}

/**
 * Authenticate before signing if enabled
 */
export async function authenticateIfRequired(
  reason?: string
): Promise<boolean> {
  const isEnabled = await isBiometricEnabled();

  if (!isEnabled) {
    return true; // Authentication not required
  }

  const biometricInfo = await getBiometricInfo();

  if (!biometricInfo.isAvailable || !biometricInfo.isEnrolled) {
    // If biometric is enabled but not available, we can't proceed
    throw new Error(
      "Biometric authentication is required but not available on this device"
    );
  }

  return await authenticateUser(reason);
}
