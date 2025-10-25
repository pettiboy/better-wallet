import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRScanner } from '../components/QRScanner';
import { useDeviceMode } from '../contexts/DeviceModeContext';

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-4 text-gray-900 dark:text-white">
            Connect Hot Wallet
          </h1>
          
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Connect to your cold wallet to manage transactions
          </p>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              How It Works
            </h2>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>• <span className="font-semibold">Cold Wallet:</span> Mobile app stores private keys offline</li>
              <li>• <span className="font-semibold">Hot Wallet:</span> Web app connects to blockchain, broadcasts transactions</li>
              <li>• Communication via QR codes only</li>
            </ul>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleConnectWallet}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex flex-col items-center"
            >
              <span className="text-3xl mb-2">📱</span>
              <span className="text-lg">Connect to Cold Wallet</span>
              <span className="text-sm opacity-90">Scan wallet address QR code</span>
            </button>
          </div>

          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
              📱 Make sure you have the Better Wallet mobile app set up as your cold wallet first
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
