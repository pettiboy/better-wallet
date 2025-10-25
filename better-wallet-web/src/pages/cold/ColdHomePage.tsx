import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Button';
import { QRDisplay } from '../../components/QRDisplay';
import { useDeviceMode } from '../../contexts/DeviceModeContext';

export function ColdHomePage() {
  const navigate = useNavigate();
  const { walletAddress } = useDeviceMode();
  const [showQR, setShowQR] = useState(false);

  const handleShowAddress = () => {
    setShowQR(true);
  };

  if (showQR && walletAddress) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <QRDisplay
              data={walletAddress}
              title="Your Wallet Address"
              description="Scan this with your hot wallet"
              size={280}
            />
            <Button
              title="Hide QR Code"
              variant="primary"
              onClick={() => setShowQR(false)}
              className="w-full mt-4"
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
          <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Cold Wallet
          </h1>

          <div className="bg-yellow-500 rounded-lg p-4 mb-6 text-center">
            <span className="text-white font-bold text-lg">✈️ OFFLINE MODE</span>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Your Address:</p>
            <p className="font-mono text-sm break-all text-gray-900 dark:text-white">
              {walletAddress}
            </p>
          </div>

          <div className="space-y-3">
            <Button
              title="Show Address QR"
              variant="primary"
              onClick={handleShowAddress}
              className="w-full"
            />

            <Button
              title="Sign Transaction"
              variant="primary"
              onClick={() => navigate("/cold/sign")}
              className="w-full"
            />

            <Button
              title="Settings"
              variant="secondary"
              onClick={() => navigate("/cold/settings")}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
