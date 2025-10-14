# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15 application with Web3 wallet integration (wagmi/viem) deployed to Cloudflare Workers via OpenNext. Uses shadcn/ui components and TanStack Query for state management.

## Development Commands

```bash
# Development server (with Turbopack)
npm run dev

# Build for production
npm build

# Lint code
npm run lint

# Deploy to Cloudflare
npm run deploy

# Preview Cloudflare deployment locally
npm run preview

# Generate Cloudflare types
npm run cf-typegen
```

## Architecture

### Deployment Strategy
- **Local development**: Standard Next.js dev server with OpenNext Cloudflare dev mode enabled
- **Production**: Builds to `.open-next/` directory and deploys as Cloudflare Worker
- **Configuration**: `open-next.config.ts` for OpenNext settings, `wrangler.jsonc` for Cloudflare Workers config

### Web3 Integration Layer
The application uses a custom SimpleKit wallet connection system built on wagmi:

1. **Provider hierarchy** (src/app/layout.tsx → src/app/providers.tsx):
   - Root `WagmiProvider` with cookie-based SSR state
   - `QueryClientProvider` for TanStack Query
   - `SimpleKitProvider` wraps app content (optional, not used in current layout)

2. **Wagmi configuration** (src/lib/wagmi.ts):
   - Configured for mainnet and sepolia chains
   - Connectors: injected, baseAccount, walletConnect
   - Uses cookie storage for SSR compatibility
   - Requires `NEXT_PUBLIC_WC_PROJECT_ID` environment variable

3. **SimpleKit components** (src/components/simplekit.tsx):
   - `SimpleKitProvider`: Manages wallet connection modal state and connector lifecycle
   - `ConnectWalletButton`: Main UI component for wallet connection
   - `useSimpleKit()`: Hook exposing modal controls and connection state
   - Custom connector sorting logic prioritizes MetaMask, handles injected wallets
   - Uses custom icon URLs for wallet logos

4. **Responsive modal system** (src/components/simplekit-modal.tsx):
   - Desktop: Dialog component
   - Mobile: Drawer component
   - Automatically switches based on `(min-width: 768px)` media query
   - Built with Radix UI primitives via shadcn/ui

### Component Library
Uses shadcn/ui (New York style) with:
- Tailwind CSS v4 with `@tailwindcss/postcss`
- CSS variables for theming (neutral base color)
- Components aliased to `@/components/ui`
- Path aliases configured: `@/components`, `@/lib`, `@/hooks`, `@/utils`

### Key Files
- `src/lib/wagmi.ts`: Web3 configuration and chain setup
- `src/components/simplekit.tsx`: Wallet connection logic (363 lines)
- `src/components/simplekit-modal.tsx`: Responsive modal wrapper
- `src/lib/utils.ts`: Utility functions (cn for className merging)

## Important Notes

### OpenNext Cloudflare Integration
- Development mode initialized in `next.config.ts` via `initOpenNextCloudflareForDev()`
- Worker entry point at `.open-next/worker.js` with assets at `.open-next/assets`
- R2 incremental cache can be enabled in `open-next.config.ts` if needed

### Web3 Provider Pattern
Two provider implementations exist:
- `src/app/providers.tsx`: Simple wagmi + react-query wrapper (currently used)
- `src/components/web3-provider.tsx`: Includes SimpleKitProvider (alternative pattern)

When adding Web3 features, use hooks from wagmi (useAccount, useConnect, useDisconnect, etc.) and access SimpleKit via `useSimpleKit()` if modal control is needed.

### Connector Handling
SimpleKit includes special logic for MetaMask detection:
- Handles both `metaMaskSDK` and `metaMask` connector IDs
- Filters duplicate injected connectors (io.metamask, io.metamask.mobile)
- Falls back to generic injected connector when MetaMask not detected
- See `useConnectors()` in simplekit.tsx:353-429 for full logic

### Styling Approach
- Global styles in `src/app/globals.css`
- Component-level styles use Tailwind with `cn()` utility for conditional classes
- Inter font loaded via next/font/google
