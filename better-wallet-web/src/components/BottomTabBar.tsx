import { useNavigate, useLocation } from "react-router-dom";
import { Wallet, Send, Plug, Settings } from "lucide-react";

type Tab = "home" | "send" | "dapps" | "settings";

interface TabConfig {
  id: Tab;
  label: string;
  icon: typeof Wallet;
  path: string;
}

const tabs: TabConfig[] = [
  { id: "home", label: "Wallet", icon: Wallet, path: "/hot/home" },
  { id: "send", label: "Send", icon: Send, path: "/hot/send" },
  { id: "dapps", label: "dApps", icon: Plug, path: "/hot/dapp-connect" },
  { id: "settings", label: "Settings", icon: Settings, path: "/hot/settings" },
];

export function BottomTabBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTab = (): Tab => {
    if (location.pathname.includes("/hot/send")) return "send";
    if (location.pathname.includes("/hot/dapp-connect")) return "dapps";
    if (location.pathname.includes("/hot/settings")) return "settings";
    return "home";
  };

  const activeTab = getActiveTab();

  const handleTabClick = (tab: TabConfig) => {
    navigate(tab.path);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: "428px",
        backgroundColor: "var(--color-white)",
        borderTop: "4px solid var(--color-black)",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "stretch",
        zIndex: 1000,
      }}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "0.75rem 0.5rem",
              backgroundColor: isActive
                ? "var(--color-primary)"
                : "transparent",
              color: isActive ? "var(--color-white)" : "var(--color-black)",
              borderRight: "4px solid var(--color-black)",
              transition: "all 0.1s ease",
              fontWeight: 700,
              fontSize: "0.875rem",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = "var(--color-gray-100)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
            onMouseDown={(e) => {
              if (!isActive) {
                e.currentTarget.style.transform = "scale(0.95)";
              }
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <Icon
              size={24}
              strokeWidth={2.5}
              style={{ marginBottom: "0.25rem" }}
            />
            <span>{tab.label}</span>
          </button>
        );
      })}
      {/* Remove border from last item */}
      <style>
        {`
          div button:last-child {
            border-right: none !important;
          }
        `}
      </style>
    </div>
  );
}
