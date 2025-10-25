import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { QRDisplay } from '../../components/QRDisplay';
import { loadMnemonic, deleteWallet } from '../../services/wallet';
import { useDeviceMode } from '../../contexts/DeviceModeContext';

export function SettingsPage() {
  const navigate = useNavigate();
  const { walletAddress, setWalletAddress } = useDeviceMode();
  const [showMnemonic, setShowMnemonic] = useState(false);
  const [mnemonic, setMnemonic] = useState<string | null>(null);

  const handleShowMnemonic = async () => {
    try {
      const mnemonicPhrase = await loadMnemonic();
      if (mnemonicPhrase) {
        setMnemonic(mnemonicPhrase);
        setShowMnemonic(true);
      } else {
        alert("No mnemonic found");
      }
    } catch (error) {
      console.error("Error loading mnemonic:", error);
      alert("Failed to load mnemonic");
    }
  };

  const handleDeleteWallet = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this wallet? This action cannot be undone."
    );
    
    if (confirmed) {
      try {
        await deleteWallet();
        setWalletAddress(null);
        navigate("/setup");
        alert("Wallet deleted successfully");
      } catch (error) {
        console.error("Error deleting wallet:", error);
        alert("Failed to delete wallet");
      }
    }
  };

  if (showMnemonic && mnemonic) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
              Recovery Phrase
            </h1>

            <div className="bg-red-100 dark:bg-red-900 rounded-lg p-4 mb-6">
              <p className="text-red-800 dark:text-red-200 text-sm font-semibold mb-2">
                ⚠️ SECURITY WARNING
              </p>
              <p className="text-red-700 dark:text-red-300 text-sm">
                Never share your recovery phrase with anyone. Anyone with this phrase can access your wallet.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Your Recovery Phrase:</p>
              <p className="font-mono text-sm text-gray-900 dark:text-white wrap-break-word">
                {mnemonic}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                title="Hide Recovery Phrase"
                variant="primary"
                onClick={() => setShowMnemonic(false)}
                className="w-full"
              />
              <Button
                title="Back to Settings"
                variant="secondary"
                onClick={() => navigate("/cold/home")}
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
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            Settings
          </h1>

          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Wallet Address</h3>
              <p className="font-mono text-sm text-gray-600 dark:text-gray-300 break-all">
                {walletAddress}
              </p>
            </div>

            <QRDisplay
              data={walletAddress || ""}
              title="Wallet Address QR"
              description="Scan this to connect your hot wallet"
              size={200}
            />

            <div className="space-y-3">
              <Button
                title="Show Recovery Phrase"
                variant="warning"
                onClick={handleShowMnemonic}
                className="w-full"
              />

              <Button
                title="Delete Wallet"
                variant="danger"
                onClick={handleDeleteWallet}
                className="w-full"
              />

              <Button
                title="Back to Home"
                variant="secondary"
                onClick={() => navigate("/cold/home")}
                className="w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
