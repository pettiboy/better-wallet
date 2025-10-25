import { QRCodeSVG } from 'qrcode.react';

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
    <div className="flex flex-col items-center p-5">
      {title && (
        <h3 className="text-lg font-semibold mb-2 text-center text-gray-900 dark:text-white">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 text-center">
          {description}
        </p>
      )}
      <div className="p-5 bg-white rounded-xl shadow-lg">
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
