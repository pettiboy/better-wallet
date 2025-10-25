import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { ThemedView } from "./themed-view";
import { ThemedText } from "./themed-text";
import { BorderWidth, Shadows } from "@/constants/theme";
import { useThemeColor } from "@/hooks/use-theme-color";

interface QRDisplayProps {
  data: string;
  size?: number;
  title?: string;
  description?: string;
}

export function QRDisplay({
  data,
  size = 250,
  title,
  description,
}: QRDisplayProps) {
  const [hasError, setHasError] = useState(false);
  const borderColor = useThemeColor({}, "border");
  const dangerColor = useThemeColor({}, "danger");

  return (
    <ThemedView style={styles.container}>
      {title && (
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
      )}
      {description && (
        <ThemedText style={styles.description}>{description}</ThemedText>
      )}
      <View
        style={[
          styles.qrContainer,
          {
            borderColor,
            borderWidth: BorderWidth.thick,
            ...Shadows.large,
          },
        ]}
      >
        {data && !hasError ? (
          <QRCode
            value={data}
            size={size}
            backgroundColor="white"
            color="black"
            onError={(error: any) => {
              console.error("QR Code Error:", error);
              setHasError(true);
            }}
          />
        ) : hasError ? (
          <ThemedText style={[styles.errorText, { color: dangerColor }]}>
            QR Code failed to generate
          </ThemedText>
        ) : (
          <ThemedText>No data to display</ThemedText>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
  },
  title: {
    marginBottom: 12,
    textAlign: "center",
    fontWeight: "700",
  },
  description: {
    marginBottom: 24,
    textAlign: "center",
    fontSize: 14,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 0,
  },
  errorText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },
});
