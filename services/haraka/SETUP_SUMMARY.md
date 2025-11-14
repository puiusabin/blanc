# Haraka Email Service - Setup Summary

## Implementation Complete ✓

Your Haraka server is now configured as a freemium email service with the following features:

### Features Implemented

1. **PostgreSQL Database Integration (Prisma)**
   - User accounts with storage quotas
   - Email metadata storage
   - Alias support
   - PGP key storage (for future encryption)

2. **Cloudflare R2 Storage**
   - Emails stored as compressed blobs (.eml.gz)
   - Organized by user: `{userId}/{year}/{month}/{emailId}.eml.gz`

3. **Storage Quota Management**
   - FREE plan: 2GB quota
   - PREMIUM plan: 20GB quota
   - Real-time quota checking (rejects emails when quota exceeded)

4. **Email Aliasing**
   - Multiple aliases can point to one user account
   - Aliases resolved during RCPT phase
   - Original recipient address preserved in metadata

5. **PGP Encryption (Built but Disabled)**
   - Encryption code ready in `plugins/pgp_handler.js`
   - Currently disabled via config: `encryptionEnabled: false`
   - Easy to enable later when web interface is ready

### File Structure

```
/root/haraka/
├── prisma/
│   ├── schema.prisma              # Database schema
│   ├── migrations/                # Migration files
│   └── seed.js                    # Test data seeder
├── lib/
│   └── prisma.js                  # Prisma client singleton
├── plugins/
│   ├── cf_r2_queue.js            # Main email queue plugin
│   └── pgp_handler.js            # PGP encryption module
├── config/
│   ├── cf_r2_queue.json          # Plugin configuration
│   └── plugins                    # Enabled plugins list
└── .env                          # Database connection string
```

### Database Schema

**Users**
- email, planType (FREE/PREMIUM), quotaBytes, usedBytes, active

**Emails**
- fromAddress, toAddress, subject, sizeBytes, r2Path, encrypted, status

**Aliases**
- aliasAddress → targetUserId

**PGPKeys**
- publicKey, privateKey, fingerprint (ready for future use)

### Test Accounts Created

| Email | Plan | Quota | Aliases |
|-------|------|-------|---------|
| test@blanc.is | FREE | 2GB | hello@blanc.is, info@blanc.is |
| premium@blanc.is | PREMIUM | 20GB | support@blanc.is |

### Configuration

**Current Settings** (`/root/haraka/config/cf_r2_queue.json`):
```json
{
  "encryptionEnabled": false,      // ← Encryption disabled for development
  "requirePGPKeys": false,          // ← Don't require PGP keys
  "zipBeforeUpload": true,          // ← Gzip compression enabled
  "fileExtension": ".eml.gz"        // ← File format
}
```

### Verified Functionality

✅ **Email Delivery**: Emails accepted and stored
✅ **R2 Upload**: Emails uploaded to Cloudflare R2
✅ **Database Storage**: Metadata stored in PostgreSQL
✅ **Quota Tracking**: User storage updated correctly
✅ **Alias Resolution**: Aliases resolve to target users
✅ **User Rejection**: Non-existent users rejected with 550
✅ **Quota Enforcement**: Will reject when quota exceeded

### Testing

**Send to direct address:**
```bash
swaks -s localhost -t test@blanc.is -f sender@blanc.is
```

**Send to alias:**
```bash
swaks -s localhost -t hello@blanc.is -f sender@blanc.is
```

**Query database:**
```bash
docker exec -w /etc/haraka haraka node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const user = await prisma.user.findUnique({
        where: { email: 'test@blanc.is' },
        include: { emails: true }
    });
    console.log('Used:', user.usedBytes.toString(), '/', user.quotaBytes.toString());
    console.log('Emails:', user.emails.length);
}
main().finally(() => prisma.\$disconnect());
"
```

### R2 Bucket Structure

