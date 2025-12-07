# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

**Blanc** is a Web3-native email service built as a Turborepo monorepo. It combines a Next.js 15 web application with Web3 wallet authentication, a custom Haraka SMTP server for email processing, and a Prisma database layer for data persistence.

### Project Statistics

- **Primary language**: TypeScript
- **Active since**: August 2025 (~3.5 months)
- **Total commits**: 86 commits
- **Architecture**: Monorepo with 3 workspaces (apps, packages, services)
- **Lines of code**: ~6,000 (web app), ~300 (Haraka plugins)

### Core Value Proposition

Privacy-focused email service with wallet-based authentication, built for edge deployment (Cloudflare Workers) with decentralized identity and optional PGP encryption.

## Quick Start & Commands

For setup instructions and available commands, see [README.md](README.md).

## Monorepo Architecture

### Workspace Structure

```
blanc/
├── apps/
│   └── web/                          # @blanc/web - Next.js 15 application
│       ├── .storybook/               # Storybook config + MSW mocks
│       ├── src/
│       │   ├── app/                  # Next.js App Router
│       │   │   ├── mail/             # Email UI routes
│       │   │   │   ├── inbox/        # Inbox view
│       │   │   │   └── layout.tsx    # Mail layout with sidebar
│       │   │   ├── layout.tsx        # Root layout (Web3 + Theme providers)
│       │   │   └── page.tsx          # Landing page (wallet demo)
│       │   ├── components/
│       │   │   ├── mail/             # Email-specific components
│       │   │   │   ├── email-detail/ # Email detail panel
│       │   │   │   ├── email-list/   # Email list with items
│       │   │   │   └── email-panel/  # Resizable email panel
│       │   │   ├── ui/               # shadcn/ui components (~21)
│       │   │   ├── walletkit.tsx     # Web3 wallet connection (363 lines)
│       │   │   ├── walletkit-modal.tsx  # Responsive modal (desktop/mobile)
│       │   │   └── app-sidebar.tsx   # Main application sidebar
│       │   ├── hooks/
│       │   │   ├── use-emails.ts     # Email data hook (mock → API ready)
│       │   │   ├── use-email-selection.ts  # Selection state
│       │   │   └── use-mobile.ts     # Mobile breakpoint detection
│       │   ├── lib/
│       │   │   ├── wagmi.ts          # Web3 config (mainnet, sepolia)
│       │   │   ├── utils.ts          # cn() utility
│       │   │   └── mock-emails.ts    # Development mock data
│       │   └── types/
│       │       └── email.ts          # TypeScript email types
│       ├── next.config.ts            # Next.js + OpenNext config
│       ├── open-next.config.ts       # Cloudflare Workers adapter
│       ├── wrangler.jsonc            # Cloudflare Workers settings
│       └── vitest.config.ts          # Vitest + Storybook tests
│
├── packages/
│   ├── database/                     # @blanc/database - Prisma ORM
│   │   ├── prisma/
│   │   │   └── schema.prisma         # Database schema (4 models)
│   │   ├── src/
│   │   │   ├── client.ts             # PrismaClient singleton
│   │   │   └── index.ts              # Package exports
│   │   └── generated/                # Prisma Client (gitignored)
│   │
│   └── typescript-config/            # @blanc/typescript-config
│       ├── base.json                 # Base strict config
│       ├── nextjs.json               # Next.js extensions
│       └── react.json                # React extensions
│
└── services/
    └── haraka/                       # @blanc/mail-server - SMTP server
        ├── config/                   # Haraka configuration
        │   ├── plugins               # Plugin load order
        │   ├── smtp.ini              # SMTP settings (ports 25, 587)
        │   └── *.ini                 # Connection, logging config
        ├── plugins/
        │   ├── cf_r2_queue.js        # Cloudflare R2 email storage (300 lines)
        │   └── pgp_handler.js        # PGP encryption plugin
        ├── Dockerfile                # Custom Haraka image
        ├── docker-compose.yml        # Orchestration
        └── README.md                 # Comprehensive setup guide
```

### Build System: Turborepo

**Pipeline Configuration** (`turbo.json`):

```json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build", "^db:generate"],
      "outputs": [".next/**", ".open-next/**", "dist/**"]
    },
    "dev": {
      "dependsOn": ["^db:generate"],
      "cache": false,
      "persistent": true
    }
  }
}
```

**Critical Dependencies**:

- All build tasks depend on `db:generate` (Prisma Client must exist)
- Database tasks never cache (`cache: false`)
- Type checking depends on successful builds

**Package Manager**: npm@10.9.2 (enforced via `packageManager` field in root package.json)

## Tech Stack

### Frontend Framework

- **Next.js 15.4.6** - App Router, React 19, Turbopack
  - Server Components (RSC) by default
  - Server-side rendering with cookie-based state
  - Route handlers for API endpoints
- **React 19.1.0** - Latest stable release

### Web3 Stack

- **wagmi 2.17.5** - React hooks for Ethereum
  - Chains: mainnet (id: 1), sepolia (id: 11155111)
  - Connectors: injected, baseAccount, walletConnect
  - Cookie storage for SSR compatibility (critical)
- **viem 2.37.12** - TypeScript Ethereum library
- **Custom WalletKit** - 363-line wallet connection UI

