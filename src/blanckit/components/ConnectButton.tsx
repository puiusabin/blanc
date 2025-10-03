"use client";

import { useAccount, useDisconnect } from "wagmi";
import { useState } from "react";
import { WalletModal } from "./WalletModal";
import { monochromeTheme } from "../themes/monochrome";

interface ConnectButtonProps {
  label?: string;
  showBalance?: boolean;
  chainStatus?: "icon" | "name" | "none";
}

export function ConnectButton({
  label = "Connect Wallet",
  showBalance = false,
}: ConnectButtonProps) {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            fontFamily: monochromeTheme.fonts.body,
            padding: '8px 16px',
            border: `1px solid ${monochromeTheme.colors.border}`,
            borderRadius: monochromeTheme.radii.md,
            background: monochromeTheme.colors.background,
            color: monochromeTheme.colors.foreground,
            fontSize: '14px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = monochromeTheme.colors.hover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = monochromeTheme.colors.background;
          }}
        >
          {formatAddress(address)}
        </button>

        {isModalOpen && (
          <WalletModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onDisconnect={() => {
              disconnect();
              setIsModalOpen(false);
            }}
          />
        )}
      </>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        style={{
          fontFamily: monochromeTheme.fonts.body,
          padding: '8px 16px',
          border: `1px solid ${monochromeTheme.colors.foreground}`,
          borderRadius: monochromeTheme.radii.md,
          background: monochromeTheme.colors.foreground,
          color: monochromeTheme.colors.background,
          fontSize: '14px',
          fontWeight: 500,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = monochromeTheme.colors.gray800;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = monochromeTheme.colors.foreground;
        }}
      >
        {label}
      </button>

      {isModalOpen && (
        <WalletModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </>
  );
}
