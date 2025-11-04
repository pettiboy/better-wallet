import React, { useState, useRef, useCallback } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { ThemedButton } from "./themed-button";
import { BorderWidth, Shadows } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  title?: string;
}

export function QRScanner({
  onScan,
  onClose,
  title = "Scan QR Code",
}: QRScannerProps) {
  // All hooks must be called before any early returns
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [enableTorch, setEnableTorch] = useState(false);
  const lastScanTime = useRef<number>(0);
  const scanTimeout = useRef<number | undefined>(undefined);

  const primaryColor = useThemeColor({}, "primary");
  const borderColor = useThemeColor({}, "border");
  const successColor = useThemeColor({}, "success");

  const handleBarCodeScanned = useCallback(
    ({ data }: { data: string }) => {
      // Prevent duplicate scans within 500ms
      const now = Date.now();
      if (scanned || now - lastScanTime.current < 500) {
        return;
      }

      lastScanTime.current = now;
      setScanned(true);

      // Haptic feedback
      try {
        Vibration.vibrate(100);
      } catch {
        // Ignore vibration errors on unsupported devices
      }

      // Call onScan with slight delay to ensure state updates
      scanTimeout.current = setTimeout(() => {
        onScan(data);
      }, 100) as unknown as number;
    },
    [scanned, onScan]
  );

  const handleRescan = useCallback(() => {
    setScanned(false);
    lastScanTime.current = 0;
  }, []);

  const toggleTorch = useCallback(() => {
    setEnableTorch((prev) => !prev);
  }, []);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (scanTimeout.current) {
        clearTimeout(scanTimeout.current);
      }
    };
  }, []);

  // Early returns after all hooks
  if (!permission) {
    return <ThemedView style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.message}>
          Camera permission is required to scan QR codes
        </ThemedText>
        <ThemedButton
          title="Grant Permission"
          variant="primary"
          onPress={requestPermission}
        />
      </ThemedView>
    );
  }

  return (
    <View style={styles.fullScreen}>
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={enableTorch}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="subtitle" style={styles.title}>
            {title}
          </ThemedText>

          {/* Torch Toggle */}
          <TouchableOpacity
            style={[
              styles.torchButton,
              {
                backgroundColor: enableTorch
                  ? successColor
                  : "rgba(255,255,255,0.2)",
                borderColor: enableTorch
                  ? successColor
                  : "rgba(255,255,255,0.5)",
                borderWidth: BorderWidth.thin,
              },
            ]}
            onPress={toggleTorch}
          >
            <Ionicons
              name={enableTorch ? "flash" : "flash-outline"}
              size={24}
              color="white"
            />
          </TouchableOpacity>
        </View>

        {/* Scan Area with Corners */}
        <View style={styles.scanAreaContainer}>
          <View
            style={[
              styles.scanArea,
              {
                borderColor: scanned ? successColor : borderColor,
                borderWidth: BorderWidth.thick,
              },
            ]}
          >
            {/* Corner Markers */}
            <View
              style={[
                styles.corner,
                styles.cornerTopLeft,
                { borderColor: scanned ? successColor : "white" },
              ]}
            />
            <View
              style={[
                styles.corner,
                styles.cornerTopRight,
                { borderColor: scanned ? successColor : "white" },
              ]}
            />
            <View
              style={[
                styles.corner,
                styles.cornerBottomLeft,
                { borderColor: scanned ? successColor : "white" },
              ]}
            />
            <View
              style={[
                styles.corner,
                styles.cornerBottomRight,
                { borderColor: scanned ? successColor : "white" },
              ]}
            />

            {scanned && (
              <View style={styles.successOverlay}>
                <Ionicons name="checkmark-circle" size={64} color="white" />
              </View>
            )}
          </View>
        </View>

        {/* Instructions */}
        <ThemedText style={styles.instructions}>
          {scanned
            ? "QR code scanned successfully!"
            : "Position the QR code within the frame"}
        </ThemedText>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.closeButton,
              {
                borderColor,
                borderWidth: BorderWidth.thick,
                ...Shadows.medium,
              },
            ]}
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>CANCEL</Text>
          </TouchableOpacity>

          {scanned && (
            <TouchableOpacity
              style={[
                styles.rescanButton,
                {
                  backgroundColor: primaryColor,
                  borderColor,
                  borderWidth: BorderWidth.thick,
                  ...Shadows.medium,
                },
              ]}
              onPress={handleRescan}
            >
              <Text style={styles.rescanButtonText}>SCAN AGAIN</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 32,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 60,
  },
  title: {
    color: "white",
    fontWeight: "800",
    fontSize: 18,
  },
  torchButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  scanAreaContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: 280,
    height: 280,
    borderRadius: 0,
    backgroundColor: "transparent",
    position: "relative",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderWidth: 4,
  },
  cornerTopLeft: {
    top: -2,
    left: -2,
    borderBottomWidth: 0,
    borderRightWidth: 0,
  },
  cornerTopRight: {
    top: -2,
    right: -2,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  },
  cornerBottomLeft: {
    bottom: -2,
    left: -2,
    borderTopWidth: 0,
    borderRightWidth: 0,
  },
  cornerBottomRight: {
    bottom: -2,
    right: -2,
    borderTopWidth: 0,
    borderLeftWidth: 0,
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,255,0,0.2)",
  },
  instructions: {
    color: "white",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "600",
    fontSize: 16,
  },
  message: {
    textAlign: "center",
    marginBottom: 24,
    fontSize: 16,
    fontWeight: "600",
  },
  buttonContainer: {
    width: "100%",
    gap: 16,
    marginBottom: 40,
  },
  closeButton: {
    backgroundColor: "rgba(255,255,255,0.95)",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 0,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  rescanButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 0,
    alignItems: "center",
  },
  rescanButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
});