### UI & Styling

- **shadcn/ui** - ~21 components (New York style)
  - Built on Radix UI primitives
  - Components: Dialog, Dropdown Menu, Sidebar, Popover, etc.
- **Tailwind CSS v4** - Latest with @tailwindcss/postcss
  - CSS variables for theming
  - Neutral base color
  - tw-animate-css for animations
- **class-variance-authority 0.7.1** - Component variants
- **clsx 2.1.1** + **tailwind-merge 3.3.1** - Conditional classes

### State Management

- **TanStack Query 5.90.2** - Server state management
  - Configured but not yet implemented for emails
  - Hooks structured for easy migration
- **wagmi** - Web3 state
- **React hooks** - Local component state

### Database & ORM

- **Prisma 6.18.0**
  - PostgreSQL target
  - Prisma Accelerate extension (connection pooling)
  - Generated client: `packages/database/generated/prisma`
- **Database**: PostgreSQL (local or Prisma Postgres)

### Email Service

- **Haraka** - SMTP server (instrumentisto/haraka:latest Docker image)
  - Custom plugins: R2 storage, PGP encryption
  - Ports: 25 (SMTP), 587 (Submission)
- **aws-sdk 2.1692.0** - Cloudflare R2 (S3-compatible)
- **openpgp 5.11.0** - PGP encryption
- **uuid 10.0.0** - Email ID generation

### Development Tools

- **Storybook 10.0.7** - Component development
  - @storybook/nextjs-vite integration
  - MSW addon for API mocking
  - a11y addon for accessibility testing
  - Vitest addon for component tests
- **Vitest 4.0.9** - Test runner
  - @vitest/browser-playwright for browser tests
  - @vitest/coverage-v8 for coverage
- **Playwright 1.56.1** - E2E testing
- **MSW 2.12.2** - API mocking

### Build & Deployment

- **Turborepo 2.5.8** - Monorepo orchestration
- **@opennextjs/cloudflare 1.3.0** - Next.js → Cloudflare Workers
- **Wrangler 4.42.0** - Cloudflare Workers CLI
- **ESLint 9.x** - Flat config with Next.js + Storybook
- **Prettier 3.4.2** - Code formatting

### External Services

- **Cloudflare**:
  - Workers (web app deployment)
  - R2 (email blob storage)
  - Assets (static file serving)
- **WalletConnect** - Web3 wallet connection
- **Prisma Postgres** (optional) - Managed database

## Web3 Integration Architecture

### Provider Hierarchy

```typescript
// apps/web/src/app/layout.tsx
Root Layout
  → ThemeProvider (next-themes)
    → Web3Provider (web3-provider.tsx)
      → WagmiProvider (cookie-based SSR state)
        → QueryClientProvider (TanStack Query)
          → WalletKitProvider (wallet modal management)
            → App Content
```

### Wagmi Configuration

**File**: `apps/web/src/lib/wagmi.ts`

```typescript
import { cookieStorage, createConfig, createStorage, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { baseAccount, injected, walletConnect } from "wagmi/connectors";

export function getConfig() {
  return createConfig({
    chains: [mainnet, sepolia],
    connectors: [
      injected(),
      baseAccount(),
      walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID! }),
    ],
    storage: createStorage({ storage: cookieStorage }), // SSR requirement
    ssr: true,
    transports: {
      [mainnet.id]: http(),
      [sepolia.id]: http(),
    },
  });
}
```

**Critical**: Cookie storage enables SSR state hydration. Using `localStorage` would break server-side rendering.

### WalletKit Wallet Connection

**File**: `apps/web/src/components/walletkit.tsx` (363 lines)

**Key Features**:

1. **Recent Connector Persistence** - Saves last successful connector to `localStorage`, promotes to first position
2. **MetaMask Detection** - Handles both `metaMaskSDK` and `metaMask` connector IDs
3. **Duplicate Filtering** - Removes duplicate injected connectors (io.metamask, io.metamask.mobile)
4. **Custom Connector Sorting**:
   - Recent connector → first
   - MetaMask → first (if detected)
   - Other injected wallets → middle
   - Base Account → second-to-last
   - WalletConnect → last

**Connector Detection Logic** (lines 332-351):

```typescript
const isInjectedWallet =
  props.connector.id === "metaMask" ||
  props.connector.id === "metaMaskSDK" ||
  props.connector.id === "injected" ||
  props.connector.id.startsWith("io.metamask") ||
  props.connector.type === "injected";
```

**Usage**:

```typescript
import { ConnectWalletButton, useWalletKit } from '@/components/walletkit'

function MyComponent() {
  const { open, close } = useWalletKit()
  return <ConnectWalletButton />
}
```

### Responsive Modal System

**File**: `apps/web/src/components/walletkit-modal.tsx`

- **Desktop** (≥768px): Dialog component (centered overlay)
- **Mobile** (<768px): Drawer component (bottom sheet)
- Automatic switching via media query
- Built with Radix UI primitives

### Web3 Hooks

**Available Hooks**:

```typescript
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useWalletKit } from "@/components/walletkit";

const { address, isConnected } = useAccount();
const { connect, connectors } = useConnect();
const { disconnect } = useDisconnect();
const { open, close } = useWalletKit(); // Modal control
```

