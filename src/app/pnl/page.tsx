'use client';

import { Navbar } from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight, BarChart3, Clock, Zap, Loader2, RefreshCw } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState, useCallback } from 'react';
import { connection } from '@/lib/solana';
import { PublicKey } from '@solana/web3.js';
import { getSolanaTokenData } from '@/lib/dexscreener';
import { useWaveAccess } from '@/hooks/useWaveAccess';
import { LockedOverlay } from '@/components/LockedOverlay';

interface TokenBalance {
  mint: string;
  symbol: string;
  name: string;
  amount: number;
  price: number;
  value: number;
  change24h: number;
  logo?: string;
}

export default function PnLPage() {
  const { connected, publicKey } = useWallet();
  const { hasAccess, balance: waveBalance, isLoading: isBalanceLoading, requiredBalance } = useWaveAccess();
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalValue, setTotalValue] = useState(0);
  const [avgChange, setAvgChange] = useState(0);

  const fetchPnL = useCallback(async () => {
    if (!publicKey || !hasAccess) return;
    setLoading(true);
    try {
      // 1. Fetch SOL Balance
      const solBalance = await connection.getBalance(publicKey);
      const solAmount = solBalance / 1e9;

      // 2. Fetch Token Accounts
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      });

      const tokens = tokenAccounts.value
        .map(ta => {
          const info = ta.account.data.parsed.info;
          return {
            mint: info.mint,
            amount: info.tokenAmount.uiAmount
          };
        })
        .filter(t => t.amount > 0);

      // 3. Get Prices and Data from Dexscreener/Jupiter
      const mints = ['So11111111111111111111111111111111111111112', ...tokens.map(t => t.mint)];
      const tokenData = await getSolanaTokenData(mints);
      
      const balanceList: TokenBalance[] = [];
      let total = 0;
      let totalChange = 0;

      // Add SOL
      const solPair = tokenData.pairs?.find(p => p.baseToken.address === 'So11111111111111111111111111111111111111112');
      if (solPair) {
        const value = solAmount * parseFloat(solPair.priceUsd);
        balanceList.push({
          mint: 'So11111111111111111111111111111111111111112',
          symbol: 'SOL',
          name: 'Solana',
          amount: solAmount,
          price: parseFloat(solPair.priceUsd),
          value,
          change24h: solPair.priceChange.h24,
          logo: solPair.info?.imageUrl
        });
        total += value;
        totalChange += solPair.priceChange.h24;
      }

      // Add Tokens
      tokens.forEach(t => {
        const pair = tokenData.pairs?.find(p => p.baseToken.address === t.mint);
        if (pair) {
          const value = t.amount * parseFloat(pair.priceUsd);
          balanceList.push({
            mint: t.mint,
            symbol: pair.baseToken.symbol,
            name: pair.baseToken.name,
            amount: t.amount,
            price: parseFloat(pair.priceUsd),
            value,
            change24h: pair.priceChange.h24,
            logo: pair.info?.imageUrl
          });
          total += value;
          totalChange += pair.priceChange.h24;
        }
      });

      setBalances(balanceList.sort((a, b) => b.value - a.value));
      setTotalValue(total);
      setAvgChange(balanceList.length > 0 ? totalChange / balanceList.length : 0);
    } catch (err) {
      console.error('PnL Fetch Error:', err);
    } finally {
      setLoading(false);
    }
  }, [publicKey]);

  useEffect(() => {
    if (connected && publicKey) {
      fetchPnL();
    }
  }, [connected, publicKey, fetchPnL]);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-wave-cyan selection:text-black">
      <Navbar />
      
      <main className="container mx-auto pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-4">
                 <div className="w-1.5 h-1.5 rounded-full bg-wave-cyan animate-pulse" />
                 <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Real-time Exposure</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-none">
                Live <span className="text-wave-cyan">Portfolio</span>
              </h1>
            </div>
            <button 
              onClick={fetchPnL}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 bg-white/[0.03] border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
              Refresh Data
            </button>
          </div>

            {!connected ? (
              <div className="flex flex-col items-center justify-center py-32 rounded-[3rem] bg-white/[0.01] border border-white/5 text-center">
                <div className="w-20 h-20 rounded-3xl bg-wave-cyan/5 border border-wave-cyan/20 flex items-center justify-center text-wave-cyan mb-8">
                  <Wallet size={32} />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Terminal Disconnected</h2>
                <p className="text-zinc-600 max-w-sm mb-10 font-medium">
                  Sync your Solana wallet to analyze your on-chain conviction and market performance.
                </p>
              </div>
            ) : !hasAccess ? (
              <LockedOverlay 
                requiredBalance={requiredBalance} 
                currentBalance={waveBalance} 
                isLoading={isBalanceLoading} 
              />
            ) : (
              <div className="space-y-12">

              {/* Overview Stats */}
              <div className="grid md:grid-cols-3 gap-6">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 relative overflow-hidden group hover:border-wave-cyan/30 transition-all"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-wave-cyan/5 blur-[60px] rounded-full" />
                  <div className="flex items-center justify-between mb-6 text-zinc-600 font-black text-[10px] uppercase tracking-widest">
                    Net Equity
                    <BarChart3 size={16} className="text-wave-cyan" />
                  </div>
                  <div className="text-4xl font-black text-white mb-2 font-mono">
                    ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <div className={`font-black flex items-center gap-1 text-[10px] uppercase tracking-widest ${avgChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {avgChange >= 0 ? '+' : ''}{avgChange.toFixed(2)}% Avg Change
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 group hover:border-wave-cyan/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-6 text-zinc-600 font-black text-[10px] uppercase tracking-widest">
                    Assets Tracked
                    <Zap size={16} className="text-wave-cyan" />
                  </div>
                  <div className="text-4xl font-black text-white mb-2">{balances.length}</div>
                  <div className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Across Solana Mainnet</div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 group hover:border-wave-cyan/30 transition-all"
                >
                  <div className="flex items-center justify-between mb-6 text-zinc-600 font-black text-[10px] uppercase tracking-widest">
                    Wallet Handle
                    <Wallet size={16} className="text-wave-cyan" />
                  </div>
                  <div className="text-xs font-mono text-white truncate mb-2 max-w-[200px]">
                    {publicKey?.toString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Active Session</span>
                  </div>
                </motion.div>
              </div>

              {/* Asset Breakdown */}
              <div className="bg-white/[0.01] border border-white/5 rounded-[3rem] p-8 md:p-12">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h3 className="text-2xl font-black uppercase tracking-tight">Conviction Assets</h3>
                    <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] mt-1">On-chain balance verification</p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-separate border-spacing-y-3">
                    <thead>
                      <tr className="text-zinc-700 text-[10px] font-black uppercase tracking-[0.2em]">
                        <th className="pb-4 px-6">Asset</th>
                        <th className="pb-4 px-6">Balance</th>
                        <th className="pb-4 px-6">Price</th>
                        <th className="pb-4 px-6">Market Value</th>
                        <th className="pb-4 px-6 text-right">24h Performance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {balances.map((token) => (
                        <tr key={token.mint} className="group transition-all">
                          <td className="py-6 px-6 bg-white/[0.02] first:rounded-l-[2rem] border-y border-l border-white/5 group-hover:border-wave-cyan/30 group-hover:bg-white/[0.04]">
                            <div className="flex items-center gap-4">
                              {token.logo ? (
                                <img src={token.logo} className="w-10 h-10 rounded-xl object-cover" alt="" />
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-zinc-900 flex items-center justify-center font-bold text-zinc-700">{token.symbol[0]}</div>
                              )}
                              <div>
                                <div className="font-black text-white text-sm uppercase tracking-tight">{token.name}</div>
                                <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">{token.symbol}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-6 px-6 bg-white/[0.02] border-y border-white/5 group-hover:border-wave-cyan/30 group-hover:bg-white/[0.04] font-mono font-bold text-sm">
                            {token.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                          </td>
                          <td className="py-6 px-6 bg-white/[0.02] border-y border-white/5 group-hover:border-wave-cyan/30 group-hover:bg-white/[0.04] font-mono font-bold text-zinc-400 text-sm">
                            ${token.price < 0.01 ? token.price.toFixed(6) : token.price.toLocaleString()}
                          </td>
                          <td className="py-6 px-6 bg-white/[0.02] border-y border-white/5 group-hover:border-wave-cyan/30 group-hover:bg-white/[0.04]">
                            <div className="font-mono font-black text-white text-sm">
                              ${token.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </div>
                          </td>
                          <td className="py-6 px-6 bg-white/[0.02] last:rounded-r-[2rem] border-y border-r border-white/5 group-hover:border-wave-cyan/30 group-hover:bg-white/[0.04] text-right">
                            <div className={`flex items-center justify-end gap-1 font-black text-xs uppercase ${token.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {token.change24h >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                              {Math.abs(token.change24h).toFixed(2)}%
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {balances.length === 0 && !loading && (
                    <div className="py-20 text-center text-zinc-800 font-black uppercase tracking-[0.3em] text-xs">
                      No significant balances detected
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="py-20 text-center border-t border-white/5 opacity-30">
        <div className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em]">WaveDex Analytics v0.9.4</div>
      </footer>
    </div>
  );
}
