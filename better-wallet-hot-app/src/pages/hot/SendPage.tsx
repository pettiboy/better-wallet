import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { Send, CheckCircle, Lightbulb, Coins } from "lucide-react";
import { useNotification } from "@blockscout/app-sdk";
import { Button } from "../../components/Button";
import { QRDisplay } from "../../components/QRDisplay";
import { QRScanner } from "../../components/QRScanner";
import { useDeviceMode } from "../../contexts/DeviceModeContext";
import { useNetwork } from "../../contexts/NetworkContext";
import { useTokens } from "../../contexts/TokenContext";
import {
  constructTransaction,
  constructERC20Transfer,
  broadcastTransaction,
  isValidAddress,
  getBalance,
  getERC20Balance,
  setProvider,
} from "../../services/ethereum";
import {
  serializeTransaction,
  deserializeSignedTransaction,
} from "../../utils/transaction-serializer";
import { type TokenInfo } from "../../config/tokens";

type Step =
  | "input"
  | "show-unsigned"
  | "scan-signed"
  | "broadcasting"
  | "success";

export function SendPage() {
  const { walletAddress } = useDeviceMode();
  const { openTxToast } = useNotification();
  const { selectedChain } = useNetwork();
  const { getTokensForChain } = useTokens();
  const [step, setStep] = useState<Step>("input");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [availableTokens, setAvailableTokens] = useState<TokenInfo[]>([]);
  const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(null);
  const [tokenBalance, setTokenBalance] = useState<string | null>(null);
  const [unsignedTx, setUnsignedTx] =
    useState<ethers.TransactionRequest | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Initialize provider when chain changes
  useEffect(() => {
    setProvider(selectedChain.id, selectedChain.rpcUrl);
  }, [selectedChain]);

  const loadTokenBalance = useCallback(async () => {
    if (!walletAddress || !selectedToken) return;

    try {
      if (selectedToken.isNative) {
        const balance = await getBalance(walletAddress);
        setTokenBalance(balance);
      } else {
        const { balance } = await getERC20Balance(
          selectedToken.address,
          walletAddress
        );
        setTokenBalance(balance);
      }
    } catch (error) {
      console.error("Error loading balance:", error);
      setTokenBalance(null);
    }
  }, [walletAddress, selectedToken]);

  // Update available tokens when chain changes
  useEffect(() => {
    const nativeToken: TokenInfo = {
      symbol: selectedChain.nativeCurrency.symbol,
      name: selectedChain.nativeCurrency.name,
      address: "0x0",
      decimals: selectedChain.nativeCurrency.decimals,
      isNative: true,
    };

    const customTokens = getTokensForChain(selectedChain.id);
    const tokens = [nativeToken, ...customTokens];
    setAvailableTokens(tokens);

    // Set default selected token to native
    if (!selectedToken || selectedToken.isNative) {
      setSelectedToken(nativeToken);
    } else {
      // Check if current selected token is available in new chain
      const tokenExists = customTokens.find(
        (t) => t.address.toLowerCase() === selectedToken.address.toLowerCase()
      );
      setSelectedToken(tokenExists || nativeToken);
    }
  }, [selectedChain, getTokensForChain, selectedToken]);

  // Load token balance when token or chain changes
  useEffect(() => {
    if (selectedToken) {
      loadTokenBalance();
    }
  }, [selectedToken, walletAddress, selectedChain, loadTokenBalance]);

  const handleCreateTransaction = async () => {
    if (!walletAddress) {
      alert("No wallet address found");
      return;
    }

    if (!selectedToken) {
      alert("No token selected");
      return;
    }

    if (!recipient || !amount) {
      alert("Please fill in all fields");
      return;
    }

    if (!isValidAddress(recipient)) {
      alert("Invalid recipient address");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert("Invalid amount");
      return;
    }

    try {
      let tx: ethers.TransactionRequest;

      if (selectedToken.isNative) {
        // ETH transfer
        tx = await constructTransaction(walletAddress, recipient, amount);
      } else {
        // ERC20 token transfer
        tx = await constructERC20Transfer(
          selectedToken.address,
          walletAddress,
          recipient,
          amount,
          selectedToken.decimals
        );
      }

      setUnsignedTx(tx);
      setStep("show-unsigned");
    } catch (error) {
      console.error("Error creating transaction:", error);
      alert(
        "Failed to create transaction. Check your balance and internet connection."
      );
    }
  };

  const handleScanSigned = (data: string) => {
    setStep("input");
    broadcastSignedTransaction(data);
  };

  const broadcastSignedTransaction = async (data: string) => {
    setStep("broadcasting");

    try {
      // Deserialize to handle both legacy and new formats
      const { signedTransaction } = deserializeSignedTransaction(data);
      const hash = await broadcastTransaction(signedTransaction);
      setTxHash(hash);
      setStep("success");

      // Show Blockscout transaction toast for real-time tracking
      await openTxToast(selectedChain.id.toString(), hash);

      alert(`Transaction broadcasted!\nHash: ${hash.substring(0, 10)}...`);
    } catch (error) {
      console.error("Error broadcasting transaction:", error);
      alert("Failed to broadcast transaction");
      setStep("input");
    }
  };

  const handleReset = () => {
    setStep("input");
    setRecipient("");
    setAmount("");
    setUnsignedTx(null);
    setTxHash(null);
    loadTokenBalance();
  };

  const getTransactionDisplayValue = (tx: ethers.TransactionRequest) => {
    if (!selectedToken) return "0";

    if (selectedToken.isNative) {
      return `${ethers.formatEther(tx.value || 0)} ${selectedToken.symbol}`;
    } else {
      // For ERC20, decode the data to get the amount
      if (tx.data) {
        try {
          const iface = new ethers.Interface([
            "function transfer(address to, uint256 amount)",
          ]);
          const decoded = iface.decodeFunctionData("transfer", tx.data);
          const formattedAmount = ethers.formatUnits(
            decoded[1],
            selectedToken.decimals
          );
          return `${formattedAmount} ${selectedToken.symbol}`;
        } catch (error: unknown) {
          console.error("Error decoding transaction data:", error);
          return `${amount} ${selectedToken.symbol}`;
        }
      }
      return `${amount} ${selectedToken.symbol}`;
    }
  };

  if (step === "scan-signed") {
    return (
      <QRScanner
        title="Scan Signed Transaction"
        onScan={handleScanSigned}
        onClose={() => setStep("show-unsigned")}
      />
    );
  }

  if (step === "show-unsigned" && unsignedTx) {
    return (
      <div
        style={{
          flex: 1,
          backgroundColor: "var(--color-bg-main)",
          overflowY: "auto",
          padding: "1.5rem",
          paddingBottom: "6rem",
        }}
      >
        <div style={{ maxWidth: "400px", margin: "0 auto" }}>
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
                fontSize: "1.75rem",
                fontWeight: 900,
                textAlign: "center",
                marginBottom: "1rem",
              }}
            >
              Unsigned Transaction
            </h1>

            <p
              style={{
                textAlign: "center",
                color: "var(--color-gray-800)",
                marginBottom: "1.5rem",
                fontWeight: 500,
              }}
            >
              Show this QR code to your cold wallet for signing
            </p>

            <QRDisplay
              data={serializeTransaction(unsignedTx, { source: "manual" })}
              title="Transaction to Sign"
              size={250}
            />

            <div
              style={{
                backgroundColor: "var(--color-gray-100)",
                border: "3px solid var(--color-black)",
                padding: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <DetailRow label="Network" value={selectedChain.name} />
              <DetailRow
                label="To"
                value={
                  selectedToken?.isNative
                    ? (unsignedTx.to as string)
                    : recipient
                }
              />
              <DetailRow
                label="Amount"
                value={getTransactionDisplayValue(unsignedTx)}
              />
              {selectedToken && !selectedToken.isNative && (
                <DetailRow label="Token" value={selectedToken.name} />
              )}
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              <Button
                title="Scan Signed Transaction"
                variant="primary"
                onClick={() => setStep("scan-signed")}
                fullWidth
              />

              <Button
                title="Cancel"
                variant="danger"
                onClick={handleReset}
                fullWidth
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === "broadcasting") {
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
            Broadcasting...
          </h1>
          <p
            style={{
              color: "var(--color-gray-800)",
              marginBottom: "1.5rem",
              fontWeight: 500,
            }}
          >
            Sending transaction to the network
          </p>
          <div className="spinner" style={{ margin: "0 auto" }}></div>
        </div>
      </div>
    );
  }

  if (step === "success" && txHash) {
    return (
      <div
        style={{
          flex: 1,
          backgroundColor: "var(--color-bg-main)",
          overflowY: "auto",
          padding: "1.5rem",
          paddingBottom: "6rem",
        }}
      >
        <div style={{ maxWidth: "400px", margin: "0 auto" }}>
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
                fontSize: "1.75rem",
                fontWeight: 900,
                textAlign: "center",
                marginBottom: "1.5rem",
                color: "var(--color-success)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <CheckCircle size={28} strokeWidth={2.5} />
              Transaction Sent!
            </h1>

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
                }}
              >
                Transaction Hash:
              </p>
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                  wordBreak: "break-all",
                  fontWeight: 500,
                }}
              >
                {txHash}
              </p>
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <p
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 900,
                  marginBottom: "0.5rem",
                }}
              >
                View on block explorer:
              </p>
              <a
                href={`${selectedChain.blockExplorer}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.875rem",
                  wordBreak: "break-all",
                  color: "var(--color-primary)",
                  fontWeight: 700,
                }}
              >
                {selectedChain.blockExplorer.replace("https://", "")}/tx/
                {txHash.slice(0, 10)}...
              </a>
            </div>

            <Button
              title="Send Another Transaction"
              variant="primary"
              onClick={handleReset}
              fullWidth
            />
          </div>
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
        paddingBottom: "6rem",
      }}
    >
      <div style={{ maxWidth: "400px", margin: "0 auto" }}>
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
              fontSize: "1.75rem",
              fontWeight: 900,
              textAlign: "center",
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
            }}
          >
            <Send size={28} strokeWidth={2.5} />
            Send Transaction
          </h1>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
            {/* Network Display */}
            <div
              style={{
                backgroundColor: "var(--color-info)",
                border: "3px solid var(--color-black)",
                padding: "0.75rem",
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "var(--color-white)",
              }}
            >
              Network: {selectedChain.name}
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 900,
                  marginBottom: "0.5rem",
                  color: "var(--color-black)",
                }}
              >
                Asset
              </label>
              <select
                value={selectedToken?.symbol || ""}
                onChange={(e) => {
                  const token = availableTokens.find(
                    (t) => t.symbol === e.target.value
                  );
                  if (token) {
                    setSelectedToken(token);
                    setAmount(""); // Reset amount when changing token
                  }
                }}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  fontSize: "1rem",
                  fontWeight: 700,
                  border: "3px solid var(--color-black)",
                  borderRadius: "0",
                  backgroundColor: "var(--color-white)",
                  cursor: "pointer",
                }}
              >
                {availableTokens.map((token) => (
                  <option key={token.address} value={token.symbol}>
                    {token.symbol} - {token.name}
                  </option>
                ))}
              </select>
              {tokenBalance !== null && selectedToken && (
                <div
                  style={{
                    marginTop: "0.5rem",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: "var(--color-gray-800)",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <Coins size={14} />
                  Balance: {tokenBalance} {selectedToken.symbol}
                </div>
              )}
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 900,
                  marginBottom: "0.5rem",
                  color: "var(--color-black)",
                }}
              >
                Recipient Address
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                style={{ width: "100%" }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 900,
                  marginBottom: "0.5rem",
                  color: "var(--color-black)",
                }}
              >
                Amount ({selectedToken?.symbol || ""})
              </label>
              <input
                type="number"
                step={selectedToken?.decimals === 6 ? "0.000001" : "0.00001"}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                style={{ width: "100%" }}
              />
            </div>

            <Button
              title="Create Transaction"
              variant="primary"
              onClick={handleCreateTransaction}
              fullWidth
            />

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
                  fontWeight: 700,
                  margin: 0,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                }}
              >
                <Lightbulb
                  size={16}
                  strokeWidth={2.5}
                  style={{ flexShrink: 0, marginTop: "0.125rem" }}
                />
                <span>
                  This will create an unsigned transaction. You'll need to show
                  the QR code to your cold wallet for signing.
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "0.75rem",
      }}
    >
      <span style={{ fontWeight: 900, fontSize: "0.875rem" }}>{label}:</span>
      <span
        style={{
          fontFamily: "monospace",
          fontSize: "0.875rem",
          textAlign: "right",
          wordBreak: "break-all",
          marginLeft: "0.5rem",
          fontWeight: 500,
        }}
      >
        {value}
      </span>
    </div>
  );
}