## Email Service Architecture (Haraka)

### Storage Architecture

**Metadata**: PostgreSQL via Prisma
**Blobs**: Cloudflare R2 (S3-compatible)

**R2 Bucket Structure**:

```
mail-storage/
  {userId}/
    {year}/
      {month}/
        {emailId}.eml.gz
```

### Email Processing Flow

1. **SMTP Reception** (ports 25, 587)
2. **Recipient Validation** (`hook_rcpt_ok` in `cf_r2_queue.js`):
   - Alias resolution (Alias table → User table)
   - User existence check
   - Quota enforcement (DENY if `usedBytes >= quotaBytes`)
   - Store recipient info in `transaction.notes`
3. **Email Queueing** (`hook_queue` in `cf_r2_queue.js`):
   - Create gzip compression stream
   - (Optional) Create PGP encryption stream
   - Upload to R2 (`{userId}/{year}/{month}/{emailId}.eml.gz`)
   - Create Email record in database
   - Increment User.usedBytes
4. **Delivery Success**: Return OK to sender

### Database Schema

**File**: `packages/database/prisma/schema.prisma`

The schema defines 4 models: **User**, **Email**, **Alias**, and **PGPKey**. Key architecture decisions:

- **Users** have quota management (FREE: 2GB, PREMIUM: 20GB) with `usedBytes` tracking
- **Emails** store metadata only; blobs in R2 at path `{userId}/{year}/{month}/{emailId}.eml.gz`
- **Aliases** enable email forwarding (e.g., `hello@blanc.is` → `test@blanc.is`)
- **PGPKeys** support optional end-to-end encryption

For full schema details, see `packages/database/prisma/schema.prisma`.

### Haraka Configuration

**Plugin Load Order** (`services/haraka/config/plugins`):

```
tls
auth/flat_file
cf_r2_queue
```

**Current Settings** (`services/haraka/config/cf_r2_queue.example.json`):

```json
{
  "encryptionEnabled": false, // Disabled for development
  "requirePGPKeys": false,
  "zipBeforeUpload": true, // Gzip compression (50-70% savings)
  "fileExtension": ".eml.gz"
}
```

### Quota System

**Plan Types**:

- **FREE**: 2GB (`2 * 1024 * 1024 * 1024` bytes)
- **PREMIUM**: 20GB (`20 * 1024 * 1024 * 1024` bytes)

**Enforcement**: Checked at RCPT phase before data transfer (saves bandwidth)

### Test Accounts

**Defined in Prisma seed** (see `services/haraka/README.md:58-66`):

- `test@blanc.is` - FREE plan (2GB)
- `premium@blanc.is` - PREMIUM plan (20GB)
- **Aliases**: `hello@blanc.is`, `info@blanc.is` → `test@blanc.is`

### Docker Setup

**File**: `services/haraka/docker-compose.yml`

```yaml
services:
  haraka:
    build: .
    ports:
      - "25:25" # SMTP
      - "587:587" # Submission
    volumes:
      - ./config:/app/haraka/config # Live config updates
      - ../../packages/database:/app/node_modules/@blanc/database # Dev mode
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - R2_ACCOUNT_ID=${R2_ACCOUNT_ID}
      - R2_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID}
      - R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY}
      - R2_BUCKET_NAME=${R2_BUCKET_NAME}
      - R2_ENDPOINT=${R2_ENDPOINT}
```

## Development Workflows

### Git Workflow

**Branches**:

- `main` - Production branch
- `recode` - Current development branch (active)

**Commit Convention** (Conventional Commits):

```
feat: Add new feature
feat(ui): Add button component
fix: Fix authentication bug
refactor: Simplify email list
chore(deps): Update dependencies
```

**Recent Pattern**: Scoped commits (`feat(ui)`, `refactor(mail)`, `fix(auth)`)

### Local Development Workflow

1. **Start services**:

   ```bash
   # Terminal 1: Web app
   npm run dev

   # Terminal 2: Haraka
   cd services/haraka && npm run dev
   ```

2. **Make changes** to source files

3. **Database schema changes**:

   ```bash
   # Edit packages/database/prisma/schema.prisma
   npm run db:generate      # Regenerate Prisma Client
   npm run db:push          # Push to dev database
   ```

4. **Type check** before committing:

   ```bash
   npm run type-check
   npm run lint
   ```

5. **Commit** with conventional commit message

### Storybook Workflow

**Component Development**:

1. Create component in `apps/web/src/components/`
2. Create story in same directory: `component-name.stories.tsx`
3. Run Storybook: `npm run storybook`
4. Develop component visually at http://localhost:6006
5. Add MSW mocks if API calls needed (`.storybook/mocks/`)

**Example Story** (`apps/web/src/components/ui/button.stories.tsx`):

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: { children: "Button", variant: "default" },
};

export const Destructive: Story = {
  args: { children: "Delete", variant: "destructive" },
};
```

### Database Workflow

**Development** (fast iteration):

```bash
# Edit schema
vim packages/database/prisma/schema.prisma

# Push changes (no migration files)
npm run db:push

# Regenerate Prisma Client
npm run db:generate
```

**Production** (tracked migrations):

```bash
# Edit schema
vim packages/database/prisma/schema.prisma

