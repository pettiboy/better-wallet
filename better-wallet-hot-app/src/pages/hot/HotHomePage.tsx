import { useState, useEffect } from "react";
import { RefreshCw, History } from "lucide-react";
import { useTransactionPopup } from "@blockscout/app-sdk";
import { Button } from "../../components/Button";
import { useDeviceMode } from "../../contexts/DeviceModeContext";
import { getBalance, getERC20Balance } from "../../services/ethereum";
import { SUPPORTED_TOKENS } from "../../config/tokens";

export function HotHomePage() {
  const { walletAddress } = useDeviceMode();
  const { openPopup } = useTransactionPopup();
  const [balance, setBalance] = useState<string>("0.0");
  const [pyusdBalance, setPyusdBalance] = useState<string>("0.0");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (walletAddress) {
      loadBalance();
    }
  }, [walletAddress]);

  const loadBalance = async () => {
    if (!walletAddress) return;

    setLoading(true);
    try {
      // Load ETH balance
      const ethBal = await getBalance(walletAddress);
      setBalance(ethBal);

      // Load PYUSD balance
      const pyusdToken = SUPPORTED_TOKENS.find((t) => t.symbol === "PYUSD");
      if (pyusdToken) {
        const { balance: pyusdBal } = await getERC20Balance(
          pyusdToken.address,
          walletAddress
        );
        setPyusdBalance(pyusdBal);
      }
    } catch (error) {
      console.error("Error loading balance:", error);
      alert("Failed to load balance. Check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = () => {
    if (!walletAddress) return;
    openPopup({
      chainId: "11155111", // Sepolia testnet
      address: walletAddress,
    });
  };

  if (!walletAddress) {
    return (
      <div
        style={{
          flex: 1,
          backgroundColor: "var(--color-bg-main)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1.5rem",
          paddingBottom: "6rem",
        }}
      >
        <div
          style={{
            backgroundColor: "var(--color-white)",
            border: "4px solid var(--color-black)",
            boxShadow: "8px 8px 0 var(--color-black)",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: 900,
              marginBottom: "1rem",
            }}
          >
            Hot Wallet
          </h1>
          <p style={{ color: "var(--color-gray-800)", fontWeight: 500 }}>
            No wallet connected. Please connect to your cold wallet mobile app
            first.
          </p>
        </div>
      </div>
    );
  }

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
        <div
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
          {/* image inside a outline circle */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "50%",
              padding: "0.25rem",
              border: "2px solid var(--color-black)",
              boxShadow: "4px 4px 0 var(--color-black)",
            }}
          >
            <img
              src="/android-chrome-512x512.png"
              alt="Better Wallet"
              width={70}
              height={70}
            />
          </div>
          <h1 style={{ fontSize: "2.5rem", fontWeight: 900, margin: 0 }}>
            Better Wallet
          </h1>
        </div>

        {/* Balance Cards */}
        <div style={{ marginBottom: "1.5rem" }}>
          {/* ETH Balance */}
          <div
            style={{
              backgroundColor: "var(--color-primary)",
              border: "4px solid var(--color-black)",
              boxShadow: "8px 8px 0 var(--color-black)",
              padding: "1.5rem",
              textAlign: "center",
              color: "var(--color-white)",
              marginBottom: "1rem",
            }}
          >
            <p
              style={{
                fontSize: "0.875rem",
                opacity: 0.9,
                marginBottom: "0.5rem",
                fontWeight: 700,
              }}
            >
              ETH Balance
            </p>
            <p
              style={{
                fontSize: "2rem",
                fontWeight: 900,
              }}
            >
              {parseFloat(balance).toFixed(4)} ETH
            </p>
          </div>

          {/* PYUSD Balance */}
          <div
            style={{
              backgroundColor: "var(--color-success)",
              border: "4px solid var(--color-black)",
              boxShadow: "8px 8px 0 var(--color-black)",
              padding: "1.5rem",
              textAlign: "center",
              color: "var(--color-white)",
            }}
          >
            <p
              style={{
                fontSize: "0.875rem",
                opacity: 0.9,
                marginBottom: "0.5rem",
                fontWeight: 700,
              }}
            >
              PYUSD Balance
            </p>
            <p
              style={{
                fontSize: "2rem",
                fontWeight: 900,
              }}
            >
              {parseFloat(pyusdBalance).toFixed(2)} PYUSD
            </p>
          </div>
        </div>

        {/* Network Badge */}
        <div
          style={{
            backgroundColor: "var(--color-gray-100)",
            border: "3px solid var(--color-black)",
            padding: "0.75rem",
            textAlign: "center",
            marginBottom: "1.5rem",
          }}
        >
          <p style={{ fontSize: "0.875rem", fontWeight: 900, margin: 0 }}>
            Sepolia Testnet
          </p>
        </div>

        {/* Address Card */}
        <div
          style={{
            backgroundColor: "var(--color-gray-100)",
            border: "3px solid var(--color-black)",
            padding: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <p
            style={{
              fontSize: "0.875rem",
              fontWeight: 900,
              marginBottom: "0.5rem",
              color: "var(--color-black)",
            }}
          >
            Address
          </p>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: "0.875rem",
              color: "var(--color-black)",
              wordBreak: "break-all",
              fontWeight: 500,
            }}
          >
            {walletAddress}
          </p>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <Button
            title="Transaction History"
            icon={History}
            variant="secondary"
            onClick={handleViewHistory}
            fullWidth
          />

          <Button
            title="Refresh Balance"
            icon={RefreshCw}
            variant="secondary"
            onClick={loadBalance}
            disabled={loading}
            fullWidth
          />
        </div>

        {/* How to Use */}
        <div
          style={{
            backgroundColor: "var(--color-warning)",
            border: "3px solid var(--color-black)",
            padding: "1.5rem",
            color: "var(--color-black)",
          }}
        >
          <h3
            style={{
              fontWeight: 900,
              marginBottom: "1rem",
              fontSize: "1.125rem",
            }}
          >
            How to Use
          </h3>
          <ol
            style={{
              paddingLeft: "1.25rem",
              margin: 0,
              fontSize: "0.875rem",
              fontWeight: 500,
              lineHeight: 1.8,
            }}
          >
            <li>Create a transaction on this web app</li>
            <li>Show the QR code to your cold wallet mobile app</li>
            <li>Sign it on the mobile app (offline)</li>
            <li>Scan the signed transaction back here</li>
            <li>Broadcast to the network</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
