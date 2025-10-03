"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAccount } from "wagmi";
import { useState } from "react";
import { WalletConnectModal } from "./wallet-connect-modal";

export function Navbar() {
  const { address, isConnected } = useAccount();
  const [showWalletModal, setShowWalletModal] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <>
      <nav className="bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image
                src="/blanc.svg"
                alt="Blanc"
                width={120}
                height={40}
                className="h-5 w-auto"
                priority
                sizes="120px"
              />
            </Link>

            <div className="flex items-center gap-4">
              {isConnected && address ? (
                <Button
                  variant="outline"
                  onClick={() => setShowWalletModal(true)}
                >
                  {formatAddress(address)}
                </Button>
              ) : (
                <Button onClick={() => setShowWalletModal(true)}>
                  Connect Wallet
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {showWalletModal && (
        <WalletConnectModal onClose={() => setShowWalletModal(false)} />
      )}
    </>
  );
}