# Create migration
npm run db:migrate

# Regenerate Prisma Client (automatic in migrate)
npm run db:generate
```

**Database GUI**:

```bash
npm run db:studio
# Opens Prisma Studio at http://localhost:5555
```

### Deployment Workflow

**Manual Deployment**:

```bash
cd apps/web

# Ensure environment variables set
echo $NEXT_PUBLIC_WC_PROJECT_ID  # Must be set

# Build and deploy
npm run deploy

# Or just build
npm run build  # Creates .open-next/ directory

# Preview locally
npm run preview
```

**CI/CD** (`.github/workflows/deploy-app.yml`):

- Triggers on push to `main` branch
- Triggers on changes to `apps/web/**` or workflow file
- Steps: Checkout → Setup Node → Install → Lint → Build → Deploy
- Requires secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`

## Coding Conventions

### File Naming

**Pattern**: kebab-case for all files and directories

```
apps/web/src/components/
  email-list-item.tsx
  brand-header.tsx
  decorative-border-layout.tsx

apps/web/src/hooks/
  use-emails.ts
  use-email-selection.ts
  use-mobile.ts
```

### Component Naming

**Pattern**: PascalCase for component functions, matching file purpose

```typescript
// brand-header.tsx
export function BrandHeader({ className, showName = true, size = "md" }: BrandHeaderProps) {...}

// email-list-item.tsx
export function EmailListItem({ email, isSelected, onSelect, onClick }: EmailListItemProps) {...}
```

### Function and Variable Naming

**Pattern**: camelCase for functions, variables, parameters

```typescript
// Correct
const formatTimestamp = (timestamp: string) => {...}
const handleCheckboxChange = (checked: boolean) => {...}
const selectedIds = new Set<string>()

// Incorrect
const FormatTimestamp = (timestamp: string) => {...}
const SelectedIDs = new Set<string>()
```

### TypeScript Conventions

**Strict Mode** (enforced in `packages/typescript-config/base.json`):

```json
{
  "strict": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true
}
```

**Type-First Approach**:

- Interfaces for props and domain models
- Explicit return types on custom hooks
- No `any` types (use `unknown` if truly dynamic)
- Type exports from central files (`src/types/`)

**Example**:

```typescript
// src/types/email.ts
export interface Email {
  id: string;
  from: EmailAddress;
  to: EmailAddress[];
  subject: string;
  timestamp: string;
  isRead: boolean;
  folder: EmailFolder;
}

export type EmailFolder = "inbox" | "sent" | "drafts" | "spam" | "trash" | "archive";

// src/hooks/use-emails.ts
export interface UseEmailsOptions {
  folder: EmailFolder;
  search?: string;
  isRead?: boolean;
}

export interface UseEmailsResult {
  emails: Email[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useEmails({ folder, search, isRead }: UseEmailsOptions): UseEmailsResult {
  // Implementation
}
```

### Import/Export Patterns

**Path Aliases** (configured in `apps/web/components.json`):

```typescript
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEmails } from "@/hooks/use-emails";
import type { Email } from "@/types/email";
```

**Named Exports Preferred**:

```typescript
// Correct
export function EmailList() {...}
export interface EmailListProps {...}

// Avoid default exports
export default EmailList
```

**Barrel Exports** (package entry points):

```typescript
// packages/database/src/index.ts
export { prisma } from "./client";
export * from "../generated/prisma";
```

### File Organization

**Standard Component Structure**:

1. Imports (external first, then internal)
2. Type/Interface definitions
3. Constants/Configuration
4. Component function
5. Helper functions (internal)
6. Exports

**Example**:

```typescript
// 1. Imports
import Image from "next/image"
import { cn } from "@/lib/utils"

// 2. Interface
interface BrandHeaderProps {
  className?: string
  showName?: boolean
  size?: "sm" | "md" | "lg"
}

// 3. Configuration
const sizeConfig = {
  sm: { image: 14, text: "text-sm" },
  md: { image: 20, text: "text-lg" },
  lg: { image: 28, text: "text-xl" },
}

// 4. Component
export function BrandHeader({ className, showName = true, size = "md" }: BrandHeaderProps) {
  const config = sizeConfig[size]
  return (...)
}
```

### Styling Conventions

**Tailwind with cn() Utility**:

```typescript
import { cn } from "@/lib/utils"

<div className={cn(
  "flex items-center border-b px-4 py-3",
  isHovered && "bg-accent/50",
  isSelected && "bg-accent/30",
  className  // Allow prop overrides
)} />
```

**Component Variants** (using class-variance-authority):

```typescript
import { cva } from "class-variance-authority";

const buttonVariants = cva("inline-flex items-center justify-center gap-2 rounded-md", {
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      destructive: "bg-destructive text-white hover:bg-destructive/90",
      outline: "border bg-background shadow-xs hover:bg-accent",
    },
    size: {
      default: "h-9 px-4 py-2",
      sm: "h-8 rounded-md gap-1.5 px-3",
      lg: "h-10 rounded-md px-6",
    },
  },
  defaultVariants: { variant: "default", size: "default" },
});
```

### Comment Conventions

**JSDoc for Public APIs**:

```typescript
/**
 * Hook to fetch and manage emails
 * Currently uses mock data, but structured for easy TanStack Query migration
 *
 * @example
 * const { emails, isLoading } = useEmails({ folder: 'inbox' })
 */
