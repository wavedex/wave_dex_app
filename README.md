# WaveDex Terminal 🌊

The Ultimate Conviction Terminal on Solana. High-performance trading tools designed for diamond hands.

## 🚀 Overview

WaveDex is a professional-grade DeFi terminal that emphasizes "Conviction" over luck. It features a unique trading contest engine where users are rewarded for holding duration and volume rather than just raw PnL.

## ✨ Features

- **Conviction Contests**: Participate in trading contests where "diamond handing" is the winning strategy.
- **Jupiter V6 Integration**: Enterprise-grade swap engine for the best prices across Solana.
- **Token-Gated Intelligence**: Advanced tools requiring $WAVE token ownership:
  - **Wallet Tracker & PnL**: Real-time on-chain verification.
  - **AI Insights**: Proprietary Llama-3-70b engine for behavior analysis.
  - **Whale Alert**: Monitor large liquidity shifts.
  - **Volume Bot**: Enterprise-grade liquidity provisioning.
- **Admin Dashboard**: Secure management of RPCs, private keys, and token listings.

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Framer Motion
- **Backend**: Supabase (Auth, PostgreSQL, Realtime)
- **Blockchain**: Solana (@solana/web3.js)
- **APIs**: Jupiter V6, Helius, Dexscreener, Groq (AI)

## 📦 Getting Started

### Prerequisites

- Node.js / Bun
- Solana RPC (QuickNode/Helius)
- Supabase Project

### Environment Setup

Create a `.env` file in the root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

# Solana
NEXT_PUBLIC_SOLANA_RPC_URL=
QUICKNODE_API_KEY=
HELIUS_API_KEY=

# AI & Trading
GROQ_API_KEY=
JUPITER_API_KEY=
```

### Installation

```bash
bun install
bun run dev
```

## 🛡 Security

Sensitive data (Private Keys, Admin RPCs) is managed exclusively through the encrypted Admin Dashboard and never exposed in client-side code.

## 📜 License

© 2026 WaveDex. Professional Grade DeFi.
