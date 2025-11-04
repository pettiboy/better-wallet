import * as LocalAuthentication from "expo-local-authentication";

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
 * Authenticate before signing - always required for security
 * On devices without biometric support, will proceed with a warning
 */
export async function authenticateIfRequired(
  reason?: string
): Promise<boolean> {
  const biometricInfo = await getBiometricInfo();

  if (!biometricInfo.isAvailable || !biometricInfo.isEnrolled) {
    // If biometric is not available, allow operation but log warning
    console.warn(
      "Biometric authentication is not available on this device. Proceeding without authentication."
    );
    return true; // Allow operation on devices without biometric
  }

  return await authenticateUser(reason);
}