export function useEmails({ folder, search, isRead }: UseEmailsOptions): UseEmailsResult {
  // Implementation
}
```

**Inline Comments for Complex Logic**:

```typescript
// Unread indicator
{!email.isRead && <div className="size-2 rounded-full bg-blue-600" />}

// Store user info in transaction notes for later use in hook_queue
connection.transaction.notes.userInfo = { userId, email }
```

**TODO Comments** (for planned work):

```typescript
// TODO: Replace with TanStack Query when API is ready
// return useQuery({
//   queryKey: ['emails', folder, search, isRead],
//   queryFn: () => fetchEmails({ folder, search, isRead }),
// })
```

### Prettier Configuration

**File**: `.prettierrc.json`

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "useTabs": false,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

## Testing Approach

### Current State

**Test Infrastructure**:

- Vitest 4.0.9 with Playwright browser testing
- Storybook 10.0.7 with 31 component stories
- MSW 2.12.2 for API mocking
- **Only 1 test file exists**: `apps/web/src/components/ui/__tests__/button.test.tsx`

**Storybook as Testing Foundation**:

- 31 story files across UI and mail components
- Portable stories pattern (stories as test fixtures)
- Accessibility testing via @storybook/addon-a11y (warning mode)
- Visual testing capability via Chromatic addon

**MSW Mocks** (`.storybook/mocks/`):

- Web3 handlers: `eth_chainId`, `eth_accounts`, `eth_sendTransaction`, etc.
- Auth handlers: `/api/auth/login`, `/api/auth/logout`
- Mail handlers: `/api/mail/emails`, `/api/mail/send`

### Running Tests

```bash
# Component tests (web app)
cd apps/web
npm run test                # Currently no test script defined

# Storybook (visual testing)
npm run storybook           # http://localhost:6006

# Type checking (primary quality gate)
npm run type-check

# Linting
npm run lint
```

### Test Pattern

**Portable Stories Pattern** (from `button.test.tsx`):

```typescript
import { composeStories } from "@storybook/react"
import { render, screen } from "@testing-library/react"
import * as stories from "../button.stories"

const { Default, Destructive, Disabled, WithIcon } = composeStories(stories)

describe("Button Component", () => {
  it("renders default button", () => {
    render(<Default />)
    expect(screen.getByRole("button")).toBeInTheDocument()
  })

  it("applies destructive variant styles", () => {
    render(<Destructive />)
    const button = screen.getByRole("button")
    expect(button).toHaveClass("bg-destructive")
  })

  it("disables button when disabled prop is true", () => {
    render(<Disabled />)
    expect(screen.getByRole("button")).toBeDisabled()
  })

  it("renders icon alongside text", () => {
    render(<WithIcon />)
    expect(screen.getByRole("button")).toContainHTML("svg")
  })
})
```

### Quality Gates

**CI Pipeline** (`.github/workflows/deploy-app.yml`):

1. **Lint** - ESLint validation
2. **Test** - Vitest execution
3. **Build** - TypeScript compilation
4. **Deploy** - Cloudflare Workers

**Missing from CI**:

- ❌ Coverage reporting
- ❌ E2E tests
- ❌ Accessibility validation

### Recommendations for Testing

1. **Add test script** to package.json:

   ```json
   {
     "test": "vitest run",
     "test:watch": "vitest",
     "test:coverage": "vitest run --coverage"
   }
   ```

2. **Add tests to CI** in `.github/workflows/deploy-app.yml`:

   ```yaml
   - name: Test
     run: npm run test
   ```

3. **Set coverage thresholds** in `vitest.config.ts`:

   ```typescript
   export default defineConfig({
     test: {
       coverage: {
         provider: "v8",
         reporter: ["text", "json", "html"],
         lines: 80,
         functions: 80,
         branches: 80,
         statements: 80,
       },
     },
   });
   ```

4. **Add E2E tests** for critical flows:
   - Wallet connection
   - Email sending
   - Inbox viewing

5. **Enable a11y errors** in `.storybook/main.ts`:
   ```typescript
   a11y: {
     config: {},
     options: {
       checks: { 'color-contrast': { options: { noScroll: true } } },
       restoreScroll: true,
       runOnly: {
         type: 'tag',
         values: ['wcag2a', 'wcag2aa']
       }
     },
     manual: false,
     test: 'error'  // Change from 'todo' to 'error'
   }
   ```

## Deployment

### Cloudflare Workers (Web App)

**Build Process**:

1. Next.js build: `next build` → `.next/`
2. OpenNext transformation: `opennextjs-cloudflare build` → `.open-next/`
3. Outputs:
   - `.open-next/worker.js` - Edge worker entry point
   - `.open-next/assets/` - Static assets

**Configuration**:

**File**: `apps/web/wrangler.jsonc`

```jsonc
{
  "name": "my-next-app", // TODO: Change to actual app name
  "main": ".open-next/worker.js",
  "compatibility_date": "2025-03-01",
  "compatibility_flags": [
    "nodejs_compat", // Node.js APIs on Workers
    "global_fetch_strictly_public", // Fetch API strictness
  ],
  "assets": {
    "binding": "ASSETS",
    "directory": ".open-next/assets",
  },
  "observability": {
    "enabled": true, // Cloudflare observability
  },
}
```

**Environment Variables**:

```bash
# Required in CI/CD
CLOUDFLARE_API_TOKEN=<your-token>
CLOUDFLARE_ACCOUNT_ID=<your-account-id>
NEXT_PUBLIC_WC_PROJECT_ID=<walletconnect-project-id>
```

**Deployment Commands**:

```bash
# Full deployment
npm run deploy

