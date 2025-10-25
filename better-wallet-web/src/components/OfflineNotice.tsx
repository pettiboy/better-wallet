import { useState, useEffect } from "react";

export function OfflineNotice() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: "5rem",
        left: "50%",
        transform: "translateX(-50%)",
        maxWidth: "380px",
        width: "calc(100% - 2rem)",
        backgroundColor: "var(--color-warning)",
        border: "4px solid var(--color-black)",
        boxShadow: "6px 6px 0 var(--color-black)",
        padding: "1rem",
        zIndex: 9998,
        animation: "slideUp 0.3s ease",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "0.875rem",
          fontWeight: 900,
          color: "var(--color-black)",
          textAlign: "center",
        }}
      >
        ⚠️ You're offline. Some features may not work.
      </p>
      <style>
        {`
          @keyframes slideUp {
            from {
              transform: translate(-50%, 100%);
              opacity: 0;
            }
            to {
              transform: translateX(-50%);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}
