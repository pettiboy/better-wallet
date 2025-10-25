/**
 * Neobrutalism design tokens for the cold wallet app.
 * Bold colors, thick borders, and hard shadows.
 */

import { Platform } from "react-native";

// Neobrutalism color palette
const creamBackground = "#FFF8E7";
const offWhite = "#FFFDF7";
const black = "#000000";

// Bold accent colors
const ethereumBlue = "#4A90E2";
const brightGreen = "#00D084";
const brightOrange = "#FF9500";
const brightYellow = "#FFD60A";
const brightRed = "#FF3B30";
const brightPurple = "#8B5CF6";
const coolGrey = "#E8E8E8";

export const Colors = {
  // Neobrutalism uses light theme only
  light: {
    text: black,
    background: creamBackground,
    tint: ethereumBlue,
    icon: black,
    tabIconDefault: black,
    tabIconSelected: ethereumBlue,
    // Action colors
    primary: ethereumBlue,
    secondary: brightPurple,
    success: brightGreen,
    warning: brightOrange,
    danger: brightRed,
    info: ethereumBlue,
    accent: brightYellow,
    // Layout colors
    card: offWhite,
    overlay: coolGrey,
    border: black,
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

// Neobrutalism design tokens
export const Spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderWidth = {
  thin: 2,
  regular: 3,
  thick: 4,
  bold: 5,
};

export const Shadows = {
  small: {
    shadowColor: black,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  medium: {
    shadowColor: black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
  large: {
    shadowColor: black,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 0,
  },
};
