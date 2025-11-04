import {
  AlertTriangle,
  Download,
  Shield,
  Smartphone,
  Check,
  Info,
  Settings,
} from "lucide-react";
import "./Cold.css";

interface AppVersion {
  version: string;
  releaseDate: string;
  downloadUrl: string;
  size?: string;
  changelog?: string[];
}

const appVersions: AppVersion[] = [
  {
    version: "1.0.0",
    releaseDate: "2024-01-15",
    downloadUrl: "/builds/app-release.apk",
    size: "~25 MB",
    changelog: [
      "Initial release",
      "Air-gapped transaction signing",
      "Biometric authentication",
      "QR code scanning",
      "HD wallet with BIP39 mnemonic",
    ],
  },
];

const latestVersion = appVersions[0];

export default function Cold() {
  return (
    <>
      {/* Hero Section */}
      <section className="cold-hero">
        <div className="container">
          <div className="cold-hero-content">
            <img
              src="/logo.png"
              alt="Better Wallet Logo"
              className="cold-hero-logo"
            />
            <h1>Better Wallet - Cold App</h1>
            <p className="cold-hero-subtitle">
              Download the secure, offline-only cold wallet for your Android
              device
            </p>
          </div>
        </div>
      </section>

      {/* Latest Version Download Section */}
      <section className="download-section section">
        <div className="container">
          <div className="download-card card">
            <div className="download-header">
              <Smartphone size={48} strokeWidth={2} className="download-icon" />
              <div>
                <h2>Latest Version</h2>
                <p className="version-label">v{latestVersion.version}</p>
              </div>
            </div>
            <div className="download-info">
              <div className="apk-info">
                <Info size={20} strokeWidth={2} />
                <span>
                  <strong>File Format:</strong> Android APK (.apk) - Android
                  8.0+ required
                </span>
              </div>
              <div className="download-meta">
                <span>
                  <strong>Release Date:</strong>{" "}
                  {new Date(latestVersion.releaseDate).toLocaleDateString(
                    "en-US",
                    { year: "numeric", month: "long", day: "numeric" }
                  )}
                </span>
                {latestVersion.size && (
                  <span>
                    <strong>Size:</strong> {latestVersion.size}
                  </span>
                )}
              </div>
              {latestVersion.changelog &&
                latestVersion.changelog.length > 0 && (
                  <div className="changelog">
                    <h3>What's New:</h3>
                    <ul className="changelog-list">
                      {latestVersion.changelog.map((item, index) => (
                        <li key={index}>
                          <Check size={16} strokeWidth={2.5} />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              <a
                href={latestVersion.downloadUrl}
                className="button download-button"
                download="better-wallet-cold.apk"
              >
                <Download size={20} strokeWidth={2.5} /> Download Latest Version
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Android Sideloading Instructions */}
      <section className="sideloading-section section">
        <div className="container">
          <div className="sideloading-card card">
            <div className="sideloading-header">
              <Settings
                size={48}
                strokeWidth={2}
                className="sideloading-icon"
              />
              <div>
                <h2>Installing on Android</h2>
                <p className="sideloading-subtitle">
                  Android will show security warnings when installing APK files.
                  Here's how to safely allow installation.
                </p>
              </div>
            </div>
            <div className="sideloading-content">
              <div className="sideloading-warning-box">
                <AlertTriangle size={24} strokeWidth={2} />
                <div>
                  <strong>What to Expect:</strong>
                  <p>
                    When you try to install the APK, Android will show a warning
                    about "Install from Unknown Sources" or "Install Unknown
                    Apps". This is normal security behavior for apps not from
                    the Play Store.
                  </p>
                </div>
              </div>

              <div className="installation-steps">
                <h3>Step-by-Step Installation:</h3>
                <ol className="steps-list">
                  <li>
                    <strong>Download the APK</strong> using the button above
                    (saves to your Downloads folder)
                  </li>
                  <li>
                    <strong>Open your file manager</strong> or Downloads app and
                    tap the downloaded APK file
                  </li>
                  <li>
                    <strong>Android will show a warning</strong> - Tap
                    "Settings" or "Allow from this source"
                  </li>
                  <li>
                    <strong>Enable installation</strong> - Toggle "Allow from
                    this source" or "Install unknown apps" ON
                  </li>
                  <li>
                    <strong>Go back</strong> and tap "Install" to complete the
                    installation
                  </li>
                  <li>
                    <strong>Open the app</strong> after installation completes
                  </li>
                </ol>
              </div>

              <div className="sideloading-security-note">
                <Shield size={24} strokeWidth={2} />
                <div>
                  <strong>Why This is Safe:</strong>
                  <p>
                    This warning appears because the app isn't from Google Play
                    Store. Better Wallet is open-source and the APK is signed
                    with our official signing key. You're downloading from the
                    official website, so it's safe to proceed. Android's
                    security feature is working as intended - it protects you
                    from malicious apps, but trusted sources like this website
                    are safe.
                  </p>
                </div>
              </div>

              <div className="alternative-methods">
                <h4>Alternative: Enable Before Installing</h4>
                <p>
                  You can also enable "Install unknown apps" before downloading:
                </p>
                <ul>
                  <li>
                    <strong>Android 8.0+:</strong> Settings → Apps → Special
                    access → Install unknown apps → Select your browser/file
                    manager → Enable
                  </li>
                  <li>
                    <strong>Older Android:</strong> Settings → Security → Enable
                    "Unknown sources"
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Warning Section */}
      <section className="security-warning-section section">
        <div className="container">
          <div className="warning-card card">
            <div className="warning-header">
              <AlertTriangle
                size={48}
                strokeWidth={2}
                className="warning-icon"
              />
              <h2>Security Warning</h2>
            </div>
            <div className="warning-content">
              <p className="warning-text">
                <strong>
                  Only download Better Wallet from this official website.
                </strong>
              </p>
              <ul className="warning-list">
                <li>
                  <Shield size={20} strokeWidth={2} />
                  <span>
                    Never download from third-party app stores or unverified
                    sources
                  </span>
                </li>
                <li>
                  <Shield size={20} strokeWidth={2} />
                  <span>
                    Verify the download URL matches this website exactly
                  </span>
                </li>
                <li>
                  <Shield size={20} strokeWidth={2} />
                  <span>Check the APK signature before installing</span>
                </li>
                <li>
                  <Shield size={20} strokeWidth={2} />
                  <span>Malicious copies could steal your private keys</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Security Info */}
      <section className="security-info-section section">
        <div className="container">
          <div className="text-center mb-5">
            <h2>Why Download Only From Here?</h2>
          </div>
          <div className="security-grid">
            <div className="security-item">
              <div className="security-icon">
                <Shield size={48} strokeWidth={2} />
              </div>
              <h3>Official Source</h3>
              <p>
                This is the only official website for Better Wallet downloads.
                Any other source may distribute malicious copies.
              </p>
            </div>
            <div className="security-item">
              <div className="security-icon">
                <AlertTriangle size={48} strokeWidth={2} />
              </div>
              <h3>Protect Your Keys</h3>
              <p>
                Malicious copies could steal your private keys and drain your
                wallet. Always verify the source before downloading.
              </p>
            </div>
            <div className="security-item">
              <div className="security-icon">
                <Check size={48} strokeWidth={2} />
              </div>
              <h3>Verified Builds</h3>
              <p>
                All builds are signed and verified. Check the APK signature
                matches our official signing key before installation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* All Versions Section */}
      <section className="versions-section section">
        <div className="container">
          <div className="text-center mb-3">
            <h3 className="versions-heading">Previous Versions</h3>
            <p className="versions-subtitle">
              Older versions are available for archival purposes only. We
              recommend using the latest version for security and features.
            </p>
          </div>

          <div className="versions-list">
            {appVersions.slice(1).map((version) => (
              <div
                key={version.version}
                className="version-card version-card-archival"
              >
                <div className="version-header">
                  <div>
                    <h4>v{version.version}</h4>
                    <span className="version-date">
                      Released:{" "}
                      {new Date(version.releaseDate).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" }
                      )}
                    </span>
                  </div>
                  <a
                    href={version.downloadUrl}
                    className="button button-archival"
                    download={`better-wallet-cold-${version.version}.apk`}
                  >
                    <Download size={16} strokeWidth={2.5} /> Download
                  </a>
                </div>
                {version.size && (
                  <div className="version-size">
                    <strong>Size:</strong> {version.size}
                  </div>
                )}
                {version.changelog && version.changelog.length > 0 && (
                  <div className="version-changelog">
                    <h5>Changes:</h5>
                    <ul>
                      {version.changelog.map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
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
            <a href="/">Home</a>
            <a href="/cold">Download Cold App</a>
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
          </div>
        </div>
      </footer>
    </>
  );
}