# Preview locally
npm run preview

# Generate Cloudflare types
npm run cf-typegen
```

**R2 Incremental Cache** (optional, currently disabled):

- Configured but commented out in `open-next.config.ts`
- Enable for better performance with cached data
- See https://opennext.js.org/cloudflare/caching

### Haraka Email Service (Docker)

**File**: `services/haraka/docker-compose.yml`

**Ports**:

- `25` - SMTP
- `587` - Submission (authenticated)

**Environment Variables Required**:

```bash
DATABASE_URL=postgresql://user:password@host:5432/blanc
R2_ACCOUNT_ID=<cloudflare-account-id>
R2_ACCESS_KEY_ID=<r2-access-key>
R2_SECRET_ACCESS_KEY=<r2-secret>
R2_BUCKET_NAME=mail-storage
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
```

**Deployment**:

```bash
cd services/haraka

# Build and start
npm run dev

# Or manually
docker compose up --build

# View logs
docker logs -f haraka-dev
```

**Health Check**: Docker health check configured (SMTP connection test)

### Database Migrations

**Development**:

```bash
# Push schema changes (no migration files)
npm run db:push
```

**Production**:

```bash
# Create and apply migration
npm run db:migrate

# Deploy migration
# 1. Update schema in packages/database/prisma/schema.prisma
# 2. npm run db:migrate (creates migration files)
# 3. Commit migration files to git
# 4. Deploy: migrations run automatically on production DB
```

## Key Abstractions

### Email Domain Models

**File**: `apps/web/src/types/email.ts`

```typescript
export interface Email {
  id: string;
  from: EmailAddress;
  to: EmailAddress[];
  cc?: EmailAddress[];
  subject: string;
  preview: string;
  bodyText: string;
  bodyHtml?: string;
  timestamp: string;
  isRead: boolean;
  folder: EmailFolder;
  hasAttachments: boolean;
  attachments?: EmailAttachment[];
  inReplyTo?: string;
}

export interface EmailAttachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  r2Key: string; // Cloudflare R2 storage key
  url?: string; // Signed URL for temporary access
}

export type EmailFolder = "inbox" | "sent" | "drafts" | "spam" | "trash" | "archive";
```

### Custom Hooks

**Email Data Hook** (`apps/web/src/hooks/use-emails.ts`):

```typescript
export interface UseEmailsOptions {
  folder: EmailFolder;
  search?: string;
  isRead?: boolean;
}

