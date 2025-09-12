<div align="center">
  <img src="public/blanc.svg" alt="Blanc Logo" width="400" />
  
  <div style="height: 30px;"></div>
  
  **Zero-Knowledge • Wallet-First • Private**
</div>

> **🚧 Pre-Launch:** The future of truly private email is being built. Star this repo to be notified when we go live!

---

## What is Blanc?

Blanc is a **zero-knowledge, end-to-end encrypted email platform** that uses your **crypto wallet** as your identity. No passwords, no personal information stored on our servers, no ability for anyone (including us) to read your emails.

```
┌─────────────────┐    🔐 Encrypted    ┌─────────────────┐
│   Your Wallet   │ ──────────────────→ │  Recipient's   │
│   📱 MetaMask   │      Transit        │  Wallet        │
│   🦊 Phantom    │                     │  Rainbow       │
│   💙 Coinbase   │ ←────────────────── │  WalletCon     │
└─────────────────┘    🔒 E2E Secure   └─────────────────┘
        ↓                                        ↓
   ┌──────────┐                            ┌──────────┐
   │Your Keys │                            │Their Keys│
   │Generated │                            │Generated │
   │from Sig  │                            │from Sig  │
   └──────────┘                            └──────────┘
```

## 🎯 Why Blanc?

### The Problem with Traditional Email
- 📧 **Gmail, Outlook**: Your emails are scanned, analyzed, and used for ads
- 🔓 **"Secure" Email**: Still requires personal info and can be subpoenaed
- 🔑 **Complex PGP**: Too technical for everyday users
- 👤 **Identity Issues**: Email addresses can be impersonated or compromised

### The Blanc Solution
```
Traditional Email:           Blanc Email:
┌─────────────┐             ┌─────────────┐
│  Your Data  │             │ Wallet Sig  │
│     +       │    VS       │     +       │
│ Server Key  │             │ Zero Data   │
│     ↓       │             │     ↓       │
│  Readable   │             │ Encrypted   │
└─────────────┘             └─────────────┘
```

## ✨ Core Features

### 🔐 **True Zero-Knowledge**
- Your private keys are **derived from wallet signatures** - never stored anywhere
- We literally cannot read your emails, even if we wanted to
- No personal information required - just connect your wallet

### ⚡ **Wallet-First Identity**
- Use **MetaMask**, **Phantom**, **Coinbase**, **WalletConnect**, or any major wallet
- Your wallet address is your email identity (`0x123...@blanc.is`)
- ENS names supported (`vitalik.eth@blanc.is`)

### 🔒 **Strong Encryption**
- **Curve25519** elliptic curve + **XSalsa20-Poly1305** authenticated encryption (same primitives as Signal)
- **HKDF key derivation** from wallet signatures using SHA-256
- **Forward secrecy** with ephemeral keys for each conversation

### 🌐 **Decentralized & Censorship Resistant**
- Built on **Cloudflare Workers** for global edge distribution
- No single point of failure
- Wallet-based auth makes it impossible to ban specific users

## 🔬 How It Works

### 1. **Signature-Based Key Derivation**
```typescript
// Your wallet signs a deterministic challenge
const signature = wallet.sign("blanc-key-derivation-v1:your-address")

// We use HKDF to derive your encryption keys
const masterKey = HKDF(signature, salt, "MASTER_KEY")
const encryptionKey = HKDF(masterKey, salt2, "PRIVATE_KEYS")

// Keys are generated deterministically - same signature = same keys
```

### 2. **End-to-End Encryption Flow**
```
📝 Compose Email
    ↓
🔐 Encrypt with recipient's public key (Curve25519)
    ↓
📤 Send encrypted blob to server
    ↓
📥 Recipient retrieves blob
    ↓
🔓 Decrypt with their derived private key
    ↓
✉️ Read plaintext email
```

### 3. **Zero Server Knowledge**
- Server only stores: encrypted blobs + wallet addresses
- Server never sees: your private keys, email content, or personal data
- Even metadata is minimized and encrypted where possible

## 🏗️ Technical Architecture

```
┌─────────────────┐
│   Next.js App   │ ← Frontend 
├─────────────────┤
│ better-auth +   │ ← Wallet Authentication
│ SIWE (Ethereum) │
├─────────────────┤
│ TweetNaCl +     │ ← Crypto (Curve25519 + XSalsa20)
│ HKDF Derivation │
├─────────────────┤
│ Prisma + PostgreSQL │ ← Encrypted Data Storage
├─────────────────┤
│ Cloudflare Workers │ ← Edge Deployment
└─────────────────┘
```

### Security Primitives
- **Signature Standard**: SIWE 
- **Key Derivation**: HKDF-SHA256
- **Symmetric Encryption**: XSalsa20-Poly1305 via TweetNaCl
- **Asymmetric Encryption**: Curve25519 
- **Forward Secrecy**: Ephemeral key exchange per conversation

## 🚀 Getting Started (For Developers)

```bash
# Clone the repository
git clone https://github.com/puiusabin/blanc.git
cd blanc

# Install dependencies
npm install

# Set up your environment
cp .env.example .env.local
# Add your DATABASE_URL and other config

# Run database migrations
npx prisma db push

# Start development server
npm run dev
```

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Cloudflare account (for deployment)

## 🎨 Built With

- **Frontend**: Next.js 15 + React 19 + Tailwind CSS v4
- **Authentication**: better-auth + RainbowKit + Wagmi
- **Crypto**: TweetNaCl + HKDF + Viem
- **Database**: Prisma + PostgreSQL + Accelerate
- **Deployment**: Cloudflare Workers + OpenNext
- **UI**: Radix UI + Lucide Icons + Magic UI

## 🔒 Security Status

```
🔍 Internal Review: ✅ Ongoing
🏛️ Third-Party Audit: 📋 Planned for Q1 2026
🐛 Bug Bounty: 💰 Will launch with public beta
🔐 Code Review: 👥 Open source - review welcome
```

## 🗺️ Roadmap

### Phase 1
- [x] Wallet authentication & SIWE
- [x] End-to-end encryption infrastructure
- [ ] Basic email compose/send/receive
- [ ] Inbox and message threading
- [ ] Mobile-responsive web app

### Phase 2
- [ ] File attachments with encryption
- [ ] Client-side email search
- [ ] Contact management
- [ ] Email organization (folders/labels)

### Phase 3
- [ ] Multiple wallet support per user
- [ ] Email aliases and custom domains
- [ ] Improved mobile experience
- [ ] Performance optimizations


## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

```bash
# Areas where we need help:
🔐 Security review & audit
📱 Mobile UI/UX design  
🧪 Test coverage
📚 Documentation
🌍 Internationalization
```

## ⚖️ License

GPL-3.0 License - see [LICENSE](LICENSE) for details.

*Why GPL-3.0?* We believe privacy tools should remain free and open source forever.

## 🙋‍♂️ FAQ

**Q: How is this different from ProtonMail?**
A: ProtonMail still requires personal info and can be compelled to hand over data. Blanc uses wallet-based identity with zero-knowledge architecture.

**Q: What if I lose access to my wallet?**
A: Your emails are tied to your wallet's private key. We're exploring social recovery options while maintaining zero-knowledge principles.

**Q: Can you read my emails?**
A: Technically impossible. Your encryption keys are derived from your wallet signature and never leave your device.

**Q: What about spam and moderation?**
A: We're developing wallet reputation systems and user-controlled filtering that work without compromising privacy.

---

<div align="center">

**🌟 Star this repo to get notified when Blanc launches!**

Built with ❤️ by privacy-focused developers who believe email should be truly private.

</div>