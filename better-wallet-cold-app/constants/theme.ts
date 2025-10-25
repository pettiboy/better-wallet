/**
 * Ethereum-themed colors for the cold wallet app.
 * Colors inspired by Ethereum's brand colors and security-focused design.
 */

import { Platform } from "react-native";

// Ethereum brand colors
const ethereumBlue = "#627EEA";
const ethereumPurple = "#8B5CF6";
const ethereumDark = "#1a1a1a";
const ethereumLight = "#f8fafc";

// Security-focused colors
const successGreen = "#10B981";
const warningOrange = "#F59E0B";
const dangerRed = "#EF4444";
const infoBlue = "#3B82F6";

export const Colors = {
  light: {
    text: "#1a1a1a",
    background: ethereumLight,
    tint: ethereumBlue,
    icon: "#6B7280",
    tabIconDefault: "#9CA3AF",
    tabIconSelected: ethereumBlue,
    // Ethereum theme colors
    primary: ethereumBlue,
    secondary: ethereumPurple,
    success: successGreen,
    warning: warningOrange,
    danger: dangerRed,
    info: infoBlue,
    card: "#ffffff",
    overlay: "#f1f5f9",
    border: "#e2e8f0",
  },
  dark: {
    text: "#f8fafc",
    background: ethereumDark,
    tint: ethereumBlue,
    icon: "#9CA3AF",
    tabIconDefault: "#6B7280",
    tabIconSelected: ethereumBlue,
    // Ethereum theme colors
    primary: ethereumBlue,
    secondary: ethereumPurple,
    success: successGreen,
    warning: warningOrange,
    danger: dangerRed,
    info: infoBlue,
    card: "#1e293b",
    overlay: "#334155",
    border: "#475569",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
