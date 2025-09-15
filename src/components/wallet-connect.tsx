"use client";

import React, { useState, useEffect } from "react";
import { useConnect, useAccount } from "wagmi";
import type { Connector } from "wagmi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PhantomIcon } from "@/components/icons/phantom";
import { MetamaskIcon } from "@/components/icons/metamask";
import { CoinbaseIcon } from "@/components/icons/coinbase";
import { WalletConnectIcon } from "@/components/icons/walletconnect";
import { RainbowIcon } from "@/components/icons/rainbow";
import { useWagmiAuth } from "@/hooks/use-wagmi-auth";
import { BorderBeam } from "@/components/magicui/border-beam";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";

// Wallet type definition
interface WalletType {
  id: string;
  name: string;
  icon: React.ReactNode;
  loadingIcon: React.ReactNode;
  available: boolean;
  connector: Connector | null;
  isPhantom?: boolean;
  isMetaMask?: boolean;
  isCoinbase?: boolean;
  isRainbow?: boolean;
  isWalletConnect?: boolean;
}

// Define the fixed wallet order with their proper connectors
const getOrderedWallets = (
  connectors: readonly Connector[],
  isClient: boolean,
): WalletType[] => {
  const wallets: WalletType[] = [];

  // 1. Phantom - always show
  wallets.push({
    id: "phantom",
    name: "Phantom",
    icon: <PhantomIcon className="size-8 rounded-md" />,
    loadingIcon: <PhantomIcon className="size-12 rounded-md" />,
    available: true,
    connector: connectors.find((c) => c.id === "injected") || null,
    isPhantom: true,
  });

  // 2. MetaMask - always show
  const metamaskConnector = connectors.find((c) => c.id === "io.metamask");
  wallets.push({
    id: "metamask",
    name: "MetaMask",
    icon: <MetamaskIcon className="size-8" />,
    loadingIcon: <MetamaskIcon className="size-12" />,
    available: true,
    connector: metamaskConnector || null,
    isMetaMask: true,
  });

  // 3. Coinbase - always show
  const coinbaseConnector =
    connectors.find((c) => c.id === "baseAccount") ||
    connectors.find((c) => c.id === "coinbaseWallet");
  wallets.push({
    id: "coinbase",
    name: "Coinbase",
    icon: <CoinbaseIcon className="size-8 rounded-md" />,
    loadingIcon: <CoinbaseIcon className="size-12 rounded-md" />,
    available: true,
    connector: coinbaseConnector || null,
    isCoinbase: true,
  });

  // 4. Rainbow - show if available (only on client-side)
  const injectedConnector = connectors.find((c) => c.id === "injected");
  if (
    isClient &&
    typeof window !== "undefined" &&
    window.ethereum?.isRainbow &&
    injectedConnector
  ) {
    wallets.push({
      id: "rainbow",
      name: "Rainbow",
      icon: <RainbowIcon className="size-8 rounded-md" />,
      loadingIcon: <RainbowIcon className="size-12 rounded-md" />,
      available: true,
      connector: injectedConnector || null,
      isRainbow: true,
    });
  }

  // 5. WalletConnect - always show last
  const wcConnector = connectors.find((c) => c.id === "walletConnect");
  wallets.push({
    id: "walletconnect",
    name: "WalletConnect",
    icon: <WalletConnectIcon className="size-9" />,
    loadingIcon: <WalletConnectIcon className="size-14" />,
    available: true,
    connector: wcConnector || null,
    isWalletConnect: true,
  });

  return wallets;
};

