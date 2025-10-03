"use client";

import { useConnect, useAccount } from "wagmi";
import type { Connector } from "wagmi";
import { useState, useEffect } from "react";
import { monochromeTheme } from "../themes/monochrome";
import { detectInjectedWallets, isWalletAvailable } from "@/lib/wallet-detection";
import { useWagmiAuth } from "@/hooks/use-wagmi-auth";
import { useRouter } from "next/navigation";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDisconnect?: () => void;
}

interface WalletOption {
  id: string;
  name: string;
  detected: boolean;
  connector: Connector | null;
}

export function WalletModal({ isOpen, onClose, onDisconnect }: WalletModalProps) {
  const { connectors, connect } = useConnect();
  const { isConnected } = useAccount();
  const { isAuthenticated, authLoading, authenticate } = useWagmiAuth();
  const router = useRouter();
  const [wallets, setWallets] = useState<WalletOption[]>([]);
  const [connecting, setConnecting] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      onClose();
      router.push("/mail");
    }
  }, [isAuthenticated, onClose, router]);

  useEffect(() => {
    const detectedWallets = detectInjectedWallets();
    const injectedConnector = connectors.find((c) => c.id === "injected");

    const walletList: WalletOption[] = [
      {
        id: "metamask",
        name: "MetaMask",
        detected: isWalletAvailable("metamask"),
        connector: connectors.find((c) => c.id === "io.metamask") || injectedConnector || null,
      },
      {
        id: "coinbase",
        name: "Coinbase Wallet",
        detected: isWalletAvailable("coinbase"),
        connector: connectors.find((c) => c.id === "coinbaseWallet") || injectedConnector || null,
      },
      {
        id: "phantom",
        name: "Phantom",
        detected: isWalletAvailable("phantom"),
        connector: injectedConnector || null,
      },
      {
        id: "walletconnect",
        name: "WalletConnect",
        detected: true,
        connector: connectors.find((c) => c.id === "walletConnect") || null,
      },
    ];

    setWallets(walletList);
  }, [connectors]);

  const handleWalletClick = async (wallet: WalletOption) => {
    if (!wallet.connector) return;
    setConnecting(wallet.id);

    connect(
      { connector: wallet.connector },
      {
        onSuccess: () => setConnecting(null),
        onError: () => setConnecting(null),
      }
    );
  };

  const handleSignIn = async () => {
    if (!isConnected) return;
    setConnecting("signing");
    try {
      await authenticate();
    } catch (error) {
      console.error("Sign in failed:", error);
    } finally {
      setConnecting(null);
    }
  };

  if (!isOpen) return null;

  // Show sign-in screen if connected but not authenticated
  if (isConnected && !isAuthenticated && !authLoading) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          fontFamily: monochromeTheme.fonts.body,
        }}
        onClick={onClose}
      >
        <div
          style={{
            background: monochromeTheme.colors.background,
            border: `1px solid ${monochromeTheme.colors.border}`,
            borderRadius: monochromeTheme.radii.md,
            padding: '32px',
            maxWidth: '400px',
            width: '100%',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              Wallet Connected
            </div>
            <div style={{ fontSize: '14px', color: monochromeTheme.colors.gray600 }}>
              Sign in to access your encrypted email
            </div>
          </div>

          <button
            onClick={handleSignIn}
            disabled={connecting === "signing"}
            style={{
              width: '100%',
              padding: '12px',
              border: `1px solid ${monochromeTheme.colors.foreground}`,
              borderRadius: monochromeTheme.radii.md,
              background: monochromeTheme.colors.foreground,
              color: monochromeTheme.colors.background,
              fontSize: '14px',
              fontWeight: 500,
              cursor: connecting === "signing" ? 'not-allowed' : 'pointer',
              opacity: connecting === "signing" ? 0.6 : 1,
            }}
          >
            {connecting === "signing" ? "Signing In..." : "Sign In"}
          </button>
        </div>
      </div>
    );
  }

  // Show wallet selection
  const detectedWallets = wallets.filter((w) => w.detected);
  const otherWallets = wallets.filter((w) => !w.detected);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        fontFamily: monochromeTheme.fonts.body,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: monochromeTheme.colors.background,
          border: `1px solid ${monochromeTheme.colors.border}`,
          borderRadius: monochromeTheme.radii.md,
          padding: '24px',
          maxWidth: '400px',
          width: '100%',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>
            Connect a wallet
          </h2>
        </div>

        {/* Wallet List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {detectedWallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => handleWalletClick(wallet)}
              disabled={connecting !== null}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `1px solid ${monochromeTheme.colors.border}`,
                borderRadius: monochromeTheme.radii.md,
                background: monochromeTheme.colors.background,
                fontSize: '14px',
                textAlign: 'left',
                cursor: connecting !== null ? 'not-allowed' : 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s',
                opacity: connecting !== null && connecting !== wallet.id ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (connecting === null) {
                  e.currentTarget.style.background = monochromeTheme.colors.hover;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = monochromeTheme.colors.background;
              }}
            >
              <span>{wallet.name}</span>
              <span style={{ fontSize: '12px', color: monochromeTheme.colors.gray600 }}>
                {connecting === wallet.id ? "Connecting..." : "DETECTED"}
              </span>
            </button>
          ))}

          {detectedWallets.length > 0 && otherWallets.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '12px 0',
              }}
            >
              <div style={{ flex: 1, height: '1px', background: monochromeTheme.colors.border }} />
              <span style={{ fontSize: '12px', color: monochromeTheme.colors.gray500 }}>
                OTHER WALLETS
              </span>
              <div style={{ flex: 1, height: '1px', background: monochromeTheme.colors.border }} />
            </div>
          )}

          {otherWallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => handleWalletClick(wallet)}
              disabled={connecting !== null}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `1px solid ${monochromeTheme.colors.border}`,
                borderRadius: monochromeTheme.radii.md,
                background: monochromeTheme.colors.background,
                fontSize: '14px',
                textAlign: 'left',
                cursor: connecting !== null ? 'not-allowed' : 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'all 0.2s',
                opacity: connecting !== null && connecting !== wallet.id ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (connecting === null) {
                  e.currentTarget.style.background = monochromeTheme.colors.hover;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = monochromeTheme.colors.background;
              }}
            >
              <span>{wallet.name}</span>
              <span style={{ fontSize: '12px', color: monochromeTheme.colors.gray500 }}>
                {connecting === wallet.id ? "Connecting..." : "INSTALL"}
              </span>
            </button>
          ))}
        </div>

        {/* Disconnect button if already connected */}
        {isConnected && onDisconnect && (
          <button
            onClick={onDisconnect}
            style={{
              width: '100%',
              marginTop: '16px',
              padding: '12px',
              border: `1px solid ${monochromeTheme.colors.border}`,
              borderRadius: monochromeTheme.radii.md,
              background: monochromeTheme.colors.background,
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
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
}
