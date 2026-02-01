'use client';

import { Lock, Wallet, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface LockedOverlayProps {
  requiredBalance: number;
  currentBalance: number | null;
  isLoading: boolean;
}

export function LockedOverlay({ requiredBalance, currentBalance, isLoading }: LockedOverlayProps) {
  return (
    <div className="flex flex-col items-center justify-center py-32 px-4 rounded-[3rem] bg-white/[0.01] border border-white/5 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-wave-cyan/5 blur-[120px] pointer-events-none opacity-50" />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 rounded-3xl bg-wave-cyan/5 border border-wave-cyan/20 flex items-center justify-center text-wave-cyan mb-8 relative z-10"
      >
        <Lock size={40} className="animate-pulse" />
      </motion.div>

      <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-6 relative z-10">
        Access <span className="text-wave-cyan">Restricted</span>
      </h2>
      
      <p className="text-zinc-500 max-w-md mb-10 font-medium text-lg leading-relaxed relative z-10">
        This high-performance tool is reserved for $WAVE believers. 
        Hold at least <span className="text-white font-bold">{requiredBalance.toLocaleString()} $WAVE</span> to unlock full terminal capabilities.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10">
        <Link 
          href="/" 
          className="flex items-center gap-2 px-8 py-4 bg-wave-cyan text-wave-deep font-black rounded-xl text-xs hover:brightness-110 transition-all shadow-xl shadow-wave-cyan/10"
        >
          GET $WAVE
          <ArrowRight size={14} />
        </Link>
        
        <div className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-zinc-400">
          Your Balance: <span className="text-white">{isLoading ? '...' : (currentBalance?.toLocaleString() || '0')} $WAVE</span>
        </div>
      </div>

      <div className="mt-12 flex items-center gap-2 text-[10px] font-black text-zinc-700 uppercase tracking-widest relative z-10">
        <div className="w-1 h-1 rounded-full bg-wave-cyan" />
        Conviction Proof Required
      </div>
    </div>
  );
}
