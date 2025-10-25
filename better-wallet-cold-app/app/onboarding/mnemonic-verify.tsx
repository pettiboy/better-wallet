import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Animated,
  ScrollView,
} from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedButton } from "@/components/themed-button";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useLocalSearchParams, router } from "expo-router";
import { storePrivateKey } from "@/services/wallet";
import { ethers } from "ethers";
import { SafeThemedView } from "@/components/safe-themed-view";
import { BorderWidth, Shadows, Spacing } from "@/constants/theme";

export default function MnemonicVerifyScreen() {
  const { mnemonic } = useLocalSearchParams<{ mnemonic: string }>();
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [shuffledWords, setShuffledWords] = useState<
    { word: string; originalIndex: number }[]
  >([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [shakeAnimation] = useState(new Animated.Value(0));

  const overlayColor = useThemeColor({}, "overlay");
  const successColor = useThemeColor({}, "success");
  const borderColor = useThemeColor({}, "border");
  const cardColor = useThemeColor({}, "card");

  useEffect(() => {
    if (mnemonic) {
      const words = mnemonic.split(" ");
      const shuffled = words
        .map((word, index) => ({ word, originalIndex: index }))
        .sort(() => Math.random() - 0.5);
      setShuffledWords(shuffled);
    }
  }, [mnemonic]);

  const handleWordPress = (wordIndex: number) => {
    const wordItem = shuffledWords[wordIndex];
    const isSelected = selectedWords.some(
      (w, index) => w === wordItem.word && index === wordItem.originalIndex
    );

    if (isSelected) {
      setSelectedWords((prev) =>
        prev.filter(
          (w, index) =>
            !(w === wordItem.word && index === wordItem.originalIndex)
        )
      );
    } else {
      if (selectedWords.length < 12) {
        setSelectedWords((prev) => [...prev, wordItem.word]);
      }
    }
  };

  const handleVerify = async () => {
    if (selectedWords.length !== 12) {
      Alert.alert("Incomplete", "Please select all 12 words");
      return;
    }

    setIsVerifying(true);

    try {
      const originalWords = mnemonic?.split(" ") || [];
      const isCorrect = selectedWords.every(
        (word, index) => word === originalWords[index]
      );

      if (isCorrect) {
        const wallet = ethers.Wallet.fromPhrase(mnemonic);
        await storePrivateKey(wallet.privateKey, mnemonic);
        router.push("/onboarding/wallet-created");
      } else {
        triggerShakeAnimation();
        setSelectedWords([]);
        Alert.alert(
          "Incorrect",
          "The word order is incorrect. Please try again."
        );
      }
    } catch (error) {
      console.error("Error verifying mnemonic:", error);
      Alert.alert("Error", "Failed to verify mnemonic. Please try again.");
    } finally {
      setIsVerifying(false);
    }
  };

  const triggerShakeAnimation = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getWordButtonStyle = (wordIndex: number) => {
    const wordItem = shuffledWords[wordIndex];
    const isSelected = selectedWords.some(
      (w, index) => w === wordItem.word && index === wordItem.originalIndex
    );

    return [
      styles.wordButton,
      {
        backgroundColor: isSelected ? successColor : cardColor,
        borderColor,
        borderWidth: BorderWidth.thick,
        ...Shadows.small,
      },
      isSelected && styles.wordButtonSelected,
    ];
  };

  return (
    <SafeThemedView style={styles.container} edges={["top"]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ThemedText type="title" style={styles.title}>
          VERIFY RECOVERY PHRASE
        </ThemedText>

        <ThemedText style={styles.subtitle}>
          Tap the words in the correct order to verify you've written them down
          correctly.
        </ThemedText>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <ThemedText style={styles.progressText}>
            Word {selectedWords.length} of 12
          </ThemedText>
          <View
            style={[
              styles.progressBar,
              {
                borderColor,
                borderWidth: BorderWidth.thin,
              },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(selectedWords.length / 12) * 100}%`,
                  backgroundColor: successColor,
                },
              ]}
            />
          </View>
        </View>

        {/* Selected Words */}
        <Animated.View
          style={[
            styles.selectedContainer,
            {
              backgroundColor: overlayColor,
              borderColor,
              borderWidth: BorderWidth.thick,
              ...Shadows.medium,
            },
            { transform: [{ translateX: shakeAnimation }] },
          ]}
        >
          <ThemedText type="subtitle" style={styles.selectedTitle}>
            SELECTED WORDS:
          </ThemedText>

          <View style={styles.selectedWordsGrid}>
            {Array.from({ length: 12 }, (_, index) => (
              <View key={index} style={styles.selectedWordSlot}>
                <ThemedText style={styles.wordNumber}>{index + 1}.</ThemedText>
                <View
                  style={[
                    styles.selectedWord,
                    {
                      backgroundColor: selectedWords[index]
                        ? successColor
                        : cardColor,
                      borderColor,
                      borderWidth: BorderWidth.thin,
                    },
                  ]}
                >
                  <ThemedText style={styles.selectedWordText}>
                    {selectedWords[index] || "___"}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Word Selection */}
        <View style={styles.wordSelectionContainer}>
          <ThemedText type="subtitle" style={styles.selectionTitle}>
            TAP WORDS IN ORDER:
          </ThemedText>

          <View style={styles.wordsGrid}>
            {shuffledWords.map((wordItem, index) => {
              const isSelected = selectedWords.some(
                (w, i) => w === wordItem.word && i === wordItem.originalIndex
              );
              return (
                <TouchableOpacity
                  key={`${wordItem.word}-${wordItem.originalIndex}`}
                  style={getWordButtonStyle(index)}
                  onPress={() => handleWordPress(index)}
                  disabled={isSelected}
                  activeOpacity={0.7}
                >
                  <ThemedText
                    style={[styles.wordText, isSelected && { color: "#fff" }]}
                  >
                    {wordItem.word}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View
        style={[
          styles.buttonContainer,
          {
            backgroundColor: useThemeColor({}, "background"),
            borderTopColor: borderColor,
            borderTopWidth: BorderWidth.thick,
          },
        ]}
      >
        <ThemedButton
          title="Verify Recovery Phrase"
          variant="success"
          onPress={handleVerify}
          disabled={selectedWords.length !== 12}
          loading={isVerifying}
          style={styles.verifyButton}
        />

        <ThemedButton
          title="Start Over"
          variant="secondary"
          onPress={() => setSelectedWords([])}
          style={styles.resetButton}
        />
      </View>
    </SafeThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.md,
    paddingBottom: Spacing.xxl,
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
  progressContainer: {
    marginBottom: Spacing.lg,
  },
  progressText: {
    textAlign: "center",
    marginBottom: Spacing.sm,
    fontWeight: "700",
    fontSize: 16,
  },
  progressBar: {
    height: 12,
    backgroundColor: "transparent",
    borderRadius: 0,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 0,
  },
  selectedContainer: {
    padding: Spacing.md,
    borderRadius: 0,
    marginBottom: Spacing.lg,
  },
  selectedTitle: {
    marginBottom: Spacing.md,
    textAlign: "center",
    fontWeight: "800",
    fontSize: 16,
  },
  selectedWordsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  selectedWordSlot: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  wordNumber: {
    fontSize: 12,
    fontWeight: "800",
    marginRight: Spacing.xs,
    width: 24,
  },
  selectedWord: {
    flex: 1,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: 0,
    alignItems: "center",
    minHeight: 36,
    justifyContent: "center",
  },
  selectedWordText: {
    fontFamily: "monospace",
    fontSize: 13,
    fontWeight: "700",
  },
  wordSelectionContainer: {
    marginBottom: Spacing.lg,
  },
  selectionTitle: {
    marginBottom: Spacing.md,
    textAlign: "center",
    fontWeight: "800",
    fontSize: 16,
  },
  wordsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  wordButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 0,
    width: "48%",
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
  },
  wordButtonSelected: {
    opacity: 0.6,
  },
  wordText: {
    fontFamily: "monospace",
    fontSize: 14,
    fontWeight: "700",
  },
  buttonContainer: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  verifyButton: {
    width: "100%",
  },
  resetButton: {
    width: "100%",
  },
});