Emails are stored in Cloudflare R2 bucket `mail-storage`:

```
mail-storage/
├── {user-id-1}/
│   ├── 2025/
│   │   ├── 11/
│   │   │   ├── {email-uuid-1}.eml.gz
│   │   │   └── {email-uuid-2}.eml.gz
│   │   └── 12/
│   │       └── {email-uuid-3}.eml.gz
└── {user-id-2}/
    └── 2025/
        └── 11/
            └── {email-uuid-4}.eml.gz
```

### Next Steps for Web Interface

When building your Next.js web interface, you'll need to:

1. **Fetch Email List**: Query PostgreSQL for email metadata
2. **Download Email**: Fetch from R2 using the `r2Path` field
3. **Decompress**: Gunzip the downloaded file
4. **Parse**: Use an email parser library (e.g., mailparser)
5. **Display**: Render email content

Example query for inbox:
```javascript
const emails = await prisma.email.findMany({
  where: {
    userId: 'user-id',
    status: 'STORED'
  },
  orderBy: { dateReceived: 'desc' },
  take: 50
});
```

### Enabling Encryption Later

When ready to enable PGP encryption:

1. **Generate PGP keys for users**:
   ```javascript
   const openpgp = require('openpgp');
   const { privateKey, publicKey } = await openpgp.generateKey({
     userIDs: [{ email: 'user@blanc.is' }],
     curve: 'ed25519'
   });
   ```

2. **Store keys in database**:
   ```javascript
   await prisma.pGPKey.create({
     data: {
       userId: user.id,
       publicKey: publicKey,
       privateKey: privateKey, // optional
       fingerprint: key.getFingerprint(),
       algorithm: 'ed25519',
       active: true
     }
   });
   ```

3. **Enable encryption**:
   Update `config/cf_r2_queue.json`:
   ```json
   {
     "encryptionEnabled": true,
     "requirePGPKeys": true
   }
   ```

4. **Restart Haraka**:
   ```bash
   docker restart haraka
   ```

### Storage Quota Management

**Check user quota:**
```javascript
const user = await prisma.user.findUnique({
  where: { email: 'test@blanc.is' }
});
console.log(`Used: ${user.usedBytes} / ${user.quotaBytes}`);
```

**Manually update quota:**
```javascript
await prisma.user.update({
  where: { email: 'test@blanc.is' },
  data: { quotaBytes: BigInt(5 * 1024 * 1024 * 1024) } // 5GB
});
```

### Troubleshooting

**Check Haraka logs:**
```bash
docker logs haraka --tail 100
```

**Verify database connection:**
```bash
docker exec -w /etc/haraka haraka npx prisma db execute --stdin <<<'SELECT 1;'
```

**Check R2 bucket:**
Visit Cloudflare Dashboard → R2 → mail-storage

### Performance Considerations

- **Database Indexing**: Already optimized with indexes on userId, dateReceived, email
- **R2 Storage**: Organized by date for easier management/cleanup
- **Compression**: Gzip reduces storage by ~50-70%
- **Connection Pooling**: Prisma client singleton prevents connection exhaustion

### Security Notes

⚠️ **Current Setup**:
- Emails stored **unencrypted** in R2 (development mode)
- Database credentials in .env file
- No TLS on SMTP (development only)

🔒 **For Production**:
- Enable PGP encryption
- Set up TLS/SSL for SMTP
- Use environment variables for secrets
- Implement rate limiting
- Add SPF/DKIM/DMARC
- Enable firewall rules

---

## Summary

Your Haraka email server is now a fully functional freemium email service with:
- ✅ Database-backed user management
- ✅ Storage quota enforcement (2GB/20GB)
- ✅ Email aliasing
- ✅ Cloudflare R2 storage
- ✅ Compression enabled
- ✅ Encryption ready (but disabled for development)

You can now build your Next.js web interface to read emails from the database and R2, and later enable encryption when ready!
