'use client';

import { Navbar } from '@/components/Navbar';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Zap, TrendingUp, Shield, Plus, Settings, Play, Info, Save, Key, Globe, AlertTriangle, Loader2, Copy, Trash2, Wallet, Layers } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Keypair } from '@solana/web3.js';
import bs58 from 'bs58';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWaveAccess } from '@/hooks/useWaveAccess';
import { LockedOverlay } from '@/components/LockedOverlay';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const PLANS = [
  {
    id: 'basic',
    name: 'Basic',
    price: '0.5 SOL',
    duration: '24 Hours',
    features: ['Up to $50k Daily Volume', 'Standard Frequency', '1 Execution Wallet'],
    color: 'border-zinc-500/20',
    walletCount: 1
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '2.5 SOL',
    duration: '7 Days',
    features: ['Up to $500k Daily Volume', 'High Frequency', '4 Wallets Cluster', 'Anti-MEV Protection'],
    color: 'border-wave-cyan/50',
    featured: true,
    walletCount: 4
  },
  {
    id: 'whale',
    name: 'Whale',
    price: '10 SOL',
    duration: '30 Days',
    features: ['Unlimited Volume', 'Insane Frequency', '10 Wallets Cluster', 'Priority Support'],
    color: 'border-purple-500/50',
    walletCount: 10
  }
];

