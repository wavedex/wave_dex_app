'use client';

import { Navbar } from '@/components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Sparkles, Wallet, BarChart3, Zap, Loader2, RefreshCw, AlertCircle, ArrowRight, TrendingUp } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useEffect, useState, useCallback } from 'react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
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

interface Transaction {
  type: string;
  timestamp: string;
  fromAsset: { symbol: string; amount: number };
  toAsset: { symbol: string; amount: number };
}

export default function AIInsightsPage() {
  const { connected, publicKey } = useWallet();
  const { hasAccess, balance: waveBalance, isLoading: isBalanceLoading, requiredBalance } = useWaveAccess();
  const [targetAddress, setTargetAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [trades, setTrades] = useState<Transaction[]>([]);

  // Initialize targetAddress with publicKey when it changes
  useEffect(() => {
    if (publicKey && !targetAddress) {
      setTargetAddress(publicKey.toString());
    }
  }, [publicKey, targetAddress]);

  const fetchData = useCallback(async (addressToFetch?: string) => {
    const address = addressToFetch || targetAddress;
    if (!address || !hasAccess) return;
    
    setLoading(true);
    try {
      // Fetch balances from our Helius API route
      const balanceRes = await fetch(`/api/helius/assets?address=${address}`);
      const balanceData = await balanceRes.json();
      setBalances(balanceData.assets || []);

      // Fetch transactions from our Helius API route
      const txRes = await fetch(`/api/helius/transactions?address=${address}`);
      const txData = await txRes.json();
      setTrades(txData.transactions || []);
      
      if (balanceData.assets?.length === 0 && txData.transactions?.length === 0) {
        toast.info('No direct wallet data found. Checking if this is a Token CA...');
      }
    } catch (err) {
      console.error('Fetch Error:', err);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [targetAddress]);

  useEffect(() => {
    if (connected && publicKey && !targetAddress) {
      fetchData(publicKey.toString());
    }
  }, [connected, publicKey, fetchData]);

  const generateInsights = async () => {
    if (!targetAddress) {
      toast.error('Enter a wallet address or token CA');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await fetch('/api/ai/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: targetAddress,
          balances,
          trades
        }),
      });

      const data = await response.json();
      if (data.insights) {
        setInsights(data.insights);
        toast.success('AI Analysis Complete');
      } else {
        throw new Error(data.error || 'Failed to generate insights');
      }
    } catch (err: any) {
      toast.error(err.message || 'AI Engine Error');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-wave-cyan selection:text-black font-sans">
      <Navbar />
      
      <main className="container mx-auto pt-32 pb-20 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
               <div className="w-1.5 h-1.5 rounded-full bg-wave-cyan animate-pulse" />
               <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Proprietary AI Engine</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none mb-6">
              AI <span className="text-wave-cyan">Insights</span>
            </h1>
            <p className="text-zinc-500 max-w-2xl font-medium text-lg leading-relaxed">
              Deep on-chain intelligence powered by Groq Llama-3. Analyze portfolio conviction, 
              risk profiles, and trading behavior in seconds.
            </p>
          </div>

          {!connected ? (
            <div className="flex flex-col items-center justify-center py-32 rounded-[3rem] bg-white/[0.01] border border-white/5 text-center">
              <div className="w-20 h-20 rounded-3xl bg-wave-cyan/5 border border-wave-cyan/20 flex items-center justify-center text-wave-cyan mb-8">
                <Bot size={32} />
              </div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Terminal Locked</h2>
                <p className="text-zinc-600 max-w-sm mb-10 font-medium">
                  Connect your wallet to grant the AI engine access to your on-chain activity.
                </p>
              </div>
            ) : !hasAccess ? (
              <LockedOverlay 
                requiredBalance={requiredBalance} 
                currentBalance={waveBalance} 
                isLoading={isBalanceLoading} 
              />
            ) : (
              <div className="space-y-8">

              {/* Target Address Input */}
              <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row items-end gap-6">
                  <div className="flex-1 w-full">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-3 block">Target Address (Wallet or Token CA)</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-4 flex items-center text-zinc-500 group-focus-within:text-wave-cyan transition-colors">
                        <Wallet size={18} />
                      </div>
                      <input 
                        type="text"
                        value={targetAddress}
                        onChange={(e) => setTargetAddress(e.target.value)}
                        placeholder="Enter Solana Address..."
                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm font-mono text-white placeholder:text-zinc-700 focus:outline-none focus:border-wave-cyan/50 focus:ring-1 focus:ring-wave-cyan/20 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3 w-full md:w-auto">
                    <button 
                      onClick={() => fetchData()}
                      disabled={loading || !targetAddress}
                      className="flex-1 md:flex-none px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-2xl text-xs uppercase tracking-widest hover:bg-white/10 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                      Fetch Data
                    </button>
                    <button 
                      onClick={generateInsights}
                      disabled={analyzing || loading || (balances.length === 0 && trades.length === 0)}
                      className="flex-1 md:flex-none px-8 py-4 bg-wave-cyan text-wave-deep font-black rounded-2xl text-xs uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all shadow-lg shadow-wave-cyan/10 flex items-center justify-center gap-2"
                    >
                      {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                      {analyzing ? 'Analyzing...' : 'Run Analysis'}
                    </button>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-wrap gap-4">
                  <div className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                    <div className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter">Status</div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${balances.length > 0 || trades.length > 0 ? 'bg-green-500' : 'bg-zinc-700'}`} />
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        {balances.length > 0 || trades.length > 0 ? 'Data Loaded' : 'Awaiting Data'}
                      </span>
                    </div>
                  </div>
                  <div className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/5 flex items-center gap-3">
                    <div className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter">Data Points</div>
                    <div className="text-[10px] font-bold text-white uppercase tracking-widest">
                      {balances.length} Assets | {trades.length} Trades
                    </div>
                  </div>
                </div>
              </div>

              {/* Analysis Result */}

              <AnimatePresence mode="wait">
                {insights ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-8 md:p-12 rounded-[3rem] bg-white/[0.01] border border-white/5 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-wave-cyan/5 blur-[100px] rounded-full -z-10" />
                    
                      <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 rounded-lg bg-wave-cyan/10 text-wave-cyan">
                          <BarChart3 size={20} />
                        </div>
                        <h3 className="text-xl font-black uppercase tracking-tight">
                          {balances.length === 1 && (balances[0].mint === targetAddress || balances[0].symbol === targetAddress) 
                            ? 'Token Intelligence Report' 
                            : 'Wallet Intelligence Report'}
                        </h3>
                      </div>


                    <div className="prose prose-invert prose-zinc max-w-none 
                      prose-h1:text-wave-cyan prose-h1:uppercase prose-h1:tracking-tighter prose-h1:italic
                      prose-h2:text-white prose-h2:uppercase prose-h2:tracking-tight prose-h2:mt-8 prose-h2:mb-4
                      prose-p:text-zinc-400 prose-p:leading-relaxed prose-p:text-base prose-p:font-medium
                      prose-li:text-zinc-400 prose-strong:text-wave-cyan prose-strong:font-black
                      prose-code:text-wave-cyan prose-code:bg-wave-cyan/5 prose-code:px-1 prose-code:rounded
                    ">
                      <ReactMarkdown>{insights}</ReactMarkdown>
                    </div>

                    <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-center gap-2 text-[10px] font-black text-zinc-700 uppercase tracking-widest">
                        <AlertCircle size={12} />
                        Generated by WaveDex Llama-3-70b Engine
                      </div>
                      <button 
                        onClick={() => setInsights(null)}
                        className="text-[10px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors"
                      >
                        Clear Report
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="py-32 flex flex-col items-center justify-center text-center opacity-40">
                    {analyzing ? (
                      <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                          <div className="w-16 h-16 rounded-full border-2 border-wave-cyan/20 border-t-wave-cyan animate-spin" />
                          <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-wave-cyan animate-pulse" size={24} />
                        </div>
                        <div className="text-sm font-black uppercase tracking-[0.4em]">Engine Initializing...</div>
                      </div>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-3xl border border-white/10 flex items-center justify-center mb-6">
                          <TrendingUp size={24} className="text-zinc-700" />
                        </div>
                        <div className="text-xs font-black uppercase tracking-[0.4em]">Awaiting Instruction</div>
                      </>
                    )}
                  </div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
