import React from "react";

interface GenericWalletIconProps {
  className?: string;
  walletName?: string;
}

export function GenericWalletIcon({ className = "size-8", walletName }: GenericWalletIconProps) {
  // Create a simple gradient based on wallet name for unique colors
  const getGradientColors = (name?: string) => {
    if (!name) return { from: "#6366f1", to: "#8b5cf6" };

    const hash = name.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    const hue1 = Math.abs(hash) % 360;
    const hue2 = (hue1 + 60) % 360;

    return {
      from: `hsl(${hue1}, 70%, 60%)`,
      to: `hsl(${hue2}, 70%, 70%)`
    };
  };

  const colors = getGradientColors(walletName);
  const gradientId = `gradient-${walletName?.replace(/\s+/g, '') || 'default'}`;

  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="0%"
          y1="0%"
          x2="100%"
          y2="100%"
        >
          <stop offset="0%" stopColor={colors.from} />
          <stop offset="100%" stopColor={colors.to} />
        </linearGradient>
      </defs>

      {/* Wallet background */}
      <rect
        x="4"
        y="8"
        width="24"
        height="16"
        rx="3"
        fill={`url(#${gradientId})`}
        stroke="white"
        strokeWidth="1"
      />

      {/* Wallet fold */}
      <rect
        x="4"
        y="8"
        width="24"
        height="4"
        rx="3"
        fill="rgba(255, 255, 255, 0.2)"
      />

      {/* Card slot */}
      <rect
        x="7"
        y="14"
        width="12"
        height="2"
        rx="1"
        fill="rgba(255, 255, 255, 0.6)"
      />

      {/* Card */}
      <rect
        x="8"
        y="17"
        width="8"
        height="5"
        rx="1"
        fill="rgba(255, 255, 255, 0.8)"
      />

      {/* Wallet icon detail */}
      <circle
        cx="24"
        cy="18"
        r="2"
        fill="rgba(255, 255, 255, 0.4)"
      />
    </svg>
  );
}
