import { QRCodeSVG } from "qrcode.react";

interface QRDisplayProps {
  data: string;
  size?: number;
  title?: string;
  description?: string;
}

export function QRDisplay({
  data,
  size = 250,
  title,
  description,
}: QRDisplayProps) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "1rem",
      }}
    >
      {title && (
        <h3
          style={{
            fontSize: "1.25rem",
            fontWeight: 900,
            marginBottom: "0.5rem",
            textAlign: "center",
            color: "var(--color-black)",
          }}
        >
          {title}
        </h3>
      )}
      {description && (
        <p
          style={{
            fontSize: "0.875rem",
            color: "var(--color-gray-800)",
            marginBottom: "1rem",
            textAlign: "center",
          }}
        >
          {description}
        </p>
      )}
      <div
        style={{
          padding: "1.25rem",
          backgroundColor: "var(--color-white)",
          border: "4px solid var(--color-black)",
          boxShadow: "8px 8px 0 var(--color-black)",
        }}
      >
        <QRCodeSVG
          value={data}
          size={size}
          bgColor="white"
          fgColor="black"
          level="M"
        />
      </div>
    </div>
  );
}
