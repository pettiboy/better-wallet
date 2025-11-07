import { useState } from "react";
import { ChevronDown, Network, X } from "lucide-react";
import { useNetwork } from "../contexts/NetworkContext";
import { getMainnetChains, getTestnetChains } from "../config/chains";
import { Button } from "./Button";

export function NetworkSelector() {
  const { selectedChain, selectChain } = useNetwork();
  const [isOpen, setIsOpen] = useState(false);

  const mainnetChains = getMainnetChains();
  const testnetChains = getTestnetChains();

  const handleSelectChain = (chainId: number) => {
    selectChain(chainId);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.75rem 1rem",
          backgroundColor: "var(--color-white)",
          border: "3px solid var(--color-black)",
          boxShadow: "4px 4px 0 var(--color-black)",
          fontWeight: 900,
          cursor: "pointer",
          fontSize: "0.875rem",
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Network size={18} strokeWidth={2.5} />
          <span>{selectedChain.name}</span>
          {selectedChain.testnet && (
            <span
              style={{
                fontSize: "0.75rem",
                backgroundColor: "var(--color-warning)",
                padding: "0.125rem 0.375rem",
                border: "2px solid var(--color-black)",
              }}
            >
              TESTNET
            </span>
          )}
        </div>
        <ChevronDown size={18} strokeWidth={2.5} />
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      onClick={() => setIsOpen(false)}
    >
      <div
        style={{
          backgroundColor: "var(--color-white)",
          border: "4px solid var(--color-black)",
          boxShadow: "8px 8px 0 var(--color-black)",
          maxWidth: "500px",
          width: "100%",
          maxHeight: "80vh",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "3px solid var(--color-black)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 900,
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Network size={24} strokeWidth={2.5} />
            Select Network
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.25rem",
            }}
          >
            <X size={24} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            overflowY: "auto",
            flex: 1,
            padding: "1.5rem",
          }}
        >
          {/* Testnets Section */}
          <div style={{ marginBottom: "1.5rem" }}>
            <h3
              style={{
                fontSize: "0.875rem",
                fontWeight: 900,
                marginBottom: "0.75rem",
                color: "var(--color-gray-800)",
              }}
            >
              TESTNETS (RECOMMENDED)
            </h3>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {testnetChains.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => handleSelectChain(chain.id)}
                  style={{
                    padding: "1rem",
                    backgroundColor:
                      chain.id === selectedChain.id
                        ? "var(--color-primary)"
                        : "var(--color-gray-100)",
                    color:
                      chain.id === selectedChain.id
                        ? "var(--color-white)"
                        : "var(--color-black)",
                    border: "3px solid var(--color-black)",
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.875rem",
                  }}
                >
                  <span>{chain.name}</span>
                  {chain.id === selectedChain.id && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 900,
                      }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Mainnets Section */}
          <div>
            <h3
              style={{
                fontSize: "0.875rem",
                fontWeight: 900,
                marginBottom: "0.75rem",
                color: "var(--color-gray-800)",
              }}
            >
              MAINNETS
            </h3>
            <div
              style={{
                backgroundColor: "var(--color-warning)",
                border: "3px solid var(--color-black)",
                padding: "0.75rem",
                marginBottom: "0.75rem",
                fontSize: "0.75rem",
                fontWeight: 700,
              }}
            >
              ⚠️ Warning: Mainnets use real funds. Use at your own risk.
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {mainnetChains.map((chain) => (
                <button
                  key={chain.id}
                  onClick={() => handleSelectChain(chain.id)}
                  style={{
                    padding: "1rem",
                    backgroundColor:
                      chain.id === selectedChain.id
                        ? "var(--color-primary)"
                        : "var(--color-gray-100)",
                    color:
                      chain.id === selectedChain.id
                        ? "var(--color-white)"
                        : "var(--color-black)",
                    border: "3px solid var(--color-black)",
                    fontWeight: 700,
                    cursor: "pointer",
                    textAlign: "left",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.875rem",
                  }}
                >
                  <span>{chain.name}</span>
                  {chain.id === selectedChain.id && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 900,
                      }}
                    >
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "1rem 1.5rem",
            borderTop: "3px solid var(--color-black)",
          }}
        >
          <Button
            title="Close"
            variant="secondary"
            onClick={() => setIsOpen(false)}
            fullWidth
          />
        </div>
      </div>
    </div>
  );
}
