import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { useDeviceMode } from '../../contexts/DeviceModeContext';
import { getBalance } from '../../services/ethereum';

export function HotHomePage() {
  const navigate = useNavigate();
  const { walletAddress } = useDeviceMode();
  const [balance, setBalance] = useState<string>("0.0");
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
      const bal = await getBalance(walletAddress);
      setBalance(bal);
    } catch (error) {
      console.error("Error loading balance:", error);
      alert("Failed to load balance. Check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
              Hot Wallet
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              No wallet connected. Please set up your cold wallet first.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Wallet
          </h1>

          <div className="bg-blue-500 rounded-lg p-8 mb-6 text-center text-white">
            <p className="text-sm opacity-80 mb-2">Balance</p>
            <p className="text-4xl font-bold mb-2">
              {parseFloat(balance).toFixed(4)} ETH
            </p>
            <p className="text-sm opacity-70">Sepolia Testnet</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Address</p>
            <p className="font-mono text-sm text-gray-900 dark:text-white break-all">
              {walletAddress}
            </p>
          </div>

          <div className="space-y-3">
            <Button
              title="Send Transaction"
              variant="success"
              onClick={() => navigate("/hot/send")}
              className="w-full"
            />

            <Button
              title="Refresh Balance"
              variant="primary"
              onClick={loadBalance}
              disabled={loading}
              className="w-full"
            />
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-6">
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">How to Use</h3>
            <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>1. Create a transaction on this device</li>
              <li>2. Show the QR code to your cold wallet</li>
              <li>3. Sign it on the cold wallet (offline)</li>
              <li>4. Scan the signed transaction back here</li>
              <li>5. Broadcast to the network</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
