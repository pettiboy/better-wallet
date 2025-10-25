import { useNavigate } from "react-router-dom";
import { Settings, Unplug, Lightbulb } from "lucide-react";
import { Button } from "../../components/Button";
import { useDeviceMode } from "../../contexts/DeviceModeContext";

export function SettingsPage() {
  const navigate = useNavigate();
  const { walletAddress, setMode, setWalletAddress } = useDeviceMode();

  const handleDisconnect = () => {
    const confirmed = window.confirm(
      "Are you sure you want to disconnect this wallet? You'll need to scan a new wallet QR code to reconnect."
    );

    if (confirmed) {
      // Clear wallet address and return to setup mode
      setWalletAddress("");
      setMode("setup").then(() => {
        navigate("/setup");
      });
    }
  };

  return (
    <div
      style={{
        flex: 1,
        backgroundColor: "var(--color-bg-main)",
        overflowY: "auto",
        padding: "1.5rem",
        paddingBottom: "6rem", // Space for bottom navigation
      }}
    >
      <div style={{ maxWidth: "400px", margin: "0 auto" }}>
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: 900,
            textAlign: "center",
            marginBottom: "2rem",
            color: "var(--color-black)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.75rem",
          }}
        >
          <Settings size={40} strokeWidth={2.5} />
          Settings
        </h1>

        {/* Connected Wallet Info */}
        <div
          style={{
            backgroundColor: "var(--color-white)",
            border: "4px solid var(--color-black)",
            boxShadow: "8px 8px 0 var(--color-black)",
            padding: "1.5rem",
            marginBottom: "1.5rem",
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
            Connected Wallet
          </h2>
          <div
            style={{
              backgroundColor: "var(--color-gray-100)",
              border: "3px solid var(--color-black)",
              padding: "1rem",
              marginBottom: "1rem",
            }}
          >
            <p
              style={{
                fontSize: "0.875rem",
                fontWeight: 900,
                marginBottom: "0.5rem",
              }}
            >
              Address:
            </p>
            <p
              style={{
                fontFamily: "monospace",
                fontSize: "0.875rem",
                wordBreak: "break-all",
                fontWeight: 500,
                color: "var(--color-gray-800)",
              }}
            >
              {walletAddress}
            </p>
          </div>

          <Button
            title="Disconnect Wallet"
            icon={Unplug}
            variant="danger"
            onClick={handleDisconnect}
            fullWidth
          />
        </div>

        {/* App Info */}
        <div
          style={{
            backgroundColor: "var(--color-white)",
            border: "4px solid var(--color-black)",
            boxShadow: "8px 8px 0 var(--color-black)",
            padding: "1.5rem",
            marginBottom: "1.5rem",
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
            About
          </h2>
          <div style={{ fontSize: "0.875rem", lineHeight: 1.8 }}>
            <p style={{ marginBottom: "0.75rem", fontWeight: 500 }}>
              <strong>App:</strong> Better Wallet (Hot Wallet)
            </p>
            <p style={{ marginBottom: "0.75rem", fontWeight: 500 }}>
              <strong>Version:</strong> 1.0.0
            </p>
            <p style={{ marginBottom: "0.75rem", fontWeight: 500 }}>
              <strong>Network:</strong> Sepolia Testnet
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div
          style={{
            backgroundColor: "var(--color-info)",
            border: "3px solid var(--color-black)",
            padding: "1.5rem",
            color: "var(--color-white)",
          }}
        >
          <h3
            style={{
              fontWeight: 900,
              marginBottom: "1rem",
              fontSize: "1.125rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Lightbulb size={20} strokeWidth={2.5} />
            How It Works
          </h3>
          <ul
            style={{
              paddingLeft: "1.25rem",
              margin: 0,
              fontSize: "0.875rem",
              fontWeight: 700,
              lineHeight: 1.8,
            }}
          >
            <li>
              This is the <strong>hot wallet</strong> - it connects to the
              blockchain
            </li>
            <li>
              Your private keys are stored safely in the{" "}
              <strong>cold wallet</strong> mobile app
            </li>
            <li>Devices communicate only via QR codes</li>
            <li>No private keys are ever exposed online</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