export function CustomWalletConnect() {
  const { connectors, connect, error } = useConnect();
  const { isConnected } = useAccount();
  const router = useRouter();
  const [processingWallet, setProcessingWallet] = useState<string | null>(null);
  const [showingQR, setShowingQR] = useState(false);
  const [qrUri, setQrUri] = useState<string>("");
  const [qrWalletType, setQrWalletType] = useState<string>("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [isClient, setIsClient] = useState(false);

  const {
    isAuthenticated,
    isLoading: authLoading,
    error: authError,
    authenticate,
  } = useWagmiAuth();

  // Auto-authenticate when wallet connects
  useEffect(() => {
    if (isConnected && !isAuthenticated && !authLoading && processingWallet) {
      authenticate().finally(() => {
        setProcessingWallet(null);
      });
    }
  }, [
    isConnected,
    isAuthenticated,
    authLoading,
    authenticate,
    processingWallet,
  ]);

  // Clear processing state and redirect when authentication completes successfully
  useEffect(() => {
    if (isAuthenticated && (processingWallet || showingQR)) {
      setProcessingWallet(null);
      setShowingQR(false);
      // Redirect to mail page after successful authentication
      router.push("/mail");
    }
  }, [isAuthenticated, processingWallet, showingQR, router]);

  // Also redirect if user becomes authenticated (covers existing keys loaded scenario)
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      console.log("User authenticated on auth page, redirecting to /mail");
      router.push("/mail");
    }
  }, [isAuthenticated, authLoading, router]);

  // Set client-side flag immediately to avoid hydration issues
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Generate QR code when URI changes
  useEffect(() => {
    if (qrUri && showingQR) {
      QRCode.toDataURL(qrUri, { width: 256, margin: 2 })
        .then(setQrCodeDataUrl)
        .catch(console.error);
    } else {
      setQrCodeDataUrl("");
    }
  }, [qrUri, showingQR]);

  const handleWalletClick = async (wallet: WalletType) => {
    // Handle Phantom wallet
    if (wallet.isPhantom) {
      if (typeof window !== "undefined" && window.ethereum?.isPhantom) {
        setProcessingWallet("phantom");
        if (wallet.connector) {
          connect(
            { connector: wallet.connector },
            {
              onSuccess: () => {},
              onError: () => setProcessingWallet(null),
            },
          );
        }
      } else {
        window.open("https://phantom.app/", "_blank");
        return;
      }
      return;
    }

    // Handle MetaMask wallet
    if (wallet.isMetaMask) {
      const isActualMetaMask =
        typeof window !== "undefined" &&
        window.ethereum?.isMetaMask &&
        !window.ethereum?.isRainbow &&
        !window.ethereum?.isCoinbaseWallet &&
        wallet.connector;

      if (!isActualMetaMask) {
        const currentUrl = window.location.origin;
        const metamaskDeepLink = `https://metamask.app.link/dapp/${currentUrl.replace("https://", "").replace("http://", "")}`;

        setQrUri(metamaskDeepLink);
        setQrWalletType("metamask");
        setShowingQR(true);
        setProcessingWallet(null);
        return;
      }

      if (!wallet.connector) return;
      setProcessingWallet("metamask");
      connect(
        { connector: wallet.connector },
        {
          onSuccess: () => {},
          onError: () => setProcessingWallet(null),
        },
      );
      return;
    }

    // Handle WalletConnect
    if (wallet.isWalletConnect) {
      if (!wallet.connector) return;
      setProcessingWallet("walletconnect");
      connect(
        { connector: wallet.connector },
        {
          onSuccess: () => {},
          onError: () => setProcessingWallet(null),
        },
      );
      return;
    }

    // Handle other wallets (Coinbase, Rainbow, etc.)
    if (!wallet.connector) return;
    setProcessingWallet(wallet.id);

    if (isConnected) {
      await authenticate();
      setProcessingWallet(null);
    } else {
      connect(
        { connector: wallet.connector },
        {
          onSuccess: () => {},
          onError: () => setProcessingWallet(null),
        },
      );
    }
  };

  // Show QR code state
  if (showingQR && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="absolute top-6 left-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/blanc.svg"
              alt="Blanc"
              width={120}
              height={40}
              className="h-5 w-auto"
            />
          </Link>
        </div>

        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md relative">
            <div className="absolute top-4 left-4 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowingQR(false);
                  setQrUri("");
                  setQrWalletType("");
                }}
              >
                <ArrowLeft className="size-4" />
              </Button>
            </div>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center space-y-6">
                <h2 className="text-xl font-semibold text-center">
                  {qrWalletType === "metamask"
                    ? "Open MetaMask Mobile"
                    : "Scan with your wallet"}
                </h2>

                {qrCodeDataUrl ? (
                  <div className="flex justify-center">
                    <Image
                      src={qrCodeDataUrl}
                      alt={`${qrWalletType === "metamask" ? "MetaMask" : "WalletConnect"} QR Code`}
                      width={256}
                      height={256}
                      className="border-2 border-gray-200 rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="w-64 h-64 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                )}

                <p className="text-sm text-gray-600 text-center">
                  {qrWalletType === "metamask"
                    ? "Scan this QR code with MetaMask mobile app to connect to this dapp"
                    : "Open your mobile wallet and scan this QR code to connect"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show loading state during connection/authentication process
  if (processingWallet && !isAuthenticated) {
    let loadingText = "Connecting...";
    if (isConnected && authLoading) {
      loadingText = "Signing message...";
    } else if (isConnected && !authLoading) {
      loadingText = "Generating encryption keys...";
    }

    // Get all wallets (base + detected)
    const allWallets = getOrderedWallets(connectors, isClient);
    const currentWallet = allWallets.find((w) => w.id === processingWallet);
    const walletIcon = currentWallet?.loadingIcon || (
      <Wallet className="size-12" />
    );

    return (
      <div className="min-h-screen bg-background">
        <div className="absolute top-6 left-6">
          <Link href="/" className="flex items-center">
            <Image
              src="/blanc.svg"
              alt="Blanc"
              width={120}
              height={40}
              className="h-5 w-auto"
            />
          </Link>
        </div>

        <div className="flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md relative">
            <div className="absolute top-4 left-4 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setProcessingWallet(null);
                  setShowingQR(false);
                }}
              >
                <ArrowLeft className="size-4" />
              </Button>
            </div>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="size-16 rounded-md bg-white flex items-center justify-center">
                    {walletIcon}
                    <BorderBeam duration={2} size={100} />
                  </div>
                </div>
                <p className="text-lg font-medium text-center">{loadingText}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Redirect happens in useEffect, so we don't need a success state UI here

  // Main wallet selection UI - show wallets in the correct order
  const wallets = getOrderedWallets(connectors, isClient);

  // Decide number of columns: if there are more than the 4 base wallets, cap to 4 columns
  const columns = wallets.length > 4 ? 4 : Math.max(1, wallets.length);

  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/blanc.svg"
            alt="Blanc"
            width={120}
            height={40}
            className="h-5 w-auto"
          />
        </Link>
      </div>

      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <h1 className="text-2xl font-semibold text-center mb-6">
              Connect your wallet
            </h1>

            {(error || authError) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error?.message || authError}
              </div>
            )}

            {/* Use CSS Grid and an inline style for dynamic column count so we can cap at 4 columns when needed */}
            <div
              className="grid grid-cols-4 gap-3"
              style={{
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              }}
            >
              {wallets.map((wallet) => {
                const isProcessing = processingWallet === wallet.id;
                const isDisabled = processingWallet !== null;

                return (
                  <Button
                    key={wallet.id}
                    variant="outline"
                    className="w-full h-14 flex items-center justify-center"
                    onClick={() => handleWalletClick(wallet)}
                    disabled={isDisabled}
                  >
                    {isProcessing ? (
                      <div className="size-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    ) : (
                      wallet.icon
                    )}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CustomWalletConnect;
