'use client';

import { Navbar } from '@/components/Navbar';
import { motion } from 'framer-motion';
import { Bot, MessageSquare, TrendingUp, Zap, BarChart3, Globe, Hash, Users, ExternalLink, Sparkles } from 'lucide-react';
import { useState } from 'react';

export default function SentimentAIPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-wave-cyan selection:text-black">
      <Navbar />
      
      <main className="container mx-auto pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-16">
            <div className="flex items-center gap-2 mb-4">
               <div className="w-1.5 h-1.5 rounded-full bg-wave-cyan animate-pulse" />
               <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">Narrative Tracking Engine</span>
               <span className="ml-2 px-1.5 py-0.5 rounded border border-white/5 bg-white/5 text-[8px] font-black text-zinc-500 uppercase tracking-widest">Coming Soon</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic leading-none mb-6">
              Sentiment <span className="text-wave-cyan">AI</span>
            </h1>
            <p className="text-zinc-500 max-w-2xl font-medium text-lg leading-relaxed">
              Proprietary Natural Language Processing (NLP) engine tracking social sentiment, 
              whale narrative shifts, and high-frequency alpha signals across 𝕏 and Telegram.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                icon: <MessageSquare className="text-wave-cyan" size={24} />,
                title: "Social Scraping",
                desc: "Real-time analysis of 50,000+ key influencer and whale accounts on 𝕏."
              },
              {
                icon: <Hash className="text-wave-cyan" size={24} />,
                title: "Ticker Correlation",
                desc: "Direct mapping of social volume spikes to on-chain price action and liquidity flows."
              },
              {
                icon: <Users className="text-wave-cyan" size={24} />,
                title: "Whale Narratives",
                desc: "Identify what the smart money is discussing before it hits the charts."
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-wave-cyan/20 transition-all group">
                <div className="mb-6 p-3 rounded-xl bg-white/5 w-fit group-hover:bg-wave-cyan/10 transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-black text-white mb-3 uppercase tracking-tight">{feature.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed font-medium">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Large Placeholder UI */}
          <div className="relative rounded-[3rem] bg-white/[0.01] border border-white/5 p-12 overflow-hidden text-center min-h-[400px] flex flex-col items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-b from-wave-cyan/5 to-transparent pointer-events-none" />
            
            <div className="relative z-10 max-w-lg">
              <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8">
                <Sparkles className="text-zinc-700" size={32} />
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Engine Under Calibration</h2>
              <p className="text-zinc-600 font-medium mb-10 leading-relaxed">
                We are currently training the Llama-3-70b-Sentiment model on 18 months of Solana social data 
                to ensure the highest precision narrative detection. 
              </p>
              
              <div className="inline-flex items-center gap-6 px-8 py-4 rounded-2xl bg-wave-cyan/5 border border-wave-cyan/20">
                <div className="text-left">
                  <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Current Progress</div>
                  <div className="text-lg font-black text-white">84.2% Trained</div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-left">
                  <div className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Expected Drop</div>
                  <div className="text-lg font-black text-wave-cyan">Q1 2026</div>
                </div>
              </div>
            </div>
            
            {/* Decorative Grid */}
            <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-20 bg-[radial-gradient(#1e3a8a_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
          </div>
        </div>
      </main>
    </div>
  );
}
