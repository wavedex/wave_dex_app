'use client';

import { motion } from 'framer-motion';
import { Activity, Zap, Flame, BadgeCheck, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function InfoBar() {
  const [trending, setTrending] = useState<any[]>([]);
  const [marketStats, setMarketStats] = useState({
    tps: '2,840',
    volume24h: '1.2B',
  });

  useEffect(() => {
    async function fetchTrending() {
      const { data } = await supabase
        .from('tokens')
        .select('*')
        .eq('is_listed', true)
        .order('is_featured', { ascending: false })
        .limit(10);
      
      if (data && data.length > 0) {
        setTrending(data);
      } else {
        // Fallback trending if DB is empty or during load
        setTrending([
          { symbol: 'TRUMP', is_featured: true },
          { symbol: 'WHALE', is_featured: true },
          { symbol: 'AI16Z', is_featured: true },
          { symbol: 'BONK', is_featured: true },
          { symbol: 'WIF', is_featured: true },
        ]);
      }
    }
    fetchTrending();

    const interval = setInterval(() => {
      setMarketStats(prev => ({
        ...prev,
        tps: (Math.random() * (3500 - 2800) + 2800).toFixed(0)
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#050505] border-b border-white/5 h-10 flex items-center overflow-hidden z-[80] relative">
      {/* Label */}
      <div className="h-full px-4 flex items-center gap-2 bg-wave-cyan/10 border-r border-white/5 shrink-0 z-10 relative">
        <Flame size={12} className="text-wave-cyan animate-pulse" />
        <span className="text-[9px] font-black text-wave-cyan uppercase tracking-[0.2em]">Trending</span>
      </div>

      {/* Ticker Container */}
      <div className="flex-1 h-full overflow-hidden relative bg-white/[0.01]">
        <div className="flex items-center h-full animate-marquee hover:pause-animation">
          {/* Loop 1 */}
          <div className="flex items-center gap-8 px-4">
            {trending.map((token, i) => (
              <div key={`t1-${i}`} className="flex items-center gap-2 group cursor-pointer hover:bg-white/5 px-2 py-1 rounded-md transition-all">
                <span className="text-[9px] font-black text-zinc-700 uppercase">#{i + 1}</span>
                <span className="text-[10px] font-black text-white uppercase tracking-tight group-hover:text-wave-cyan">{token.symbol}</span>
                {token.is_featured && <BadgeCheck size={10} className="text-wave-cyan" />}
                <span className="text-[10px] font-mono text-green-500 font-bold">
                  +{(Math.random() * 12 + 2).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
          {/* Loop 2 (Seamless) */}
          <div className="flex items-center gap-8 px-4">
            {trending.map((token, i) => (
              <div key={`t2-${i}`} className="flex items-center gap-2 group cursor-pointer hover:bg-white/5 px-2 py-1 rounded-md transition-all">
                <span className="text-[9px] font-black text-zinc-700 uppercase">#{i + 1}</span>
                <span className="text-[10px] font-black text-white uppercase tracking-tight group-hover:text-wave-cyan">{token.symbol}</span>
                {token.is_featured && <BadgeCheck size={10} className="text-wave-cyan" />}
                <span className="text-[10px] font-mono text-green-500 font-bold">
                  +{(Math.random() * 12 + 2).toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Stats */}
      <div className="hidden md:flex items-center gap-6 px-6 h-full bg-[#050505] border-l border-white/5 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <Activity size={12} className="text-wave-cyan" />
          <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{marketStats.tps} TPS</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap size={12} className="text-zinc-700" />
          <span className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">JUP V6</span>
        </div>
      </div>

      <style jsx>{`
        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 30s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .hover\:pause-animation:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
