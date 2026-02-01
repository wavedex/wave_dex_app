'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Bot, Lock, Menu, X, Terminal, Trophy, BarChart3, Activity, Hammer, Wallet, ShieldAlert } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { motion, AnimatePresence } from 'framer-motion';
import { InfoBar } from './InfoBar';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { WalletTracker } from './WalletTracker';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useWaveAccess } from '@/hooks/useWaveAccess';

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const { hasAccess, balance, isLoading, requiredBalance } = useWaveAccess();

  useEffect(() => {
    setMounted(true);
  }, []);

    const navLinks = [
      { href: "/tokens", label: "Terminal", icon: <Terminal size={14} /> },
      { href: "/contests", label: "Contests", icon: <Trophy size={14} /> },
      { href: "/volume-bot", label: "Volume Bot", icon: <Bot size={14} /> },
      { href: "/leaderboard", label: "Leaderboard", icon: <BarChart3 size={14} /> },
      { href: "/pnl", label: "PnL", icon: <Activity size={14} /> },
    ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <InfoBar />
      <nav className="border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-1 rounded-lg bg-wave-cyan/10 text-wave-cyan group-hover:bg-wave-cyan group-hover:text-wave-deep transition-all duration-300">
              <img 
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/1d69b988-7f20-42cb-acb9-faa4090f6e5e/image-removebg-preview-1-1769820808958.png?width=128&height=128&resize=contain" 
                alt="WaveDex Logo" 
                className="w-[36px] h-[36px] object-contain"
              />
            </div>

            <span className="text-lg font-black tracking-tighter text-white uppercase italic">
              WAVE<span className="text-wave-cyan">DEX</span>
            </span>
          </Link>

            {/* Desktop / Large Tablet Nav (lg+) */}
              <div className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => {
                  const isRestricted = (link.href === '/volume-bot' || link.href === '/pnl') && !hasAccess;
                  
                  if (isRestricted) {
                    return (
                      <div 
                        key={link.href}
                        className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-600/50 cursor-not-allowed flex items-center gap-2 group relative"
                      >
                        <span className="text-zinc-800">{link.icon}</span>
                        {link.label}
                        <Lock size={10} className="text-zinc-700 ml-1" />
                      </div>
                    );
                  }

                  return (
                    <Link 
                      key={link.href}
                      href={link.href} 
                      className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 group"
                    >
                      <span className="text-zinc-700 group-hover:text-wave-cyan transition-colors">{link.icon}</span>
                      {link.label}
                    </Link>
                  );
                })}


              <div className="w-px h-4 bg-white/10 mx-4" />

            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-600/50 cursor-not-allowed flex items-center gap-2 group">
                      <Activity size={14} className="text-zinc-800" />
                      Perp
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-900 border-white/10 text-white text-[8px] font-black uppercase tracking-widest">
                    Coming Soon
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-600/50 cursor-not-allowed flex items-center gap-2 group">
                      <Lock size={14} className="text-zinc-800" />
                      Staking
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-zinc-900 border-white/10 text-white text-[8px] font-black uppercase tracking-widest">
                    Coming Soon
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 transition-all flex items-center gap-2 group">
                      <Hammer size={14} className="text-zinc-700 group-hover:text-wave-cyan transition-colors" />
                      Tools
                    </button>
                  </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#080808] border-white/10 text-white w-48 p-1 rounded-xl">
                          <Sheet open={isTrackerOpen} onOpenChange={(open) => hasAccess ? setIsTrackerOpen(open) : null}>
                            <SheetTrigger asChild>
                              <DropdownMenuItem 
                                onSelect={(e) => {
                                  if (!hasAccess) {
                                    e.preventDefault();
                                    return;
                                  }
                                  e.preventDefault();
                                  setIsTrackerOpen(true);
                                }}
                                className={`flex items-center justify-between px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer ${
                                  hasAccess 
                                  ? 'text-zinc-400 hover:text-wave-cyan focus:text-wave-cyan focus:bg-wave-cyan/5' 
                                  : 'text-zinc-600/50 cursor-not-allowed'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <Wallet size={14} />
                                  Wallet Tracker
                                </div>
                                {!hasAccess && <Lock size={12} className="text-zinc-700" />}
                              </DropdownMenuItem>
                            </SheetTrigger>
                            <SheetContent side="right" className="w-full sm:max-w-md p-0 bg-[#050505] border-white/5">
                              <WalletTracker />
                            </SheetContent>
                          </Sheet>
                          
                          {hasAccess ? (
                            <Link href="/ai-insights">
                              <DropdownMenuItem className="flex items-center gap-3 px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-wave-cyan focus:text-wave-cyan focus:bg-wave-cyan/5 cursor-pointer">
                                <Bot size={14} />
                                AI Insights
                              </DropdownMenuItem>
                            </Link>
                          ) : (
                            <div className="flex items-center justify-between px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-600/50 cursor-not-allowed">
                              <div className="flex items-center gap-3">
                                <Bot size={14} />
                                AI Insights
                              </div>
                              <Lock size={12} className="text-zinc-700" />
                            </div>
                          )}

                          {hasAccess ? (
                            <Link href="/whale-alert">
                              <DropdownMenuItem className="flex items-center gap-3 px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-wave-cyan focus:text-wave-cyan focus:bg-wave-cyan/5 cursor-pointer">
                                <Activity size={14} />
                                Whale Alert
                              </DropdownMenuItem>
                            </Link>
                          ) : (
                            <div className="flex items-center justify-between px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-600/50 cursor-not-allowed">
                              <div className="flex items-center gap-3">
                                <Activity size={14} />
                                Whale Alert
                              </div>
                              <Lock size={12} className="text-zinc-700" />
                            </div>
                          )}


                        <div className="flex items-center justify-between px-4 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-700 cursor-not-allowed">
                          <div className="flex items-center gap-3">
                            <Bot size={14} />
                            Sentiment AI
                          </div>
                          <span className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded border border-white/5">Soon</span>
                        </div>
                      </DropdownMenuContent>
                </DropdownMenu>

            </div>
          </div>

          {/* Tablet+ Wallet area – force minimum width and prevent shrinking */}
          <div className="hidden md:flex items-center gap-4">
            {mounted && (
              <div className="min-w-[140px]">
                <WalletMultiButton 
                  className={`
                    !bg-wave-cyan 
                    !text-black 
                    !font-black 
                    !rounded-lg 
                    !px-4 
                    !h-9
                    !text-[10px]
                    !uppercase
                    !tracking-widest
                    !transition-all 
                    active:!scale-95 
                    shadow-lg shadow-wave-cyan/20
                    hover:!bg-white
                    [&>span]:!truncate
                  `}
                />
              </div>
            )}

            
            {/* Menu toggle for < lg */}
            <button 
              className="lg:hidden p-2 text-zinc-400 hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile-only menu button (< md) */}
          <button 
            className="md:hidden p-2 text-zinc-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-white/5 bg-[#050505] overflow-hidden"
            >
                <div className="p-4 space-y-2">
                  {navLinks.map((link) => {
                    const isRestricted = (link.href === '/volume-bot' || link.href === '/pnl') && !hasAccess;
                    
                    if (isRestricted) {
                      return (
                        <div 
                          key={link.href}
                          className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.01] border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-600/50 cursor-not-allowed"
                        >
                          <div className="flex items-center gap-4">
                            {link.icon}
                            {link.label}
                          </div>
                          <Lock size={14} className="text-zinc-800" />
                        </div>
                      );
                    }

                    return (
                      <Link 
                        key={link.href}
                        href={link.href} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-wave-cyan transition-all"
                      >
                        {link.icon}
                        {link.label}
                      </Link>
                    );
                  })}
                  
                  <div className="p-4 flex items-center gap-4 text-zinc-800 text-[10px] font-black uppercase tracking-widest">
                    <Activity size={14} />
                    Perp (Coming Soon)
                  </div>

                  <div className="p-4 flex items-center gap-4 text-zinc-800 text-[10px] font-black uppercase tracking-widest">
                    <Lock size={14} />
                    Staking (Coming Soon)
                  </div>

                  <div className="space-y-2">
                    <Sheet open={isTrackerOpen} onOpenChange={(open) => hasAccess ? setIsTrackerOpen(open) : null}>
                      <SheetTrigger asChild>
                        <button 
                          onClick={(e) => {
                            if (!hasAccess) {
                              e.preventDefault();
                              return;
                            }
                          }}
                          className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                            hasAccess 
                            ? 'bg-white/[0.02] border-white/5 text-zinc-400 hover:text-wave-cyan' 
                            : 'bg-white/[0.01] border-white/5 text-zinc-600/50 cursor-not-allowed'
                          } text-[10px] font-black uppercase tracking-widest`}
                        >
                          <div className="flex items-center gap-4">
                            <Wallet size={14} />
                            Wallet Tracker
                          </div>
                          {!hasAccess && <Lock size={14} className="text-zinc-800" />}
                        </button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-full sm:max-w-md p-0 bg-[#050505] border-white/5">
                        <WalletTracker />
                      </SheetContent>
                    </Sheet>
                    
                    {hasAccess ? (
                      <Link 
                        href="/ai-insights"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-wave-cyan transition-all"
                      >
                        <Bot size={14} />
                        AI Insights
                      </Link>
                    ) : (
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.01] border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-600/50 cursor-not-allowed">
                        <div className="flex items-center gap-4">
                          <Bot size={14} />
                          AI Insights
                        </div>
                        <Lock size={14} className="text-zinc-800" />
                      </div>
                    )}

                    {hasAccess ? (
                      <Link 
                        href="/whale-alert"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-wave-cyan transition-all"
                      >
                        <Activity size={14} />
                        Whale Alert
                      </Link>
                    ) : (
                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.01] border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-600/50 cursor-not-allowed">
                        <div className="flex items-center gap-4">
                          <Activity size={14} />
                          Whale Alert
                        </div>
                        <Lock size={14} className="text-zinc-800" />
                      </div>
                    )}


                      <div className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-700">
                        <div className="flex items-center gap-4">
                          <Bot size={14} />
                          Sentiment AI
                        </div>
                        <span className="text-[8px] bg-white/5 px-1.5 py-0.5 rounded border border-white/5">Soon</span>
                      </div>
                </div>


                  <div className="pt-6 px-2">
                    {mounted && (
                      <div className="flex flex-col gap-2">
                        <WalletMultiButton 
                          className={`
                            !w-full 
                            !min-w-full
                            !h-12
                            !rounded-xl 
                            !text-sm 
                            !font-medium
                            shadow-lg shadow-wave-cyan/10
                            [&>span]:!truncate
                          `}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </div>
    );
  }

