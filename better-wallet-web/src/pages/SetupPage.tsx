import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Smartphone } from "lucide-react";
import { QRScanner } from "../components/QRScanner";
import { useDeviceMode } from "../contexts/DeviceModeContext";

export function SetupPage() {
  const navigate = useNavigate();
  const { setMode, setWalletAddress } = useDeviceMode();
  const [scanning, setScanning] = useState(false);

  const handleConnectWallet = () => {
    setScanning(true);
  };

  const handleScan = (data: string) => {
    setScanning(false);

    if (data.startsWith("0x") && data.length === 42) {
      setWalletAddress(data);
      setMode("hot").then(() => {
        navigate("/hot/home");
        alert(`Connected to wallet: ${data.substring(0, 10)}...`);
      });
    } else {
      alert("Invalid wallet address QR code");
    }
  };

  if (scanning) {
    return (
      <QRScanner
        title="Scan Wallet Address"
        onScan={handleScan}
        onClose={() => setScanning(false)}
      />
    );
  }

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
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 900,
              textAlign: "center",
              marginBottom: "1rem",
              color: "var(--color-black)",
            }}
          >
            Connect Hot Wallet
          </h1>

          <p
            style={{
              textAlign: "center",
              color: "var(--color-gray-800)",
              marginBottom: "2rem",
              fontWeight: 500,
            }}
          >
            Connect to your cold wallet to manage transactions
          </p>

          <div
            style={{
              backgroundColor: "var(--color-gray-100)",
              border: "3px solid var(--color-black)",
              padding: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: 900,
                marginBottom: "1rem",
                color: "var(--color-black)",
              }}
            >
              How It Works
            </h2>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
              }}
            >
              <li
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-gray-800)",
                  marginBottom: "0.75rem",
                  fontWeight: 500,
                }}
              >
                • <span style={{ fontWeight: 900 }}>Cold Wallet:</span> Mobile
                app stores private keys offline
              </li>
              <li
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-gray-800)",
                  marginBottom: "0.75rem",
                  fontWeight: 500,
                }}
              >
                • <span style={{ fontWeight: 900 }}>Hot Wallet:</span> Web app
                connects to blockchain, broadcasts transactions
              </li>
              <li
                style={{
                  fontSize: "0.875rem",
                  color: "var(--color-gray-800)",
                  fontWeight: 500,
                }}
              >
                • Communication via QR codes only
              </li>
            </ul>
          </div>

          <button
            onClick={handleConnectWallet}
            style={{
              width: "100%",
              backgroundColor: "var(--color-primary)",
              color: "var(--color-white)",
              border: "4px solid var(--color-black)",
              padding: "1.5rem",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "6px 6px 0 var(--color-black)",
              transition: "all 0.1s ease",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translate(-2px, -2px)";
              e.currentTarget.style.boxShadow = "8px 8px 0 var(--color-black)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translate(0, 0)";
              e.currentTarget.style.boxShadow = "6px 6px 0 var(--color-black)";
            }}
          >
            <Smartphone
              size={48}
              strokeWidth={2.5}
              style={{ marginBottom: "0.5rem" }}
            />
            <span style={{ fontSize: "1.125rem" }}>Connect to Cold Wallet</span>
            <span style={{ fontSize: "0.875rem", opacity: 0.9 }}>
              Scan wallet address QR code
            </span>
          </button>

          <div
            style={{
              backgroundColor: "var(--color-info)",
              border: "3px solid var(--color-black)",
              padding: "1rem",
              color: "var(--color-white)",
            }}
          >
            <p
              style={{
                fontSize: "0.875rem",
                textAlign: "center",
                fontWeight: 700,
                margin: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <Smartphone size={16} strokeWidth={2.5} />
              Make sure you have the Better Wallet mobile app set up as your
              cold wallet first
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
