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
import { GenericWalletIcon } from "@/components/icons/generic-wallet";
import {
  detectInjectedWallets,
  isWalletAvailable,
  getWalletDownloadUrl,
} from "@/lib/wallet-detection";
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
  isDetected?: boolean;
  downloadUrl?: string;
  isWalletConnect?: boolean;
}

// Get wallet icon component for known wallets
const getWalletIcon = (walletId: string, className: string = "size-8") => {
  switch (walletId) {
    case "metamask":
      return <MetamaskIcon className={className} />;
    case "rainbow":
      return <RainbowIcon className={`${className} rounded-md`} />;
    case "coinbase":
      return <CoinbaseIcon className={`${className} rounded-md`} />;
    case "phantom":
      return <PhantomIcon className={`${className} rounded-md`} />;
    default:
      return <GenericWalletIcon className={className} walletName={walletId} />;
  }
};

// Define the wallet detection and ordering
const getOrderedWallets = (
  connectors: readonly Connector[],
  isClient: boolean,
): WalletType[] => {
  const wallets: WalletType[] = [];
  const injectedConnector = connectors.find((c) => c.id === "injected");

  // Always show core wallets first (whether detected or not)
  const coreWallets = [
    {
      id: "metamask",
      name: "MetaMask",
      connectorId: "io.metamask",
      fallbackConnector: injectedConnector,
    },
    {
      id: "coinbase",
      name: "Coinbase Wallet",
      connectorId: "coinbaseWallet",
      fallbackConnector: injectedConnector,
    },
    {
      id: "phantom",
      name: "Phantom",
      connectorId: "injected",
      fallbackConnector: injectedConnector,
    },
  ];

  // Add core wallets
  coreWallets.forEach(({ id, name, connectorId, fallbackConnector }) => {
    const connector =
      connectors.find((c) => c.id === connectorId) || fallbackConnector;
    const isDetected = isClient && isWalletAvailable(id);

    wallets.push({
      id,
      name,
      icon: getWalletIcon(id),
      loadingIcon: getWalletIcon(id, "size-12"),
      available: true,
      connector: connector || null,
      isDetected,
      downloadUrl: getWalletDownloadUrl(id),
    });
  });

  // Dynamically detect and add other injected wallets
  if (isClient && injectedConnector) {
    const detectedWallets = detectInjectedWallets();

    // Filter out wallets we already added as core wallets
    const coreWalletIds = new Set(coreWallets.map((w) => w.id));
    const additionalWallets = detectedWallets.filter(
      (w) => !coreWalletIds.has(w.id),
    );

    additionalWallets.forEach((detectedWallet) => {
      wallets.push({
        id: detectedWallet.id,
        name: detectedWallet.name,
        icon: getWalletIcon(detectedWallet.id),
        loadingIcon: getWalletIcon(detectedWallet.id, "size-12"),
        available: true,
        connector: injectedConnector,
        isDetected: true,
        downloadUrl: getWalletDownloadUrl(detectedWallet.id),
      });
    });
  }

  // Always add WalletConnect last
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

  // Removed auto-authenticate - user must explicitly sign in
  // This improves UX by not surprising users with signature requests

  // Clear processing state and redirect when authentication completes successfully
  useEffect(() => {
    if (isAuthenticated && (processingWallet || showingQR)) {
      setProcessingWallet(null);
      setShowingQR(false);
      router.push("/mail");
    }
  }, [isAuthenticated, processingWallet, showingQR, router]);

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
    // Handle WalletConnect
    if (wallet.isWalletConnect) {
      if (!wallet.connector) return;
      setProcessingWallet("walletconnect");
      connect(
        { connector: wallet.connector },
        {
          onSuccess: () => setProcessingWallet(null),
          onError: () => setProcessingWallet(null),
        },
      );
      return;
    }

    // Handle detected wallets
    if (wallet.isDetected && wallet.connector) {
      setProcessingWallet(wallet.id);
      connect(
        { connector: wallet.connector },
        {
          onSuccess: () => setProcessingWallet(null),
          onError: () => setProcessingWallet(null),
        },
      );
      return;
    }

    // Handle undetected wallets - show download option or QR code
    if (!wallet.isDetected) {
      if (wallet.id === "metamask") {
        const currentUrl = window.location.origin;
        const metamaskDeepLink = `https://metamask.app.link/dapp/${currentUrl.replace("https://", "").replace("http://", "")}`;

        setQrUri(metamaskDeepLink);
        setQrWalletType("metamask");
        setShowingQR(true);
        return;
      }

      // For other undetected wallets, open download URL
      if (wallet.downloadUrl) {
        window.open(wallet.downloadUrl, "_blank");
      }
      return;
    }

    // Fallback for other cases
    if (!wallet.connector) return;
    setProcessingWallet(wallet.id);
    connect(
      { connector: wallet.connector },
      {
        onSuccess: () => setProcessingWallet(null),
        onError: () => setProcessingWallet(null),
      },
    );
  };

  const handleSignIn = async () => {
    if (!isConnected) return;
    setProcessingWallet("signing");
    try {
      await authenticate();
    } catch (error) {
      console.error("Sign in failed:", error);
    } finally {
      setProcessingWallet(null);
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

  // Show "Sign In" button if wallet is connected but not authenticated
  if (isConnected && !isAuthenticated && !authLoading) {
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
              <div className="flex flex-col items-center space-y-6">
                <div className="size-16 rounded-full bg-green-50 flex items-center justify-center">
                  <Wallet className="size-8 text-green-600" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-semibold">Wallet Connected</h2>
                  <p className="text-sm text-muted-foreground">
                    Sign in to access your encrypted email
                  </p>
                </div>
                {authError && (
                  <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {authError}
                  </div>
                )}
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleSignIn}
                  disabled={processingWallet === "signing"}
                >
                  {processingWallet === "signing" ? "Signing In..." : "Sign In"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main wallet selection UI - show wallets in the correct order
  const wallets = getOrderedWallets(connectors, isClient);

  // Decide number of columns: cap to 4 columns max for better layout
  const columns = Math.min(4, Math.max(1, wallets.length));

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

            <div
              className="grid gap-3"
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
                    className="w-full h-14 [&_svg]:!size-8"
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
