# Blanc - Web3 Mail Application

A modern monorepo containing a Next.js web application with Web3 wallet integration, Prisma database layer, and Haraka mail server.

## Project Structure

```
blanc/
├── apps/
│   └── web/                           # @blanc/web - Next.js application
│       ├── src/
│       ├── public/
│       └── package.json
├── packages/
│   ├── database/                      # @blanc/database - Prisma ORM
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   ├── src/
│   │   │   ├── client.ts              # Singleton PrismaClient
│   │   │   └── index.ts               # Exports
│   │   └── package.json
│   └── typescript-config/             # @blanc/typescript-config - Shared TS configs
│       ├── base.json
│       ├── nextjs.json
│       └── react.json
├── services/
│   └── haraka/                        # @blanc/mail-server - Haraka SMTP
│       ├── config/
│       ├── plugins/
│       └── package.json
└── package.json                       # Root workspace
```

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (local or hosted via Prisma Postgres)
- Git

### Setup

1. **Clone and install**
   ```bash
   git clone <repository-url>
   cd blanc
   npm install
   ```

2. **Configure environment**
   ```bash
   # Root database URL
   cp .env.example .env

   # Web app configuration
   cp apps/web/.env.example apps/web/.env.development
   ```

3. **Set up database**
   ```bash
   # Generate Prisma Client
   npm run db:generate

   # Push schema to database (development)
   npm run db:push
   ```

4. **Start development**
   ```bash
   npm run dev
   ```

Visit http://localhost:3000

## Available Commands

### Development

```bash
npm run dev              # Generate Prisma Client + start web app
npm run dev:web          # Start web app only
npm run dev:mail         # Start Haraka mail server
```

### Build & Deploy

```bash
npm run build            # Build web app for production
npm run deploy           # Deploy web app to Cloudflare Workers
npm run preview          # Preview Cloudflare deployment locally
```

### Database

```bash
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema changes (development)
npm run db:migrate       # Create and run migrations
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database
```

### Code Quality

```bash
npm run lint             # Lint code
npm run lint:fix         # Fix linting issues
npm run type-check       # TypeScript type checking
npm run format           # Format code with Prettier
npm run check            # Run type-check + lint
```

### Cleanup

```bash
npm run clean            # Clean all workspaces
npm run clean:deep       # Deep clean (all node_modules, build artifacts)
```

## Workspace Packages

### @blanc/web (apps/web)

Next.js 15 application with:
- **Framework**: App Router, React 19, Turbopack
- **Deployment**: Cloudflare Workers via OpenNext
- **Web3**: wagmi 2.x + viem for wallet integration
- **UI**: shadcn/ui components, Tailwind CSS v4
- **State**: TanStack Query
- **Database**: Integrated with `@blanc/database`

**Development:**
```bash
cd apps/web
npm run dev              # Start dev server
npm run build            # Production build
npm run type-check       # Type checking
npm run clean            # Clean build artifacts
```

### @blanc/database (packages/database)

Prisma ORM package with:
- **Version**: Prisma 6.x
- **Database**: PostgreSQL
- **Extensions**: Prisma Accelerate for connection pooling
- **Output**: `packages/database/generated/prisma` (gitignored)

**Exports:**
```typescript
import { prisma } from "@blanc/database";        // PrismaClient singleton
import type { User, Post } from "@blanc/database"; // Generated types
```

**Usage in apps:**
```typescript
// Add to package.json dependencies
{
  "dependencies": {
    "@blanc/database": "*"
  }
}

// Use in code
import { prisma } from "@blanc/database";

const users = await prisma.user.findMany();
```

**Scripts:**
```bash
cd packages/database
npm run db:generate      # Generate client
npm run db:push          # Push schema
npm run db:migrate       # Run migrations
npm run db:studio        # Open Studio
```

### @blanc/typescript-config (packages/typescript-config)

Shared TypeScript configurations:
- `base.json` - Base configuration
- `nextjs.json` - Next.js specific (extends base)
- `react.json` - React specific (extends base)

**Usage:**
```json
{
  "extends": "@blanc/typescript-config/nextjs.json",
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### @blanc/mail-server (services/haraka)

Haraka SMTP server with:
- **Authentication**: Wallet-based (custom plugin)
- **Database**: PostgreSQL via `@blanc/database`
- **Encryption**: PGP support
- **Ports**: 25 (SMTP), 587 (Submission), 465 (SMTPS)

**Scripts:**
```bash
cd services/haraka
npm run dev              # Development mode
npm start                # Production mode
npm run clean            # Clean queue/logs
```

## Database Setup

### Option 1: Local PostgreSQL

1. Install PostgreSQL
2. Create database:
   ```sql
   CREATE DATABASE blanc;
   ```
3. Update `.env`:
   ```bash
   DATABASE_URL="postgresql://user:password@localhost:5432/blanc"
   ```

### Option 2: Prisma Postgres (Recommended)

1. Sign up at https://console.prisma.io
2. Create new database
3. Copy connection string to `.env`:
   ```bash
   DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
   ```

### Working with Schema

Edit `packages/database/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
}
```

After changes:
```bash
npm run db:generate      # Regenerate client
npm run db:push          # Apply to database
```

## Environment Variables

### Root `.env`
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/blanc"
```

### `apps/web/.env.development`
```bash
# WalletConnect (get from https://cloud.walletconnect.com)
NEXT_PUBLIC_WC_PROJECT_ID=your_project_id

# Database (optional, inherits from root)
DATABASE_URL="postgresql://user:password@localhost:5432/blanc"
```

## Monorepo Workflow

### Adding Dependencies

**To a specific workspace:**
```bash
npm install <package> --workspace=@blanc/web
npm install -D <package> --workspace=@blanc/database
```

**To root (shared dev tools):**
```bash
npm install -D <package> -w
```

### Inter-package Dependencies

Packages reference each other using workspace protocol:
```json
{
  "dependencies": {
    "@blanc/database": "*",
    "@blanc/typescript-config": "*"
  }
}
```

### Running Workspace Scripts

```bash
# From root
npm run dev --workspace=@blanc/web

# Or use shortcuts
npm run dev:web
npm run dev:mail
```

### Development Best Practices

1. **Always generate Prisma Client first:**
   ```bash
   npm run db:generate
   ```

2. **Use workspace dependencies:**
   - Reference other packages with `@blanc/*`
   - Use `"*"` version for workspace packages

3. **Run quality checks before committing:**
   ```bash
   npm run check          # Type-check + lint
   npm run format         # Format code
   ```

4. **Clean when switching branches:**
   ```bash
   npm run clean
   ```

## Deployment

### Web App (Cloudflare Workers)

```bash
npm run deploy
```

**Requirements:**
- Cloudflare account with Workers
- Set environment variables:
  - `CLOUDFLARE_API_TOKEN`
  - `CLOUDFLARE_ACCOUNT_ID`

**Or use GitHub Actions:**
- Workflow: `.github/workflows/deploy-app.yml`
- Triggers on push to main

## Contributing

1. Create feature branch
2. Make changes
3. Run quality checks: `npm run check`
4. Format code: `npm run format`
5. Test locally
6. Submit PR

## Package Naming Convention

All packages use the `@blanc` scope:
- `@blanc/web` - Web application
- `@blanc/database` - Database/ORM layer
- `@blanc/typescript-config` - Shared TypeScript configs
- `@blanc/mail-server` - Mail server service

## License

GNU General Public License v3.0
