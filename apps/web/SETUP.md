# Blanc Web App Setup Guide

Complete setup instructions for the Blanc web application with all required environment variables and services.

## Prerequisites

Before starting, ensure you have:

- Node.js 18 or higher
- npm 10.9.2 or higher
- PostgreSQL 14+ (local) OR Prisma Postgres account
- Cloudflare account (for R2 storage and Workers deployment)
- WalletConnect account (for Web3 wallet integration)

## Quick Start Checklist

- [ ] Generate SESSION_SECRET
- [ ] Set up Cloudflare R2 bucket
- [ ] Configure database
- [ ] Create local environment files
- [ ] Initialize database schema
- [ ] Verify setup

## Detailed Setup Instructions

### 1. Generate SESSION_SECRET

The SESSION_SECRET is required for iron-session authentication. It must be at least 32 characters long.

Generate a secure secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This will output a 64-character hexadecimal string. Save this for step 4.

Example output:

```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2
```

### 2. Set Up Cloudflare R2

Blanc uses Cloudflare R2 (S3-compatible object storage) for email attachments and datagrams.

#### Create R2 Bucket

1. Go to https://dash.cloudflare.com
2. Navigate to **R2 Object Storage** in the left sidebar
3. Click **Create bucket**
4. Name: `mail-storage`
5. Location: Choose closest to your users
6. Click **Create bucket**

#### Generate API Token

1. In the R2 dashboard, click **Manage R2 API Tokens**
2. Click **Create API token**
3. Configure token:
   - **Token name**: `blanc-app-token`
   - **Permissions**: Object Read & Write
   - **Specify bucket**: Select `mail-storage`
   - **TTL**: No expiration (or set your own policy)
4. Click **Create API token**
5. **Save the credentials immediately**:
   - Access Key ID
   - Secret Access Key
6. Note your **Account ID** from the R2 dashboard URL or settings
7. Construct your **R2 Endpoint**: `https://<account-id>.r2.cloudflarestorage.com`

Example credentials (do not use these):

```
R2_ENDPOINT=https://abc123def456.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=a1b2c3d4e5f6g7h8i9j0
R2_SECRET_ACCESS_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
R2_BUCKET_NAME=mail-storage
R2_ACCOUNT_ID=abc123def456
```

### 3. Set Up Database

Choose one of the following options:

#### Option A: Local PostgreSQL

**Install PostgreSQL** (macOS):

```bash
brew install postgresql@14
brew services start postgresql@14
```

**Create database**:

```bash
createdb blanc
```

**Connection string**:

```bash
DATABASE_URL="postgresql://localhost:5432/blanc"
```

If you have a password-protected PostgreSQL user:

```bash
DATABASE_URL="postgresql://username:password@localhost:5432/blanc"
```

#### Option B: Prisma Postgres (Cloud)

1. Go to https://console.prisma.io
2. Click **New project**
3. Select **PostgreSQL**
4. Choose your region
5. Copy the connection string

Format:

```bash
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
```

### 4. Create Environment Files

#### Web App Environment

Create `apps/web/.env.local`:

```bash
# Session Secret (from step 1)
SESSION_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2

# WalletConnect (get from https://cloud.walletconnect.com)
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_project_id

# Cloudflare R2 (from step 2)
R2_ENDPOINT=https://abc123def456.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=a1b2c3d4e5f6g7h8i9j0
R2_SECRET_ACCESS_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
R2_BUCKET_NAME=mail-storage
R2_ACCOUNT_ID=abc123def456

# Next.js Environment
NEXTJS_ENV=development
```

#### Root Environment

Create `.env` in project root:

```bash
# Database (from step 3)
DATABASE_URL="postgresql://localhost:5432/blanc"

# Cloudflare R2 (same as apps/web/.env.local)
R2_ENDPOINT=https://abc123def456.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=a1b2c3d4e5f6g7h8i9j0
R2_SECRET_ACCESS_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
R2_BUCKET_NAME=mail-storage
R2_ACCOUNT_ID=abc123def456
```

The R2 credentials are shared because both the web app and Haraka email service need access to the same bucket.

### 5. Initialize Database

Generate Prisma Client and push schema to database:

```bash
npm run db:generate
npm run db:push
```

This will:

1. Generate TypeScript types from your Prisma schema
2. Create all tables in your database
3. Set up indexes and relationships

### 6. Verify Setup

Start the development server:

```bash
npm run dev
```

If setup is correct, you should see:

```
> blanc@0.1.0 dev
> turbo run dev

• Packages in scope: @blanc/database, @blanc/web
• Running dev in 2 packages
...
@blanc/web:dev: ▲ Next.js 15.4.6
@blanc/web:dev: - Local:        http://localhost:3000
@blanc/web:dev: ✓ Starting...
@blanc/web:dev: ✓ Ready in 2.5s
```

**If you see errors**, check the Troubleshooting section below.

Open http://localhost:3000 in your browser. The app should load without console errors.

