'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Bot, Plus, Trash2, 
  Search, List, Loader2, LogOut, RefreshCw, Activity, BadgeCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { getTokenImageUrl } from '@/lib/dexscreener';

interface Token {
  address: string;
  symbol: string;
  name: string;
  logo_url?: string;
  dexscreener_pair_address?: string;
  is_featured: boolean;
  is_listed: boolean;
  twitter_content?: string;
}

interface VolumeBot {
  id: string;
  token_address: string;
  status: string;
  wallet_count: number;
  total_volume_generated: number;
  profit: number;
  expires_at: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'listings' | 'monitoring'>('listings');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [volumeBots, setVolumeBots] = useState<VolumeBot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newToken, setNewToken] = useState<Token>({
    address: '',
    symbol: '',
    name: '',
    is_featured: false,
    is_listed: true
  });

  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [tokensRes, botsRes] = await Promise.all([
        fetch('/api/admin/tokens'),
        fetch('/api/admin/volume-bots')
      ]);

      if (tokensRes.status === 401) {
        router.push('/auth/admin');
        return;
      }

      const tokensData = await tokensRes.json();
      const botsData = await botsRes.json();

      setTokens(tokensData);
      setVolumeBots(botsData);
    } catch (err) {
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }

  const searchTokensOnDex = async (q: string) => {
    if (q.length < 3) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${q}`);
      const data = await res.json();
      setSearchResults(data.pairs?.filter((p: any) => p.chainId === 'solana') || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) searchTokensOnDex(searchQuery);
      else setSearchResults([]);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const selectTokenFromSearch = (pair: any) => {
    setNewToken({
      address: pair.baseToken.address,
      symbol: pair.baseToken.symbol,
      name: pair.baseToken.name,
      logo_url: pair.info?.imageUrl || '',
      dexscreener_pair_address: pair.pairAddress,
      is_featured: false,
      is_listed: true
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleAddToken = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch('/api/admin/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newToken),
      });
      if (res.ok) {
        toast.success('Token added/updated');
        setNewToken({ address: '', symbol: '', name: '', is_featured: false, is_listed: true });
        fetchData();
      } else {
        toast.error('Failed to add token');
      }
    } catch (err) {
      toast.error('Error adding token');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteToken = async (address: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;
    try {
      const res = await fetch(`/api/admin/tokens?address=${address}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Token deleted');
        fetchData();
      }
    } catch (err) {
      toast.error('Error deleting token');
    }
  };

  const handleLogout = () => {
    document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/auth/admin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="animate-spin text-wave-cyan" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 font-medium selection:bg-wave-cyan selection:text-black">
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-wave-cyan/10 border border-wave-cyan/20 flex items-center justify-center text-wave-cyan">
              <Shield size={16} />
            </div>
            <h1 className="font-black tracking-tighter text-white text-lg">WAVE <span className="text-wave-cyan">ADMIN</span></h1>
          </div>
          <button onClick={handleLogout} className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition-colors">
            Logout session
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-12 max-w-6xl">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-3 space-y-8">
            <div className="space-y-4">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2">Navigation</p>
              <div className="flex flex-col gap-2">
                {[
                  { id: 'listings', label: 'LISTINGS', icon: <List size={14} /> },
                  { id: 'monitoring', label: 'ACTIVE BOTS', icon: <Activity size={14} /> }
                ].map((tab) => (
                  <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`text-left px-4 py-2.5 transition-all text-xs font-black flex items-center gap-3 border-l-2 rounded-r-xl ${
                      activeTab === tab.id ? 'text-wave-cyan border-wave-cyan bg-wave-cyan/10' : 'text-zinc-600 border-transparent hover:text-zinc-400 hover:bg-white/5'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-white/5">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest px-2 mb-4">Platform Stats</p>
              <div className="grid grid-cols-2 gap-4 px-2">
                <div>
                  <div className="text-xl font-bold text-white">{tokens.length}</div>
                  <div className="text-[10px] uppercase font-black text-zinc-700">Tokens</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-wave-cyan">{tokens.filter(t => t.is_featured).length}</div>
                  <div className="text-[10px] uppercase font-black text-zinc-700">Featured</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {activeTab === 'listings' ? (
                <motion.div key="listings" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12">
                  <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl">
                    <div className="mb-8">
                      <h2 className="text-xl font-bold text-white mb-2">Market Discovery</h2>
                      <p className="text-xs text-zinc-600 uppercase font-black tracking-widest">Search and list tokens from dexscreener</p>
                    </div>

                    <div className="space-y-8">
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700"><Search size={18} /></div>
                        <input 
                          type="text" 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search CA or Symbol..." 
                          className="w-full bg-black/40 border border-white/5 rounded-xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-wave-cyan/20 transition-all font-medium placeholder:text-zinc-800"
                        />
                        {isSearching && <div className="absolute right-4 top-1/2 -translate-y-1/2"><Loader2 className="animate-spin text-wave-cyan" size={18} /></div>}

                        {searchResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900/90 backdrop-blur-xl border border-white/5 rounded-xl p-2 shadow-2xl z-50 max-h-[300px] overflow-y-auto">
                            {searchResults.map((pair) => (
                              <button key={pair.pairAddress} onClick={() => selectTokenFromSearch(pair)} className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-lg transition-all group">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center overflow-hidden border border-white/5">
                                    <img src={getTokenImageUrl(pair.baseToken.address, pair.info?.imageUrl)} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <div className="text-left">
                                    <div className="font-bold text-zinc-300 group-hover:text-wave-cyan transition-colors text-sm">{pair.baseToken.symbol}</div>
                                    <div className="text-[9px] text-zinc-700 font-mono tracking-tighter">{pair.baseToken.address}</div>
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <form onSubmit={handleAddToken} className="grid md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <input 
                            type="text" 
                            value={newToken.address}
                            onChange={(e) => setNewToken({...newToken, address: e.target.value})}
                            placeholder="Contract Address" 
                            className="w-full bg-black/40 border border-white/5 rounded-xl py-3 px-5 text-white focus:outline-none focus:border-wave-cyan/20 transition-all font-mono text-sm"
                            required
                          />
                        </div>
                        <div className="flex items-center gap-6 p-4 rounded-xl bg-white/[0.01] border border-white/5 md:col-span-2">
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" checked={newToken.is_featured} onChange={(e) => setNewToken({...newToken, is_featured: e.target.checked})} className="w-4 h-4 rounded-sm bg-black border-white/10 text-wave-cyan focus:ring-wave-cyan" />
                            <span className="font-bold text-[10px] uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400">Featured</span>
                          </label>
                          <label className="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" checked={newToken.is_listed} onChange={(e) => setNewToken({...newToken, is_listed: e.target.checked})} className="w-4 h-4 rounded-sm bg-black border-white/10 text-wave-cyan focus:ring-wave-cyan" />
                            <span className="font-bold text-[10px] uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400">Visible</span>
                          </label>
                        </div>
                        <button type="submit" disabled={isSaving} className="md:col-span-2 w-full py-4 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-wave-cyan transition-all flex items-center justify-center gap-2">
                          {isSaving ? <Loader2 className="animate-spin" size={14} /> : 'Process Listing'}
                        </button>
                      </form>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xs font-black text-zinc-700 uppercase tracking-[0.2em] px-2">Active Terminal Listings</h2>
                    <div className="space-y-2">
                      {tokens.map((token) => (
                        <div key={token.address} className="bg-white/[0.01] border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:border-white/10 transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center overflow-hidden">
                              <img src={getTokenImageUrl(token.address, token.logo_url)} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-sm">{token.name}</span>
                                <span className="text-zinc-600 font-mono text-[10px] uppercase">{token.symbol}</span>
                                {token.is_featured && <BadgeCheck size={10} className="text-wave-cyan" />}
                              </div>
                              <div className="text-[9px] text-zinc-800 font-mono tracking-tight">{token.address}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleDeleteToken(token.address)} className="ml-2 text-[9px] font-black uppercase tracking-widest text-red-900/40 hover:text-red-500 transition-colors">
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : activeTab === 'monitoring' ? (
                <motion.div key="monitoring" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                  <div className="flex items-center justify-between px-2">
                    <h2 className="text-xs font-black text-zinc-700 uppercase tracking-[0.2em]">Live Volume Bots</h2>
                    <button onClick={fetchData} className="p-2 rounded-lg bg-white/5 text-zinc-600 hover:text-wave-cyan transition-all"><RefreshCw size={14} /></button>
                  </div>
                  <div className="grid gap-4">
                    {volumeBots.length === 0 ? (
                      <div className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-12 text-center shadow-2xl">
                        <Bot className="mx-auto text-zinc-800 mb-4" size={40} />
                        <p className="text-sm font-bold text-zinc-600 uppercase tracking-widest">No active volume bots found</p>
                      </div>
                    ) : (
                      volumeBots.map((bot) => (
                        <div key={bot.id} className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] p-8 hover:border-wave-cyan/20 transition-all shadow-xl group">
                          <div className="grid md:grid-cols-4 gap-8 items-center">
                            <div>
                              <div className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mb-1">Target Token</div>
                              <div className="font-mono text-xs text-white break-all">{bot.token_address}</div>
                            </div>
                            <div>
                              <div className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mb-1">Status</div>
                              <div className="flex items-center gap-3">
                                <span className={`w-2 h-2 rounded-full ${bot.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-zinc-700'}`} />
                                <span className="font-black text-[10px] text-white uppercase">{bot.status}</span>
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mb-1">Volume</div>
                              <div className="font-black text-white text-sm">${bot.total_volume_generated.toLocaleString()}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mb-1">Profit</div>
                              <div className="font-bold text-green-500">{bot.profit?.toFixed(4) || '0.0000'} SOL</div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
