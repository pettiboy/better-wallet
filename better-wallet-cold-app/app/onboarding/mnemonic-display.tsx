import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { SafeThemedView } from "@/components/safe-themed-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { useThemeColor } from "@/hooks/use-theme-color";
import { generateWallet } from "@/services/wallet";
import { router } from "expo-router";

export default function MnemonicDisplayScreen() {
  const [mnemonic, setMnemonic] = useState<string>("");
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isGenerating, setIsGenerating] = useState(true);

  const overlayColor = useThemeColor({}, "overlay");
  const dangerColor = useThemeColor({}, "danger");
  const borderColor = useThemeColor({}, "border");

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

    // Navigate to verification screen with mnemonic
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
          <ThemedText type="title" style={styles.loadingTitle}>
            Generating Wallet...
          </ThemedText>
          <ThemedText style={styles.loadingText}>
            Creating your secure Ethereum wallet
          </ThemedText>
        </View>
      </SafeThemedView>
    );
  }

  return (
    <SafeThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={styles.content}>
          {/* Header */}
          <ThemedText type="title" style={styles.title}>
            Your Recovery Phrase
          </ThemedText>

          <ThemedText style={styles.subtitle}>
            Write down these 12 words in the exact order shown. Store them
            safely offline.
          </ThemedText>

          {/* Warning */}
          <View
            style={[styles.warningContainer, { backgroundColor: dangerColor }]}
          >
            <ThemedText style={styles.warningText}>
              ⚠️ These words are your wallet. Write them down and store them
              offline. This will not be shown again.
            </ThemedText>
          </View>

          {/* Mnemonic Words Grid */}
          <View
            style={[
              styles.mnemonicContainer,
              { backgroundColor: overlayColor, borderColor },
            ]}
          >
            {mnemonicWords.map((word, index) => (
              <View key={index} style={styles.wordItem}>
                <View
                  style={[styles.wordNumber, { backgroundColor: borderColor }]}
                >
                  <ThemedText style={styles.wordNumberText}>
                    {index + 1}
                  </ThemedText>
                </View>
                <ThemedText style={styles.wordText}>{word}</ThemedText>
              </View>
            ))}
          </View>

          {/* Instructions */}
          <View style={styles.instructionsContainer}>
            <ThemedText type="subtitle" style={styles.instructionsTitle}>
              Important Instructions:
            </ThemedText>

            <ThemedText style={styles.instructionItem}>
              • Write down all 12 words in order
            </ThemedText>
            <ThemedText style={styles.instructionItem}>
              • Store them in a safe, offline location
            </ThemedText>
            <ThemedText style={styles.instructionItem}>
              • Never share these words with anyone
            </ThemedText>
            <ThemedText style={styles.instructionItem}>
              • Anyone with these words can access your wallet
            </ThemedText>
          </View>

          {/* Scroll to bottom indicator */}
          {!hasScrolledToBottom && (
            <View style={styles.scrollIndicator}>
              <ThemedText style={styles.scrollText}>
                Scroll down to continue
              </ThemedText>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.buttonContainer}>
        <ThemedButton
          title="I've Written Down My Words"
          variant="primary"
          onPress={handleNext}
          style={[
            styles.nextButton,
            !hasScrolledToBottom && styles.disabledButton,
          ]}
          disabled={!hasScrolledToBottom}
        />
      </View>
    </SafeThemedView>
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
    padding: 20,
  },
  loadingTitle: {
    marginBottom: 16,
    textAlign: "center",
  },
  loadingText: {
    textAlign: "center",
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  content: {
    flex: 1,
  },
  title: {
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
    opacity: 0.8,
  },
  warningContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  warningText: {
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 20,
  },
  mnemonicContainer: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  wordItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "48%",
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  wordNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  wordNumberText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  wordText: {
    flex: 1,
    fontFamily: "monospace",
    fontSize: 16,
    fontWeight: "600",
  },
  instructionsContainer: {
    marginBottom: 24,
  },
  instructionsTitle: {
    marginBottom: 12,
  },
  instructionItem: {
    marginBottom: 8,
    lineHeight: 20,
  },
  scrollIndicator: {
    alignItems: "center",
    paddingVertical: 16,
  },
  scrollText: {
    opacity: 0.6,
    fontStyle: "italic",
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 0,
  },
  nextButton: {
    width: "100%",
  },
  disabledButton: {
    opacity: 0.5,
  },
});
