'use client';

import { Navbar } from '@/components/Navbar';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Timer, Users, Trophy, ArrowRight, Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { getSolanaTokenData, DexPair } from '@/lib/dexscreener';

interface ContestWithToken extends any {
  tokenData?: DexPair;
}

export default function ContestsPage() {
  const [contests, setContests] = useState<ContestWithToken[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchContests() {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        // Fetch token data for each contest
        const tokenAddresses = data.map(c => c.token_address);
        const tokenDataResponse = await getSolanaTokenData(tokenAddresses);
        
        const enhancedContests = data.map(contest => ({
          ...contest,
          tokenData: tokenDataResponse.pairs.find(p => p.baseToken.address === contest.token_address)
        }));
        
        setContests(enhancedContests);
      }
      setLoading(false);
    }

    fetchContests();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="container mx-auto pt-32 pb-20 px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
              ACTIVE <span className="text-wave-cyan italic">CONTESTS</span>
            </h1>
            <p className="text-zinc-500 text-lg">Filter by token or volume. Prove your conviction.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-wave-cyan transition-colors" size={20} />
              <input 
                type="text" 
                placeholder="Search token address..." 
                className="bg-white/5 border border-white/10 rounded-full py-3 pl-12 pr-6 w-full md:w-80 focus:outline-none focus:border-wave-cyan/50 transition-all"
              />
            </div>
            <Link 
              href="/create" 
              className="flex items-center gap-2 px-6 py-3 bg-white text-black font-black rounded-full hover:scale-105 transition-all whitespace-nowrap"
            >
              <Plus size={20} />
              CREATE
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 rounded-3xl bg-white/5 border border-white/10 animate-pulse" />
            ))}
          </div>
        ) : contests.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {contests.map((contest, i) => (
              <motion.div
                key={contest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="group p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-wave-cyan/50 hover:bg-white/[0.08] transition-all flex flex-col"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                    {contest.tokenData?.info?.imageUrl ? (
                      <img src={contest.tokenData.info.imageUrl} alt="" className="w-14 h-14 rounded-full border-2 border-wave-cyan/20" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-wave-cyan/10 flex items-center justify-center text-wave-cyan font-black text-xl">
                        {contest.token_symbol?.[0] || 'T'}
                      </div>
                    )}
                    <div>
                      <h3 className="text-2xl font-bold">{contest.token_name || 'Token'}</h3>
                      <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">{contest.token_symbol || 'TOKEN'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-wave-cyan font-black text-xl">${contest.prize_pool?.toLocaleString()}</p>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Prize Pool</p>
                  </div>
                </div>

                <div className="space-y-4 mb-8 flex-grow">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5">
                    <div className="flex items-center gap-3">
                      <Users size={18} className="text-zinc-500" />
                      <span className="text-sm font-bold text-zinc-400">Participants</span>
                    </div>
                    <span className="font-black">124</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5">
                    <div className="flex items-center gap-3">
                      <Timer size={18} className="text-zinc-500" />
                      <span className="text-sm font-bold text-zinc-400">Ends in</span>
                    </div>
                    <span className="font-black text-wave-cyan">3d 12h</span>
                  </div>
                </div>

                <Link 
                  href={`/contests/${contest.id}`}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-wave-cyan text-wave-deep font-black rounded-2xl group-hover:scale-[1.02] transition-all"
                >
                  JOIN CONTEST
                  <ArrowRight size={20} />
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 px-8 rounded-3xl border border-dashed border-white/10">
            <Trophy size={64} className="mx-auto text-zinc-700 mb-6" />
            <h3 className="text-2xl font-bold mb-2">No Active Contests</h3>
            <p className="text-zinc-500 mb-8">Be the first to create a conviction challenge.</p>
            <Link 
              href="/create" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-black font-black rounded-full hover:scale-105 transition-all"
            >
              <Plus size={20} />
              CREATE CONTEST
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
