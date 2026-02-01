'use client';

import { Navbar } from '@/components/Navbar';
import { useEffect, useState, useCallback } from 'react';
import { getTrendingTokens, searchTokens, DexPair, getSolanaTokenData, getTokenImageUrl } from '@/lib/dexscreener';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ExternalLink, RefreshCw, BadgeCheck, BarChart3, Activity, Zap, ShieldCheck, LayoutPanelLeft } from 'lucide-react';
import { Swap } from '@/components/Swap';
import { TerminalChart } from '@/components/TerminalChart';
import { InfoBar } from '@/components/InfoBar';
import { OrderBook } from '@/components/OrderBook';

export default function TokensPage() {
  const [tokens, setTokens] = useState<DexPair[]>([]);
  const [featuredTokens, setFeaturedTokens] = useState<DexPair[]>([]);
  const [listedAddresses, setListedAddresses] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedToken, setSelectedToken] = useState<DexPair | null>(null);
  const [activeView, setActiveView] = useState<'chart' | 'info'>('chart');

  const fetchInitialTokens = useCallback(async () => {
    setLoading(true);
    try {
      const { data: dbTokens, error: dbError } = await supabase
        .from('tokens')
        .select('*')
        .eq('is_listed', true);

      if (dbError) console.error('Supabase fetch error:', dbError);

      const listed = new Set(dbTokens?.map(t => t.address) || []);
      const dbTokensList = dbTokens || [];
      setListedAddresses(listed);
      
      const popularAddresses = [
        'So11111111111111111111111111111111111111112', // SOL
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
        '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN', // TRUMP
        '9BB6NFEcjBCtnNLFko2FqVQBq8HHM13kCyYcdQbgpump', // FART
        '2qEHj6n3wkoS7p8zA64G5F1U9f4AAtN2j1s86mU2pump', // PNUT
      ];

      const fetchAddresses = Array.from(new Set([...popularAddresses, ...dbTokensList.map(t => t.address)]));
      const [popularData, trending] = await Promise.all([
        getSolanaTokenData(fetchAddresses),
        getTrendingTokens()
      ]);

      const dbPairs: DexPair[] = dbTokensList.map(dbT => {
        // Find all pairs for this token and sort by liquidity
        const matches = popularData.pairs?.filter(p => p.baseToken.address === dbT.address) || [];
        const found = matches.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
        
        if (found) {
          return {
            ...found,
            info: { ...found.info, imageUrl: found.info?.imageUrl || dbT.logo_url }
          };
        }
        return {
          chainId: 'solana', dexId: 'wavedex', url: `https://dexscreener.com/solana/${dbT.address}`,
          pairAddress: dbT.dexscreener_pair_address || dbT.address,
          baseToken: { address: dbT.address, name: dbT.name, symbol: dbT.symbol },
          quoteToken: { address: 'So11111111111111111111111111111111111111112', name: 'SOL', symbol: 'SOL' },
          priceNative: '0', priceUsd: '0',
          txns: { m5: { buys: 0, sells: 0 }, h1: { buys: 0, sells: 0 }, h6: { buys: 0, sells: 0 }, h24: { buys: 0, sells: 0 } },
          volume: { h24: 0, h6: 0, h1: 0, m5: 0 },
          priceChange: { m5: 0, h1: 0, h6: 0, h24: 0 },
          liquidity: { usd: 0, base: 0, quote: 0 },
          fdv: 0, marketCap: 0, pairCreatedAt: Date.now(),
          info: { imageUrl: dbT.logo_url }
        } as DexPair;
      });

      const otherPairs = popularData.pairs?.filter(p => !listed.has(p.baseToken.address)) || [];
      const allTokens = [...dbPairs, ...otherPairs, ...(trending || [])];
      const uniqueTokens = Array.from(new Map(allTokens.map(t => [t.baseToken.address, t])).values());

      setFeaturedTokens(dbPairs);
      setTokens(uniqueTokens);
      if (dbPairs.length > 0) setSelectedToken(dbPairs[0]);
      else if (uniqueTokens.length > 0) setSelectedToken(uniqueTokens[0]);
    } catch (err) {
      console.error('Failed to fetch initial tokens:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialTokens();
  }, [fetchInitialTokens]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await searchTokens(searchQuery);
      setTokens(results);
      if (results.length > 0) setSelectedToken(results[0]);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-wave-cyan selection:text-black overflow-x-hidden">
      <div className="fixed top-0 left-0 right-0 z-[70]">
        <Navbar />
      </div>
      
      <div className="fixed top-10 md:top-0 left-0 right-0 z-[60]">
        <InfoBar />
      </div>
      
      <main className="w-full pt-28 md:pt-36 px-2 md:px-4 pb-10 lg:h-screen lg:overflow-hidden">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-3 h-full lg:h-[calc(100vh-220px)] min-h-0">
          
          {/* Column 1: Markets (Left) */}
          <div className="lg:col-span-3 xl:col-span-2 flex flex-col gap-3 min-h-[400px] lg:min-h-0 h-auto lg:h-full lg:overflow-hidden">
            <div className="p-4 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col gap-3 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Markets</span>
                <button onClick={fetchInitialTokens} disabled={loading} className="text-zinc-600 hover:text-wave-cyan transition-colors">
                  <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
                </button>
              </div>
              
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-700" size={14} />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..." 
                  className="bg-white/5 border border-white/5 rounded-xl py-2 pl-9 pr-4 w-full focus:outline-none focus:border-wave-cyan/20 transition-all font-bold text-[10px] placeholder:text-zinc-800 uppercase"
                />
              </form>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-1">
              {loading || isSearching ? (
                Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-14 rounded-xl bg-white/[0.01] border border-white/5 animate-pulse" />
                ))
              ) : (
                <>
                  {featuredTokens.map((token) => (
                      <div
                        key={`feat-${token.pairAddress}`}
                        onClick={() => setSelectedToken(token)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between group ${
                          selectedToken?.pairAddress === token.pairAddress 
                            ? 'bg-wave-cyan/10 border-wave-cyan/20' 
                            : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={getTokenImageUrl(token.baseToken.address, token.info?.imageUrl)} className="w-7 h-7 rounded-lg object-cover bg-zinc-900" alt="" />
                          <div className="min-w-0">
                            <div className="font-black text-[10px] text-white uppercase tracking-tight truncate">{token.baseToken.symbol}</div>
                            <div className={`text-[8px] font-black ${token.priceChange.h24 >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {token.priceChange.h24 >= 0 ? '+' : ''}{token.priceChange.h24}%
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 font-mono text-[10px] text-white">
                          ${parseFloat(token.priceUsd) === 0 ? '0.00' : parseFloat(token.priceUsd) < 0.01 ? parseFloat(token.priceUsd).toFixed(8) : parseFloat(token.priceUsd).toLocaleString()}
                        </div>
                      </div>
                  ))}
                  
                  <div className="h-px bg-white/5 my-2" />
                  
                  {tokens.filter(t => !featuredTokens.some(ft => ft.baseToken.address === t.baseToken.address)).map((token) => (
                      <div
                        key={token.pairAddress}
                        onClick={() => setSelectedToken(token)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 flex items-center justify-between group ${
                          selectedToken?.pairAddress === token.pairAddress 
                            ? 'bg-white/10 border-white/20' 
                            : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <img src={getTokenImageUrl(token.baseToken.address, token.info?.imageUrl)} className="w-7 h-7 rounded-lg object-cover bg-zinc-900 opacity-60" alt="" />
                          <div className="min-w-0">
                            <div className="font-bold text-[10px] text-zinc-400 group-hover:text-white uppercase tracking-tight truncate">{token.baseToken.symbol}</div>
                            <div className={`text-[8px] font-black ${token.priceChange.h24 >= 0 ? 'text-green-500/50' : 'text-red-500/50'}`}>
                              {token.priceChange.h24 >= 0 ? '+' : ''}{token.priceChange.h24}%
                            </div>
                          </div>
                        </div>
                        <div className="text-right shrink-0 font-mono text-[10px] text-zinc-500">
                          ${parseFloat(token.priceUsd) === 0 ? '0.00' : parseFloat(token.priceUsd) < 0.01 ? parseFloat(token.priceUsd).toFixed(8) : parseFloat(token.priceUsd).toLocaleString()}
                        </div>
                      </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Column 2: Chart & Trades (Center) */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-3 h-auto lg:h-full min-h-0 order-first lg:order-none overflow-hidden">
             {selectedToken ? (
               <>
                 <div className="shrink-0 flex flex-col md:flex-row md:items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-3xl gap-4">
                  <div className="flex items-center gap-4">
                       <div className="flex items-center gap-3">
                          <img src={getTokenImageUrl(selectedToken.baseToken.address, selectedToken.info?.imageUrl)} className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-zinc-900 border border-white/10" alt="" />
                          <div>
                             <div className="flex items-center gap-2">
                                <h1 className="text-sm md:text-base font-black text-white uppercase tracking-widest truncate max-w-[100px] md:max-w-none">{selectedToken.baseToken.name}</h1>
                                <span className="text-[8px] md:text-[10px] font-mono text-zinc-600 bg-white/5 px-1 md:px-1.5 py-0.5 rounded uppercase">{selectedToken.baseToken.symbol}/SOL</span>
                             </div>
                             <div className="flex items-center gap-2 mt-1">
                                <span className="text-[8px] md:text-[9px] font-mono text-zinc-700 truncate max-w-[80px] md:max-w-none">{selectedToken.baseToken.address}</span>
                                <ExternalLink size={10} className="text-zinc-800 hover:text-wave-cyan cursor-pointer shrink-0" />
                             </div>
                          </div>
                       </div>
                       
                       <div className="hidden md:flex items-center gap-8 border-l border-white/5 pl-8">
                          <div>
                             <div className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-0.5">Price (USD)</div>
                             <div className="text-sm font-black text-wave-cyan font-mono">
                               ${parseFloat(selectedToken.priceUsd) < 0.0001 ? parseFloat(selectedToken.priceUsd).toFixed(8) : parseFloat(selectedToken.priceUsd).toLocaleString()}
                             </div>
                          </div>
                          <div>
                             <div className="text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-0.5">24H Change</div>
                             <div className={`text-sm font-black font-mono ${selectedToken.priceChange.h24 >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                               {selectedToken.priceChange.h24 >= 0 ? '+' : ''}{selectedToken.priceChange.h24}%
                             </div>
                          </div>
                       </div>
                  </div>
                     <div className="flex items-center gap-2">
                       <div className="flex items-center md:flex-col md:items-end justify-between md:justify-center">
                         <div className="text-[8px] md:text-[9px] font-black text-zinc-700 uppercase tracking-widest mb-0.5">24H Volume</div>
                         <div className="text-xs md:text-sm font-black text-white font-mono">${(selectedToken.volume.h24 || 0).toLocaleString()}</div>
                       </div>
                         <div className="flex bg-white/5 rounded-xl p-0.5 ml-2">
                           <button 
                             onClick={() => setActiveView('chart')}
                             className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'chart' ? 'bg-wave-cyan text-wave-deep' : 'text-zinc-600 hover:text-white'}`}
                           >
                             Chart
                           </button>
                           <button 
                             onClick={() => setActiveView('info')}
                             className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeView === 'info' ? 'bg-wave-cyan text-wave-deep' : 'text-zinc-600 hover:text-white'}`}
                           >
                             Info
                           </button>
                         </div>
                       </div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-3 min-h-0">
                      <AnimatePresence mode="wait">
                          {activeView === 'chart' ? (
                            <motion.div
                              key="chart"
                              initial={{ opacity: 0, scale: 0.98 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.98 }}
                              transition={{ duration: 0.2 }}
                              className="w-full"
                            >
                              <div className="bg-white/[0.01] border border-white/5 rounded-[2.5rem] overflow-hidden relative shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] w-full">
                                <TerminalChart pairAddress={selectedToken.pairAddress} />
                              </div>
                            </motion.div>
                          ) : (
                          <motion.div
                            key="info"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 shrink-0 overflow-hidden"
                          >
                             <div className="bg-white/[0.02] border border-white/5 rounded-2xl md:rounded-3xl p-3 md:p-5 flex items-center gap-3 md:gap-4 group hover:border-wave-cyan/20 transition-all">
                               <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-green-500/10 flex items-center justify-center shrink-0">
                                 <ShieldCheck size={16} className="text-green-500" />
                               </div>
                               <div className="min-w-0">
                                 <div className="text-[8px] md:text-[10px] font-black text-zinc-700 uppercase tracking-widest mb-0.5 md:mb-1">Health</div>
                                 <div className="text-xs md:text-lg font-black text-white uppercase truncate">Rug-Safe</div>
                               </div>
                             </div>
         
                             <div className="bg-white/[0.02] border border-white/5 rounded-2xl md:rounded-3xl p-3 md:p-5 flex items-center gap-3 md:gap-4 group hover:border-wave-cyan/20 transition-all">
                               <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-wave-cyan/10 flex items-center justify-center shrink-0">
                                 <Activity size={16} className="text-wave-cyan" />
                               </div>
                               <div className="min-w-0">
                                 <div className="text-[8px] md:text-[10px] font-black text-zinc-700 uppercase tracking-widest mb-0.5 md:mb-1">Liquidity</div>
                                 <div className="text-xs md:text-lg font-black text-white font-mono truncate">${(selectedToken.liquidity?.usd || 0).toLocaleString()}</div>
                               </div>
                             </div>
         
                             <div className="col-span-2 md:col-span-1 bg-white/[0.02] border border-white/5 rounded-2xl md:rounded-3xl p-3 md:p-5 flex items-center gap-3 md:gap-4 group hover:border-wave-cyan/20 transition-all">
                               <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                                 <Zap size={16} className="text-purple-500" />
                               </div>
                               <div className="min-w-0">
                                 <div className="text-[8px] md:text-[10px] font-black text-zinc-700 uppercase tracking-widest mb-0.5 md:mb-1">Market Cap</div>
                                 <div className="text-xs md:text-lg font-black text-white font-mono truncate">${(selectedToken.marketCap || selectedToken.fdv || 0).toLocaleString()}</div>
                               </div>
                             </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                  <div className="flex-1 min-h-[400px] bg-white/[0.02] border border-white/5 rounded-3xl p-5 flex flex-col gap-4 overflow-hidden shrink-0 hidden md:flex ">

                   <div className="flex items-center justify-between shrink-0">
                     <span className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                       <Activity size={12} className="text-wave-cyan" />
                       Recent Trades
                     </span>
                     <div className="flex gap-12 pr-4">
                       <span className="text-[9px] font-black text-zinc-700 uppercase">Time</span>
                       <span className="text-[9px] font-black text-zinc-700 uppercase">Size</span>
                       <span className="text-[9px] font-black text-zinc-700 uppercase">Price</span>
                     </div>
                   </div>
                   <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
                     {Array.from({ length: 15 }).map((_, i) => {
                       const isBuy = Math.random() > 0.4;
                       return (
                         <div key={i} className="flex items-center justify-between text-[11px] font-mono group hover:bg-white/5 p-2 rounded-xl transition-all border border-transparent hover:border-white/5">
                           <span className="text-zinc-600 w-20">14:02:{20 + i}</span>
                           <span className={`flex-1 font-black ${isBuy ? 'text-green-400' : 'text-red-400'}`}>
                             {isBuy ? 'BUY' : 'SELL'} {(Math.random() * 5 + 0.1).toFixed(2)} SOL
                           </span>
                           <span className="text-zinc-400 w-24 text-right">
                             ${parseFloat(selectedToken.priceUsd) < 0.0001 ? parseFloat(selectedToken.priceUsd).toFixed(8) : parseFloat(selectedToken.priceUsd).toLocaleString()}
                           </span>
                         </div>
                       );
                     })}
                     </div>
                  </div>
                </div>
              </>
            ) : (
            <div className="flex-1 flex items-center justify-center bg-white/[0.01] border border-white/5 rounded-3xl">
               <div className="text-center">
                  <BarChart3 size={32} className="text-zinc-800 mx-auto mb-3" />
                  <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">Initialize Terminal</p>
               </div>
            </div>
          )}
       </div>

            {/* Column 3: Swap & Order Book (Right) */}
            <div className="lg:col-span-3 xl:col-span-3 flex flex-col gap-3 min-h-0 lg:h-full lg:overflow-y-auto lg:custom-scrollbar lg:pr-1 pb-10 lg:pb-0">
                <div className="shrink-0 origin-top">
                <Swap 
                  key={selectedToken?.baseToken.address} 
                  initialOutputMint={selectedToken?.baseToken.address} 
                  onTokenSelect={(token) => setSelectedToken(token)}
                />
              </div>

              {selectedToken && (
                <div className="flex flex-col gap-3 shrink-0 lg:min-h-[950px]">
                  <OrderBook token={selectedToken} />

              <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-4 shrink-0 grid grid-cols-2 gap-2">

              <div className="p-2 rounded-xl bg-white/[0.01] border border-white/5">
                <div className="text-[7px] font-black text-zinc-700 uppercase tracking-widest mb-0.5">Market Cap</div>
                <div className="text-[10px] font-black text-white">${(selectedToken.marketCap || selectedToken.fdv || 0).toLocaleString()}</div>
              </div>
              <div className="p-2 rounded-xl bg-white/[0.01] border border-white/5">
                <div className="text-[7px] font-black text-zinc-700 uppercase tracking-widest mb-0.5">Liquidity</div>
                <div className="text-[10px] font-black text-white">${selectedToken.liquidity.usd.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </main>
    </div>
  );
}
