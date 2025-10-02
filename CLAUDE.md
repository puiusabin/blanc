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
- `User`: Core user entity with single wallet address (checksummed), ENS name/avatar support
- `Session`: HTTP-only cookie sessions with wallet address and expiry tracking
- `Waitlist`: Early access email collection for pre-launch signups

### Frontend Architecture
- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4 with Radix UI components
- **Components**: Located in `src/components/ui/` following shadcn/ui patterns
- **State Management**: TanStack Query for server state, React hooks for client state
- **Data Fetching**: Centralized API hooks in `src/hooks/api/` with caching and error handling

### Key Integration Points
- Prisma client is accessed via `src/lib/prisma.ts` with Accelerate extension
- Authentication configuration in `src/lib/auth.ts` with SIWE plugin
- Viem for Ethereum interactions and signature verification
- TanStack Query configuration in `src/components/providers.tsx` with React Query DevTools
- Dynamic wallet detection system in `src/lib/wallet-detection.ts` supporting 20+ wallets

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
- `src/hooks/api/` - TanStack Query API hooks for data fetching
- `prisma/` - Database schema and migrations
- `archive/` - Archived code preserved for future reference

### Important Files
- `src/lib/auth.ts` - better-auth configuration with SIWE
- `src/lib/prisma.ts` - Prisma client with Accelerate extension
- `src/lib/wagmi.ts` - Wallet connection configuration
- `src/lib/wallet-detection.ts` - Dynamic wallet detection for 20+ wallets
- `src/components/providers.tsx` - TanStack Query and Wagmi providers setup
- `src/hooks/api/index.ts` - Centralized API hooks exports
- `open-next.config.ts` - Cloudflare deployment configuration
- `wrangler.jsonc` - Cloudflare Worker configuration
- `archive/crypto-system/` - Archived encryption system (~1,000 LOC) for future use