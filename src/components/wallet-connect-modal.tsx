"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConnect, useAccount } from "wagmi";
import type { Connector } from "wagmi";
import { useState, useEffect } from "react";
import { PhantomIcon } from "@/components/icons/phantom";
import { MetamaskIcon } from "@/components/icons/metamask";
import { CoinbaseIcon } from "@/components/icons/coinbase";
import { WalletConnectIcon } from "@/components/icons/walletconnect";
import { GenericWalletIcon } from "@/components/icons/generic-wallet";
import { detectInjectedWallets, isWalletAvailable, getWalletDownloadUrl } from "@/lib/wallet-detection";
import { useWagmiAuth } from "@/hooks/use-wagmi-auth";
import { useRouter } from "next/navigation";
import { Wallet } from "lucide-react";

interface WalletConnectModalProps {
  onClose: () => void;
}

interface WalletType {
  id: string;
  name: string;
  icon: React.ReactNode;
  available: boolean;
  connector: Connector | null;
  isDetected?: boolean;
  downloadUrl?: string;
  isWalletConnect?: boolean;
}

const getWalletIcon = (walletId: string, className: string = "size-8") => {
  switch (walletId) {
    case "metamask":
      return <MetamaskIcon className={className} />;
    case "coinbase":
      return <CoinbaseIcon className={`${className} rounded-md`} />;
    case "phantom":
      return <PhantomIcon className={`${className} rounded-md`} />;
    default:
      return <GenericWalletIcon className={className} walletName={walletId} />;
  }
};

const getOrderedWallets = (connectors: readonly Connector[], isClient: boolean): WalletType[] => {
  const wallets: WalletType[] = [];
  const injectedConnector = connectors.find((c) => c.id === "injected");

  const coreWallets = [
    { id: "metamask", name: "MetaMask", connectorId: "io.metamask", fallbackConnector: injectedConnector },
    { id: "coinbase", name: "Coinbase Wallet", connectorId: "coinbaseWallet", fallbackConnector: injectedConnector },
    { id: "phantom", name: "Phantom", connectorId: "injected", fallbackConnector: injectedConnector },
  ];

  coreWallets.forEach(({ id, name, connectorId, fallbackConnector }) => {
    const connector = connectors.find((c) => c.id === connectorId) || fallbackConnector;
    const isDetected = isClient && isWalletAvailable(id);

    wallets.push({
      id,
      name,
      icon: getWalletIcon(id),
      available: true,
      connector: connector || null,
      isDetected,
      downloadUrl: getWalletDownloadUrl(id),
    });
  });

  if (isClient && injectedConnector) {
    const detectedWallets = detectInjectedWallets();
    const coreWalletIds = new Set(coreWallets.map((w) => w.id));
    const additionalWallets = detectedWallets.filter((w) => !coreWalletIds.has(w.id));

    additionalWallets.forEach((detectedWallet) => {
      wallets.push({
        id: detectedWallet.id,
        name: detectedWallet.name,
        icon: getWalletIcon(detectedWallet.id),
        available: true,
        connector: injectedConnector,
        isDetected: true,
        downloadUrl: getWalletDownloadUrl(detectedWallet.id),
      });
    });
  }

  const wcConnector = connectors.find((c) => c.id === "walletConnect");
  wallets.push({
    id: "walletconnect",
    name: "WalletConnect",
    icon: <WalletConnectIcon className="size-9" />,
    available: true,
    connector: wcConnector || null,
    isWalletConnect: true,
  });

  return wallets;
};

export function WalletConnectModal({ onClose }: WalletConnectModalProps) {
  const { connectors, connect, error } = useConnect();
  const { isConnected } = useAccount();
  const { isAuthenticated, authLoading, authError, authenticate } = useWagmiAuth();
  const router = useRouter();
  const [processingWallet, setProcessingWallet] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auto-close and redirect when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      onClose();
      router.push("/mail");
    }
  }, [isAuthenticated, onClose, router]);

  const handleWalletClick = async (wallet: WalletType) => {
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

    if (!wallet.isDetected && wallet.downloadUrl) {
      window.open(wallet.downloadUrl, "_blank");
      return;
    }

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

  // Show "Sign In" button if wallet connected but not authenticated
  if (isConnected && !isAuthenticated && !authLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center space-y-6 py-6">
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
        </DialogContent>
      </Dialog>
    );
  }

  const wallets = getOrderedWallets(connectors, isClient);
  const columns = Math.min(4, Math.max(1, wallets.length));

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">Connect your wallet</DialogTitle>
        </DialogHeader>

        {(error || authError) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error?.message || authError}
          </div>
        )}

        <div
          className="grid gap-3 pb-4"
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
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
      </DialogContent>
    </Dialog>
  );
}