export default function VolumeBotPage() {
    const { connected } = useWallet();
    const { hasAccess, balance: waveBalance, isLoading: isBalanceLoading, requiredBalance } = useWaveAccess();
    const [ca, setCa] = useState('');
    const [selectedPlan, setSelectedPlan] = useState('pro');
    const [intensity, setIntensity] = useState('Medium');
    const [isDeploying, setIsDeploying] = useState(false);

  const [wallets, setWallets] = useState<any[]>([]);
  const [isLoadingWallets, setIsLoadingWallets] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (hasAccess) {
      fetchWallets();
    }
  }, [hasAccess]);

  async function fetchWallets() {
    if (!hasAccess) return;
    setIsLoadingWallets(true);
    try {
      const { data, error } = await supabase
        .from('bot_wallets')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setWallets(data);
    } catch (err) {
      console.error('Error fetching wallets:', err);
    } finally {
      setIsLoadingWallets(false);
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  const handleDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ca) {
      toast.error('Please enter a target token address');
      return;
    }

    setIsDeploying(true);
    const toastId = toast.loading('Initializing Cluster Engine...');
    
    try {
      // 1. Create the Volume Bot record first
      let userId = null;
      try {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id || null;
      } catch (e) {}

      const plan = PLANS.find(p => p.id === selectedPlan);
      const expiresAt = new Date();
      if (selectedPlan === 'basic') expiresAt.setDate(expiresAt.getDate() + 1);
      else if (selectedPlan === 'pro') expiresAt.setDate(expiresAt.getDate() + 7);
      else expiresAt.setDate(expiresAt.getDate() + 30);

      const { data: bot, error: botError } = await supabase
        .from('volume_bots')
        .insert({
          user_id: userId,
          target_token: ca,
          plan_id: selectedPlan,
          status: 'initializing',
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (botError) throw botError;

        // 2. Call the execution API which will handle wallet generation and funding
        const res = await fetch('/api/volume-bot/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            botId: bot.id,
            ca,
            planId: selectedPlan,
            intensity
          })
        });


      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to start bot engine');
      }

      toast.success('Volume Bot Cluster is now ACTIVE!', { id: toastId });
      fetchWallets();
    } catch (err: any) {
      console.error('Deployment error:', err);
      toast.error(err.message || 'Deployment failed', { id: toastId });
    } finally {
      setIsDeploying(false);
    }
  };

  if (!mounted) return null;

    return (
      <div className="min-h-screen h-auto overflow-y-auto bg-[#050505] text-white selection:bg-wave-cyan selection:text-black">
        <Navbar />

      
      <main className="container mx-auto pt-32 pb-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-wave-cyan/10 border border-wave-cyan/20 text-wave-cyan text-[10px] font-black uppercase tracking-[0.2em] mb-6"
            >
              <Zap size={14} /> Professional Liquidity Management
            </motion.div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-6 uppercase italic">
              Cluster <span className="text-wave-cyan">Engine</span>
            </h1>
            <p className="text-zinc-500 text-lg max-w-2xl mx-auto font-medium">
              Automated on-chain volume generation via distributed wallet clusters. 
              Mimic organic trading patterns and maintain trending status.
            </p>
          </div>
    
          {!connected ? (
            <div className="flex flex-col items-center justify-center py-32 rounded-[3rem] bg-white/[0.01] border border-white/5 text-center">
              <div className="w-20 h-20 rounded-3xl bg-wave-cyan/5 border border-wave-cyan/20 flex items-center justify-center text-wave-cyan mb-8">
                <Bot size={32} />
              </div>
              <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Cluster Engine Locked</h2>
              <p className="text-zinc-600 max-w-sm mb-10 font-medium">
                Connect your wallet to access professional liquidity management and volume generation tools.
              </p>
            </div>
          ) : !hasAccess ? (
            <LockedOverlay 
              requiredBalance={requiredBalance} 
              currentBalance={waveBalance} 
              isLoading={isBalanceLoading} 
            />
          ) : (
            <div className="grid lg:grid-cols-3 gap-12 items-start">
            {/* Left/Middle: Setup & Wallets */}
            <div className="lg:col-span-2 space-y-8">
              {/* Bot Settings Card */}
              <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-wave-cyan/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                 
                 <h3 className="text-xl font-bold mb-10 uppercase tracking-tight flex items-center gap-3">
                   <Settings className="text-wave-cyan" /> Configuration
                 </h3>
                 
                 <div className="grid md:grid-cols-2 gap-8 mb-10">
                    <div>
                      <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-3">Target Token Address (Solana)</label>
                      <input 
                        type="text"
                        value={ca}
                        onChange={(e) => setCa(e.target.value)}
                        placeholder="Enter Contract Address..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-wave-cyan/30 transition-all font-mono text-xs text-white placeholder:text-zinc-800"
                      />
                    </div>
                      <div>
                        <label className="block text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em] mb-3">Trading Intensity</label>
                        <div className="grid grid-cols-3 gap-2">
                          {['Low', 'Medium', 'High'].map((mode) => (
                             <button 
                               key={mode} 
                               onClick={() => setIntensity(mode)}
                               className={`py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${intensity === mode ? 'bg-wave-cyan/10 border-wave-cyan/50 text-wave-cyan' : 'bg-white/5 border-white/5 text-zinc-600 hover:text-white'}`}
                             >
                               {mode}
                             </button>
                          ))}
                        </div>
                      </div>

                 </div>

                   <TooltipProvider>
                     <Tooltip>
                       <TooltipTrigger asChild>
                         <div className="w-full">
                           <button 
                             disabled={true}
                             className="w-full py-5 rounded-2xl bg-white/5 border border-white/10 text-zinc-800 font-black text-sm uppercase tracking-[0.3em] cursor-not-allowed flex items-center justify-center gap-3"
                           >
                             <Play size={20} fill="currentColor" />
                             Initialize Bot Cluster
                           </button>
                         </div>
                       </TooltipTrigger>
                       <TooltipContent className="bg-zinc-900 border-white/10 text-zinc-400 font-black uppercase text-[10px] tracking-widest px-4 py-2">
                         <p>Under Development</p>
                       </TooltipContent>
                     </Tooltip>
                   </TooltipProvider>
              </div>

              {/* Wallet Management */}
              <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-xl">
                  <div className="flex items-center justify-between mb-10">
                    <div>
                      <h2 className="text-2xl font-bold mb-1 uppercase tracking-tight">Active Nodes</h2>
                      <p className="text-zinc-600 text-xs font-black uppercase tracking-widest">Distributed execution wallets monitoring</p>
                    </div>
                    <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                       {wallets.length} Total Wallets
                    </div>
                  </div>

                {isLoadingWallets ? (
                   <div className="space-y-4">
                     {[1,2,3].map(i => <div key={i} className="h-24 rounded-3xl bg-white/5 animate-pulse" />)}
                   </div>
                ) : wallets.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[2rem]">
                    <Layers size={48} className="mx-auto text-zinc-900 mb-6" />
                    <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">No active clusters detected</p>
                    <p className="text-[10px] text-zinc-800 uppercase font-black mt-2 tracking-tighter">Wallets are automatically provisioned upon initialization</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {wallets.slice(0, 5).map((w) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={w.id} 
                        className="group p-6 rounded-[2rem] bg-white/[0.01] border border-white/5 hover:border-wave-cyan/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
                      >
                        <div className="flex items-center gap-5">
                           <div className="w-12 h-12 rounded-2xl bg-wave-cyan/5 border border-wave-cyan/10 flex items-center justify-center text-wave-cyan/50 group-hover:text-wave-cyan transition-colors">
                              <Key size={20} />
                           </div>
                           <div>
                              <div className="font-black text-white uppercase tracking-tight mb-1 flex items-center gap-2">
                                {w.label}
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                              </div>
                              <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-600">
                                 {w.public_key.slice(0, 16)}...{w.public_key.slice(-16)}
                                 <button onClick={() => copyToClipboard(w.public_key, 'Address')} className="hover:text-wave-cyan transition-colors">
                                    <Copy size={12} />
                                 </button>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-8 pr-4">
                           <div className="text-right">
                              <div className="text-sm font-bold text-white">{w.balance} SOL</div>
                              <div className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Gas Balance</div>
                           </div>
                           <div className="text-right">
                              <div className="text-sm font-bold text-wave-cyan">ACTIVE</div>
                              <div className="text-[10px] font-black text-zinc-700 uppercase tracking-widest">Status</div>
                           </div>
                        </div>
                      </motion.div>
                    ))}
                    {wallets.length > 5 && (
                       <div className="text-center py-4 text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em]">
                         + {wallets.length - 5} More Active Nodes
                       </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Tier Selection */}
            <div className="space-y-8">
              <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-10 backdrop-blur-xl">
                <h3 className="text-lg font-bold mb-8 uppercase tracking-widest flex items-center gap-3">
                   <Bot size={18} className="text-wave-cyan" /> Select Tier
                </h3>
                <div className="grid gap-4">
                   {PLANS.map(plan => (
                      <button 
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`p-6 rounded-[1.5rem] border text-left transition-all relative overflow-hidden group ${
                          selectedPlan === plan.id ? 'bg-wave-cyan/10 border-wave-cyan shadow-[0_0_30px_rgba(0,245,212,0.05)]' : 'bg-white/[0.02] border-white/5 hover:border-white/20'
                        }`}
                      >
                         {plan.featured && <div className="absolute top-0 right-0 px-3 py-1 bg-wave-cyan text-wave-deep text-[9px] font-black uppercase tracking-tighter">Most Popular</div>}
                         <div className="flex justify-between items-center mb-1">
                            <span className={`font-black uppercase tracking-tight text-base ${selectedPlan === plan.id ? 'text-wave-cyan' : 'text-white'}`}>{plan.name}</span>
                            <span className="font-mono text-sm font-bold text-white">{plan.price}</span>
                         </div>
                         <div className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest mb-4">{plan.duration}</div>
                         <ul className="space-y-2">
                           {plan.features.map((f, i) => (
                              <li key={i} className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">
                                <Zap size={8} className={selectedPlan === plan.id ? 'text-wave-cyan' : 'text-zinc-700'} />
                                {f}
                              </li>
                           ))}
                         </ul>
                      </button>
                   ))}
                </div>
              </div>

              <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-wave-cyan/10 to-transparent border border-wave-cyan/20">
                 <div className="flex items-center gap-3 mb-4 text-wave-cyan">
                    <AlertTriangle size={20} />
                    <span className="font-black uppercase tracking-widest text-xs">Security Protocol</span>
                 </div>
                 <p className="text-xs text-zinc-500 leading-relaxed font-medium">
                   Our cluster engine uses distributed nodes to prevent detection and ensure organic-looking volume. Each node is automatically funded via the Master Pool.
                 </p>
              </div>

              <div className="p-8 rounded-[2.5rem] bg-white/[0.02] border border-white/5">
                 <h4 className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] mb-6">Cluster Health</h4>
                 <div className="space-y-4">
                    <div className="flex justify-between text-xs">
                       <span className="text-zinc-600 font-bold uppercase tracking-tighter">API Connectivity</span>
                       <span className="text-green-500 font-black uppercase tracking-widest">99.9%</span>
                    </div>
                    <div className="flex justify-between text-xs">
                       <span className="text-zinc-600 font-bold uppercase tracking-tighter">Execution Speed</span>
                       <span className="text-white font-black uppercase tracking-widest">&lt; 800ms</span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-20 text-center border-t border-white/5 opacity-30">
        <div className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.5em]">WaveDex Neural Cluster v1.8.5</div>
      </footer>
    </div>
  );
}
