'use client';

import { Navbar } from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, Zap, Trophy, Flame, Anchor } from 'lucide-react';

const steps = [
  {
    icon: <Zap className="text-wave-cyan" size={32} />,
    title: "1. Pick Your Wave",
    description: "Browse the Terminal for trending tokens or join an active Contest. Each contest focuses on a specific high-conviction token."
  },
  {
    icon: <Anchor className="text-wave-cyan" size={32} />,
    title: "2. Lock Your Conviction",
    description: "Buy the token through WaveDex. Your entry is timestamped, and your 'Conviction Score' starts growing from the second you hold."
  },
  {
    icon: <Shield className="text-wave-cyan" size={32} />,
    title: "3. Diamond Hands Only",
    description: "Selling even a single token disqualifies you from the contest. To win, you must hold through the volatility."
  },
  {
    icon: <TrendingUp className="text-wave-cyan" size={32} />,
    title: "4. Provide Liquidity",
    description: "Boost your score by providing liquidity on Meteora. Our system tracks DLMM positions and rewards LP providers with 2x multipliers."
  },
  {
    icon: <Trophy className="text-wave-cyan" size={32} />,
    title: "5. Win Rewards",
    description: "At the end of the contest, the users with the highest Conviction Scores share the prize pool and earn exclusive badges."
  }
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-wave-cyan selection:text-wave-deep">
      <Navbar />
      
      <main className="container mx-auto pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-20"
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase italic">
              Ride the <span className="text-wave-cyan">Wave</span>
            </h1>
            <p className="text-zinc-500 text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed">
              WaveDex isn't just a DEX. It's a conviction-based arena where the strongest hands win.
            </p>
          </motion.div>

          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col md:flex-row items-center gap-8 p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-wave-cyan/30 transition-all group"
              >
                <div className="w-20 h-20 shrink-0 rounded-2xl bg-wave-cyan/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  {step.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-3 text-white">{step.title}</h3>
                  <p className="text-zinc-400 text-lg leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="mt-24 p-12 rounded-[3rem] bg-gradient-to-br from-wave-cyan/20 to-transparent border border-wave-cyan/20 text-center relative overflow-hidden"
          >
            <Flame className="absolute -top-10 -right-10 text-wave-cyan/10" size={300} />
            <h2 className="text-4xl font-black mb-6 relative z-10 italic uppercase">Ready to prove your conviction?</h2>
            <p className="text-zinc-300 text-lg mb-10 relative z-10 max-w-xl mx-auto">
              Join thousands of traders competing for the top of the leaderboard. No paper hands allowed.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
              <a href="/tokens" className="w-full sm:w-auto px-10 py-4 bg-wave-cyan text-wave-deep font-black rounded-full hover:scale-105 transition-all text-center">
                ENTER TERMINAL
              </a>
              <a href="/contests" className="w-full sm:w-auto px-10 py-4 bg-white/5 border border-white/10 text-white font-black rounded-full hover:bg-white/10 transition-all text-center">
                VIEW CONTESTS
              </a>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
