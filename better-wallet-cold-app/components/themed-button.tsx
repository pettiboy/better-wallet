import React, { useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  type TouchableOpacityProps,
} from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";
import { BorderWidth, Shadows } from "@/constants/theme";

export type ThemedButtonProps = TouchableOpacityProps & {
  title: string;
  variant?: "primary" | "success" | "danger" | "warning" | "secondary";
  loading?: boolean;
  lightColor?: string;
  darkColor?: string;
};

export function ThemedButton({
  title,
  variant = "primary",
  loading = false,
  lightColor,
  darkColor,
  style,
  disabled,
  ...props
}: ThemedButtonProps) {
  const [pressed, setPressed] = useState(false);

  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    variant as any
  );
  const borderColor = useThemeColor({}, "border");
  const textColor = "#FFFFFF";

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor,
          borderColor,
          borderWidth: BorderWidth.thick,
          ...(!pressed ? Shadows.medium : {}),
        },
        pressed && styles.buttonPressed,
        isDisabled && styles.buttonDisabled,
        style,
      ]}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      <View style={styles.buttonContent}>
        {loading && (
          <ActivityIndicator
            size="small"
            color={textColor}
            style={styles.spinner}
          />
        )}
        <Text
          style={[
            styles.buttonText,
            { color: textColor },
            loading && styles.buttonTextWithSpinner,
          ]}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  buttonPressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    shadowOffset: { width: 2, height: 2 },
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  buttonTextWithSpinner: {
    marginLeft: 8,
  },
  spinner: {
    marginRight: 8,
  },
});
