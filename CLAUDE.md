# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start Next.js development server
- `npm run build` - Generate Prisma client and build Next.js application  
- `npm start` - Start production Next.js server
- `npm run lint` - Run ESLint

### Database Operations
- `npx prisma generate` - Generate Prisma client (outputs to default location)
- `npx prisma db push` - Push schema changes to database
- `npx prisma migrate dev` - Create and apply development migrations
- `npx prisma migrate reset` - Reset database and apply all migrations
- `npx prisma studio` - Open Prisma Studio for database management

### Cloudflare Deployment
- `npm run deploy` - Build and deploy to Cloudflare Workers
- `npm run preview` - Build and preview locally with Cloudflare
- `npm run cf-typegen` - Generate Cloudflare environment types
- `wrangler types --env-interface CloudflareEnv ./cloudflare-env.d.ts` - Generate types manually

## Architecture Overview

### Deployment Strategy
This is a Next.js application configured for deployment on **Cloudflare Workers** using OpenNext Cloudflare adapter. The application is not designed for traditional Vercel deployment despite being a Next.js app.

### Database Architecture
- **Database**: PostgreSQL with Prisma ORM
- **Prisma Client Location**: Generated in `node_modules/.prisma/client/` (standard location)
- **Extensions**: Prisma Accelerate for connection pooling and caching
- **Schema**: User authentication system with wallet-based authentication via SIWE (Sign-In With Ethereum)

### Authentication System
- **Framework**: better-auth with Prisma adapter
- **Method**: Wallet-based authentication using SIWE (Sign-In With Ethereum)
- **Features**: ENS name and avatar resolution, session management
- **Email/Password**: Disabled - wallet-only authentication

### Database Models
- `User`: Core user entity with wallet addresses, no email authentication
- `Session`: User sessions with IP and user agent tracking
- `Account`: OAuth/external account linking (prepared but not actively used)
- `WalletAddress`: Multiple wallet addresses per user with chain ID support
- `Verification`: General verification tokens system
- `KeyDerivationChallenge`: Deterministic challenges for signature-based key derivation
- `UserEncryptedKeys`: Encrypted private keys derived from user's wallet signature

### Frontend Architecture
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4 with Radix UI components
- **Components**: Located in `src/components/ui/` following shadcn/ui patterns
- **State Management**: React hooks for client state

### Cryptography Architecture
- **Key Derivation**: HKDF-SHA256 from wallet signatures for deterministic key generation
- **Symmetric Encryption**: XSalsa20-Poly1305 via TweetNaCl for message encryption
- **Asymmetric Encryption**: Curve25519 for public-key operations
- **Signing**: Ed25519 keypairs for message signing
- **Implementation**: SignatureCrypto class in `src/lib/crypto.ts` provides unified crypto operations

### Key Integration Points
- Prisma client is accessed via `src/lib/prisma.ts` with Accelerate extension
- Authentication configuration in `src/lib/auth.ts` with SIWE plugin
- Viem for Ethereum interactions and signature verification
- Crypto operations centralized in `src/lib/crypto.ts` with TweetNaCl primitives

### Cloudflare-Specific Configuration
- Worker main entry: `.open-next/worker.js`
- Static assets binding: `ASSETS` pointing to `.open-next/assets`
- Compatibility flags: `nodejs_compat`, `global_fetch_strictly_public`
- OpenNext configuration in `open-next.config.ts` (R2 caching available but commented out)

## Project Structure

### Key Directories
- `src/app/` - Next.js App Router pages and API routes
- `src/components/ui/` - Reusable UI components (shadcn/ui pattern)  
- `src/components/` - Application-specific components
- `src/lib/` - Core utilities and configurations
- `src/hooks/` - Custom React hooks
- `prisma/` - Database schema and migrations

### Important Files
- `src/lib/auth.ts` - better-auth configuration with SIWE
- `src/lib/crypto.ts` - Cryptography operations (SignatureCrypto class)
- `src/lib/prisma.ts` - Prisma client with Accelerate extension
- `src/lib/wagmi.ts` - Wallet connection configuration
- `open-next.config.ts` - Cloudflare deployment configuration
- `wrangler.jsonc` - Cloudflare Worker configuration