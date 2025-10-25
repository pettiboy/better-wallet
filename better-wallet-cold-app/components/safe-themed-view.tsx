import { type ViewProps } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";
import { SafeAreaView, type Edge } from "react-native-safe-area-context";

export type SafeThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
  edges?: Edge[];
};

export function SafeThemedView({
  style,
  lightColor,
  darkColor,
  edges = ["top", "bottom", "left", "right"],
  ...otherProps
}: SafeThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );

  return (
    <SafeAreaView
      style={[{ backgroundColor, flex: 1 }, style]}
      edges={edges}
      {...otherProps}
    />
  );
}
