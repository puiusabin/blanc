import { createConfig, http, createStorage, cookieStorage } from "wagmi";
import { mainnet } from "wagmi/chains";
import {
  metaMask,
  baseAccount,
  walletConnect,
  injected,
} from "wagmi/connectors";

// Lazy load connectors to reduce initial bundle size
const getConnectors = () => {
  const connectors = [
    // Injected connector for all installed wallets
    injected(),

    // MetaMask connector
    metaMask({
      dappMetadata: {
        name: "Blanc",
        url: "https://blanc.is",
        iconUrl: "https://blanc.is/favicon.ico",
      },
      headless: true,
    }),

    // Coinbase Base Account connector
    baseAccount({
      appName: "Blanc",
    }),

    // WalletConnect for mobile wallets
    walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || "" }),
  ];

  // TODO: Re-enable WalletConnect when type issues are resolved
  // WalletConnect has type compatibility issues with current wagmi version

  return connectors;
};

export const wagmiConfig = createConfig({
  chains: [mainnet],
  connectors: getConnectors(),
  transports: {
    [mainnet.id]: http(),
  },
  ssr: true, // Enable SSR support for better performance
  storage: createStorage({
    storage: typeof window !== "undefined" ? localStorage : cookieStorage,
  }),
});
