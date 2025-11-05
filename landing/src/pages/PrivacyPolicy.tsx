import "../App.css";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function PrivacyPolicy() {
  return (
    <>
      <section className="section">
        <div className="container">
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "2rem",
              color: "var(--color-primary)",
              fontWeight: 700,
            }}
          >
            <ArrowLeft size={20} strokeWidth={2.5} /> Back to Home
          </Link>

          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h1>Privacy Policy</h1>

            <div style={{ marginBottom: "3rem" }}>
              <h2>Introduction</h2>
              <p>
                Better Wallet ("we," "our," or "us") is committed to protecting
                your privacy. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our mobile
                and web applications (collectively, the "Service").
              </p>
            </div>

            <div style={{ marginBottom: "3rem" }}>
              <h2>Key Principle: Your Keys, Your Privacy</h2>
              <p>
                Better Wallet is designed with privacy as a core principle. We
                operate on a non-custodial basis, meaning:
              </p>
              <ul style={{ marginLeft: "1.5rem", marginTop: "1rem" }}>
                <li style={{ marginBottom: "0.5rem" }}>
                  <strong>We never store your private keys.</strong> All
                  cryptographic keys are generated and stored locally on your
                  device.
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  <strong>We never have access to your funds.</strong> We cannot
                  access, control, or recover your cryptocurrency.
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  <strong>We don't track your transactions.</strong> Transaction
                  data is processed on your device and through public blockchain
                  networks.
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  <strong>No account registration required.</strong> You can use
                  Better Wallet without creating an account or providing
                  personal information.
                </li>
              </ul>
            </div>

            <div style={{ marginBottom: "3rem" }}>
              <h2>Information We Collect</h2>

              <h3
                style={{
                  fontSize: "1.25rem",
                  marginTop: "1.5rem",
                  marginBottom: "1rem",
                }}
              >
                Cold Wallet App
              </h3>
              <p>
                The Cold Wallet mobile application operates entirely offline and
                does not collect, transmit, or store any information:
              </p>
              <ul style={{ marginLeft: "1.5rem", marginTop: "1rem" }}>
                <li style={{ marginBottom: "0.5rem" }}>
                  No network access is permitted when the app is in use
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  No data is transmitted to external servers
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  All wallet data is stored locally on your device using secure
                  storage
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Camera access is used only for QR code scanning (no images are
                  stored)
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Biometric authentication data is handled by your device's
                  secure enclave
                </li>
              </ul>

              <h3
                style={{
                  fontSize: "1.25rem",
                  marginTop: "1.5rem",
                  marginBottom: "1rem",
                }}
              >
                Hot Wallet App
              </h3>
              <p>
                The Hot Wallet web application is a watch-only wallet that
                connects to public blockchain networks. We may collect minimal
                information necessary for operation:
              </p>
              <ul style={{ marginLeft: "1.5rem", marginTop: "1rem" }}>
                <li style={{ marginBottom: "0.5rem" }}>
                  <strong>Public blockchain data:</strong> We read public
                  blockchain information (addresses, balances, transaction
                  history) that is already publicly available
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  <strong>Browser storage:</strong> We may store wallet
                  addresses and preferences locally in your browser
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  <strong>Error logs:</strong> If errors occur, we may collect
                  anonymous error information to improve the service
                </li>
              </ul>
            </div>

            <div style={{ marginBottom: "3rem" }}>
              <h2>How We Use Information</h2>
              <p>
                Since we collect minimal information, our use is limited to:
              </p>
              <ul style={{ marginLeft: "1.5rem", marginTop: "1rem" }}>
                <li style={{ marginBottom: "0.5rem" }}>
                  Providing and maintaining the Service
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Improving user experience and fixing bugs
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Ensuring security and preventing fraud
                </li>
              </ul>
            </div>

            <div style={{ marginBottom: "3rem" }}>
              <h2>Third-Party Services</h2>
              <p>Better Wallet may interact with third-party services:</p>
              <ul style={{ marginLeft: "1.5rem", marginTop: "1rem" }}>
                <li style={{ marginBottom: "0.5rem" }}>
                  <strong>Blockchain networks:</strong> We connect to public
                  Ethereum and other blockchain networks. Transactions are
                  public and permanent.
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  <strong>RPC providers:</strong> We may use third-party RPC
                  providers to query blockchain data. These providers may log
                  your IP address.
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  <strong>Hosting services:</strong> The Hot Wallet app is
                  hosted on Firebase. Please review Firebase's privacy policy
                  for their data practices.
                </li>
              </ul>
            </div>

            <div style={{ marginBottom: "3rem" }}>
              <h2>Data Security</h2>
              <p>We implement security measures to protect your information:</p>
              <ul style={{ marginLeft: "1.5rem", marginTop: "1rem" }}>
                <li style={{ marginBottom: "0.5rem" }}>
                  Private keys are encrypted using device secure storage
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Biometric authentication protects access to sensitive data
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Cold wallet operates in airplane mode to prevent network
                  access
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Open source code allows for security audits
                </li>
              </ul>
            </div>

            <div style={{ marginBottom: "3rem" }}>
              <h2>Your Rights</h2>
              <p>You have the right to:</p>
              <ul style={{ marginLeft: "1.5rem", marginTop: "1rem" }}>
                <li style={{ marginBottom: "0.5rem" }}>
                  Use the Service without providing personal information
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Delete the app and all locally stored data at any time
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Review our open source code to verify privacy claims
                </li>
                <li style={{ marginBottom: "0.5rem" }}>
                  Use the Service anonymously
                </li>
              </ul>
            </div>

            <div style={{ marginBottom: "3rem" }}>
              <h2>Children's Privacy</h2>
              <p>
                Our Service is not intended for children under 18. We do not
                knowingly collect personal information from children.
              </p>
            </div>

            <div style={{ marginBottom: "3rem" }}>
              <h2>Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last updated" date.
              </p>
            </div>

            <div style={{ marginBottom: "3rem" }}>
              <h2>Open Source</h2>
              <p>
                Better Wallet is open source software. You can review our code,
                audit our security practices, and verify our privacy claims by
                visiting our GitHub repository at{" "}
                <a
                  href="https://github.com/pettiboy/better-wallet"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  https://github.com/pettiboy/better-wallet
                </a>
                .
              </p>
            </div>

            <div style={{ marginBottom: "3rem" }}>
              <h2>Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please
                contact us through our GitHub repository or by creating an issue
                on our open source project.
              </p>
            </div>

            <div
              style={{
                marginTop: "3rem",
                paddingTop: "2rem",
                borderTop: "var(--border-width) solid var(--color-black)",
              }}
            >
              <Link to="/" className="button">
                <ArrowLeft size={20} strokeWidth={2.5} /> Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
