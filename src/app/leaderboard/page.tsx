'use client';

import { Navbar } from '@/components/Navbar';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, TrendingUp, Users, Droplets } from 'lucide-react';

export default function GlobalLeaderboardPage() {
  const [topParticipants, setTopParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      const { data, error } = await supabase
        .from('participants')
        .select('*, contests(title, token_symbol)')
        .eq('is_disqualified', false)
        .order('conviction_score', { ascending: false })
        .limit(20);

      if (data) {
        setTopParticipants(data);
      }
      setLoading(false);
    }

    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="container mx-auto pt-32 pb-20 px-6 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-wave-cyan/10 border border-wave-cyan/20 text-wave-cyan text-sm font-bold mb-6">
            <Crown size={16} />
            THE BRAVEST OF THE BRAVE
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4">
            GLOBAL <span className="text-wave-cyan italic">LEADERBOARD</span>
          </h1>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto">
            These wallets have shown the highest conviction across all active contests on WaveDex.
          </p>
        </motion.div>

        {/* Podium */}
        {!loading && topParticipants.length >= 3 && (
          <div className="grid md:grid-cols-3 gap-8 mb-16 items-end">
            {/* Rank 2 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center order-2 md:order-1 h-fit"
            >
              <div className="w-16 h-16 rounded-full bg-zinc-300 text-black flex items-center justify-center mx-auto mb-4 font-black text-xl">2</div>
              <p className="font-mono text-sm mb-2">{topParticipants[1].wallet_address.slice(0, 8)}...</p>
              <p className="text-wave-cyan font-black text-2xl">{Math.floor(topParticipants[1].conviction_score)}</p>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">Score</p>
            </motion.div>

            {/* Rank 1 */}
            <motion.div
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-10 rounded-3xl bg-wave-cyan text-wave-deep border border-wave-cyan text-center order-1 md:order-2 relative shadow-[0_0_50px_rgba(0,245,212,0.2)]"
            >
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 p-3 bg-yellow-400 rounded-full text-black shadow-lg">
                <Crown size={24} />
              </div>
              <div className="w-20 h-20 rounded-full bg-wave-deep text-wave-cyan flex items-center justify-center mx-auto mb-6 font-black text-3xl">1</div>
              <p className="font-mono text-lg font-bold mb-2">{topParticipants[0].wallet_address.slice(0, 8)}...</p>
              <p className="font-black text-4xl">{Math.floor(topParticipants[0].conviction_score)}</p>
              <p className="text-xs uppercase font-black tracking-widest mt-1 opacity-60">Ultimate Conviction</p>
            </motion.div>

            {/* Rank 3 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center order-3 h-fit"
            >
              <div className="w-16 h-16 rounded-full bg-amber-600 text-black flex items-center justify-center mx-auto mb-4 font-black text-xl">3</div>
              <p className="font-mono text-sm mb-2">{topParticipants[2].wallet_address.slice(0, 8)}...</p>
              <p className="text-wave-cyan font-black text-2xl">{Math.floor(topParticipants[2].conviction_score)}</p>
              <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mt-1">Score</p>
            </motion.div>
          </div>
        )}

        {/* Table */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden">
          <div className="p-8 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight">ALL-TIME RANKING</h2>
            <div className="flex items-center gap-2 text-wave-cyan text-sm font-bold">
              <Droplets size={16} />
              LIVE DATA
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-zinc-500 text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                  <th className="px-8 py-6">Rank</th>
                  <th className="px-8 py-6">Wallet</th>
                  <th className="px-8 py-6">Active Contest</th>
                  <th className="px-8 py-6 text-right">Conviction Score</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={4} className="px-8 py-6 h-16 bg-white/[0.02]"></td>
                    </tr>
                  ))
                ) : topParticipants.map((p, i) => (
                  <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                    <td className="px-8 py-6">
                      <span className="font-black text-zinc-500">#{i + 1}</span>
                    </td>
                    <td className="px-8 py-6 font-mono text-sm">
                      {p.wallet_address.slice(0, 6)}...{p.wallet_address.slice(-6)}
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{p.contests?.title}</span>
                        <span className="text-[10px] bg-wave-cyan/10 text-wave-cyan px-2 py-0.5 rounded-full font-black">{p.contests?.token_symbol}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-wave-cyan font-black text-xl">{Math.floor(p.conviction_score).toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
