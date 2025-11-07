import { useState } from "react";
import { X, Plus, Search } from "lucide-react";
import { Button } from "./Button";
import { useTokens } from "../contexts/TokenContext";
import { useNetwork } from "../contexts/NetworkContext";
import { getERC20Info, isValidAddress } from "../services/ethereum";
import { type TokenInfo } from "../config/tokens";

interface AddTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddTokenModal({ isOpen, onClose }: AddTokenModalProps) {
  const { addCustomToken, hasToken } = useTokens();
  const { selectedChain } = useNetwork();
  const [tokenAddress, setTokenAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchedToken, setFetchedToken] = useState<TokenInfo | null>(null);
  const [error, setError] = useState<string>("");

  if (!isOpen) return null;

  const handleFetchToken = async () => {
    setError("");
    setFetchedToken(null);

    if (!tokenAddress.trim()) {
      setError("Please enter a token contract address");
      return;
    }

    if (!isValidAddress(tokenAddress)) {
      setError("Invalid contract address format");
      return;
    }

    // Check if token already exists
    if (hasToken(selectedChain.id, tokenAddress)) {
      setError("This token is already added to your wallet");
      return;
    }

    setLoading(true);

    try {
      const tokenInfo = await getERC20Info(tokenAddress);

      const token: TokenInfo = {
        symbol: tokenInfo.symbol,
        name: tokenInfo.name,
        address: tokenAddress,
        decimals: tokenInfo.decimals,
        isNative: false,
      };

      setFetchedToken(token);
    } catch (err) {
      console.error("Error fetching token info:", err);
      setError(
        "Failed to fetch token information. Make sure this is a valid ERC20 token contract on the selected network."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddToken = () => {
    if (!fetchedToken) return;

    try {
      addCustomToken(selectedChain.id, fetchedToken);
      setTokenAddress("");
      setFetchedToken(null);
      setError("");
      onClose();
    } catch (err) {
      console.error("Error adding token:", err);
      setError("Failed to add token");
    }
  };

  const handleClose = () => {
    setTokenAddress("");
    setFetchedToken(null);
    setError("");
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: "var(--color-white)",
          border: "4px solid var(--color-black)",
          boxShadow: "8px 8px 0 var(--color-black)",
          maxWidth: "500px",
          width: "100%",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "3px solid var(--color-black)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 900,
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Plus size={24} strokeWidth={2.5} />
            Add Custom Token
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.25rem",
            }}
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "1.5rem" }}>
          {/* Network Info */}
          <div
            style={{
              backgroundColor: "var(--color-info)",
              border: "3px solid var(--color-black)",
              padding: "0.75rem",
              marginBottom: "1rem",
              fontSize: "0.875rem",
              fontWeight: 700,
              color: "var(--color-white)",
            }}
          >
            Adding token on: {selectedChain.name}
          </div>

          {/* Token Address Input */}
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 900,
                marginBottom: "0.5rem",
                color: "var(--color-black)",
              }}
            >
              Token Contract Address
            </label>
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              placeholder="0x..."
              disabled={loading}
              style={{
                width: "100%",
                marginBottom: "0.75rem",
              }}
            />
            <Button
              title={loading ? "Fetching..." : "Fetch Token Info"}
              icon={Search}
              variant="secondary"
              onClick={handleFetchToken}
              disabled={loading || !tokenAddress.trim()}
              fullWidth
            />
          </div>

          {/* Error Message */}
          {error && (
            <div
              style={{
                backgroundColor: "var(--color-danger)",
                border: "3px solid var(--color-black)",
                padding: "0.75rem",
                marginBottom: "1rem",
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "var(--color-white)",
              }}
            >
              {error}
            </div>
          )}

          {/* Fetched Token Info */}
          {fetchedToken && (
            <div
              style={{
                backgroundColor: "var(--color-gray-100)",
                border: "3px solid var(--color-black)",
                padding: "1rem",
                marginBottom: "1rem",
              }}
            >
              <h3
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 900,
                  marginBottom: "0.75rem",
                }}
              >
                Token Information
              </h3>
              <div style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                <div style={{ marginBottom: "0.5rem" }}>
                  <strong>Name:</strong> {fetchedToken.name}
                </div>
                <div style={{ marginBottom: "0.5rem" }}>
                  <strong>Symbol:</strong> {fetchedToken.symbol}
                </div>
                <div style={{ marginBottom: "0.5rem" }}>
                  <strong>Decimals:</strong> {fetchedToken.decimals}
                </div>
                <div
                  style={{
                    marginTop: "0.75rem",
                    paddingTop: "0.75rem",
                    borderTop: "2px solid var(--color-black)",
                  }}
                >
                  <strong>Address:</strong>
                  <div
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.75rem",
                      wordBreak: "break-all",
                      marginTop: "0.25rem",
                    }}
                  >
                    {fetchedToken.address}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
          >
            {fetchedToken && (
              <Button
                title="Add Token to Wallet"
                variant="primary"
                onClick={handleAddToken}
                fullWidth
              />
            )}
            <Button
              title="Cancel"
              variant="secondary"
              onClick={handleClose}
              fullWidth
            />
          </div>

          {/* Warning */}
          <div
            style={{
              backgroundColor: "var(--color-warning)",
              border: "3px solid var(--color-black)",
              padding: "0.75rem",
              marginTop: "1rem",
              fontSize: "0.75rem",
              fontWeight: 700,
            }}
          >
            ⚠️ Warning: Anyone can create a token with any name. Always verify
            the token contract address before adding.
          </div>
        </div>
      </div>
    </div>
  );
}