### 7. Configure GitHub Secrets (for CI/CD)

If you plan to deploy via GitHub Actions, add these secrets to your repository:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each:

| Secret Name                 | Value                    | Source        |
| --------------------------- | ------------------------ | ------------- |
| `SESSION_SECRET`            | Your 64-character secret | Step 1        |
| `R2_ENDPOINT`               | R2 endpoint URL          | Step 2        |
| `R2_ACCESS_KEY_ID`          | R2 access key            | Step 2        |
| `R2_SECRET_ACCESS_KEY`      | R2 secret key            | Step 2        |
| `R2_BUCKET_NAME`            | `mail-storage`           | Step 2        |
| `R2_ACCOUNT_ID`             | Cloudflare account ID    | Step 2        |
| `NEXT_PUBLIC_WC_PROJECT_ID` | WalletConnect project ID | WalletConnect |
| `CLOUDFLARE_API_TOKEN`      | Workers deploy token     | Cloudflare    |
| `CLOUDFLARE_ACCOUNT_ID`     | Same as R2_ACCOUNT_ID    | Cloudflare    |

## Troubleshooting

### Error: SESSION_SECRET environment variable is required

**Cause**: Missing or incorrect SESSION_SECRET in `.env.local`

**Fix**:

1. Verify `apps/web/.env.local` exists
2. Check that `SESSION_SECRET` is set
3. Ensure it's at least 32 characters long
4. Restart dev server

### Error: Missing required environment variables (R2)

**Cause**: R2 credentials not configured

**Fix**:

1. Verify all R2 variables in both `.env.local` and `.env`
2. Check that R2_ENDPOINT includes `https://` and `.r2.cloudflarestorage.com`
3. Verify Access Key ID and Secret Access Key are correct
4. Test R2 credentials in Cloudflare dashboard

### GET /api/mail/threads 404

**Possible causes**:

1. **Missing R2 credentials**: Route validates env vars on load
   - Check server console for error messages
   - Verify R2 credentials in `.env.local`

2. **Database not initialized**: Tables don't exist
   - Run `npm run db:push`
   - Check database connection with `npm run db:studio`

3. **No test data**: Database is empty
   - Create a test user and thread
   - Or use Prisma seed (if configured)

4. **Authentication issue**: Missing or invalid session
   - Check that you're passing `x-user-id` header
   - Verify session is created via `/api/auth/session`

### Prisma Client generation fails

**Cause**: Database connection issue or schema error

**Fix**:

1. Verify `DATABASE_URL` in `.env`
2. Test database connection: `psql $DATABASE_URL`
3. Check schema file: `packages/database/prisma/schema.prisma`
4. Delete `node_modules` and reinstall: `npm install`

### Next.js build fails

**Cause**: TypeScript errors or missing dependencies

**Fix**:

1. Run type check: `npm run type-check`
2. Check for TypeScript errors in `apps/web/src/`
3. Verify all dependencies installed: `npm install`
4. Clear Next.js cache: `rm -rf apps/web/.next`

## Development Workflow

### Start Development Server

```bash
npm run dev
```

Starts:

- Web app at http://localhost:3000
- Prisma Studio at http://localhost:5555 (run `npm run db:studio` separately)

### Database Changes

When modifying `packages/database/prisma/schema.prisma`:

```bash
# Development (no migration files)
npm run db:push
npm run db:generate

# Production (with migration files)
npm run db:migrate
```

### Type Checking

```bash
npm run type-check
```

### Linting

```bash
npm run lint
```

### Building

```bash
npm run build
```

### Deployment

```bash
cd apps/web
npm run deploy
```

Requires `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` environment variables.

## Security Best Practices

1. **Never commit environment files**:
   - `.env.local` is in `.gitignore`
   - `.env` is in `.gitignore`
   - Only commit `.env.example`

2. **Use different secrets for each environment**:
   - Development: Local `.env.local`
   - Staging: GitHub secrets (staging)
   - Production: GitHub secrets (production)

3. **Rotate secrets regularly**:
   - SESSION_SECRET: Every 90 days
   - R2 API tokens: Every 180 days
   - Database passwords: Per your security policy

4. **Limit R2 token permissions**:
   - Only grant Object Read & Write
   - Restrict to specific bucket (`mail-storage`)
   - Use separate tokens for dev/staging/prod

## Next Steps

After setup is complete:

1. **Explore the app**: Visit http://localhost:3000
2. **Check database**: Run `npm run db:studio`
3. **Review CLAUDE.md**: See project architecture and patterns
4. **Read README.md**: Learn about monorepo structure
5. **Start developing**: Make changes and see them live reload

## Getting Help

- Check CLAUDE.md for project-specific guidance
- Review error messages in terminal and browser console
- Verify environment variables match this guide
- Check Cloudflare R2 dashboard for bucket and token status
- Review Prisma logs for database issues

## Resources

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [iron-session Documentation](https://github.com/vvo/iron-session)
- [WalletConnect Documentation](https://docs.walletconnect.com/)
