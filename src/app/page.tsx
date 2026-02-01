'use client';

import { Navbar } from '@/components/Navbar';
import { LiveContests } from '@/components/LiveContests';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, Trophy, Zap, ArrowRight, Waves, ArrowUpRight, BarChart3, Wallet, Copy, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Swap } from '@/components/Swap';
import { useState } from 'react';
import { toast } from 'sonner';
import { useWaveAccess } from '@/hooks/useWaveAccess';
import { Lock } from 'lucide-react';

export default function Home() {
  const [ca] = useState('5sB53PmfbCdggGaVi1EPzvuCv4yDtYsYSYQpP34owave');
  const { hasAccess, isLoading, requiredBalance } = useWaveAccess();
  
  const copyCA = () => {
    navigator.clipboard.writeText(ca);
    toast.success('CA copied to clipboard');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-400 selection:bg-wave-cyan selection:text-black">
      <Navbar />
      
      <main className="relative pt-24 pb-20">
        {/* Subtle Ambient Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b from-wave-cyan/10 to-transparent blur-[120px] pointer-events-none opacity-50" />
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Column: Hero Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-wave-cyan/5 border border-wave-cyan/20 text-wave-cyan text-xs font-bold mb-6 mt-10 tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-wave-cyan animate-pulse" />
                Live on Solana
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
                The Ultimate <br />
                <span className="text-wave-cyan font-black italic">Conviction</span> Terminal
              </h1>
              
              <p className="max-w-md mx-auto lg:mx-0 text-lg text-zinc-500 mb-8 leading-relaxed font-medium">
                High-performance trading terminal designed for diamond hands. 
                Swap, track, and prove your conviction on-chain.
              </p>

              {/* CA: SOON Component */}
              <div className="inline-flex flex-col items-center lg:items-start gap-3 mb-10 w-full max-w-sm">
                 <div className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl w-full group hover:border-wave-cyan/50 transition-all cursor-pointer" onClick={copyCA}>
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter">Contract Address</span>
                    <span className="flex-1 font-mono text-sm text-white font-bold ml-2 overflow-hidden text-ellipsis">{ca}</span>
                    <Copy size={14} className="text-zinc-500 group-hover:text-wave-cyan transition-colors" />
                 </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 mb-10">
                <Link 
                  href="/tokens" 
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-wave-cyan text-wave-deep font-black rounded-xl text-sm hover:brightness-110 transition-all shadow-xl shadow-wave-cyan/10"
                >
                  LAUNCH TERMINAL
                  <ArrowRight size={16} />
                </Link>
                
                <a
                  href="https://x.com/WaveDEX_app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-sm font-bold text-white hover:bg-white/10 hover:border-wave-cyan/50 transition-all"
                >
                  <span className="text-xl">𝕏</span> FOLLOW ON X
                </a>
              </div>

              <div className="mt-12 flex items-center justify-center lg:justify-start gap-12 border-t border-white/5 pt-8">
                <div>
                  <div className="text-xl font-bold text-white tracking-tighter">$142M+</div>
                  <div className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Volume</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white tracking-tighter">42.5K</div>
                  <div className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Traders</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white tracking-tighter">890</div>
                  <div className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Contests</div>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Swap Widget */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center"
            >
              <div className="w-full max-w-[420px] relative">
                <div className="absolute inset-0 bg-wave-cyan/5 blur-[80px] -z-10 rounded-full" />
                <Swap initialOutputMint="5sB53PmfbCdggGaVi1EPzvuCv4yDtYsYSYQpP34owave" />
              </div>
            </motion.div>
          </div>

          {/* Tools Coming Soon Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-24 py-12 border-t border-white/5"
          >
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black text-white mb-4 tracking-tight uppercase">
                Terminal <span className="text-wave-cyan">Expansion</span>
              </h2>
              <p className="text-zinc-500 max-w-2xl mx-auto font-medium">
                Our core engine is evolving. New high-frequency tools dropping weekly.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
              {[
                {
                  title: "Wallet Tracker",
                  desc: "Real-time on-chain balance verification and PnL tracking for any Solana address.",
                  status: "LIVE",
                  link: "/pnl"
                },
                {
                  title: "AI Insights",
                  desc: "Proprietary Llama-3-70b engine analyzing wallet behavior and conviction metrics.",
                  status: "LIVE",
                  link: "/ai-insights"
                },
                {
                  title: "Whale Alert",
                  desc: "Real-time monitoring of large on-chain moves and liquidity shifts.",
                  status: "LIVE",
                  link: "/whale-alert"
                },
                {
                  title: "Rug-Check AI",
                  desc: "Automated contract security analysis to identify honeypots and rug-pulls.",
                  status: "UPCOMING"
                },
                {
                  title: "Copy-Trading",
                  desc: "Automated mirroring of top 0.1% on-chain performers with MEV protection.",
                  status: "SOON"
                },
                {
                  title: "Volume Bot",
                  desc: "Enterprise-grade liquidity provisioning and volume generation engine.",
                  status: "ACTIVE",
                  link: "/volume-bot"
                },
                {
                  title: "MEV Shield",
                  desc: "Built-in Jito bundle support to prevent front-run and sandwich attacks.",
                  status: "SOON"
                },
                {
                  title: "Deep Liquidity",
                  desc: "Advanced monitoring of Meteora & Orca pools for early yield opportunities.",
                  status: "ACTIVE"
                },
                {
                  title: "Sentiment AI",
                  desc: "Natural Language Processing engine tracking social sentiment and whale narrative shifts.",
                  status: "SOON"
                },
                {
                  title: "Yield Aggregator",
                  desc: "Cross-protocol yield optimization for stablecoins and major LSTs.",
                  status: "UPCOMING"
                },
                {
                  title: "Market Maker",
                  desc: "Automated liquidity provisioning with customizable spread and depth parameters.",
                  status: "SOON"
                },
                {
                  title: "Flash Sniper",
                  desc: "Ultra-low latency token sniping with automated contract verification and safety checks.",
                  status: "SOON"
                }
                ].map((tool, i) => {
                  const isLocked = (tool.link === '/pnl' || tool.link === '/ai-insights' || tool.link === '/whale-alert' || tool.link === '/volume-bot') && !hasAccess;
                  
                  const content = (
                    <>
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        {isLocked && <Lock size={12} className="text-zinc-600" />}
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded border tracking-widest uppercase ${
                          tool.status === 'LIVE' || tool.status === 'ACTIVE' 
                          ? 'bg-wave-cyan/10 text-wave-cyan border-wave-cyan/20' 
                          : 'bg-zinc-900 text-zinc-600 border-white/5'
                        }`}>
                          {tool.status}
                        </span>
                      </div>
                      <h3 className={`text-sm font-black mb-2 uppercase tracking-tight transition-colors ${isLocked ? 'text-zinc-600' : 'text-white group-hover:text-wave-cyan'}`}>{tool.title}</h3>
                      <p className={`text-[11px] leading-relaxed font-medium ${isLocked ? 'text-zinc-800' : 'text-zinc-600'}`}>{tool.desc}</p>
                      {isLocked && (
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-wave-cyan animate-pulse" />
                          <span className="text-[8px] font-black text-wave-cyan/50 uppercase tracking-widest">Hold {requiredBalance.toLocaleString()} $WAVE to Unlock</span>
                        </div>
                      )}
                    </>
                  );

                  const className = `p-6 rounded-2xl bg-white/[0.02] border border-white/5 transition-all group relative overflow-hidden ${(!tool.link || isLocked) ? 'cursor-default' : 'cursor-pointer hover:bg-white/[0.04] hover:border-wave-cyan/30'}`;

                  if (tool.link && !isLocked) {
                    return (
                      <Link key={i} href={tool.link} className={className}>
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <div key={i} className={className}>
                      {content}
                    </div>
                  );
                })}
            </div>

            <div className="flex justify-center">
              <a 
                href="https://x.com/WaveDEX_app/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex items-center gap-3 px-8 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:border-wave-cyan/50 hover:bg-white/10 transition-all shadow-lg"
              >
                <span className="text-2xl">𝕏</span>
                <div className="text-left">
                  <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest leading-none mb-1">Stay Updated</div>
                  <div className="text-sm font-black uppercase tracking-tight">Follow @WaveDEX_app</div>
                </div>
                <ExternalLink size={16} className="ml-2 text-wave-cyan" />
              </a>
            </div>
          </motion.section>
        </div>
      </main>

      {/* Featured Section */}
      <section className="py-24 border-t border-white/5 bg-[#080808]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Active Contests</h2>
              <p className="text-zinc-600 text-sm font-medium uppercase tracking-widest">Compete for the highest conviction score</p>
            </div>
            <Link href="/contests" className="flex items-center gap-2 text-wave-cyan text-xs font-black tracking-widest hover:brightness-125 transition-all">
              VIEW ALL <ExternalLink size={14} />
            </Link>
          </div>
          <LiveContests />
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-24 border-t border-white/5">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap className="text-wave-cyan" size={24} />,
                title: "Jupiter V6 Integration",
                desc: "Enterprise-grade swap engine providing the best prices across all Solana DEXs with minimal slippage."
              },
              {
                icon: <TrendingUp className="text-wave-cyan" size={24} />,
                title: "Conviction Scoring",
                desc: "Unique on-chain algorithm that rewards holding duration and volume rather than just PnL."
              },
              {
                icon: <Trophy className="text-wave-cyan" size={24} />,
                title: "Automated Rewards",
                desc: "Smart contract based prize distribution ensures winners are paid instantly and transparently."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all group"
              >
                <div className="mb-6 p-3 rounded-xl bg-white/5 w-fit group-hover:bg-wave-cyan/10 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed font-medium">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 bg-[#050505] text-center">
        <div className="flex items-center justify-center gap-2 mb-6 opacity-50 hover:opacity-100 transition-all cursor-default">
          <img 
            src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/1d69b988-7f20-42cb-acb9-faa4090f6e5e/image-removebg-preview-1-1769820808958.png?width=128&height=128&resize=contain" 
            alt="WaveDex Logo" 
            className="w-8 h-8 object-contain"
          />
          <span className="font-bold text-white tracking-tighter text-sm">WAVEDEX TERMINAL</span>
        </div>
        <div className="flex justify-center mb-6">
          <a 
            href="https://x.com/WaveDEX_app/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-zinc-400 hover:text-wave-cyan transition-colors opacity-50 hover:opacity-100 text-3xl"
          >
            𝕏
          </a>
        </div>
        <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em]">© 2026 WaveDex. Professional Grade DeFi.</p>
      </footer>
    </div>
  );
}