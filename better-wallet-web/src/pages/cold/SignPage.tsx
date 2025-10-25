import { useState } from 'react';
import { ethers } from 'ethers';
import { Button } from '../../components/Button';
import { QRScanner } from '../../components/QRScanner';
import { QRDisplay } from '../../components/QRDisplay';
import { signTransaction, loadPrivateKey } from '../../services/wallet';
import { deserializeTransaction, serializeSignedTransaction, type SerializedTransaction } from '../../utils/transaction-serializer';

export function SignPage() {
  const [scanning, setScanning] = useState(false);
  const [transactionData, setTransactionData] = useState<SerializedTransaction | null>(null);
  const [signedTx, setSignedTx] = useState<string | null>(null);

  const handleScan = async (data: string) => {
    try {
      const parsed = deserializeTransaction(data);
      setTransactionData(parsed);
      setScanning(false);
    } catch (error) {
      console.error("Error parsing transaction:", error);
      alert("Invalid transaction QR code");
      setScanning(false);
    }
  };

  const handleSign = async () => {
    if (!transactionData) return;

    try {
      const privateKey = await loadPrivateKey();

      if (!privateKey) {
        alert("No private key found. Please set up wallet first.");
        return;
      }

      const signed = await signTransaction(
        transactionData.transaction,
        privateKey
      );

      // Serialize signed transaction with metadata for routing
      const serialized = serializeSignedTransaction(
        signed,
        transactionData.metadata
      );
      setSignedTx(serialized);

      alert("Transaction signed! Show this QR code to your hot wallet.");
    } catch (error) {
      console.error("Error signing transaction:", error);
      alert("Failed to sign transaction");
    }
  };

  const handleReset = () => {
    setTransactionData(null);
    setSignedTx(null);
  };

  if (scanning) {
    return (
      <QRScanner
        title="Scan Unsigned Transaction"
        onScan={handleScan}
        onClose={() => setScanning(false)}
      />
    );
  }

  if (signedTx) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <QRDisplay
              data={signedTx}
              title="Signed Transaction"
              description="Scan this with your hot wallet to broadcast"
              size={280}
            />
            <Button
              title="Sign Another Transaction"
              variant="primary"
              onClick={handleReset}
              className="w-full mt-4"
            />
          </div>
        </div>
      </div>
    );
  }

  if (transactionData) {
    const { transaction: unsignedTx, metadata } = transactionData;
    const isWalletConnect = metadata.source === "walletconnect";
    const hasData = unsignedTx.data && unsignedTx.data !== "0x";

    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
              Review Transaction
            </h1>

            {/* Transaction Source */}
            <div className={`rounded-lg p-3 mb-4 text-center ${
              isWalletConnect ? 'bg-blue-100 dark:bg-blue-900' : 'bg-gray-100 dark:bg-gray-700'
            }`}>
              <span className="font-semibold text-gray-900 dark:text-white">
                {isWalletConnect ? "📱 dApp Request" : "✏️ Manual Transaction"}
              </span>
            </div>

            {/* dApp Information (if from WalletConnect) */}
            {isWalletConnect && metadata.dappMetadata && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">dApp Information</h3>
                <DetailRow label="Name" value={metadata.dappMetadata.name} />
                <DetailRow label="URL" value={metadata.dappMetadata.url} />
                {metadata.dappMetadata.description && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Description:</p>
                    <p className="text-sm text-gray-900 dark:text-white">{metadata.dappMetadata.description}</p>
                  </div>
                )}
              </div>
            )}

            {/* Contract Interaction Warning */}
            {hasData && (
              <div className="bg-yellow-100 dark:bg-yellow-900 rounded-lg p-3 mb-4">
                <p className="font-semibold text-yellow-800 dark:text-yellow-200 mb-1">
                  ⚠️ Contract Interaction
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  This transaction includes contract data. Verify the recipient and dApp before signing.
                </p>
              </div>
            )}

            {/* Transaction Details */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">Transaction Details</h3>
              <DetailRow label="To" value={unsignedTx.to as string} />
              <DetailRow
                label="Amount"
                value={`${ethers.formatEther(unsignedTx.value || 0)} ETH`}
              />
              <DetailRow
                label="Gas Limit"
                value={unsignedTx.gasLimit?.toString() || "N/A"}
              />
              <DetailRow
                label="Chain ID"
                value={unsignedTx.chainId?.toString() || "N/A"}
              />
              {hasData && (
                <DetailRow
                  label="Data"
                  value={`${(unsignedTx.data as string).substring(0, 20)}...`}
                />
              )}
            </div>

            <div className="space-y-3">
              <Button
                title="Sign Transaction"
                variant="success"
                onClick={handleSign}
                className="w-full"
              />

              <Button
                title="Cancel"
                variant="danger"
                onClick={handleReset}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            Sign Transaction
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Scan the QR code from your hot wallet to sign a transaction
          </p>

          <Button
            title="Scan Transaction QR"
            variant="primary"
            onClick={() => setScanning(true)}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-start mb-2">
      <span className="font-semibold text-gray-600 dark:text-gray-300">{label}:</span>
      <span className="font-mono text-sm text-gray-900 dark:text-white text-right break-all ml-2">
        {value}
      </span>
    </div>
  );
}
