import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRScanner } from '../components/QRScanner';
import { generateWallet, storePrivateKey, hasWallet, loadPrivateKey, getAddress } from '../services/wallet';
import { useDeviceMode } from '../contexts/DeviceModeContext';

export function SetupPage() {
  const navigate = useNavigate();
  const { setMode, setWalletAddress } = useDeviceMode();
  const [scanning, setScanning] = useState(false);

  const handleColdWallet = async () => {
    try {
      const exists = await hasWallet();

      if (exists) {
        const confirmed = window.confirm(
          "A wallet already exists on this device. Continue?"
        );
        
        if (!confirmed) return;

        const privateKey = await loadPrivateKey();
        if (privateKey) {
          const address = getAddress(privateKey);
          setWalletAddress(address);
        }
        await setMode("cold");
        navigate("/cold/home");
        return;
      }

      const wallet = await generateWallet();
      await storePrivateKey(wallet.privateKey, wallet.mnemonic);
      setWalletAddress(wallet.address);

      alert(
        `Your wallet has been created securely. Address: ${wallet.address.substring(0, 10)}...`
      );
      
      await setMode("cold");
      navigate("/cold/home");
    } catch (error) {
      console.error("Error setting up cold wallet:", error);
      alert("Failed to create wallet");
    }
  };

  const handleHotWallet = () => {
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
      alert("Invalid address QR code");
    }
  };

  if (scanning) {
    return (
      <QRScanner
        title="Scan Cold Wallet Address"
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
            Better Wallet
          </h1>
          
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
            Turn your smartphone into an air-gapped hardware wallet
          </p>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              How It Works
            </h2>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>• <span className="font-semibold">Cold Wallet:</span> Stores private keys offline, signs transactions</li>
              <li>• <span className="font-semibold">Hot Wallet:</span> Connects to blockchain, broadcasts transactions</li>
              <li>• Communication via QR codes only</li>
            </ul>
          </div>

          <div className="space-y-4">
            <button
              onClick={handleColdWallet}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex flex-col items-center"
            >
              <span className="text-3xl mb-2">🔒</span>
              <span className="text-lg">Cold Wallet</span>
              <span className="text-sm opacity-90">Store keys offline (Old Phone)</span>
            </button>

            <button
              onClick={handleHotWallet}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 flex flex-col items-center"
            >
              <span className="text-3xl mb-2">📱</span>
              <span className="text-lg">Hot Wallet</span>
              <span className="text-sm opacity-90">Connect to blockchain (Main Phone)</span>
            </button>
          </div>

          <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
              ⚠️ For maximum security, use a dedicated offline device as your cold wallet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
