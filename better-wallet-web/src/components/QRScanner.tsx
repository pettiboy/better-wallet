import { useState, useEffect } from "react";
import { Scanner } from "@yudiel/react-qr-scanner";

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
      const isSecure =
        window.location.protocol === "https:" ||
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";

      if (!isSecure) {
        setError(
          "Camera access requires HTTPS. Please use https://localhost:5173 or enable HTTPS in your browser."
        );
        setHasPermission(false);
        return;
      }

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera access not supported in this browser");
        setHasPermission(false);
        return;
      }

      // Test camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      // Stop the test stream
      stream.getTracks().forEach((track) => track.stop());

      setHasPermission(true);
      setIsScanning(true);
    } catch (err) {
      console.error("Camera access error:", err);
      setHasPermission(false);
      if (err instanceof Error) {
        if (err.message.includes("HTTPS")) {
          setError(
            "Camera access requires HTTPS. Please access the app via https://localhost:5173 or enable HTTPS in your browser."
          );
        } else if (err.name === "NotAllowedError") {
          setError(
            "Camera permission denied. Please allow camera access and try again."
          );
        } else if (err.name === "NotFoundError") {
          setError("No camera found. Please connect a camera and try again.");
        } else if (err.name === "NotSupportedError") {
          setError("Camera access not supported in this browser.");
        } else {
          setError(`Camera error: ${err.message}`);
        }
      } else {
        setError(
          "Failed to access camera. Please check your browser permissions."
        );
      }
    }
  };

  const handleScan = (detectedCodes: any[]) => {
    if (detectedCodes && detectedCodes.length > 0) {
      const firstCode = detectedCodes[0];
      console.log("QR Code detected:", firstCode.rawValue);
      onScan(firstCode.rawValue);
      setIsScanning(false);
    }
  };

  const handleError = (error: unknown) => {
    console.error("Scanner error:", error);
    setError("Failed to initialize camera scanner");
    setIsScanning(false);
  };

  const requestPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      setHasPermission(true);
      setError(null);
      setIsScanning(true);
    } catch (err) {
      setError(
        "Failed to access camera. Please check your browser permissions."
      );
    }
  };

  if (hasPermission === null) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "var(--color-bg-main)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto 1rem" }}></div>
          <p style={{ color: "var(--color-black)", fontWeight: 700 }}>
            Initializing camera...
          </p>
        </div>
      </div>
    );
  }

  if (hasPermission === false) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "var(--color-bg-main)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            maxWidth: "400px",
            backgroundColor: "var(--color-white)",
            border: "4px solid var(--color-black)",
            boxShadow: "8px 8px 0 var(--color-black)",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 900,
              marginBottom: "1rem",
            }}
          >
            {title}
          </h2>
          <p style={{ marginBottom: "1.5rem", color: "var(--color-gray-800)" }}>
            {error || "Camera permission is required to scan QR codes"}
          </p>
          <div
            style={{ display: "flex", gap: "1rem", flexDirection: "column" }}
          >
            <button
              onClick={requestPermission}
              style={{
                backgroundColor: "var(--color-primary)",
                color: "var(--color-white)",
                border: "4px solid var(--color-black)",
                padding: "0.75rem 1.5rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "4px 4px 0 var(--color-black)",
              }}
            >
              Grant Permission
            </button>
            <button
              onClick={onClose}
              style={{
                backgroundColor: "var(--color-gray-200)",
                color: "var(--color-black)",
                border: "4px solid var(--color-black)",
                padding: "0.75rem 1.5rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "4px 4px 0 var(--color-black)",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "var(--color-black)",
        display: "flex",
        flexDirection: "column",
        zIndex: 9999,
      }}
    >
      {/* Scanner Container */}
      <div style={{ flex: 1, position: "relative" }}>
        <Scanner
          onScan={handleScan}
          onError={handleError}
          constraints={{
            facingMode: "environment",
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
              width: "100%",
              height: "100%",
              position: "relative",
            },
            video: {
              width: "100%",
              height: "100%",
              objectFit: "cover",
              position: "absolute",
              top: 0,
              left: 0,
              zIndex: 1,
            },
          }}
        />
      </div>

      {/* Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "1.25rem",
        }}
      >
        <h2
          style={{
            color: "var(--color-white)",
            fontSize: "1.5rem",
            fontWeight: 900,
            marginTop: "4rem",
            pointerEvents: "auto",
            textShadow: "2px 2px 0 var(--color-black)",
          }}
        >
          {title}
        </h2>

        <div
          style={{
            textAlign: "center",
            marginBottom: "4rem",
            pointerEvents: "auto",
          }}
        >
          <p
            style={{
              color: "var(--color-white)",
              marginBottom: "1rem",
              fontWeight: 700,
              textShadow: "2px 2px 0 var(--color-black)",
            }}
          >
            Position the QR code within the frame
          </p>
          {isScanning && (
            <p
              style={{
                color: "var(--color-success)",
                fontSize: "0.875rem",
                marginBottom: "0.5rem",
                fontWeight: 700,
                textShadow: "2px 2px 0 var(--color-black)",
              }}
            >
              🔍 Scanning...
            </p>
          )}
          <button
            onClick={onClose}
            style={{
              backgroundColor: "var(--color-danger)",
              color: "var(--color-white)",
              border: "4px solid var(--color-black)",
              padding: "0.75rem 1.5rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "4px 4px 0 var(--color-black)",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
