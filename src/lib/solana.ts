import { Connection, PublicKey } from '@solana/web3.js';

const RPC_URL = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const WSS_URL = process.env.NEXT_PUBLIC_SOLANA_WSS_URL;

export const connection = new Connection(RPC_URL, {
  commitment: 'confirmed',
  wsEndpoint: WSS_URL
});

export const DLMM_PROGRAM_ID = new PublicKey('LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo');
