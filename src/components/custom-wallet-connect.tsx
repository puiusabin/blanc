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
import { useWagmiAuth } from "@/hooks/useWagmiAuth";
// import { QRModal } from "./qr-modal";
import { BorderBeam } from "@/components/magicui/border-beam";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function CustomWalletConnect() {
  const { connectors, connect, error } = useConnect();
  const { isConnected } = useAccount();
  const [processingWallet, setProcessingWallet] = useState<string | null>(null);
  // const [qrModalOpen, setQrModalOpen] = useState(false);
  // const [qrUri, setQrUri] = useState<string>("");

  const {
    isAuthenticated,
    isLoading: authLoading,
    error: authError,
    userKeys,
    authenticate,
  } = useWagmiAuth();

  // Auto-authenticate when wallet connects
  useEffect(() => {
    if (isConnected && !isAuthenticated && !authLoading && processingWallet) {
      authenticate().finally(() => {
        // Clear processing state after authentication attempt
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

  // Clear processing state when authentication completes successfully
  useEffect(() => {
    if (isAuthenticated && processingWallet) {
      setProcessingWallet(null);
      // setQrModalOpen(false);
    }
  }, [isAuthenticated, processingWallet]);

  // Listen for WalletConnect display_uri event
  useEffect(() => {
    // For now, let's use the built-in WalletConnect modal
    // We can implement custom QR modal later once we confirm WC is working
    console.log(
      "WalletConnect connectors available:",
      connectors.find((c) => c.id === "walletConnect")
    );
  }, [connectors]);

  const handleWalletClick = async (
    walletType: string,
    connector?: Connector
  ) => {
    // Handle Phantom wallet separately
    if (walletType === "phantom") {
      // Check if Phantom is available
      if (typeof window !== "undefined" && window.phantom?.ethereum) {
        setProcessingWallet("phantom");
        // Use MetaMask connector for Phantom (it's compatible)
        const phantomConnector = connectors.find((c) => c.id === "io.metamask");
        if (phantomConnector) {
          connect(
            { connector: phantomConnector },
            {
              onSuccess: () => {
                // Keep processingWallet set - authentication will happen in useEffect
              },
              onError: () => {
                setProcessingWallet(null);
              },
            }
          );
        }
      } else {
        // Redirect to Phantom website if not available
        window.open("https://phantom.app/", "_blank");
        return;
      }
      return;
    }

    // Handle MetaMask wallet separately
    if (walletType === "metamask") {
      console.log("MetaMask button clicked");
      console.log("window.ethereum:", window.ethereum);
      console.log("isMetaMask:", window.ethereum?.isMetaMask);
      console.log("MetaMask connector:", connector);

      // Check if MetaMask is available
      if (typeof window !== "undefined" && !window.ethereum?.isMetaMask) {
        console.log("MetaMask not detected, using WalletConnect");
        // Show QR code for MetaMask mobile using WalletConnect
        const wcConnector = connectors.find((c) => c.id === "walletConnect");
        console.log("WalletConnect connector:", wcConnector);
        if (wcConnector) {
          setProcessingWallet("metamask");
          connect(
            { connector: wcConnector },
            {
              onSuccess: () => {
                console.log("WalletConnect connection successful");
              },
              onError: (error) => {
                console.log("WalletConnect connection error:", error);
                setProcessingWallet(null);
              },
            }
          );
        } else {
          console.log("No WalletConnect connector found");
        }
        return;
      }

      console.log("MetaMask detected, using MetaMask connector");
      // If MetaMask is available, use the regular MetaMask connector
      if (connector) {
        setProcessingWallet(walletType);
        connect(
          { connector },
          {
            onSuccess: () => {
              console.log("MetaMask connection successful");
            },
            onError: (error) => {
              console.log("MetaMask connection error:", error);
              setProcessingWallet(null);
            },
          }
        );
      } else {
        console.log("No MetaMask connector found");
      }
      return;
    }

    // Handle WalletConnect to use normal flow
    if (walletType === "walletconnect") {
      if (!connector) return;
      setProcessingWallet(walletType);

      connect(
        { connector },
        {
          onSuccess: () => {
            // Keep processingWallet set - authentication will happen in useEffect
          },
          onError: () => {
            setProcessingWallet(null);
          },
        }
      );
      return;
    }

    if (!connector) return;

    setProcessingWallet(walletType);

    if (isConnected) {
      // If already connected, just authenticate
      await authenticate();
      setProcessingWallet(null);
    } else {
      // If not connected, connect first (then auto-authenticate via useEffect)
      connect(
        { connector },
        {
          onSuccess: () => {
            // Keep processingWallet set - authentication will happen in useEffect
          },
          onError: () => {
            setProcessingWallet(null);
          },
        }
      );
    }
  };

  // Define the 4 wallet options
  const walletOptions = [
    {
      id: "phantom",
      name: "Phantom",
      icon: <PhantomIcon className="size-8 rounded-md" />,
      loadingIcon: <PhantomIcon className="size-12 rounded-md" />,
      connector: null, // Handled separately
    },
    {
      id: "metamask",
      name: "MetaMask",
      icon: <MetamaskIcon className="size-8" />,
      loadingIcon: <MetamaskIcon className="size-12" />,
      connector: connectors.find((c) => c.id === "io.metamask"),
    },
    {
      id: "coinbase",
      name: "Coinbase",
      icon: <CoinbaseIcon className="size-8 rounded-md" />,
      loadingIcon: <CoinbaseIcon className="size-12 rounded-md" />,
      connector: connectors.find((c) => c.id === "baseAccount"),
    },
    {
      id: "walletconnect",
      name: "WalletConnect",
      icon: <WalletConnectIcon className="size-9" />,
      loadingIcon: <WalletConnectIcon className="size-14" />,
      connector: connectors.find((c) => c.id === "walletConnect"),
    },
  ];

  // Show loading state during connection/authentication process
  if (processingWallet && !isAuthenticated) {
    let loadingText = "Connecting...";
    if (isConnected && authLoading) {
      loadingText = "Signing message...";
    } else if (isConnected && !authLoading) {
      loadingText = "Generating encryption keys...";
    }

    // Get the larger wallet icon for the processing wallet
    const processingWalletOption = walletOptions.find(
      (w) => w.id === processingWallet
    );
    const walletIcon = processingWalletOption?.loadingIcon;

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
                  // setQrModalOpen(false);
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

  // Show success state when authenticated
  if (isAuthenticated) {
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
                Welcome to blanc
              </h1>

              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-center text-green-800">
                    ✅ Connected & Authenticated
                  </p>
                </div>

                {userKeys && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold mb-2 text-center">
                      🔐 Encryption Keys Loaded
                    </h3>
                    <details>
                      <summary className="cursor-pointer text-sm text-blue-700 text-center">
                        View Public Keys
                      </summary>
                      <div className="mt-2 space-y-2 text-xs">
                        <div>
                          <p className="font-medium">Encryption:</p>
                          <code className="break-all text-xs bg-white p-1 rounded block">
                            {userKeys.encryptionKeyPair.publicKey}
                          </code>
                        </div>
                        <div>
                          <p className="font-medium">Signing:</p>
                          <code className="break-all text-xs bg-white p-1 rounded block">
                            {userKeys.signingKeyPair.publicKey}
                          </code>
                        </div>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main wallet selection UI
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

            <div className="flex gap-3">
              {walletOptions.map((wallet) => {
                const isProcessing = processingWallet === wallet.id;
                const isDisabled = processingWallet !== null;

                return (
                  <Button
                    key={wallet.id}
                    variant="outline"
                    className="flex-1 h-14 flex items-center justify-center"
                    onClick={() =>
                      handleWalletClick(
                        wallet.id,
                        wallet.connector || undefined
                      )
                    }
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

      {/* QR Modal temporarily disabled - using built-in WalletConnect modal */}
      {/* <QRModal
        uri={qrUri}
        isOpen={qrModalOpen}
        onClose={() => {
          setQrModalOpen(false);
          setProcessingWallet(null);
        }}
      /> */}
    </div>
  );
}
