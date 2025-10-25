import React, { useState } from "react";
import { View, StyleSheet, Text, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
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
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const primaryColor = useThemeColor({}, "primary");
  const borderColor = useThemeColor({}, "border");

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

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;

    setScanned(true);
    onScan(data);
  };

  return (
    <View style={styles.fullScreen}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
      />
      <View style={styles.overlay}>
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>

        <View
          style={[
            styles.scanArea,
            {
              borderColor,
              borderWidth: BorderWidth.thick,
            },
          ]}
        />

        <ThemedText style={styles.instructions}>
          Position the QR code within the frame
        </ThemedText>

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
              onPress={() => setScanned(false)}
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
  title: {
    color: "white",
    marginTop: 60,
    fontWeight: "800",
    fontSize: 18,
  },
  scanArea: {
    width: 280,
    height: 280,
    borderRadius: 0,
    backgroundColor: "transparent",
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
