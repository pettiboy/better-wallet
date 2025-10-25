import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { useOnboarding } from "../contexts/OnboardingContext";

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
    id: "1",
    title: "Welcome to Better Wallet",
    subtitle: "Hot wallet interface for secure transactions",
    icon: "🔐",
    description:
      "Connect to your cold wallet mobile app for secure transaction management.",
    details: [
      "Bank-level security",
      "Offline transaction signing",
      "No private keys stored here",
    ],
  },
  {
    id: "2",
    title: "Hot Wallet",
    subtitle: "Your online interface",
    icon: "📱",
    description:
      "Connects to the blockchain to broadcast transactions and check balances.",
    details: [
      "No private keys stored",
      "Broadcasts signed transactions",
      "Checks balances and network status",
    ],
  },
  {
    id: "3",
    title: "QR Code Workflow",
    subtitle: "Secure communication",
    icon: "📷",
    description:
      "Devices communicate only through QR codes - no network connection between them.",
    details: [
      "Hot wallet creates transaction QR",
      "Cold wallet scans and signs",
      "Signed transaction returned via QR",
    ],
  },
  {
    id: "4",
    title: "Ready to Get Started",
    subtitle: "Connect to your cold wallet",
    icon: "🚀",
    description:
      "Connect to your existing cold wallet mobile app to start managing transactions.",
    details: [
      "Hot Wallet: Connect to existing",
      "Cold Wallet: Mobile app required",
      "Both devices work together",
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
      navigate("/setup");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      navigate("/setup"); // Still proceed even if saving fails
    }
  };

  const currentSlide = slides[currentIndex];

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: "var(--color-bg-main)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        overflowY: "auto",
      }}
    >
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div
          style={{
            backgroundColor: "var(--color-white)",
            border: "4px solid var(--color-black)",
            boxShadow: "8px 8px 0 var(--color-black)",
            padding: "2rem",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>
              {currentSlide.icon}
            </div>

            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: 900,
                marginBottom: "0.5rem",
                color: "var(--color-black)",
              }}
            >
              {currentSlide.title}
            </h1>

            <h2
              style={{
                fontSize: "1.125rem",
                fontWeight: 700,
                color: "var(--color-gray-800)",
                marginBottom: "1rem",
              }}
            >
              {currentSlide.subtitle}
            </h2>

            <p
              style={{
                color: "var(--color-gray-800)",
                marginBottom: "1.5rem",
                lineHeight: 1.6,
              }}
            >
              {currentSlide.description}
            </p>

            {currentSlide.details && (
              <div
                style={{
                  backgroundColor: "var(--color-gray-100)",
                  border: "3px solid var(--color-black)",
                  padding: "1rem",
                  marginBottom: "1.5rem",
                  textAlign: "left",
                }}
              >
                {currentSlide.details.map((detail, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      marginBottom:
                        index < currentSlide.details!.length - 1 ? "0.5rem" : 0,
                    }}
                  >
                    <span
                      style={{
                        color: "var(--color-black)",
                        marginRight: "0.5rem",
                        fontWeight: 900,
                      }}
                    >
                      •
                    </span>
                    <span
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--color-gray-800)",
                        fontWeight: 500,
                      }}
                    >
                      {detail}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pagination dots */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "1.5rem",
              gap: "0.5rem",
            }}
          >
            {slides.map((_, index) => (
              <div
                key={index}
                style={{
                  width: "12px",
                  height: "12px",
                  border: "2px solid var(--color-black)",
                  backgroundColor:
                    index === currentIndex
                      ? "var(--color-primary)"
                      : "transparent",
                }}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            {currentIndex < slides.length - 1 && (
              <Button title="Skip" variant="secondary" onClick={handleSkip} />
            )}

            <Button
              title={
                currentIndex === slides.length - 1 ? "Get Started" : "Next"
              }
              variant="primary"
              onClick={handleNext}
              fullWidth={currentIndex === slides.length - 1}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
