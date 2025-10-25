import { useState } from "react";
import { ethers } from "ethers";
import { Button } from "../../components/Button";
import { QRDisplay } from "../../components/QRDisplay";
import { QRScanner } from "../../components/QRScanner";
import { useDeviceMode } from "../../contexts/DeviceModeContext";
import {
  constructTransaction,
  broadcastTransaction,
  isValidAddress,
} from "../../services/ethereum";
import {
  serializeTransaction,
  deserializeSignedTransaction,
} from "../../utils/transaction-serializer";

type Step =
  | "input"
  | "show-unsigned"
  | "scan-signed"
  | "broadcasting"
  | "success";

export function SendPage() {
  const { walletAddress } = useDeviceMode();
  const [step, setStep] = useState<Step>("input");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [unsignedTx, setUnsignedTx] =
    useState<ethers.TransactionRequest | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleCreateTransaction = async () => {
    if (!walletAddress) {
      alert("No wallet address found");
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
      const tx = await constructTransaction(walletAddress, recipient, amount);
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
              <DetailRow label="To" value={unsignedTx.to as string} />
              <DetailRow
                label="Amount"
                value={`${ethers.formatEther(unsignedTx.value || 0)} ETH`}
              />
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
              }}
            >
              ✅ Transaction Sent!
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
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
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
                sepolia.etherscan.io/tx/{txHash.slice(0, 10)}...
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
            }}
          >
            📤 Send Transaction
          </h1>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
          >
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
                Amount (ETH)
              </label>
              <input
                type="number"
                step="0.00001"
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
              <p style={{ fontSize: "0.875rem", fontWeight: 700, margin: 0 }}>
                💡 This will create an unsigned transaction. You'll need to show
                the QR code to your cold wallet for signing.
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
