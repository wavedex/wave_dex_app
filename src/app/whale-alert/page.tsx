'use client';

import { Navbar } from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Anchor, Waves, ArrowUpRight, BarChart3, Wallet, Copy, ExternalLink, Activity, Eye, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useWaveAccess } from '@/hooks/useWaveAccess';
import { LockedOverlay } from '@/components/LockedOverlay';
import { useWallet } from '@solana/wallet-adapter-react';

interface WhaleTx {

  id: string;
  signature: string;
  timestamp: string;
  amount: number;
  symbol: string;
  from: string;
  to: string;
  type: 'BUY' | 'SELL' | 'TRANSFER';
  valueUsd: number;
}

export default function WhaleAlertPage() {
  const { connected } = useWallet();
  const { hasAccess, balance: waveBalance, isLoading: isBalanceLoading, requiredBalance } = useWaveAccess();
  const [transactions, setTransactions] = useState<WhaleTx[]>([]);
  const [isLive, setIsLive] = useState(true);

  // Simulate live feed for BETA
  useEffect(() => {
    if (!isLive || !hasAccess) return;

    const generateFakeTx = () => {
      const symbols = ['SOL', 'WAVEDEX', 'USDC', 'JUP', 'PYTH', 'BONK'];
      const types: ('BUY' | 'SELL' | 'TRANSFER')[] = ['BUY', 'SELL', 'TRANSFER'];
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const amount = Math.random() * 5000 + 500;
      const price = symbol === 'SOL' ? 140 : symbol === 'USDC' ? 1 : 0.5;
      
      const newTx: WhaleTx = {
        id: Math.random().toString(36).substring(7),
        signature: Math.random().toString(36).substring(2, 15) + '...',
        timestamp: new Date().toLocaleTimeString(),
        amount: Number(amount.toFixed(2)),
        symbol,
        from: Math.random().toString(36).substring(2, 8) + '...',
        to: Math.random().toString(36).substring(2, 8) + '...',
        type: types[Math.floor(Math.random() * types.length)],
        valueUsd: Number((amount * price).toFixed(2)),
      };

      setTransactions(prev => [newTx, ...prev].slice(0, 20));
    };

    const interval = setInterval(generateFakeTx, 3000);
    return () => clearInterval(interval);
  }, [isLive]);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-wave-cyan selection:text-black">
      <Navbar />
      
      <main className="container mx-auto pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                 <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-red-500 animate-pulse' : 'bg-zinc-600'}`} />
                 <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">
                   {isLive ? 'Live Monitoring Active' : 'Monitor Paused'}
                 </span>
                 <span className="ml-2 px-1.5 py-0.5 rounded border border-wave-cyan/20 bg-wave-cyan/5 text-[8px] font-black text-wave-cyan uppercase tracking-widest">Beta</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none">
                Whale <span className="text-wave-cyan">Alert</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsLive(!isLive)}
                className={`px-6 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                  isLive 
                  ? 'border-red-500/20 bg-red-500/5 text-red-500 hover:bg-red-500/10' 
                  : 'border-wave-cyan/20 bg-wave-cyan/5 text-wave-cyan hover:bg-wave-cyan/10'
                }`}
              >
                {isLive ? 'Pause Feed' : 'Resume Feed'}
              </button>
              </div>
            </div>

            {!connected ? (
              <div className="flex flex-col items-center justify-center py-32 rounded-[3rem] bg-white/[0.01] border border-white/5 text-center">
                <div className="w-20 h-20 rounded-3xl bg-wave-cyan/5 border border-wave-cyan/20 flex items-center justify-center text-wave-cyan mb-8">
                  <Activity size={32} />
                </div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Terminal Feed Locked</h2>
                <p className="text-zinc-600 max-w-sm mb-10 font-medium">
                  Connect your wallet to monitor large on-chain moves and liquidity shifts in real-time.
                </p>
              </div>
            ) : !hasAccess ? (
              <LockedOverlay 
                requiredBalance={requiredBalance} 
                currentBalance={waveBalance} 
                isLoading={isBalanceLoading} 
              />
            ) : (
                <div className="grid lg:grid-cols-4 gap-8">
                  {/* Sidebar Stats */}
                  <div className="space-y-4">
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                      <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">24h Whale Volume</div>
                      <div className="text-2xl font-bold text-white tracking-tighter">$14.2M</div>
                      <div className="mt-2 text-[10px] text-wave-cyan font-bold">+12.5% from yesterday</div>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                      <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-4">Active Whales</div>
                      <div className="text-2xl font-bold text-white tracking-tighter">1,242</div>
                      <div className="mt-2 text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Unique Addresses</div>
                    </div>
                    <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle size={14} className="text-wave-cyan" />
                        <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Large Sell Alert</div>
                      </div>
                      <div className="text-xs text-zinc-400 leading-relaxed">
                        Multiple whale wallets moving <span className="text-white font-bold">SOL</span> to exchanges in the last 30 minutes.
                      </div>
                    </div>
                  </div>

                  {/* Main Feed */}
                  <div className="lg:col-span-3">
                    <div className="rounded-[2rem] bg-white/[0.01] border border-white/5 overflow-hidden">
                      <div className="grid grid-cols-5 p-6 border-b border-white/5 text-[10px] font-black text-zinc-700 uppercase tracking-widest">
                        <div className="col-span-2">Transaction / Time</div>
                        <div>Type</div>
                        <div className="text-right">Amount</div>
                        <div className="text-right">Value (USD)</div>
                      </div>

                      <div className="divide-y divide-white/5">
                        <AnimatePresence initial={false}>
                          {transactions.map((tx) => (
                            <motion.div
                              key={tx.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className="grid grid-cols-5 p-6 hover:bg-white/[0.02] transition-colors items-center group"
                            >
                              <div className="col-span-2">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                    tx.type === 'BUY' ? 'bg-wave-cyan/10 text-wave-cyan' : 
                                    tx.type === 'SELL' ? 'bg-red-500/10 text-red-500' : 
                                    'bg-zinc-500/10 text-zinc-500'
                                  }`}>
                                    <Activity size={14} />
                                  </div>
                                  <div>
                                    <div className="font-mono text-[10px] text-white group-hover:text-wave-cyan transition-colors">{tx.signature}</div>
                                    <div className="text-[10px] text-zinc-600 font-bold">{tx.timestamp}</div>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border tracking-widest uppercase ${
                                  tx.type === 'BUY' ? 'bg-wave-cyan/10 text-wave-cyan border-wave-cyan/20' : 
                                  tx.type === 'SELL' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                  'bg-zinc-900 text-zinc-600 border-white/5'
                                }`}>
                                  {tx.type}
                                </span>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-bold text-white">{tx.amount.toLocaleString()} {tx.symbol}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs font-black text-zinc-400">${tx.valueUsd.toLocaleString()}</div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        {transactions.length === 0 && (
                          <div className="py-20 text-center text-zinc-700 font-black uppercase tracking-[0.4em] text-xs">
                            Initializing Terminal Feed...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
        </div>
      </main>
    </div>
  );
}
