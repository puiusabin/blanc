# BlancKit

**Monospace Monochrome Wallet Connection Kit**

A minimal, terminal-inspired wallet connection library for Blanc. Built with wagmi, inspired by RainbowKit's architecture.

## Design Philosophy

- **Monospace Everything** - All text uses monospace fonts for a code/terminal aesthetic
- **Monochrome Palette** - Strict black, white, and gray color scheme
- **Minimal & Clean** - No unnecessary visual elements
- **Terminal-Inspired** - Simple borders, clean lines, functional design

## Features

- 🎨 Pure monochrome design system
- 🔤 Monospace typography throughout
- 🔌 Automatic wallet detection
- 📱 Mobile-friendly modals
- ⚡ Built on wagmi
- 🎯 TypeScript support
- 🪝 React hooks for auth state

## Components

### ConnectButton

Main entry point for wallet connection. Shows different states:
- Disconnected: "Connect Wallet" button (black background)
- Connected: Formatted address button (white background with border)

```tsx
import { ConnectButton } from "@/blanckit";

function App() {
  return <ConnectButton label="Connect Wallet" />;
}
```

### WalletModal

Automatically triggered modal showing:
- **Detected wallets** - Installed wallets with "DETECTED" badge
- **Other wallets** - Uninstalled wallets with "INSTALL" label
- **Sign-in flow** - After connection, prompts for authentication

## Theme

The monochrome theme (`src/blanckit/themes/monochrome.ts`) defines:

```typescript
{
  fonts: {
    body: 'ui-monospace, SFMono-Regular, ...'
  },
  colors: {
    background: '#FFFFFF',
    foreground: '#000000',
    gray50-900: // Grayscale palette
  },
  radii: {
    none, sm, md, lg, full
  }
}
```

## Architecture

```
src/blanckit/
├── components/
│   ├── ConnectButton.tsx   # Main button component
│   └── WalletModal.tsx      # Wallet selection & sign-in modal
├── themes/
│   └── monochrome.ts        # Monochrome design tokens
├── hooks/                    # (Future: Custom hooks)
├── utils/                    # (Future: Utilities)
└── index.ts                  # Public exports
```

## Comparison to RainbowKit

| Feature | RainbowKit | BlancKit |
|---------|------------|----------|
| Design | Colorful, rounded | Monochrome, minimal |
| Typography | Sans-serif | Monospace |
| Themes | Multiple | Monochrome only |
| Size | Larger bundle | Lightweight |
| Customization | Extensive | Intentionally limited |

## Integration

BlancKit integrates with:
- Wagmi v2 for wallet connections
- Better-auth for session management
- Custom crypto hooks for encryption keys

## Future Additions

- [ ] Custom hooks package
- [ ] Chain switching UI
- [ ] Balance display
- [ ] Recent transactions
- [ ] ENS name resolution display
- [ ] Account modal with disconnect
