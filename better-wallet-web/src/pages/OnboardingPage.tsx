import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { useOnboarding } from '../contexts/OnboardingContext';

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
    subtitle: 'Hot wallet interface for secure transactions',
    icon: '🔐',
    description: 'Connect to your cold wallet mobile app for secure transaction management.',
    details: [
      'Bank-level security',
      'Offline transaction signing',
      'No private keys stored here',
    ],
  },
  {
    id: '2',
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
    id: '3',
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
    id: '4',
    title: 'Ready to Get Started',
    subtitle: 'Connect to your cold wallet',
    icon: '🚀',
    description: 'Connect to your existing cold wallet mobile app to start managing transactions.',
    details: [
      'Hot Wallet: Connect to existing',
      'Cold Wallet: Mobile app required',
      'Both devices work together',
    ],
  },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const { markOnboardingComplete } = useOnboarding();
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
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
      navigate('/setup');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      navigate('/setup'); // Still proceed even if saving fails
    }
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-6">{currentSlide.icon}</div>
            
            <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              {currentSlide.title}
            </h1>
            
            <h2 className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              {currentSlide.subtitle}
            </h2>
            
            <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
              {currentSlide.description}
            </p>

            {currentSlide.details && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                {currentSlide.details.map((detail, index) => (
                  <div key={index} className="flex items-start mb-2">
                    <span className="text-gray-500 dark:text-gray-400 mr-2 mt-0.5">•</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{detail}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination dots */}
          <div className="flex justify-center mb-6">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full mx-1 ${
                  index === currentIndex ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between items-center">
            {currentIndex < slides.length - 1 && (
              <button
                onClick={handleSkip}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Skip
              </button>
            )}
            
            <Button
              title={currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
              variant="primary"
              onClick={handleNext}
              className="ml-auto"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
