'use client';

import { useParams } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { useEffect, useState, use } from 'react';
import { supabase } from '@/lib/supabase';
import { getTokenData, DexPair } from '@/lib/dexscreener';
import { motion } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { 
  Trophy, 
  Users, 
  Timer, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowUpRight,
  Droplets,
  Coins
} from 'lucide-react';
import { connection } from '@/lib/solana';
import { PublicKey } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress } from '@solana/spl-token';

export default function ContestDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const { publicKey, connected } = useWallet();
  
  const [contest, setContest] = useState<any>(null);
  const [tokenData, setTokenData] = useState<DexPair | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [userParticipant, setUserParticipant] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: contestData } = await supabase
        .from('contests')
        .select('*')
        .eq('id', id)
        .single();

      if (contestData) {
        setContest(contestData);
        const tData = await getTokenData(contestData.token_address);
        setTokenData(tData);

        // Fetch participants
        const { data: participantsData } = await supabase
          .from('participants')
          .select('*')
          .eq('contest_id', id)
          .order('conviction_score', { ascending: false });
        
        setParticipants(participantsData || []);

        if (publicKey) {
          const userPart = participantsData?.find(p => p.wallet_address === publicKey.toBase58());
          setUserParticipant(userPart || null);
        }
      }
      setLoading(false);
    }

    fetchData();
    
    // Subscribe to realtime updates for participants
    const channel = supabase
      .channel(`contest-${id}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'participants',
        filter: `contest_id=eq.${id}`
      }, (payload) => {
        // Refresh participants list on change
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, publicKey]);

  async function joinContest() {
    if (!publicKey || !contest) return;
    setJoining(true);
    
    try {
      // Fetch current token balance
      const tokenMint = new PublicKey(contest.token_address);
      const ata = await getAssociatedTokenAddress(tokenMint, publicKey);
      let balance = 0;
      
      try {
        const account = await getAccount(connection, ata);
        balance = Number(account.amount) / Math.pow(10, 9); // Assuming 9 decimals for Solana tokens usually
      } catch (e) {
        console.error("No token account found or error fetching balance", e);
      }

      const { data, error } = await supabase
        .from('participants')
        .insert({
          contest_id: contest.id,
          wallet_address: publicKey.toBase58(),
          initial_balance: balance,
          current_balance: balance,
          conviction_score: 0
        })
        .select()
        .single();

      if (error) throw error;
      setUserParticipant(data);
    } catch (error) {
      console.error('Error joining contest:', error);
      alert('Failed to join. Make sure you hold the token!');
    } finally {
      setJoining(false);
    }
  }

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-wave-cyan">LOADING...</div>;
  if (!contest) return <div className="min-h-screen bg-black flex items-center justify-center">Contest not found</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      <main className="container mx-auto pt-32 pb-20 px-6">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
                <div className="flex items-center gap-6 mb-8">
                  {tokenData?.info?.imageUrl ? (
                    <img src={tokenData.info.imageUrl} alt="" className="w-24 h-24 rounded-3xl border-2 border-wave-cyan/20" />
                  ) : (
                    <div className="w-24 h-24 rounded-3xl bg-wave-cyan/10 flex items-center justify-center text-wave-cyan font-black text-4xl">
                      {contest.token_symbol?.[0]}
                    </div>
                  )}
                  <div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-2">{contest.token_name}</h1>
                    <div className="flex flex-wrap items-center gap-4">
                      <span className="px-3 py-1 bg-wave-cyan/10 text-wave-cyan text-sm font-bold rounded-full border border-wave-cyan/20">
                        {contest.token_symbol}
                      </span>
                      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5">
                        <span className="text-zinc-500 font-mono text-xs">{contest.token_address}</span>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(contest.token_address);
                            toast.success('Address copied to clipboard!');
                          }}
                          className="text-wave-cyan hover:text-white transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

              <p className="text-zinc-400 text-xl leading-relaxed max-w-2xl mb-12">
                {contest.description || "The ultimate conviction challenge. Hold your position, earn points, and climb the leaderboard. One sell = Disqualified."}
              </p>

              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  { label: "Prize Pool", value: `$${contest.prize_pool?.toLocaleString()}`, icon: <Trophy className="text-wave-cyan" /> },
                  { label: "Ends In", value: "3d 12h", icon: <Timer className="text-wave-cyan" /> },
                  { label: "Participants", value: participants.length.toString(), icon: <Users className="text-wave-cyan" /> }
                ].map((stat, i) => (
                  <div key={i} className="p-6 rounded-3xl bg-white/5 border border-white/10">
                    <div className="mb-4">{stat.icon}</div>
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mb-1">{stat.label}</p>
                    <p className="text-2xl font-black">{stat.value}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Leaderboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl border border-white/10 bg-white/[0.02] overflow-hidden"
            >
              <div className="p-8 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-2xl font-black tracking-tight">LEADERBOARD</h2>
                <div className="flex items-center gap-2 text-wave-cyan text-sm font-bold">
                  <Droplets size={16} />
                  LIVE UPDATES
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-zinc-500 text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                      <th className="px-8 py-6">Rank</th>
                      <th className="px-8 py-6">Wallet</th>
                      <th className="px-8 py-6">Holdings</th>
                      <th className="px-8 py-6 text-right">Conviction Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.length > 0 ? participants.map((p, i) => (
                      <tr key={p.id} className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors ${p.wallet_address === publicKey?.toBase58() ? 'bg-wave-cyan/5' : ''}`}>
                        <td className="px-8 py-6">
                          <span className={`flex items-center justify-center w-8 h-8 rounded-full font-black text-xs ${i === 0 ? 'bg-yellow-500 text-black' : i === 1 ? 'bg-zinc-300 text-black' : i === 2 ? 'bg-amber-600 text-black' : 'bg-white/10'}`}>
                            {i + 1}
                          </span>
                        </td>
                        <td className="px-8 py-6 font-mono text-sm">
                          {p.wallet_address.slice(0, 4)}...{p.wallet_address.slice(-4)}
                        </td>
                        <td className="px-8 py-6 font-bold">
                          {Number(p.current_balance).toLocaleString()} {contest.token_symbol}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className="text-wave-cyan font-black text-xl">{Math.floor(p.conviction_score)}</span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={4} className="px-8 py-12 text-center text-zinc-500 font-bold">
                          No participants yet. Be the first to join!
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Sidebar / Join Card */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-8 rounded-3xl bg-wave-cyan text-wave-deep border border-wave-cyan shadow-[0_0_50px_rgba(0,245,212,0.15)] sticky top-32"
            >
              <h3 className="text-3xl font-black mb-6 leading-tight">YOUR<br />CONVICTION</h3>
              
              {userParticipant ? (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-black/10 border border-black/5">
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Your Score</p>
                    <p className="text-5xl font-black">{Math.floor(userParticipant.conviction_score)}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="opacity-60">Status</span>
                      <span className="flex items-center gap-1">
                        {userParticipant.is_disqualified ? (
                          <><ShieldAlert size={16} /> Disqualified</>
                        ) : (
                          <><CheckCircle2 size={16} /> Active</>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm font-bold">
                      <span className="opacity-60">Rank</span>
                      <span>#{participants.findIndex(p => p.wallet_address === publicKey?.toBase58()) + 1}</span>
                    </div>
                  </div>
                  {userParticipant.is_disqualified && (
                    <div className="p-4 rounded-xl bg-red-500/20 text-red-950 text-xs font-bold border border-red-500/20">
                      Disqualified: {userParticipant.disqualification_reason}
                    </div>
                  )}
                  <button className="w-full py-4 bg-wave-deep text-wave-cyan font-black rounded-2xl hover:scale-105 transition-all">
                    ADD TO POSITION
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <p className="font-bold opacity-80 leading-relaxed">
                    Join now to start earning conviction points. Remember: never sell!
                  </p>
                  <div className="p-6 rounded-2xl bg-black/10 border border-black/5 space-y-4">
                    <div className="flex items-center gap-3">
                      <Coins size={20} />
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Required Token</p>
                        <p className="font-bold">{contest.token_symbol}</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={joinContest}
                    disabled={joining || !connected}
                    className="w-full py-4 bg-wave-deep text-wave-cyan font-black rounded-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100"
                  >
                    {joining ? "JOINING..." : !connected ? "CONNECT WALLET" : "JOIN CONTEST"}
                  </button>
                </div>
              )}
            </motion.div>

            {/* Token Info */}
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-6">
              <h4 className="text-sm font-black text-zinc-500 uppercase tracking-widest">Market Stats</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 text-sm font-bold">Price</span>
                  <span className="font-black">${tokenData?.priceUsd || "---"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 text-sm font-bold">24h Vol</span>
                  <span className="font-black">${tokenData?.volume.h24.toLocaleString() || "---"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-500 text-sm font-bold">Liquidity</span>
                  <span className="font-black">${tokenData?.liquidity.usd.toLocaleString() || "---"}</span>
                </div>
              </div>
              <a 
                href={`https://dexscreener.com/solana/${contest.token_address}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all"
              >
                VIEW ON DEXSCREENER <ArrowUpRight size={14} />
              </a>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
