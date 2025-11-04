import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeThemedView } from "@/components/safe-themed-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { useThemeColor } from "@/hooks/use-theme-color";
import { generateWallet } from "@/services/wallet";
import { router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { BorderWidth, Shadows, Spacing } from "@/constants/theme";

export default function MnemonicDisplayScreen() {
  const [mnemonic, setMnemonic] = useState<string>("");
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);

  const overlayColor = useThemeColor({}, "overlay");
  const dangerColor = useThemeColor({}, "danger");
  const borderColor = useThemeColor({}, "border");
  const cardColor = useThemeColor({}, "card");
  const backgroundColor = useThemeColor({}, "background");

  useEffect(() => {
    generateNewWallet();
  }, []);

  const generateNewWallet = async () => {
    try {
      setIsGenerating(true);
      const wallet = await generateWallet();
      setMnemonic(wallet.mnemonic);
    } catch (error) {
      console.error("Error generating wallet:", error);
      Alert.alert("Error", "Failed to generate wallet. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    setHasScrolledToBottom(isAtBottom);
  };

  const handleNext = () => {
    if (!mnemonic) {
      Alert.alert("Error", "Mnemonic not generated yet");
      return;
    }

    router.push({
      pathname: "/onboarding/mnemonic-verify",
      params: { mnemonic },
    });
  };

  const mnemonicWords = mnemonic.split(" ").filter((word) => word.length > 0);

  if (isGenerating) {
    return (
      <SafeThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={borderColor} />
          <ThemedText type="title" style={styles.loadingTitle}>
            GENERATING WALLET...
          </ThemedText>
          <ThemedText style={styles.loadingText}>
            Creating your secure Ethereum wallet
          </ThemedText>
        </View>
      </SafeThemedView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Save Recovery Phrase",
          headerShown: false,
        }}
      />
      <SafeThemedView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Header */}
            <ThemedText type="title" style={styles.title}>
              YOUR RECOVERY PHRASE
            </ThemedText>

            <ThemedText style={styles.subtitle}>
              Write down these 12 words in the exact order shown. Store them
              safely offline.
            </ThemedText>

            {/* Warning */}
            <View
              style={[
                styles.warningContainer,
                {
                  backgroundColor: dangerColor,
                  borderColor,
                  borderWidth: BorderWidth.thick,
                  ...Shadows.medium,
                },
              ]}
            >
              <Ionicons
                name="warning"
                size={24}
                color="#fff"
                style={styles.warningIcon}
              />
              <ThemedText style={styles.warningText}>
                These words are your wallet. Write them down and store them
                offline. This will not be shown again.
              </ThemedText>
            </View>

            {/* Mnemonic Words Grid */}
            <View
              style={[
                styles.mnemonicContainer,
                {
                  backgroundColor: cardColor,
                  borderColor,
                  borderWidth: BorderWidth.thick,
                  ...Shadows.large,
                },
              ]}
            >
              {mnemonicWords.map((word, index) => (
                <View
                  key={index}
                  style={[
                    styles.wordItem,
                    {
                      backgroundColor: overlayColor,
                      borderColor,
                      borderWidth: BorderWidth.thin,
                    },
                  ]}
                >
                  <View style={styles.wordNumber}>
                    <ThemedText style={styles.wordNumberText}>
                      {index + 1}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.wordText}>{word}</ThemedText>
                </View>
              ))}
            </View>

            {/* Instructions */}
            <View
              style={[
                styles.instructionsContainer,
                {
                  backgroundColor: overlayColor,
                  borderColor,
                  borderWidth: BorderWidth.thick,
                  ...Shadows.small,
                },
              ]}
            >
              <ThemedText type="subtitle" style={styles.instructionsTitle}>
                IMPORTANT INSTRUCTIONS:
              </ThemedText>

              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={20} color="#000" />
                <ThemedText style={styles.instructionText}>
                  Write down all 12 words in order
                </ThemedText>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={20} color="#000" />
                <ThemedText style={styles.instructionText}>
                  Store them in a safe, offline location
                </ThemedText>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={20} color="#000" />
                <ThemedText style={styles.instructionText}>
                  Never share these words with anyone
                </ThemedText>
              </View>
              <View style={styles.instructionItem}>
                <Ionicons name="checkmark-circle" size={20} color="#000" />
                <ThemedText style={styles.instructionText}>
                  Anyone with these words can access your wallet
                </ThemedText>
              </View>
            </View>

            {/* Scroll to bottom indicator */}
            {!hasScrolledToBottom && (
              <View style={styles.scrollIndicator}>
                <Ionicons name="arrow-down" size={24} color="#000" />
                <ThemedText style={styles.scrollText}>
                  Scroll down to continue
                </ThemedText>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Next Button */}
        <View
          style={[
            styles.buttonContainer,
            {
              backgroundColor: backgroundColor,
              borderTopColor: borderColor,
              borderTopWidth: BorderWidth.thick,
            },
          ]}
        >
          <ThemedButton
            title="I've Written Down My Words"
            variant="primary"
            onPress={handleNext}
            style={styles.nextButton}
            disabled={!hasScrolledToBottom}
          />
        </View>
      </SafeThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  loadingTitle: {
    marginTop: Spacing.md,
    textAlign: "center",
    fontWeight: "800",
  },
  loadingText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  content: {
    flex: 1,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.md,
    fontWeight: "800",
    fontSize: 24,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: Spacing.lg,
    lineHeight: 22,
    fontSize: 15,
    fontWeight: "600",
  },
  warningContainer: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: 0,
    marginBottom: Spacing.lg,
    alignItems: "center",
    gap: Spacing.sm,
  },
  warningIcon: {
    marginRight: Spacing.xs,
  },
  warningText: {
    flex: 1,
    fontWeight: "700",
    lineHeight: 20,
    fontSize: 14,
    color: "#fff",
  },
  mnemonicContainer: {
    padding: Spacing.md,
    borderRadius: 0,
    marginBottom: Spacing.lg,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  wordItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    borderRadius: 0,
  },
  wordNumber: {
    width: 28,
    height: 28,
    borderRadius: 0,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.xs,
  },
  wordNumberText: {
    fontSize: 12,
    fontWeight: "800",
  },
  wordText: {
    flex: 1,
    fontFamily: "monospace",
    fontSize: 15,
    fontWeight: "700",
  },
  instructionsContainer: {
    padding: Spacing.md,
    borderRadius: 0,
    marginBottom: Spacing.lg,
  },
  instructionsTitle: {
    marginBottom: Spacing.md,
    fontWeight: "800",
    fontSize: 16,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  instructionText: {
    flex: 1,
    lineHeight: 20,
    fontSize: 14,
    fontWeight: "600",
  },
  scrollIndicator: {
    alignItems: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  scrollText: {
    fontWeight: "700",
    fontSize: 14,
  },
  buttonContainer: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  nextButton: {
    width: "100%",
  },
});
