import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import { SafeThemedView } from '@/components/safe-themed-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedButton } from '@/components/themed-button';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useOnboarding } from '@/contexts/OnboardingContext';

const { width: screenWidth } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  details?: string[];
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Welcome to Better Wallet',
    subtitle: 'Your smartphone as a hardware wallet',
    icon: '🔐',
    description: 'Transform your phone into an air-gapped hardware wallet for maximum security.',
    details: [
      'Bank-level security',
      'Offline transaction signing',
      'No internet required for private keys',
    ],
  },
  {
    id: '2',
    title: 'Cold Wallet',
    subtitle: 'Your secure offline device',
    icon: '❄️',
    description: 'Store your private keys completely offline. Never connects to the internet.',
    details: [
      'Private keys stay offline',
      'Signs transactions locally',
      'Maximum security isolation',
    ],
  },
  {
    id: '3',
    title: 'Hot Wallet',
    subtitle: 'Your online interface',
    icon: '📱',
    description: 'Connects to the blockchain to broadcast transactions and check balances.',
    details: [
      'No private keys stored',
      'Broadcasts signed transactions',
      'Checks balances and network status',
    ],
  },
  {
    id: '4',
    title: 'QR Code Workflow',
    subtitle: 'Secure communication',
    icon: '📷',
    description: 'Devices communicate only through QR codes - no network connection between them.',
    details: [
      'Hot wallet creates transaction QR',
      'Cold wallet scans and signs',
      'Signed transaction returned via QR',
    ],
  },
  {
    id: '5',
    title: 'Ready to Get Started',
    subtitle: 'Choose your device type',
    icon: '🚀',
    description: 'Set up your cold wallet to store keys offline, or connect to an existing cold wallet.',
    details: [
      'Cold Wallet: Generate new wallet',
      'Hot Wallet: Connect to existing',
      'Both devices work together',
    ],
  },
];

interface OnboardingScreensProps {
  onComplete: () => void;
}

export function OnboardingScreens({ onComplete }: OnboardingScreensProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { markOnboardingComplete } = useOnboarding();

  const primaryColor = useThemeColor({}, 'primary');
  const cardColor = useThemeColor({}, 'card');
  const overlayColor = useThemeColor({}, 'overlay');
  const borderColor = useThemeColor({}, 'border');

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = async () => {
    try {
      await markOnboardingComplete();
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      onComplete(); // Still proceed even if saving fails
    }
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={[styles.slide, { width: screenWidth }]}>
      <View style={styles.content}>
        <Text style={styles.icon}>{item.icon}</Text>
        
        <ThemedText type="title" style={styles.title}>
          {item.title}
        </ThemedText>
        
        <ThemedText type="subtitle" style={styles.subtitle}>
          {item.subtitle}
        </ThemedText>
        
        <ThemedText style={styles.description}>
          {item.description}
        </ThemedText>

        {item.details && (
          <View style={[styles.detailsContainer, { backgroundColor: overlayColor }]}>
            {item.details.map((detail, index) => (
              <View key={index} style={styles.detailRow}>
                <Text style={styles.bullet}>•</Text>
                <ThemedText style={styles.detailText}>{detail}</ThemedText>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );

  const renderPaginationDots = () => (
    <View style={styles.paginationContainer}>
      {slides.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              backgroundColor: index === currentIndex ? primaryColor : borderColor,
            },
          ]}
        />
      ))}
    </View>
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  return (
    <SafeThemedView>
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        keyExtractor={(item) => item.id}
      />
      
      <View style={styles.footer}>
        {renderPaginationDots()}
        
        <View style={styles.buttonContainer}>
          {currentIndex < slides.length - 1 && (
            <TouchableOpacity
              style={[styles.skipButton, { borderColor }]}
              onPress={handleSkip}
            >
              <ThemedText style={styles.skipText}>Skip</ThemedText>
            </TouchableOpacity>
          )}
          
          <ThemedButton
            title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
            variant="primary"
            onPress={handleNext}
            style={styles.nextButton}
          />
        </View>
      </View>
    </SafeThemedView>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    alignItems: 'center',
    maxWidth: 320,
  },
  icon: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  description: {
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  detailsContainer: {
    padding: 20,
    borderRadius: 12,
    width: '100%',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bullet: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
    opacity: 0.7,
  },
  detailText: {
    flex: 1,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  skipText: {
    fontSize: 16,
  },
  nextButton: {
    flex: 1,
    marginLeft: 16,
  },
});
