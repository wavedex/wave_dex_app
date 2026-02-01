'use client';

import { useEffect, useState } from 'react';
import { getSolanaTokenData, DexPair, getTokenImageUrl } from '@/lib/dexscreener';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Timer, ArrowUpRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const FEATURED_TOKENS = [
  
];

export function LiveContests() {
  const [tokens, setTokens] = useState<DexPair[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getSolanaTokenData(FEATURED_TOKENS);
      // Get unique pairs per token address
      const uniquePairs = data.pairs.filter((pair, index, self) => 
        index === self.findIndex((p) => p.baseToken.address === pair.baseToken.address)
      );
      setTokens(uniquePairs.slice(0, 3));
      setLoading(false);
    };
    fetchData();
    const interval = setInterval(fetchData, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) return (
    <div className="grid md:grid-cols-3 gap-6 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-64 rounded-3xl bg-white/5 border border-white/10" />
      ))}
    </div>
  );

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {tokens.map((token, i) => (
        <motion.div
          key={token.pairAddress}
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="group relative p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-wave-cyan/50 hover:bg-white/[0.08] transition-all overflow-hidden"
        >
          {/* Background Glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-wave-cyan/10 blur-[60px] rounded-full group-hover:bg-wave-cyan/20 transition-all" />
          
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-wave-cyan/30 bg-zinc-900">
                  <img 
                    src={getTokenImageUrl(token.baseToken.address, token.info?.imageUrl)} 
                    alt={token.baseToken.name} 
                    className="w-full h-full object-cover" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://avatar.vercel.sh/${token.baseToken.address}.png?text=${token.baseToken.symbol[0]}`;
                    }}
                  />
                </div>
                <div>
                <h4 className="text-xl font-bold text-white leading-tight">{token.baseToken.name}</h4>
                <p className="text-sm text-zinc-500 font-medium">{token.baseToken.symbol} / CONVICTION</p>
              </div>
            </div>
            <div className={`px-2 py-1 rounded-md text-xs font-bold ${token.priceChange.h24 >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
              {token.priceChange.h24 >= 0 ? '+' : ''}{token.priceChange.h24}%
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Prize Pool</p>
              <p className="text-lg font-black text-white">$10,000</p>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-white/5">
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Participants</p>
              <div className="flex items-center gap-1">
                <Users size={14} className="text-wave-cyan" />
                <p className="text-lg font-black text-white">428</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-400 text-sm">
              <Timer size={16} />
              <span>Ends in 4d 12h</span>
            </div>
            <Link 
              href={`/contests/${token.baseToken.address}`}
              className="flex items-center gap-1 text-wave-cyan font-bold hover:underline"
            >
              Details <ArrowUpRight size={16} />
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
