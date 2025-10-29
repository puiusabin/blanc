# Mail Service Monorepo

A monorepo containing a Next.js web application with Web3 wallet integration and a Haraka mail server with PostgreSQL backend.

## Project Structure

```
mail-service/
├── apps/
│   └── web/                    # Next.js application
│       ├── src/
│       ├── public/
│       ├── package.json
│       └── README.md
├── services/
│   └── haraka/                 # Haraka mail server
│       ├── config/             # Haraka configuration
│       ├── plugins/            # Custom Haraka plugins
│       ├── Dockerfile
│       └── package.json
├── docker/
│   ├── docker-compose.yml      # Local development
│   ├── docker-compose.prod.yml # Production
│   └── nginx/
│       └── nginx.conf
├── scripts/
│   ├── setup-local.sh          # Local setup script
│   ├── deploy-server.sh        # Deployment script
│   └── init-db.sql             # Database initialization
└── .github/
    └── workflows/
        ├── deploy-app.yml      # Web app CI/CD
        └── deploy-haraka.yml   # Haraka CI/CD
```

## Quick Start

### Prerequisites

- Node.js 18+
- Docker & Docker Compose
- Git

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mail-service
   ```

2. **Run setup script**
   ```bash
   npm run setup
   ```

3. **Configure environment variables**
   - Copy `.env.example` to `.env` and update values
   - Copy `apps/web/.env.example` to `apps/web/.env.development`
   - Copy `services/haraka/.env.example` to `services/haraka/.env`

4. **Start Docker services**
   ```bash
   npm run docker:up
   ```

5. **Start the web app**
   ```bash
   npm run dev:web
   ```

Visit http://localhost:3000 to see the web app.

## Available Scripts

### Root Scripts

- `npm run dev` - Start web app in development mode
- `npm run dev:web` - Start web app
- `npm run dev:haraka` - Start Haraka server
- `npm run build` - Build web app
- `npm run deploy:web` - Deploy web app to Cloudflare
- `npm run docker:up` - Start all Docker services
- `npm run docker:down` - Stop all Docker services
- `npm run docker:logs` - View Docker logs
- `npm run docker:prod` - Start production Docker services
- `npm run setup` - Run local setup script
- `npm run clean` - Clean build artifacts and dependencies

### Web App (apps/web)

```bash
cd apps/web
npm run dev          # Development server
npm run build        # Production build
npm run lint         # Lint code
npm run deploy       # Deploy to Cloudflare
```

### Haraka (services/haraka)

```bash
cd services/haraka
npm run dev          # Start Haraka in development
npm start            # Start Haraka in production
```

## Services

### Web Application

- **Framework**: Next.js 15
- **Deployment**: Cloudflare Workers (via OpenNext)
- **Web3**: wagmi + viem
- **UI**: shadcn/ui with Tailwind CSS
- **Port**: 3000

See [apps/web/README.md](apps/web/README.md) for more details.

### Haraka Mail Server

- **Mail Server**: Haraka
- **Database**: PostgreSQL
- **Authentication**: Wallet-based
- **Encryption**: PGP
- **Ports**: 25 (SMTP), 587 (Submission), 465 (SMTPS)

### PostgreSQL Database

- **Port**: 5432
- **Default DB**: maildb
- **Schema**: See `scripts/init-db.sql`

## Docker Services

### Development (docker-compose.yml)

- PostgreSQL database
- Haraka mail server
- Next.js web app (with hot reload)

### Production (docker-compose.prod.yml)

- PostgreSQL database
- Haraka mail server
- Nginx reverse proxy

## Environment Variables

### Root (.env)

```bash
POSTGRES_DB=maildb
POSTGRES_USER=mailuser
POSTGRES_PASSWORD=changeme
DATABASE_URL=postgresql://mailuser:changeme@localhost:5432/maildb
HARAKA_DOMAIN=mail.example.com
```

### Web App (apps/web/.env.development)

```bash
NEXT_PUBLIC_WC_PROJECT_ID=your_project_id
STALWART_DOMAIN=mail.example.com
```

### Haraka (services/haraka/.env)

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/maildb
NODE_ENV=development
HARAKA_DOMAIN=mail.example.com
```

## Deployment

### Web App to Cloudflare

```bash
cd apps/web
npm run deploy
```

Or use GitHub Actions workflow: `.github/workflows/deploy-app.yml`

### Haraka to Production Server

```bash
./scripts/deploy-server.sh
```

Or use GitHub Actions workflow: `.github/workflows/deploy-haraka.yml`

## Database Schema

The database includes:

- `users` - User accounts with wallet addresses
- `email_metadata` - Metadata for received emails
- `email_queue` - Queue for email processing

See `scripts/init-db.sql` for full schema.

## Haraka Configuration

Configuration files in `services/haraka/config/`:

- `plugins` - Plugin load order
- `smtp.ini` - SMTP server settings
- `host_list` - Allowed domains
- `tls.ini` - TLS configuration
- `dkim/` - DKIM keys

## Custom Haraka Plugins

Located in `services/haraka/plugins/`:

- `auth/postgres_wallet.js` - Wallet-based authentication
- `rcpt_to.postgres.js` - Recipient validation
- `data.postgres_metadata.js` - Store email metadata
- `data.pgp_encrypt_store.js` - PGP encryption
- `queue/postgres_queue.js` - PostgreSQL queue

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally with Docker
4. Submit a pull request

## License

ISC