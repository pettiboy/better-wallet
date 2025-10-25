import { type ViewProps } from "react-native";
import { useThemeColor } from "@/hooks/use-theme-color";
import { SafeAreaView } from "react-native-safe-area-context";

export type SafeThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

export function SafeThemedView({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: SafeThemedViewProps) {
  const backgroundColor = useThemeColor(
    { light: lightColor, dark: darkColor },
    "background"
  );

  return (
    <SafeAreaView
      style={[{ backgroundColor, flex: 1 }, style]}
      {...otherProps}
    />
  );
}