export interface UseEmailsResult {
  emails: Email[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useEmails({ folder, search, isRead }: UseEmailsOptions): UseEmailsResult {
  // Currently uses mock data from lib/mock-emails.ts
  // Structured for TanStack Query migration
  // TODO: Replace with TanStack Query
  // return useQuery({
  //   queryKey: ['emails', folder, search, isRead],
  //   queryFn: () => fetchEmails({ folder, search, isRead }),
  // })
}
```

**Email Selection Hook** (`apps/web/src/hooks/use-email-selection.ts`):

```typescript
export interface EmailSelection {
  selectedIds: Set<string>;
  isAllSelected: boolean;
  selectOne: (id: string, selected: boolean) => void;
  selectAll: (selected: boolean) => void;
  clearSelection: () => void;
  toggleSelection: (id: string) => void;
}

export function useEmailSelection(): EmailSelection {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Implementation uses Sets for O(1) lookup
}
```

**Mobile Detection Hook** (`apps/web/src/hooks/use-mobile.ts`):

```typescript
export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 768px)");
    const onChange = () => setIsMobile(!mql.matches);
    mql.addEventListener("change", onChange);
    setIsMobile(!mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
```

### Utility Functions

**cn() - ClassName Merging** (`apps/web/src/lib/utils.ts`):

```typescript
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Usage
<div className={cn(
  "flex items-center",
  isActive && "bg-accent",
  className  // User overrides
)} />
```

**Prisma Client Singleton** (`packages/database/src/client.ts`):

```typescript
import { PrismaClient } from "../generated/prisma";
import { withAccelerate } from "@prisma/extension-accelerate";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient().$extends(withAccelerate());

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### Component Patterns

**Reusable Layout Components**:

- `BrandHeader` - Logo + app name with size variants
- `DecorativeBorderLayout` - Border grid layout wrapper
- `ResizableEmailPanel` - Sliding panel for email detail

**Composition Pattern** (Sidebar):

```typescript
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader>...</SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>...</SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
```

## Hidden Context & Gotchas

### Web3 Integration

#### Cookie Storage Requirement

**Critical**: wagmi MUST use `cookieStorage`, not `localStorage`, for SSR compatibility.

**File**: `apps/web/src/lib/wagmi.ts:21`

```typescript
storage: createStorage({ storage: cookieStorage }); // SSR requirement
ssr: true;
```

**Why**: Next.js Server Components require state to be available on server-side. Cookies are sent with requests; localStorage is client-only.

#### WalletKit Connector Sorting

**File**: `apps/web/src/components/walletkit.tsx:468-576`

**Complex Logic**:

1. Recent connector saved to `localStorage:walletkit-recent-connector`
2. Recent connector promoted to first position
3. MetaMask detection handles 2 connector IDs: `metaMaskSDK`, `metaMask`
4. Duplicate injected connectors filtered (e.g., `io.metamask`, `io.metamask.mobile`)
5. Generic `injected` connector skipped if MetaMask present
6. Base Account always second-to-last
7. WalletConnect always last

**Why**: Prioritizes familiar wallets (MetaMask) and recently used connectors for better UX.

#### Modal Timing

**File**: `apps/web/src/components/walletkit.tsx:31`

```typescript
const MODAL_CLOSE_DURATION = 320; // Coordinated with animation timing
```

**Why**: Matches CSS animation duration for smooth close transition before unmounting.

### Email Service

#### Non-Atomic R2 + Database Operations

**File**: `services/haraka/plugins/cf_r2_queue.js:219-266`

**Current Flow**:

1. Upload email to R2
2. Create Email record in database
3. Update User.usedBytes

**Risk**: If database fails after R2 upload, orphaned R2 objects exist.

**Mitigation**: None currently. Consider:

- R2 lifecycle rules for cleanup
- Database transaction with retry logic
- Periodic reconciliation job

#### Quota Enforcement Timing

**File**: `services/haraka/plugins/cf_r2_queue.js:95-100`

**Decision**: Quota checked at RCPT phase (before DATA transfer)

**Why**: Saves bandwidth by rejecting before email data sent.

**Trade-off**: Email size not known at RCPT time, only approximate.

#### Encryption Disabled by Default

**File**: `services/haraka/config/cf_r2_queue.example.json:2`

```json
{
  "encryptionEnabled": false // Development mode
}
```

**Why**: Simplifies development. Enable in production.

**Security Impact**: Emails stored unencrypted in R2 (development only).

#### Multi-Recipient Handling

**File**: `services/haraka/plugins/cf_r2_queue.js:161-162`

```javascript
var addresses = plugin.copyAllAddresses ? recipientList : [recipientList[0]];
```

**Current**: Only first recipient receives copy

**Configuration**: `copyAllAddresses` option controls CC/BCC handling

**Impact**: CC/BCC not fully implemented

### Database

#### Prisma Client Generation Required

**Critical**: `npm run db:generate` MUST run before dev/build.

**Enforced by**: Turborepo `dependsOn: ["^db:generate"]`

**Why**: Prisma Client is generated code (TypeScript types + runtime). Without it, imports fail:

```typescript
import { prisma } from "@blanc/database"; // Error if not generated
```

**Location**: Generated to `packages/database/generated/prisma` (gitignored)

#### Connection Pooling

**File**: `packages/database/src/client.ts:2`

```typescript
import { withAccelerate } from "@prisma/extension-accelerate";

export const prisma = new PrismaClient().$extends(withAccelerate());
```

**Why**: Prisma Accelerate provides connection pooling for serverless environments (Cloudflare Workers).

**Without it**: Each request creates new database connection (slow, exhausts pool).

### Next.js & Deployment

#### R2 Incremental Cache Disabled

**File**: `apps/web/open-next.config.ts:4-8`

```typescript
// incrementalCache: r2IncrementalCache,
// See https://opennext.js.org/cloudflare/caching for more details
```

**Status**: Commented out (not enabled)

**Decision Rationale**: Disabled by choice for simplicity. See `open-next.config.ts` for enable instructions and documentation link.

**Performance Impact**: No edge caching of Next.js incremental static regeneration

### Storybook & Testing

#### Only 1 Test File Exists

**Location**: `apps/web/src/components/ui/__tests__/button.test.tsx`

**Coverage**: ~21 components in `ui/`, only Button tested

**Why**: Recent Storybook adoption (Nov 2025), testing infrastructure setup incomplete

**Mitigation**: Use Storybook stories as visual regression tests until unit tests expand

#### Accessibility in Warning Mode

**File**: `.storybook/main.ts` (addon config)

```typescript
a11y: {
  test: "todo"; // Shows violations but doesn't fail
}
```

**Impact**: Accessibility issues not blocking

**Action Required**: Switch to `test: 'error'` once violations addressed

### Environment Variables

#### WalletConnect Project ID Required

**File**: `apps/web/src/lib/wagmi.ts:17`

```typescript
walletConnect({ projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID! });
```

**Critical**: Non-null assertion (!) means app crashes if missing

**Setup**: https://cloud.walletconnect.com → Create Project → Copy Project ID

### Migration Path

#### Mock Data → TanStack Query

**File**: `apps/web/src/hooks/use-emails.ts:26-30, 56-59`

**Current**: Mock data from `lib/mock-emails.ts`

**Planned**: TanStack Query integration (commented out)

**Pattern**:

```typescript
// Current (mock)
const emails = getMockEmailsByFolder(folder);

// Future (API)
// return useQuery({
//   queryKey: ['emails', folder, search, isRead],
//   queryFn: () => fetchEmails({ folder, search, isRead }),
// })
```

**Action Required**:

1. Create API routes: `app/api/mail/emails/route.ts`
2. Implement fetchEmails function
3. Uncomment TanStack Query code
4. Remove mock data

## Known Issues & Gaps

### Missing Documentation

1. **API Documentation**: No documentation for email API endpoints (planned but not implemented)
2. **Production Deployment Guide**: GitHub Actions configured, manual process not documented
3. **Security Documentation**: No threat model, security measures, or reporting procedures
4. **Testing Strategy**: No documented testing approach or coverage requirements

### Infrastructure Gaps

1. **No Coverage Thresholds**: Coverage tracking enabled but no enforcement
2. **No E2E Tests**: Playwright installed but no end-to-end test suite

### Security Concerns

1. **Emails Unencrypted**: PGP encryption disabled by default (development mode)
2. **No Rate Limiting**: Haraka has no per-user send limits (spam risk)
3. **No TLS Configuration**: SMTP TLS not configured (development only)
4. **R2 Signed URLs**: Attachment URL signing not implemented

### Performance Unknowns

1. **R2 Cache Disabled**: Performance impact of disabled incremental cache unclear
2. **Connection Pool Size**: Prisma Accelerate settings not documented
3. **Email Size Limits**: No validation of max email/attachment size
4. **Scalability Limits**: No load testing or performance benchmarks

### Feature Incompleteness

1. **Multi-Recipient Handling**: CC/BCC creates single copy (not multiple)
2. **PGP Key Management**: Schema exists, no UI or rotation process
3. **Email Status Tracking**: EmailStatus enum defined, not fully utilized
4. **Search Functionality**: UI exists, backend not implemented

## Project Evolution

### Major Architectural Shifts

**October 14, 2025 - Complete Recode** (commit `34dca3a`):

- 27,303 lines changed in single commit
- Fresh start with Next.js 15 + Turbopack
- Custom WalletKit replacing previous Web3 approaches
- shadcn/ui component library adoption

**Simplification Campaign** (October 2025):

- Removed 1000+ LOC of unused crypto system
- Database schema reduction: 6 models → 3 models (later expanded to 4)
- Deleted automatic signature prompts
- Dependency cleanup

**November 2025 - Monorepo Transformation**:

- Restructured into Turborepo monorepo
- Added Haraka email service
- Migrated UI to Storybook-based system
- Split between `apps/web` and `services/haraka`

### Development Patterns

**Focus Areas** (from git history):

1. **Component-Driven Development**: 31 Storybook stories, reusable component extraction
2. **Web3 UX**: Multiple iterations on wallet connection (modal improvements, connector sorting)
3. **Simplification**: Bias toward reducing complexity over adding features
4. **Email Infrastructure**: Custom Haraka integration over third-party services

**Commit Activity**:

- Burst pattern development (focused sessions vs. daily incremental)
- Strong conventional commit adoption
- Single developer, feature branch workflow

## Resources

### Internal Documentation

- `/README.md` - Comprehensive monorepo overview (381 lines)
- `services/haraka/README.md` - Haraka setup guide (318 lines)
- `services/haraka/SETUP_SUMMARY.md` - Implementation report (275 lines)
- `services/haraka/docs/Plugins.md` - Haraka plugin development (399 lines)
- `packages/database/prisma/schema.prisma` - Database schema with inline docs

### External Resources

- **Next.js 15**: https://nextjs.org/docs
- **wagmi**: https://wagmi.sh/react/getting-started
- **Prisma**: https://www.prisma.io/docs
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **OpenNext**: https://opennext.js.org/cloudflare
- **Haraka**: https://haraka.github.io
- **shadcn/ui**: https://ui.shadcn.com
- **Storybook**: https://storybook.js.org

### Configuration References

- **Turborepo**: `turbo.json` - Task orchestration
- **TypeScript**: `packages/typescript-config/base.json` - Strict mode config
- **Tailwind**: `apps/web/src/app/globals.css` - CSS variables and theming
- **Prettier**: `.prettierrc.json` - Code formatting rules
- **ESLint**: `apps/web/eslint.config.mjs` - Flat config

## Maintenance Tasks

### Regular Maintenance

- **Dependency Updates**: `npm outdated` → review → `npm update`
- **Security Audits**: `npm audit` → review vulnerabilities
- **Database Backups**: Configure automated PostgreSQL backups
- **R2 Storage Monitoring**: Track bucket size and costs
- **Log Rotation**: Haraka logs (configured: max 10MB, 3 files)

### Health Checks

- **Web App**: Cloudflare Workers observability dashboard
- **Haraka**: Docker health check (SMTP connection test)
- **Database**: Prisma Studio (`npm run db:studio`)
- **Storybook**: Visual regression testing via Chromatic (configured, not deployed)

### Code Ownership (from git history)

- **Primary Maintainer**: puiusabin (sole contributor)
- **Active Areas** (last 3 months):
  - Web app frontend (135 changes)
  - Haraka email service (55 changes)
  - Component library (39 changes)

---

**Last Updated**: 2025-11-18 (via ultrathink methodology)
**Repository Branch**: recode
**Commit Count**: 86 commits (3.5 months of development)
