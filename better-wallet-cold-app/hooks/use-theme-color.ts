/**
 * Neobrutalism theme color hook - light theme only
 */

import { Colors } from "@/constants/theme";

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light
) {
  const colorFromProps = props.light;

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors.light[colorName];
  }
}
