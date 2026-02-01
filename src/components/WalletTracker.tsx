'use client';

import { useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Search, Wallet, TrendingUp, ArrowUpRight, Copy, ExternalLink, RefreshCw, Loader2, Save, Trash2, ChevronRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface TokenBalance {
  mint: string;
  symbol: string;
  name: string;
  amount: number;
  decimals: number;
  price?: number;
  value?: number;
  logoURI?: string;
}

interface Trade {
  signature: string;
  timestamp: number;
  type: 'buy' | 'sell' | 'swap';
  dex?: string;
  fromAsset: {
    symbol: string;
    amount: number;
    mint: string;
  };
  toAsset: {
    symbol: string;
    amount: number;
    mint: string;
  };
  status: 'success' | 'failed';
}

const DEX_PROGRAMS: Record<string, string> = {
  'JUP6LkbZbjS1jKKpphqGvHwX1YhN57S9QW5S8uT2p65': 'Jupiter',
  '675kPX9MHTjS2zt1qnt1svKi7p24ic3ST8K6yq3aV58': 'Raydium',
  '6EF8rrecthR5DkZdt5iX20rrcmX634XWzX7FfLGi6Hj': 'Pump.fun',
  'whir7mNH2GmecWycbZbeyb13Y2P8pEKL25Y8n9HhUn': 'Orca',
};

interface TrackedWallet {
  id: string;
  address: string;
  name: string;
  created_at: string;
}

export function WalletTracker() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [address, setAddress] = useState('');
  const [walletName, setWalletName] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'holdings' | 'trades' | 'saved'>('trades');
  const [balances, setBalances] = useState<TokenBalance[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [totalValue, setTotalValue] = useState<number>(0);
  const [trackedWallets, setTrackedWallets] = useState<TrackedWallet[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchTrackedWallets();
  }, []);

  const fetchTrackedWallets = async () => {
    try {
      const res = await fetch('/api/tracked-wallets');
      const data = await res.json();
      if (Array.isArray(data)) {
        setTrackedWallets(data);
      }
    } catch (error) {
      console.error('Error fetching tracked wallets:', error);
    }
  };

  const saveTrackedWallet = async () => {
    if (!address || !walletName) {
      toast.error('Address and name are required');
      return;
    }

    try {
      setIsSaving(true);
      const res = await fetch('/api/tracked-wallets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, name: walletName }),
      });
      
      if (res.ok) {
        toast.success(`Wallet "${walletName}" saved`);
        setWalletName('');
        fetchTrackedWallets();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save wallet');
      }
    } catch (error) {
      toast.error('Error saving wallet');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteTrackedWallet = async (id: string) => {
    try {
      const res = await fetch(`/api/tracked-wallets?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTrackedWallets(prev => prev.filter(w => w.id !== id));
        toast.success('Wallet removed');
      }
    } catch (error) {
      toast.error('Failed to remove wallet');
    }
  };

  const fetchTrades = async (searchAddress: string) => {
    try {
      const response = await fetch('/api/helius/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: searchAddress }),
      });

      const data = await response.json();

      if (data.trades) {
        setTrades(data.trades);
      }
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };


  const fetchWalletData = async (searchAddress: string, name?: string) => {
    if (!searchAddress) return;
    
    try {
      setLoading(true);
      if (name) setWalletName(name);
      setAddress(searchAddress);
      
      // Load trades in parallel
      fetchTrades(searchAddress);

      // Use Helius API for holdings, metadata, and prices
      const response = await fetch('/api/helius/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerAddress: searchAddress }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const finalBalances = (data.assets || []).map((asset: any) => ({
        ...asset,
        value: asset.amount * (asset.price || 0)
      }));

      const sorted = finalBalances.sort((a: any, b: any) => (b.value || 0) - (a.value || 0));
      setBalances(sorted);
      setTotalValue(sorted.reduce((acc: number, curr: any) => acc + (curr.value || 0), 0));
      
      if (activeTab === 'saved') setActiveTab('trades');
    } catch (error) {
      console.error('Wallet fetch error:', error);
      toast.error('Error fetching wallet data from Helius');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWalletData(address);
  };

  const copyAddress = (addr: string) => {
    navigator.clipboard.writeText(addr);
    toast.success('Address copied');
  };

  const EmptyState = ({ message, subMessage, icon: Icon = Search }: { message: string, subMessage: string, icon?: any }) => (
    <div className="flex flex-col items-center justify-center py-20 text-zinc-800 gap-6">
      <div className="p-6 rounded-full bg-white/[0.02] border border-white/5">
        <Icon size={48} className="opacity-20" />
      </div>
      <div className="text-center">
        <p className="text-sm font-black uppercase tracking-widest text-zinc-600 mb-2">{message}</p>
        <p className="text-xs text-zinc-800 max-w-[200px] leading-relaxed mx-auto">
          {subMessage}
        </p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#050505] text-zinc-400 font-mono">
      {/* Header Area */}
      <div className="p-6 border-b border-white/5">
        <h2 className="text-xl font-black text-white mb-4 tracking-tighter flex items-center gap-2">
          <Wallet className="text-wave-cyan" size={20} />
          WALLET <span className="text-wave-cyan">TRACKER</span>
        </h2>
        
        <form onSubmit={handleSearch} className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={16} />
              <Input 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Solana Address..."
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-wave-cyan/50 h-10 rounded-xl"
              />
            </div>
            <Button 
              type="submit"
              disabled={loading}
              className="bg-wave-cyan text-black font-black hover:bg-white transition-colors h-10 rounded-xl px-6"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : 'TRACK'}
            </Button>
          </div>
          
          <AnimatePresence>
            {address && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-2"
              >
                <Input 
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  placeholder="Give it a name (e.g. Whale)..."
                  className="bg-white/5 border-white/10 text-white placeholder:text-zinc-600 focus:border-wave-cyan/50 h-9 rounded-xl text-xs"
                />
                <Button 
                  onClick={saveTrackedWallet}
                  disabled={isSaving || !walletName}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10 h-9 rounded-xl px-4 flex items-center gap-2"
                >
                  <Save size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Save</span>
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
        
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setActiveTab('trades')}
              className={`text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'trades' ? 'text-wave-cyan border-b border-wave-cyan' : 'text-zinc-500 hover:text-wave-cyan'}`}
            >
              Trades
            </button>
            <button 
              onClick={() => setActiveTab('holdings')}
              className={`text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'holdings' ? 'text-wave-cyan border-b border-wave-cyan' : 'text-zinc-500 hover:text-wave-cyan'}`}
            >
              Holdings
            </button>
              <button 
                onClick={() => setActiveTab('saved')}
                className={`text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'saved' ? 'text-wave-cyan border-b border-wave-cyan' : 'text-zinc-500 hover:text-wave-cyan'}`}
              >
                Saved
              </button>
            </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setAddress(''); setBalances([]); setTrades([]); setTotalValue(0); setWalletName(''); }}
              className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-red-500 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Portfolio Summary */}
      <AnimatePresence>
        {activeTab !== 'saved' && balances.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-wave-cyan/5 border-b border-wave-cyan/10"
          >
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-1">
                  {walletName ? `"${walletName}"` : 'Total Net Worth'}
                </p>
                <h3 className="text-3xl font-black text-white tracking-tighter">
                  ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="text-right">
                <Badge className="bg-wave-cyan/20 text-wave-cyan border-none font-black text-[10px] mb-2 uppercase tracking-widest">
                  Live Portfolio
                </Badge>
                <div className="flex items-center gap-2 text-zinc-500 text-[10px]">
                  <RefreshCw size={10} className={loading ? 'animate-spin' : ''} />
                  Last updated just now
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content Area */}
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-3">
          {loading && (activeTab === 'holdings' ? balances.length === 0 : trades.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-600 gap-4">
              <Loader2 className="animate-spin text-wave-cyan" size={32} />
              <p className="text-xs font-black uppercase tracking-widest">Scanning Chain...</p>
            </div>
          ) : activeTab === 'trades' ? (
            trades.length > 0 ? (
              trades.map((trade, i) => (
                  <motion.div
                    key={trade.signature}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-wave-cyan/30 transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${
                            trade.type === 'buy' ? 'bg-green-500/10 text-green-500' : 
                            trade.type === 'sell' ? 'bg-red-500/10 text-red-500' : 
                            'bg-wave-cyan/10 text-wave-cyan'
                          }`}>
                            {trade.type}
                          </span>
                          {trade.dex && (
                            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600">
                              via {trade.dex}
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-700 font-mono">
                          {new Date(trade.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-[8px] text-zinc-600 uppercase font-black tracking-widest mb-0.5">PAY</div>
                        <div className="text-white font-bold text-xs truncate">
                          {trade.fromAsset.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} <span className="text-zinc-500">{trade.fromAsset.symbol}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-center opacity-20">
                        <ChevronRight size={14} className="text-wave-cyan" />
                      </div>

                      <div className="flex-1 text-right">
                        <div className="text-[8px] text-zinc-600 uppercase font-black tracking-widest mb-0.5">RECEIVE</div>
                        <div className="text-wave-cyan font-bold text-xs truncate">
                          {trade.toAsset.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} <span className="text-wave-cyan/50">{trade.toAsset.symbol}</span>
                        </div>
                      </div>

                      <div className="pl-2 border-l border-white/5 group-hover:border-wave-cyan/20 transition-colors">
                        <a 
                          href={`https://solscan.io/tx/${trade.signature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-800 hover:text-wave-cyan transition-colors"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </div>
                  </motion.div>

                ))
              ) : (
                <EmptyState message="No Recent Trades" subMessage="Search for a wallet to track its recent swap activity on-chain." />
              )
            ) : activeTab === 'holdings' ? (

            balances.length > 0 ? (
              balances.map((token, i) => (
                <motion.div
                  key={token.mint}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-wave-cyan/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 overflow-hidden flex items-center justify-center border border-white/10 group-hover:border-wave-cyan/50 transition-all">
                      {token.logoURI ? (
                        <img src={token.logoURI} alt={token.symbol} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-xs font-black text-zinc-700">{token.symbol[0]}</div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white text-sm">{token.symbol === 'UNKNOWN' ? token.mint.slice(0, 4) + '...' : token.symbol}</span>
                        {token.price && (
                          <span className="text-[10px] text-zinc-600 font-bold">${token.price < 0.01 ? token.price.toFixed(8) : token.price.toFixed(4)}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-500 flex items-center gap-2">
                        {token.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} {token.symbol}
                        <button onClick={() => copyAddress(token.mint)} className="hover:text-wave-cyan">
                          <Copy size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-white text-sm">
                      ${(token.value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="flex items-center justify-end gap-1 text-wave-cyan text-[10px] font-bold">
                      <ArrowUpRight size={12} />
                      TRADE
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <EmptyState message="Portfolio Empty" subMessage="Load a wallet to view its on-chain token holdings and valuations." />
            )
          ) : (
            /* Saved Wallets Tab */
            trackedWallets.length > 0 ? (
              trackedWallets.map((wallet, i) => (
                <motion.div
                  key={wallet.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-wave-cyan/30 transition-all flex items-center justify-between"
                >
                  <div 
                    className="flex items-center gap-4 flex-1 cursor-pointer"
                    onClick={() => fetchWalletData(wallet.address, wallet.name)}
                  >
                    <div className="w-10 h-10 rounded-full bg-wave-cyan/10 flex items-center justify-center border border-wave-cyan/20 group-hover:bg-wave-cyan/20 transition-all">
                      <User size={18} className="text-wave-cyan" />
                    </div>
                    <div>
                      <h4 className="font-black text-white text-sm uppercase">{wallet.name}</h4>
                      <p className="text-[10px] text-zinc-600 font-mono flex items-center gap-1">
                        {wallet.address.slice(0, 4)}...{wallet.address.slice(-4)}
                        <Copy size={10} className="hover:text-wave-cyan cursor-pointer" onClick={(e) => { e.stopPropagation(); copyAddress(wallet.address); }} />
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={() => fetchWalletData(wallet.address, wallet.name)}
                      className="bg-white/5 hover:bg-wave-cyan/10 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-wave-cyan h-8 px-3 rounded-lg border border-transparent hover:border-wave-cyan/30"
                    >
                      Analyze
                      <ChevronRight size={12} />
                    </Button>
                    <button 
                      onClick={() => deleteTrackedWallet(wallet.id)}
                      className="p-2 text-zinc-800 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <EmptyState icon={User} message="No Saved Wallets" subMessage="Track a wallet and use the save button to keep it in your favorites list." />
            )
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-white/5 bg-black/40 flex items-center justify-between">
        <div className="flex items-center gap-2 opacity-30">
          <div className="w-1.5 h-1.5 rounded-full bg-wave-cyan animate-pulse" />
          <span className="text-[8px] font-black uppercase tracking-widest">Real-time Feed</span>
        </div>
        <div className="text-[8px] font-black uppercase tracking-widest text-zinc-700">
          POWERED BY WAVEDEX TERMINAL
        </div>
      </div>
    </div>
  );
}
