# DKIM Keys

Place your DKIM private keys in this directory.

## Generating DKIM Keys

```bash
openssl genrsa -out dkim_private.key 2048
openssl rsa -in dkim_private.key -pubout -out dkim_public.key
```

## File Naming Convention

- `<domain>.private` - Private key for domain
- `<selector>.<domain>.private` - Private key for specific selector