import "../App.css";
import {
  Smartphone,
  Globe,
  Link2,
  Scan,
  Snowflake,
  Flame,
  Lock,
  QrCode,
  Key,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";

export function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            {/* Logo */}
            <img
              src="/logo.png"
              alt="Better Wallet Logo"
              className="hero-logo"
            />
            {/* name of the app */}
            <h1>Better Wallet</h1>
            <h3>Turn Any Device Into a Hardware Wallet</h3>
            <p className="hero-subtitle">
              Air-gapped security meets simplicity. Use your spare phone as a
              secure cold wallet and manage crypto safely with QR code signing
            </p>
            <div className="cta-buttons">
              <Link to="/cold" className="button">
                <Smartphone size={20} strokeWidth={2.5} /> Download Cold Wallet
              </Link>
              <a
                href="https://better-wallet.web.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="button button-secondary"
              >
                <Globe size={20} strokeWidth={2.5} /> Open Hot Wallet
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works section">
        <div className="container">
          <div className="text-center">
            <h2>How It Works</h2>
            <p
              style={{
                color: "var(--color-gray)",
                maxWidth: "700px",
                margin: "0 auto",
              }}
            >
              Better Wallet uses a two-device system for maximum security. Your
              private keys never touch the internet.
            </p>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">
                <Smartphone size={48} strokeWidth={2} />
              </div>
              <h3>Setup Cold Wallet</h3>
              <p>
                Install the cold wallet app on an offline device. Generate your
                wallet and keep it permanently offline for air-gapped security.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">
                <Link2 size={48} strokeWidth={2} />
              </div>
              <h3>Connect Hot Wallet</h3>
              <p>
                Open the hot wallet in your browser and scan the address QR code
                from your cold wallet. No private keys are shared.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">
                <Scan size={48} strokeWidth={2} />
              </div>
              <h3>Sign with QR Codes</h3>
              <p>
                Create transactions on the hot wallet, scan to sign on the cold
                wallet, then scan back to broadcast. Completely air-gapped.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section section">
        <div className="container">
          <div className="text-center mb-5">
            <h2>Two Apps, Maximum Security</h2>
          </div>

          <div className="features-grid">
            {/* Cold Wallet Features */}
            <div className="feature-card card">
              <div className="feature-header">
                <div className="feature-icon">
                  <Snowflake size={40} strokeWidth={2} />
                </div>
                <h3>Cold Wallet</h3>
              </div>
              <p style={{ color: "var(--color-gray)", marginBottom: "1.5rem" }}>
                Your offline fortress. Keeps private keys secure and never
                connects to the internet.
              </p>
              <ul className="feature-list">
                <li>Airplane mode enforcement</li>
                <li>Secure key storage with biometric auth</li>
                <li>Transaction signing via QR codes</li>
                <li>12-word recovery phrase backup</li>
                <li>Never connects to internet</li>
              </ul>
            </div>

            {/* Hot Wallet Features */}
            <div className="feature-card card">
              <div className="feature-header">
                <div className="feature-icon">
                  <Flame size={40} strokeWidth={2} />
                </div>
                <h3>Hot Wallet</h3>
              </div>
              <p style={{ color: "var(--color-gray)", marginBottom: "1.5rem" }}>
                Your online interface. Create transactions and interact with
                dApps without storing private keys.
              </p>
              <ul className="feature-list">
                <li>Watch-only wallet (no private keys)</li>
                <li>Create and broadcast transactions</li>
                <li>ERC20 token support (ETH, PYUSD)</li>
                <li>WalletConnect integration</li>
                <li>Works as a PWA on any device</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="security-section section">
        <div className="container">
          <div className="text-center">
            <h2>Bank-Grade Security, Zero Complexity</h2>
            <p
              style={{
                color: "var(--color-gray)",
                maxWidth: "700px",
                margin: "1rem auto 0",
              }}
            >
              Better Wallet implements proven security practices without
              requiring expensive hardware.
            </p>
          </div>

          <div className="security-grid">
            <div className="security-item">
              <div className="security-icon">
                <Lock size={48} strokeWidth={2} />
              </div>
              <h3>Air-Gapped Signing</h3>
              <p>
                Private keys never leave your offline device. No internet means
                no remote attacks.
              </p>
            </div>

            <div className="security-item">
              <div className="security-icon">
                <QrCode size={48} strokeWidth={2} />
              </div>
              <h3>QR Code Only</h3>
              <p>
                All communication happens via QR codes. No network, no risk.
              </p>
            </div>

            <div className="security-item">
              <div className="security-icon">
                <Key size={48} strokeWidth={2} />
              </div>
              <h3>Your Keys, Your Crypto</h3>
              <p>
                You control your private keys. No third parties, no custodians,
                no trust needed.
              </p>
            </div>

            <div className="security-item">
              <div className="security-icon">
                <Star size={48} strokeWidth={2} />
              </div>
              <h3>Open Source</h3>
              <p>
                Fully transparent code. Audit it yourself or trust the community
                review.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="section"
        style={{ backgroundColor: "var(--color-bg)" }}
      >
        <div className="container text-center">
          <h2 className="mb-3">Ready to Secure Your Crypto?</h2>
          <p
            style={{
              color: "var(--color-gray)",
              maxWidth: "600px",
              margin: "0 auto 2rem",
              fontSize: "1.125rem",
            }}
          >
            Download the cold wallet app for your offline device and open the
            hot wallet in your browser to get started.
          </p>
          <div className="cta-buttons">
            <Link to="/cold" className="button">
              <Smartphone size={20} strokeWidth={2.5} /> Download Cold Wallet
              APK
            </Link>
            <a
              href="https://better-wallet.web.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="button button-outline"
            >
              <Globe size={20} strokeWidth={2.5} /> Launch Hot Wallet App
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p
            style={{
              fontWeight: "700",
              fontSize: "1.25rem",
              marginBottom: "0.5rem",
            }}
          >
            Better Wallet
          </p>
          <p style={{ fontSize: "1rem" }}>
            Turn any device into a hardware wallet with air-gapped security
          </p>
          <div className="footer-links">
            <a
              href="https://github.com/pettiboy/better-wallet"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://better-wallet.web.app/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Hot Wallet App
            </a>
            <Link to="/cold">Download Cold App</Link>
            <a
              href="#download-apk"
              onClick={(e) => {
                e.preventDefault();
                alert("Documentation coming soon!");
              }}
            >
              Documentation
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
