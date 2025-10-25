import { useState } from 'react';
import { ethers } from 'ethers';
import { Button } from '../../components/Button';
import { QRDisplay } from '../../components/QRDisplay';
import { QRScanner } from '../../components/QRScanner';
import { useDeviceMode } from '../../contexts/DeviceModeContext';
import { constructTransaction, broadcastTransaction, isValidAddress } from '../../services/ethereum';
import { serializeTransaction, deserializeSignedTransaction } from '../../utils/transaction-serializer';

type Step = 'input' | 'show-unsigned' | 'scan-signed' | 'broadcasting' | 'success';

export function SendPage() {
  const { walletAddress } = useDeviceMode();
  const [step, setStep] = useState<Step>('input');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [unsignedTx, setUnsignedTx] = useState<ethers.TransactionRequest | null>(null);
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
      setStep('show-unsigned');
    } catch (error) {
      console.error("Error creating transaction:", error);
      alert("Failed to create transaction. Check your balance and internet connection.");
    }
  };

  const handleScanSigned = (data: string) => {
    setStep('input');
    broadcastSignedTransaction(data);
  };

  const broadcastSignedTransaction = async (data: string) => {
    setStep('broadcasting');

    try {
      // Deserialize to handle both legacy and new formats
      const { signedTransaction } = deserializeSignedTransaction(data);
      const hash = await broadcastTransaction(signedTransaction);
      setTxHash(hash);
      setStep('success');
      alert(`Transaction broadcasted!\nHash: ${hash.substring(0, 10)}...`);
    } catch (error) {
      console.error("Error broadcasting transaction:", error);
      alert("Failed to broadcast transaction");
      setStep('input');
    }
  };

  const handleReset = () => {
    setStep('input');
    setRecipient('');
    setAmount('');
    setUnsignedTx(null);
    setTxHash(null);
  };

  if (step === 'scan-signed') {
    return (
      <QRScanner
        title="Scan Signed Transaction"
        onScan={handleScanSigned}
        onClose={() => setStep('show-unsigned')}
      />
    );
  }

  if (step === 'show-unsigned' && unsignedTx) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">
              Unsigned Transaction
            </h1>

            <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
              Show this QR code to your cold wallet for signing
            </p>

            <QRDisplay
              data={serializeTransaction(unsignedTx, { source: "manual" })}
              title="Transaction to Sign"
              size={280}
            />

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <DetailRow label="To" value={unsignedTx.to as string} />
              <DetailRow
                label="Amount"
                value={`${ethers.formatEther(unsignedTx.value || 0)} ETH`}
              />
            </div>

            <div className="space-y-3">
              <Button
                title="Scan Signed Transaction"
                variant="primary"
                onClick={() => setStep('scan-signed')}
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

  if (step === 'broadcasting') {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Broadcasting...
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Sending transaction to the network
            </p>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mt-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success' && txHash) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-center mb-6 text-green-600">
              ✅ Transaction Sent!
            </h1>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Transaction Hash:</p>
              <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
                {txHash}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">View on block explorer:</p>
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-blue-500 hover:text-blue-600 break-all"
              >
                https://sepolia.etherscan.io/tx/{txHash}
              </a>
            </div>

            <Button
              title="Send Another Transaction"
              variant="primary"
              onClick={handleReset}
              className="w-full"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            Send Transaction
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Recipient Address
              </label>
              <input
                type="text"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                placeholder="0x..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                Amount (ETH)
              </label>
              <input
                type="number"
                step="0.0001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <Button
              title="Create Transaction"
              variant="primary"
              onClick={handleCreateTransaction}
              className="w-full"
            />

            <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                💡 This will create an unsigned transaction. You'll need to show the QR code to your cold wallet for signing.
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
    <div className="flex justify-between items-start mb-2">
      <span className="font-semibold text-gray-600 dark:text-gray-300">{label}:</span>
      <span className="font-mono text-sm text-gray-900 dark:text-white text-right break-all ml-2">
        {value}
      </span>
    </div>
  );
}
