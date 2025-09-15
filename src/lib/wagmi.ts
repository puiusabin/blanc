import { createConfig, http } from "wagmi";
import { mainnet } from "wagmi/chains";
import { metaMask, baseAccount } from "wagmi/connectors";

// Lazy load connectors to reduce initial bundle size
const getConnectors = () => {
  const connectors = [
    // MetaMask connector
    metaMask(),

    // Coinbase Base Account connector
    baseAccount({
      appName: "Blanc",
    }),
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
});
