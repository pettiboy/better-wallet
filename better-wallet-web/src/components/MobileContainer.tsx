import type { ReactNode } from "react";

interface MobileContainerProps {
  children: ReactNode;
}

export function MobileContainer({ children }: MobileContainerProps) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "428px",
        minHeight: "100vh",
        margin: "0 auto",
        backgroundColor: "var(--color-white)",
        border: "4px solid var(--color-black)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {children}
    </div>
  );
}
