## Project Summary
WaveDex is a DeFi trading contest platform built on Solana, emphasizing "Conviction" over luck. Users participate by buying and holding specific tokens, with selling resulting in disqualification. The platform tracks wallet balances and holding times via Meteora and Dexscreener APIs to calculate a "Conviction Score," rewarding long-term commitment and liquidity provision.

## Tech Stack
- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Framer Motion
- **Backend/Database**: Supabase (Auth, PostgreSQL, Realtime)
- **Blockchain**: Solana (Web3.js, @solana/wallet-adapter)
- **APIs**: Jupiter V6 (Trading), Dexscreener (Market Data/Search), Helius (Asset Tracking)

## Architecture
- **src/app**: Next.js App Router for pages and API routes.
- **src/components**: Reusable UI components (Terminal style).
- **Admin**: Dedicated dashboard at `/auth/admin/dashboard` for managing global RPC, Private Keys, and Token Listings.
- **Volume Bot**: Real on-chain execution using admin-configured credentials.
- **Swap**: Real-time Jupiter V6 integration for swaps across all Solana tokens.

## User Preferences
- Theme: Deep Dark / Oceanic (Terminal Aesthetic)
- UI: Professional DeFi terminal look, centered layouts, mobile-responsive.
- Admin: Simple, link-based navigation (no bulky buttons).
- Feature: One-click "Feature" functionality with auto-generated Twitter content.

## Project Guidelines
- **Real Execution**: All trading components (Swap, Volume Bot) use real on-chain APIs (Jupiter V6).
- **Security**: Private keys and RPC URLs are managed exclusively in the secure Admin Dashboard and never exposed to public users.
- **Discovery**: Integrated Dexscreener search for instant listing of any Solana token by CA or Name.

## Common Patterns
- **Terminal UI**: High-contrast, monospaced fonts for addresses, and clean data grids.
- **Real-time Feedback**: Toasts and loaders for all on-chain interactions.
- **Automated Content**: Social media content generation for featured listings.
