import { useState, useEffect } from "react";
import { RefreshCw, History, Plus } from "lucide-react";
import { useTransactionPopup } from "@blockscout/app-sdk";
import { Button } from "../../components/Button";
import { NetworkSelector } from "../../components/NetworkSelector";
import { AddTokenModal } from "../../components/AddTokenModal";
import { useDeviceMode } from "../../contexts/DeviceModeContext";
import { useNetwork } from "../../contexts/NetworkContext";
import { useTokens } from "../../contexts/TokenContext";
import {
  getBalance,
  getERC20Balance,
  setProvider,
} from "../../services/ethereum";

export function HotHomePage() {
  const { walletAddress } = useDeviceMode();
  const { openPopup } = useTransactionPopup();
  const { selectedChain } = useNetwork();
  const { getTokensForChain } = useTokens();
  const [balance, setBalance] = useState<string>("0.0");
  const [loading, setLoading] = useState(false);
  const [tokenBalances, setTokenBalances] = useState<
    Record<string, { balance: string; symbol: string }>
  >({});
  const [isAddTokenModalOpen, setIsAddTokenModalOpen] = useState(false);

  // Initialize provider when chain changes
  useEffect(() => {
    setProvider(selectedChain.id, selectedChain.rpcUrl);
  }, [selectedChain]);

  useEffect(() => {
    if (walletAddress) {
      loadBalance();
    }
  }, [walletAddress, selectedChain]);

  const loadBalance = async () => {
    if (!walletAddress) return;

    setLoading(true);
    try {
      // Load native currency balance
      const nativeBal = await getBalance(walletAddress);
      setBalance(nativeBal);

      // Load custom token balances
      const customTokens = getTokensForChain(selectedChain.id);
      const balances: Record<string, { balance: string; symbol: string }> = {};

      for (const token of customTokens) {
        try {
          const { balance: tokenBal, symbol } = await getERC20Balance(
            token.address,
            walletAddress
          );
          balances[token.address] = { balance: tokenBal, symbol };
        } catch (error) {
          console.error(`Error loading balance for ${token.symbol}:`, error);
          balances[token.address] = { balance: "0.0", symbol: token.symbol };
        }
      }

      setTokenBalances(balances);
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
      chainId: selectedChain.id.toString(),
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

        {/* Network Selector */}
        <div style={{ marginBottom: "1.5rem" }}>
          <NetworkSelector />
        </div>

        {/* Balance Cards */}
        <div style={{ marginBottom: "1.5rem" }}>
          {/* Native Currency Balance */}
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
              {selectedChain.nativeCurrency.symbol} Balance
            </p>
            <p
              style={{
                fontSize: "2rem",
                fontWeight: 900,
              }}
            >
              {parseFloat(balance).toFixed(4)}{" "}
              {selectedChain.nativeCurrency.symbol}
            </p>
          </div>

          {/* Custom Token Balances */}
          {getTokensForChain(selectedChain.id).map((token) => (
            <div
              key={token.address}
              style={{
                backgroundColor: "var(--color-success)",
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
                {token.symbol} Balance
              </p>
              <p
                style={{
                  fontSize: "2rem",
                  fontWeight: 900,
                }}
              >
                {parseFloat(
                  tokenBalances[token.address]?.balance || "0.0"
                ).toFixed(token.decimals <= 6 ? 2 : 4)}{" "}
                {token.symbol}
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  opacity: 0.8,
                  marginTop: "0.5rem",
                }}
              >
                {token.name}
              </p>
            </div>
          ))}

          {/* Add Token Button */}
          <Button
            title="Add Custom Token"
            icon={Plus}
            variant="secondary"
            onClick={() => setIsAddTokenModalOpen(true)}
            fullWidth
          />
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

        {/* Add Token Modal */}
        <AddTokenModal
          isOpen={isAddTokenModalOpen}
          onClose={() => setIsAddTokenModalOpen(false)}
        />
      </div>
    </div>
  );
}
