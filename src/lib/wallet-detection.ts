"use client";

interface WalletProvider {
  isMetaMask?: boolean;
  isRabby?: boolean;
  isRainbow?: boolean;
  isCoinbaseWallet?: boolean;
  isPhantom?: boolean;
  isBraveWallet?: boolean;
  isExodus?: boolean;
  isTrust?: boolean;
  isFrame?: boolean;
  isOkxWallet?: boolean;
  isBitKeep?: boolean;
  isZerion?: boolean;
  isTokenPocket?: boolean;
  isImToken?: boolean;
  isMathWallet?: boolean;
  isLedgerConnect?: boolean;
  isCakeWallet?: boolean;
  isHyperPay?: boolean;
  isWalletConnect?: boolean;
  isRabby_v1?: boolean;
  isAvalanche?: boolean;
  isTronLink?: boolean;
  isKaikas?: boolean;
  isNiftyWallet?: boolean;
  isOpera?: boolean;
  providers?: WalletProvider[];
}

export interface DetectedWalletInfo {
  id: string;
  name: string;
  icon?: string;
  detected: boolean;
  priority: number;
}

// Known wallet configurations with detection methods and priorities
const WALLET_CONFIGS: Record<
  string,
  {
    name: string;
    priority: number;
    icon?: string;
    detectFn: (provider: WalletProvider) => boolean;
    downloadUrl?: string;
  }
> = {
  metamask: {
    name: "MetaMask",
    priority: 1,
    detectFn: (provider) =>
      Boolean(
        provider.isMetaMask &&
          !provider.isRabby &&
          !provider.isRainbow &&
          !provider.isCoinbaseWallet,
      ),
    downloadUrl: "https://metamask.io/download/",
  },
  rainbow: {
    name: "Rainbow",
    priority: 2,
    detectFn: (provider) => Boolean(provider.isRainbow),
    downloadUrl: "https://rainbow.me/download",
  },
  coinbase: {
    name: "Coinbase Wallet",
    priority: 3,
    detectFn: (provider) => Boolean(provider.isCoinbaseWallet),
    downloadUrl: "https://www.coinbase.com/wallet",
  },
  rabby: {
    name: "Rabby",
    priority: 4,
    detectFn: (provider) => Boolean(provider.isRabby),
    downloadUrl: "https://rabby.io/",
  },
  phantom: {
    name: "Phantom",
    priority: 5,
    detectFn: (provider) => Boolean(provider.isPhantom),
    downloadUrl: "https://phantom.app/",
  },
  brave: {
    name: "Brave Wallet",
    priority: 6,
    detectFn: (provider) => Boolean(provider.isBraveWallet),
    downloadUrl: "https://brave.com/wallet/",
  },
  exodus: {
    name: "Exodus",
    priority: 7,
    detectFn: (provider) => Boolean(provider.isExodus),
    downloadUrl: "https://www.exodus.com/",
  },
  trust: {
    name: "Trust Wallet",
    priority: 8,
    detectFn: (provider) => Boolean(provider.isTrust),
    downloadUrl: "https://trustwallet.com/",
  },
  frame: {
    name: "Frame",
    priority: 9,
    detectFn: (provider) => Boolean(provider.isFrame),
    downloadUrl: "https://frame.sh/",
  },
  okx: {
    name: "OKX Wallet",
    priority: 10,
    detectFn: (provider) => Boolean(provider.isOkxWallet),
    downloadUrl: "https://www.okx.com/web3",
  },
  bitkeep: {
    name: "BitKeep",
    priority: 11,
    detectFn: (provider) => Boolean(provider.isBitKeep),
    downloadUrl: "https://bitkeep.com/",
  },
  zerion: {
    name: "Zerion",
    priority: 12,
    detectFn: (provider) => Boolean(provider.isZerion),
    downloadUrl: "https://zerion.io/",
  },
  tokenpocket: {
    name: "TokenPocket",
    priority: 13,
    detectFn: (provider) => Boolean(provider.isTokenPocket),
    downloadUrl: "https://www.tokenpocket.pro/",
  },
  imtoken: {
    name: "imToken",
    priority: 14,
    detectFn: (provider) => Boolean(provider.isImToken),
    downloadUrl: "https://token.im/",
  },
  mathwallet: {
    name: "MathWallet",
    priority: 15,
    detectFn: (provider) => Boolean(provider.isMathWallet),
    downloadUrl: "https://mathwallet.org/",
  },
  ledger: {
    name: "Ledger",
    priority: 16,
    detectFn: (provider) => Boolean(provider.isLedgerConnect),
    downloadUrl: "https://www.ledger.com/ledger-live",
  },
  cake: {
    name: "Cake Wallet",
    priority: 17,
    detectFn: (provider) => Boolean(provider.isCakeWallet),
    downloadUrl: "https://cakewallet.com/",
  },
  hyperpay: {
    name: "HyperPay",
    priority: 18,
    detectFn: (provider) => Boolean(provider.isHyperPay),
    downloadUrl: "https://www.hyperpay.tech/",
  },
  tronlink: {
    name: "TronLink",
    priority: 19,
    detectFn: (provider) => Boolean(provider.isTronLink),
    downloadUrl: "https://www.tronlink.org/",
  },
  kaikas: {
    name: "Kaikas",
    priority: 20,
    detectFn: (provider) => Boolean(provider.isKaikas),
    downloadUrl: "https://app.klaytn.com/",
  },
  nifty: {
    name: "Nifty Wallet",
    priority: 21,
    detectFn: (provider) => Boolean(provider.isNiftyWallet),
    downloadUrl: "https://www.poa.network/for-users/nifty-wallet",
  },
  opera: {
    name: "Opera Wallet",
    priority: 22,
    detectFn: (provider) => Boolean(provider.isOpera),
    downloadUrl: "https://www.opera.com/crypto/next",
  },
};

/**
 * Detects all available injected wallets in the browser
 */
export function detectInjectedWallets(): DetectedWalletInfo[] {
  if (typeof window === "undefined" || !window.ethereum) {
    return [];
  }

  const detected: DetectedWalletInfo[] = [];
  const ethereum = window.ethereum as WalletProvider;

  // Handle multiple providers (some wallets inject multiple providers)
  const providers = ethereum.providers || [ethereum];

  // Track already detected wallets to avoid duplicates
  const detectedIds = new Set<string>();

  providers.forEach((provider: WalletProvider) => {
    Object.entries(WALLET_CONFIGS).forEach(([id, config]) => {
      if (!detectedIds.has(id) && config.detectFn(provider)) {
        detected.push({
          id,
          name: config.name,
          icon: config.icon,
          detected: true,
          priority: config.priority,
        });
        detectedIds.add(id);
      }
    });
  });

  // Sort by priority (lower number = higher priority)
  return detected.sort((a, b) => a.priority - b.priority);
}

/**
 * Gets the download URL for a wallet
 */
export function getWalletDownloadUrl(walletId: string): string | undefined {
  return WALLET_CONFIGS[walletId]?.downloadUrl;
}

/**
 * Checks if a specific wallet is available
 */
export function isWalletAvailable(walletId: string): boolean {
  if (typeof window === "undefined" || !window.ethereum) {
    return false;
  }

  const config = WALLET_CONFIGS[walletId];
  if (!config) return false;

  const ethereum = window.ethereum as WalletProvider;
  const providers = ethereum.providers || [ethereum];

  return providers.some((provider) => config.detectFn(provider));
}

/**
 * Gets a user-friendly name for unknown wallets
 */
export function getGenericWalletName(index: number): string {
  return `Wallet ${index + 1}`;
}
