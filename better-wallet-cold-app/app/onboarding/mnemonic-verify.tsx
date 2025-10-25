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

  useEffect(() => {
    if (mnemonic) {
      const words = mnemonic.split(" ");
      // Create shuffled words with original indices to handle duplicates
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
      // Remove word if already selected
      setSelectedWords((prev) =>
        prev.filter(
          (w, index) =>
            !(w === wordItem.word && index === wordItem.originalIndex)
        )
      );
    } else {
      // Add word if not selected and we haven't reached 12 words
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
        // Create wallet from the verified mnemonic
        const wallet = ethers.Wallet.fromPhrase(mnemonic);
        await storePrivateKey(wallet.privateKey, mnemonic);

        // Navigate to success screen
        router.push("/onboarding/wallet-created");
      } else {
        // Show shake animation and reset
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
        backgroundColor: isSelected ? successColor : overlayColor,
        borderColor: isSelected ? successColor : borderColor,
      },
    ];
  };

  const getSelectedWordStyle = (word: string, index: number) => {
    const isCorrect = selectedWords[index] === word;
    return [
      styles.selectedWord,
      {
        backgroundColor: isCorrect ? successColor : overlayColor,
        borderColor: isCorrect ? successColor : borderColor,
      },
    ];
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <ThemedText type="title" style={styles.title}>
          Verify Your Recovery Phrase
        </ThemedText>

        <ThemedText style={styles.subtitle}>
          Tap the words in the correct order to verify you&apos;ve written them
          down correctly.
        </ThemedText>

        {/* Progress */}
        <View style={styles.progressContainer}>
          <ThemedText style={styles.progressText}>
            Word {selectedWords.length} of 12
          </ThemedText>
          <View style={styles.progressBar}>
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
            { backgroundColor: overlayColor, borderColor },
            { transform: [{ translateX: shakeAnimation }] },
          ]}
        >
          <ThemedText type="subtitle" style={styles.selectedTitle}>
            Selected Words:
          </ThemedText>

          <View style={styles.selectedWordsGrid}>
            {Array.from({ length: 12 }, (_, index) => (
              <View key={index} style={styles.selectedWordSlot}>
                <ThemedText style={styles.wordNumber}>{index + 1}.</ThemedText>
                <View
                  style={getSelectedWordStyle(
                    selectedWords[index] || "",
                    index
                  )}
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
            Tap words in order:
          </ThemedText>

          <View style={styles.wordsGrid}>
            {shuffledWords.map((wordItem, index) => (
              <TouchableOpacity
                key={`${wordItem.word}-${wordItem.originalIndex}`}
                style={getWordButtonStyle(index)}
                onPress={() => handleWordPress(index)}
                disabled={selectedWords.some(
                  (w, i) => w === wordItem.word && i === wordItem.originalIndex
                )}
              >
                <ThemedText style={styles.wordText}>{wordItem.word}</ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <ThemedButton
            title="Verify Recovery Phrase"
            variant="primary"
            onPress={handleVerify}
            disabled={selectedWords.length !== 12 || isVerifying}
            style={[
              styles.verifyButton,
              selectedWords.length !== 12 && styles.disabledButton,
            ]}
          />

          <ThemedButton
            title="Start Over"
            variant="secondary"
            onPress={() => setSelectedWords([])}
            style={styles.resetButton}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
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
  progressContainer: {
    marginBottom: 24,
  },
  progressText: {
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "600",
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 2,
  },
  selectedContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  selectedTitle: {
    marginBottom: 12,
    textAlign: "center",
  },
  selectedWordsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  selectedWordSlot: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  wordNumber: {
    fontSize: 12,
    fontWeight: "bold",
    marginRight: 8,
    width: 20,
  },
  selectedWord: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  selectedWordText: {
    fontFamily: "monospace",
    fontSize: 14,
    fontWeight: "600",
  },
  wordSelectionContainer: {
    marginBottom: 24,
  },
  selectionTitle: {
    marginBottom: 12,
    textAlign: "center",
  },
  wordsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  wordButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    width: "48%",
    alignItems: "center",
  },
  wordText: {
    fontFamily: "monospace",
    fontSize: 14,
    fontWeight: "600",
  },
  buttonContainer: {
    gap: 12,
  },
  verifyButton: {
    width: "100%",
  },
  disabledButton: {
    opacity: 0.5,
  },
  resetButton: {
    width: "100%",
  },
});
