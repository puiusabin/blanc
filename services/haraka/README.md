# @blanc/mail-server

Haraka SMTP server configured for the Blanc freemium email service.

## Features

- ✉️ **Email Reception**: Full SMTP server for receiving emails
- 🗄️ **PostgreSQL Integration**: User accounts, quotas, and metadata via `@blanc/database`
- ☁️ **Cloudflare R2 Storage**: Scalable email blob storage
- 📊 **Quota Management**: 2GB (FREE) / 20GB (PREMIUM) per-user quotas
- 🔀 **Email Aliasing**: Multiple aliases pointing to one inbox
- 🔐 **PGP Encryption**: Ready to enable (currently disabled for development)
- 📦 **Compression**: Gzip compression for storage efficiency

## Quick Start

### 1. Environment Setup

Copy the environment template:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
- `DATABASE_URL`: Prisma Postgres connection string
- `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`: Cloudflare R2 credentials
- `R2_ENDPOINT`: Your R2 bucket endpoint
- `R2_BUCKET`: Bucket name (default: `mail-storage`)

### 2. Configure Cloudflare R2

Create a config file with your R2 settings:
```bash
cp config/cf_r2_queue.example.json config/cf_r2_queue.json
```

Edit `config/cf_r2_queue.json` with your actual R2 credentials (or use environment variables).

### 3. Start the Server

```bash
npm run dev
```

This will:
- Build the Docker image
- Start Haraka on ports 25 (SMTP) and 587 (Submission)
- Mount config and plugins for hot-reload development

### 4. Seed Test Data

From the **monorepo root**:
```bash
npm run db:migrate   # Run Prisma migrations
npm run seed --filter=@blanc/mail-server
```

This creates test users:
- `test@blanc.is` (FREE - 2GB quota)
- `premium@blanc.is` (PREMIUM - 20GB quota)

And aliases:
- `hello@blanc.is` → `test@blanc.is`
- `info@blanc.is` → `test@blanc.is`
- `support@blanc.is` → `premium@blanc.is`

## Testing

### Send Test Email

```bash
swaks -s localhost -t test@blanc.is -f sender@example.com --header "Subject: Test email"
```

### Check Logs

```bash
npm run logs
```

### Verify Database

From monorepo root:
```bash
npx prisma studio --schema packages/database/prisma/schema.prisma
```

## Architecture

### Email Flow

1. **SMTP Reception**: Email arrives at port 25/587
2. **Recipient Validation** (`hook_rcpt_ok`):
   - Resolve alias → real user
   - Check user exists and is active
   - Verify quota not exceeded
3. **Email Processing** (`hook_queue`):
   - Compress with gzip
   - (Optional) Encrypt with PGP
   - Upload to Cloudflare R2
   - Store metadata in PostgreSQL
   - Update user storage usage

### Storage Structure

**R2 Bucket**: `mail-storage/`
```
{userId}/
  └── {year}/
      └── {month}/
          └── {emailId}.eml.gz
```

**PostgreSQL**:
- `User`: email, quotaBytes, usedBytes, planType
- `Email`: from, to, subject, sizeBytes, r2Path, encrypted
- `Alias`: aliasAddress → targetUserId
- `PGPKey`: publicKey, fingerprint (for future encryption)

## Configuration

### SMTP Settings

Edit `config/smtp.ini`:
```ini
port=25
listen=[::0]
```

### Plugin Configuration

`config/cf_r2_queue.json`:
```json
{
  "encryptionEnabled": false,
  "zipBeforeUpload": true,
  "fileExtension": ".eml.gz"
}
```

Or use environment variables (recommended):
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_ENDPOINT`
- `R2_BUCKET`
- `ENCRYPTION_ENABLED`

### Enabled Plugins

Edit `config/plugins` to enable/disable features:
```
mail_from.is_resolvable
rcpt_to.in_host_list
cf_r2_queue
```

## Development

### Directory Structure

```
services/haraka/
├── config/          # Haraka configuration files
├── plugins/         # Custom plugins (cf_r2_queue, pgp_handler)
├── scripts/         # Utility scripts (seed.js)
├── docs/            # Plugin documentation
├── queue/           # Runtime queue (gitignored)
├── logs/            # Runtime logs (gitignored)
├── Dockerfile       # Production Docker image
├── docker-compose.yml
└── package.json
```

### Hot Reload

Config and plugins are volume-mounted, so changes are reflected immediately:
```bash
npm run restart
```

### Docker Commands

```bash
npm run dev         # Start with build
npm run start       # Start detached
npm run stop        # Stop containers
npm run restart     # Restart Haraka
npm run logs        # Follow logs
npm run shell       # Open shell in container
npm run clean       # Clean all data and volumes
```

## Enabling PGP Encryption

When ready to enable encryption:

### 1. Generate Keys for Users

```javascript
const openpgp = require('openpgp');
const { prisma } = require('@blanc/database');

const { privateKey, publicKey } = await openpgp.generateKey({
  userIDs: [{ email: 'user@blanc.is' }],
  curve: 'ed25519'
});

await prisma.pGPKey.create({
  data: {
    userId: user.id,
    publicKey: publicKey,
    fingerprint: key.getFingerprint(),
    algorithm: 'ed25519',
    active: true
  }
});
```

### 2. Enable in Config

Set in `config/cf_r2_queue.json`:
```json
{
  "encryptionEnabled": true,
  "requirePGPKeys": true
}
```

Or via environment:
```bash
ENCRYPTION_ENABLED=true
```

### 3. Restart

```bash
npm run restart
```

Emails will now be encrypted before storage!

## Troubleshooting

### Check Haraka Logs

```bash
npm run logs:tail
```

### Database Connection Issues

Verify `DATABASE_URL` in `.env`:
```bash
docker compose exec haraka env | grep DATABASE_URL
```

### R2 Upload Failures

Check R2 credentials and bucket permissions:
```bash
docker compose exec haraka env | grep R2_
```

### Port Already in Use

If port 25 is busy:
```yaml
# docker-compose.yml
ports:
  - "2525:25"  # Use different host port
```

## Production Deployment

### Build Production Image

```bash
docker compose build
```

### Push to Registry

```bash
docker tag blanc-haraka:latest your-registry/blanc-haraka:latest
docker push your-registry/blanc-haraka:latest
```

### Environment Variables

Set these in your production environment:
- `DATABASE_URL`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_ENDPOINT`
- `R2_BUCKET`
- `ENCRYPTION_ENABLED=true`
- `NODE_ENV=production`

### Security Checklist

- [ ] Enable TLS/SSL (ports 465/587 with certificates)
- [ ] Enable PGP encryption
- [ ] Set up SPF/DKIM/DMARC records
- [ ] Configure firewall rules
- [ ] Use secrets manager (not .env files)
- [ ] Enable rate limiting
- [ ] Set up monitoring and alerting

## Documentation

- [SETUP_SUMMARY.md](./SETUP_SUMMARY.md) - Complete setup documentation
- [Haraka Official Docs](https://haraka.github.io/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)

## License

MIT
