'use client';

import { Navbar } from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, Trophy, Zap, Droplets, Target, Rocket, Layers, BarChart3, Lock } from 'lucide-react';

export default function DocsPage() {
  const roadmap = [
    {
      phase: "Phase 1: Genesis",
      items: ["DEX Terminal Launch", "Initial Token Listings", "Trading Contests System"],
      status: "Active"
    },
    {
      phase: "Phase 2: Growth",
      items: ["Advanced Volume Bot", "Global Leaderboard", "Token Burn Mechanism"],
      status: "Coming Soon"
    },
    {
      phase: "Phase 3: Utility",
      items: ["Staking Protocol", "Tiered Listing System", "Partner Integrations"],
      status: "Development"
    },
    {
      phase: "Phase 4: Expansion",
      items: ["Multi-chain Support", "Institutional API", "WaveDex DAO"],
      status: "Planned"
    }
  ];

  const tokenomics = [
    { label: "Liquidity Pool", value: "100% BURNED", color: "text-red-500" },
    { label: "Total Supply", value: "1,000,000,000", color: "text-white" },
    { label: "Security", value: "Revoked & Mint Authority Disabled", color: "text-green-500" }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400">
      <Navbar />
      
      <main className="pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-16 text-center"
          >
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter italic">
              Wave<span className="text-wave-cyan">Docs</span>
            </h1>
            <p className="text-zinc-500 font-medium max-w-xl mx-auto">
              Comprehensive guide to the WaveDex ecosystem, roadmap, and tokenomics.
            </p>
          </motion.div>

          {/* Tokenomics Section */}
          <section className="mb-24">
            <div className="flex items-center gap-3 mb-8">
              <BarChart3 className="text-wave-cyan" size={24} />
              <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Tokenomics</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {tokenomics.map((item, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                  <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">{item.label}</div>
                  <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Roadmap Section */}
          <section className="mb-24">
            <div className="flex items-center gap-3 mb-8">
              <Target className="text-wave-cyan" size={24} />
              <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Project Roadmap</h2>
            </div>
            <div className="space-y-4">
              {roadmap.map((phase, i) => (
                <div key={i} className="relative p-8 rounded-3xl bg-white/[0.02] border border-white/5 overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                      phase.status === 'Active' ? 'bg-wave-cyan/10 text-wave-cyan' : 'bg-white/5 text-zinc-600'
                    }`}>
                      {phase.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-white mb-6 uppercase tracking-widest group-hover:text-wave-cyan transition-colors">{phase.phase}</h3>
                  <ul className="space-y-3">
                    {phase.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-3 text-sm font-medium text-zinc-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-wave-cyan/30" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Ecosystem Grid */}
          <section>
             <div className="flex items-center gap-3 mb-8">
              <Layers className="text-wave-cyan" size={24} />
              <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Core Features</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { icon: <Zap size={20} />, title: "Ultra Trading", desc: "Low-latency Jupiter V6 integration with smart routing for best price execution." },
                { icon: <Shield size={20} />, title: "Conviction Scoring", desc: "Algorithmically verified on-chain holding scoring system." },
                { icon: <Lock size={20} />, title: "Staking (V2)", desc: "Lock tokens to earn platform fees and exclusive contest multipliers." },
                { icon: <Droplets size={20} />, title: "Liquidity Tools", desc: "Native support for Meteora and Orca liquidity management." }
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/[0.01] border border-white/5 flex gap-4">
                  <div className="p-3 rounded-xl bg-wave-cyan/10 text-wave-cyan h-fit">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-sm text-zinc-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      <footer className="py-20 text-center border-t border-white/5">
        <div className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">WaveDex Professional Documentation</div>
      </footer>
    </div>
  );
}
