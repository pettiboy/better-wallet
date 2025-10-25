interface ButtonProps {
  title: string;
  variant?: "primary" | "success" | "danger" | "warning" | "secondary";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  fullWidth?: boolean;
  icon?: string;
}

export function Button({
  title,
  variant = "primary",
  onClick,
  disabled = false,
  className = "",
  fullWidth = false,
  icon,
}: ButtonProps) {
  const getVariantColors = () => {
    switch (variant) {
      case "primary":
        return {
          bg: "var(--color-primary)",
          text: "var(--color-white)",
        };
      case "success":
        return {
          bg: "var(--color-success)",
          text: "var(--color-white)",
        };
      case "danger":
        return {
          bg: "var(--color-danger)",
          text: "var(--color-white)",
        };
      case "warning":
        return {
          bg: "var(--color-warning)",
          text: "var(--color-white)",
        };
      case "secondary":
        return {
          bg: "var(--color-gray-200)",
          text: "var(--color-black)",
        };
      default:
        return {
          bg: "var(--color-primary)",
          text: "var(--color-white)",
        };
    }
  };

  const colors = getVariantColors();

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
      style={{
        width: fullWidth ? "100%" : "auto",
        backgroundColor: colors.bg,
        color: colors.text,
        border: "4px solid var(--color-black)",
        padding: "1rem 1.5rem",
        fontSize: "1rem",
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        boxShadow: disabled
          ? "4px 4px 0 var(--color-black)"
          : "6px 6px 0 var(--color-black)",
        transition: "all 0.1s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "translate(-2px, -2px)";
          e.currentTarget.style.boxShadow = "8px 8px 0 var(--color-black)";
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "translate(0, 0)";
          e.currentTarget.style.boxShadow = "6px 6px 0 var(--color-black)";
        }
      }}
      onMouseDown={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "translate(2px, 2px)";
          e.currentTarget.style.boxShadow = "2px 2px 0 var(--color-black)";
        }
      }}
      onMouseUp={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = "translate(-2px, -2px)";
          e.currentTarget.style.boxShadow = "8px 8px 0 var(--color-black)";
        }
      }}
    >
      {icon && <span style={{ fontSize: "1.25rem" }}>{icon}</span>}
      <span>{title}</span>
    </button>
  );
}
