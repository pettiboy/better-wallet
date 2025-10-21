import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  type TouchableOpacityProps,
} from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";

export type ThemedButtonProps = TouchableOpacityProps & {
  title: string;
  variant?: "primary" | "success" | "danger" | "warning" | "secondary";
  lightColor?: string;
  darkColor?: string;
};

export function ThemedButton({
  title,
  variant = "primary",
  lightColor,
  darkColor,
  style,
  ...props
}: ThemedButtonProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    variant as any
  );
  const textColor = "white";

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor }, style]}
      {...props}
    >
      <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    fontWeight: "600",
  },
});
