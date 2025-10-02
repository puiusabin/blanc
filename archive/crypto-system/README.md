# Archived Crypto System

**Archived:** January 2025
**Reason:** No consumers - mail interface doesn't exist yet

## Contents

This folder contains the complete encryption/crypto system that was built but never used:

- `crypto.ts` (486 LOC) - SignatureCrypto class with TweetNaCl
- `key-storage.ts` (228 LOC) - LocalStorage encrypted key cache
- `use-crypto.ts` (118 LOC) - React hooks for crypto operations
- `api-routes/` - 3 API endpoints (get-challenge, setup-keys, encrypted-keys)

**Total:** ~1,000 LOC of unused code

## Why Archived?

The mail interface doesn't exist yet, so this entire crypto system has zero consumers. Rather than maintain unused code, it's been archived for future use.

## When to Re-implement

When the mail interface is ready and functional:
1. Design the mail encryption flow
2. Review this archived code for reference
3. Re-implement with a simpler approach (remove LocalStorage caching, simplify HKDF)
4. Add tests from the start

## What to Keep

✅ TweetNaCl for crypto primitives
✅ SIWE signature-based key derivation concept
✅ HKDF for key stretching

## What to Change

❌ Remove LocalStorage caching (XSS risk)
❌ Simplify to single HKDF derivation
❌ Remove legacy compatibility functions
❌ Add key rotation/versioning from start
