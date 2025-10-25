import { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
  title?: string;
}

export function QRScanner({
  onScan,
  onClose,
  title = "Scan QR Code",
}: QRScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      // Check if we're on HTTPS or localhost
      const isSecure = window.location.protocol === 'https:' || 
                      window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
      
      if (!isSecure) {
        setError('Camera access requires HTTPS. Please use https://localhost:5173 or enable HTTPS in your browser.');
        setHasPermission(false);
        return;
      }
      
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera access not supported in this browser');
        setHasPermission(false);
        return;
      }

      // Test camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      // Stop the test stream
      stream.getTracks().forEach(track => track.stop());
      
      setHasPermission(true);
      setIsScanning(true);
      
    } catch (err) {
      console.error('Camera access error:', err);
      setHasPermission(false);
      if (err instanceof Error) {
        if (err.message.includes('HTTPS')) {
          setError('Camera access requires HTTPS. Please access the app via https://localhost:5173 or enable HTTPS in your browser.');
        } else if (err.name === 'NotAllowedError') {
          setError('Camera permission denied. Please allow camera access and try again.');
        } else if (err.name === 'NotFoundError') {
          setError('No camera found. Please connect a camera and try again.');
        } else if (err.name === 'NotSupportedError') {
          setError('Camera access not supported in this browser.');
        } else {
          setError(`Camera error: ${err.message}`);
        }
      } else {
        setError('Failed to access camera. Please check your browser permissions.');
      }
    }
  };

  const handleScan = (detectedCodes: any[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const firstCode = detectedCodes[0];
      console.log('QR Code detected:', firstCode.rawValue);
      onScan(firstCode.rawValue);
      setIsScanning(false);
    }
  };

  const handleError = (error: unknown) => {
    console.error('Scanner error:', error);
    setError('Failed to initialize camera scanner');
    setIsScanning(false);
  };

  const requestPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setHasPermission(true);
      setError(null);
      setIsScanning(true);
    } catch (err) {
      setError('Failed to access camera. Please check your browser permissions.');
    }
  };

  if (hasPermission === null) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Initializing camera...</p>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {error || 'Camera permission is required to scan QR codes'}
          </p>
          <button
            onClick={requestPermission}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 mr-4"
          >
            Grant Permission
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Scanner Container */}
      <div className="flex-1 relative">
        <Scanner
          onScan={handleScan}
          onError={handleError}
          constraints={{
            facingMode: 'environment',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          }}
          components={{
            finder: true,
            onOff: false,
            torch: false,
            zoom: false,
          }}
          styles={{
            container: {
              width: '100%',
              height: '100%',
              position: 'relative',
            },
            video: {
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 1,
            },
          }}
        />
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between items-center p-5">
        <h2 className="text-white text-xl font-semibold mt-16 pointer-events-auto">
          {title}
        </h2>
        
        <div className="text-center mb-16 pointer-events-auto">
          <p className="text-white mb-4">
            Position the QR code within the frame
          </p>
          {isScanning && (
            <p className="text-green-400 text-sm mb-2">
              🔍 Scanning...
            </p>
          )}
          <button
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}