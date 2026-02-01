'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, BadgeCheck, Waves, Sparkles, Twitter, ExternalLink, Shield, Rocket } from 'lucide-react';
import { DexPair, getTokenImageUrl } from '@/lib/dexscreener';
import { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';

interface FeatureImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: DexPair | null;
  mode?: 'share' | 'feature';
}

type LayoutType = 'impact' | 'technical' | 'minimalist';

interface Template {
  id: number;
  name: string;
  layout: LayoutType;
  bg: string;
  accent: string;
  border: string;
  overlay: string;
  logoBg: string;
}

const templates: Template[] = [
  {
    id: 1,
    name: 'Elite Impact',
    layout: 'impact',
    bg: 'bg-[#050505]',
    accent: 'text-[#00f5d4]',
    border: 'border-[#00f5d4]/30',
    overlay: 'bg-[radial-gradient(circle_at_center,_#00f5d4_0%,_transparent_70%)]',
    logoBg: 'bg-[#00f5d4]/20',
  },
  {
    id: 2,
    name: 'Cyber Technical',
    layout: 'technical',
    bg: 'bg-[#0a0a0f]',
    accent: 'text-[#00f5d4]',
    border: 'border-white/10',
    overlay: 'bg-[linear-gradient(45deg,_rgba(0,245,212,0.1)_0%,_transparent_100%)]',
    logoBg: 'bg-zinc-900',
  },
  {
    id: 3,
    name: 'Minimalist Prime',
    layout: 'minimalist',
    bg: 'bg-[#000814]',
    accent: 'text-white',
    border: 'border-white/5',
    overlay: 'bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.05)_0%,_transparent_70%)]',
    logoBg: 'bg-white/5',
  },
  {
    id: 4,
    name: 'Golden Conviction',
    layout: 'impact',
    bg: 'bg-[#0f110c]',
    accent: 'text-yellow-500',
    border: 'border-yellow-500/20',
    overlay: 'bg-[radial-gradient(circle_at_center,_rgba(234,179,8,0.1)_0%,_transparent_70%)]',
    logoBg: 'bg-yellow-500/10',
  }
];

export function FeatureImageModal({ isOpen, onClose, token, mode = 'feature' }: FeatureImageModalProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template>(templates[0]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (token) {
      setImgUrl(getTokenImageUrl(token.baseToken.address, token.info?.imageUrl));
    }
  }, [token]);

  if (!token) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsCapturing(true);
    const downloadToast = toast.loading('Generating high-quality asset...');
    
    try {
      // Ensure all images are loaded before capturing
      const images = cardRef.current.getElementsByTagName('img');
      const loadPromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
          // Set a timeout for individual images
          setTimeout(resolve, 5000);
        });
      });
      await Promise.all(loadPromises);
      
      // Small delay for font rendering and layout stability
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          // You can modify the cloned document if needed
          const clonedElement = clonedDoc.querySelector('[data-capture-area="true"]');
          if (clonedElement) {
             (clonedElement as HTMLElement).style.borderRadius = '3rem';
          }
        }
      });

      const link = document.createElement('a');
      link.download = `wavedex-${token.baseToken.symbol.toLowerCase()}-feature.png`;
      link.href = canvas.toDataURL('image/png', 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Asset downloaded successfully', { id: downloadToast });
    } catch (err) {
      console.error('Download failed:', err);
      toast.error('Failed to generate image. Please try again.', { id: downloadToast });
    } finally {
      setIsCapturing(false);
    }
  };

  const renderLayout = () => {
    const { layout, accent, logoBg } = selectedTemplate;
    
    if (layout === 'impact') {
      return (
        <div className="flex items-center justify-between w-full h-full p-16">
          <div className="flex flex-col items-center">
             <div className="w-64 h-64 rounded-full border-[6px] border-[#00f5d4] p-2 bg-[#050505] shadow-[0_0_50px_rgba(0,245,212,0.3)] flex items-center justify-center overflow-hidden">
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-zinc-900">
                    {imgUrl ? (
                      <img src={imgUrl} crossOrigin="anonymous" className="w-full h-full object-cover" alt="" />
                    ) : (
                      <span className="text-6xl font-black text-white italic">{token.baseToken.symbol[0]}</span>
                    )}
                  </div>
               </div>
               <div className="mt-6 px-6 py-2 bg-[#00f5d4] rounded-full text-black font-black text-[10px] uppercase tracking-[0.3em]">
                 Featured Token
               </div>
            </div>
          
               <div className="flex flex-col items-end text-right">
               <div className="flex items-center gap-2 mb-4">
                  <Rocket className="text-[#00f5d4]" size={24} />
                  <span className="text-sm font-black text-white uppercase tracking-[0.4em] bg-white/5 px-4 py-2 rounded-xl border border-white/10">Featured</span>
               </div>
               <div className="text-[80px] font-black text-white uppercase italic leading-none tracking-tighter mb-2">
                 {token.baseToken.symbol}
               </div>
               <div className="h-2 w-48 bg-[#00f5d4] rounded-full mb-4 shadow-[0_0_20px_rgba(0,245,212,0.5)]" />
               <div className="text-xl font-bold text-zinc-500 uppercase tracking-widest">
                 {token.baseToken.name}
               </div>
            </div>
        </div>
      );
    }

    if (layout === 'technical') {
      return (
        <div className="w-full h-full p-16 flex flex-col justify-between">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-wave-cyan/10 border border-wave-cyan/20 flex items-center justify-center text-wave-cyan">
                    <Shield size={24} />
                 </div>
                 <div className="text-2xl font-black text-white uppercase tracking-[0.4em]">WaveDex</div>
              </div>
              <div className="flex items-center gap-3 px-4 py-2 bg-wave-cyan/10 border border-wave-cyan/20 rounded-xl">
                 <Rocket size={16} className="text-wave-cyan" />
                 <span className="text-[10px] font-black text-wave-cyan uppercase tracking-widest">Featured</span>
                 <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Solana Network</span>
              </div>
           </div>

             <div className="flex items-center gap-12">
                <div className="w-64 h-64 rounded-3xl border-4 border-[#00f5d4] p-1 bg-black overflow-hidden shadow-2xl">
                   <div className="w-full h-full rounded-2xl overflow-hidden flex items-center justify-center bg-zinc-900">
                      {imgUrl ? (
                        <img src={imgUrl} crossOrigin="anonymous" className="w-full h-full object-cover" alt="" />
                      ) : (
                        <span className="text-5xl font-black text-white italic">{token.baseToken.symbol[0]}</span>
                      )}
                   </div>
                </div>
                <div>
                   <div className="text-[70px] font-black text-white leading-none mb-2 tracking-tighter">
                      {token.baseToken.symbol}
                   </div>
                   <div className="text-xl font-bold text-zinc-500 uppercase tracking-widest">
                      {token.baseToken.name}
                   </div>
                </div>
             </div>

           <div className="flex items-center justify-between pt-8 border-t border-white/5">
              <div className="flex items-center gap-3">
                 <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center">
                    <Waves size={12} className="text-wave-cyan" />
                 </div>
                 <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">wavedex.app</span>
              </div>
              <div className="font-mono text-xs text-zinc-700 tracking-tighter">
                {token.baseToken.address}
              </div>
           </div>
        </div>
      );
    }

    if (layout === 'minimalist') {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-16">
           <div className="absolute top-12">
              <div className="w-12 h-12 text-white/20">
                 <Waves size={48} />
              </div>
           </div>
           
             <div className="w-56 h-56 rounded-full border-4 border-white/10 p-2 relative">
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center bg-white/5 backdrop-blur-xl">
                   {imgUrl ? (
                     <img src={imgUrl} crossOrigin="anonymous" className="w-full h-full object-cover" alt="" />
                   ) : (
                     <span className="text-4xl font-black text-white">{token.baseToken.symbol[0]}</span>
                   )}
                </div>
                <div className="absolute -inset-4 border border-white/5 rounded-full" />
             </div>

             <div className="mt-12 text-center">
                <div className="text-[90px] font-black text-white uppercase tracking-tighter leading-none opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 pointer-events-none">
                  {token.baseToken.symbol}
                </div>
                <div className="text-[60px] font-black text-white uppercase tracking-tighter leading-none">
                  {token.baseToken.symbol}
                </div>
                <div className="mt-8 px-10 py-3 bg-white/5 border border-white/10 rounded-full text-white/40 font-black text-xs uppercase tracking-[0.4em] backdrop-blur-xl">
                   Featured on Wavedex.app
                </div>
             </div>
        </div>
      );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-6xl bg-[#0a0a0a] border border-white/10 rounded-[3rem] overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(0,0,0,0.8)]"
          >
            {/* Left: Preview Area */}
            <div className="flex-1 p-8 md:p-16 flex flex-col items-center justify-center bg-[#050505] relative overflow-hidden min-h-[600px]">
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className={`absolute top-0 left-0 w-full h-full ${selectedTemplate.overlay} blur-[150px]`} />
              </div>

                {/* The Card to Capture */}
                <div 
                  ref={cardRef}
                  data-capture-area="true"
                  className={`w-[800px] h-[450px] ${selectedTemplate.bg} ${selectedTemplate.border} border-2 rounded-[3rem] relative shadow-2xl overflow-hidden shrink-0`}
                >
                {/* Visual Flair */}
                <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/5 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-white/5 blur-[120px] rounded-full pointer-events-none" />
                
                {renderLayout()}
              </div>
            </div>

            {/* Right: Controls */}
            <div className="w-full md:w-[400px] p-12 border-l border-white/10 flex flex-col bg-black">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Feature Studio</h3>
                  <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">Select Engine & Layout</p>
                </div>
                <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-10 flex-1 overflow-y-auto custom-scrollbar pr-2">
                <div>
                  <label className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em] block mb-6">Visual Engines</label>
                  <div className="grid gap-3">
                    {templates.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setSelectedTemplate(t)}
                        className={`w-full p-5 rounded-[1.5rem] flex items-center justify-between border-2 transition-all group ${
                          selectedTemplate.id === t.id 
                            ? 'bg-[#00f5d4]/10 border-[#00f5d4] text-[#00f5d4]' 
                            : 'bg-white/[0.02] border-white/5 text-zinc-500 hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${t.accent.includes('text-[#00f5d4]') ? 'bg-[#00f5d4]' : t.accent.includes('text-yellow-500') ? 'bg-yellow-500' : 'bg-white'} shadow-[0_0_10px_currentColor]`} />
                          <div className="text-left">
                             <div className="text-xs font-black uppercase tracking-widest">{t.name}</div>
                             <div className="text-[9px] font-black uppercase tracking-widest opacity-40">{t.layout}</div>
                          </div>
                        </div>
                        {selectedTemplate.id === t.id && <Sparkles size={14} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-10 space-y-4">
                <button 
                  onClick={handleDownload}
                  disabled={isCapturing}
                  className="w-full py-5 bg-[#00f5d4] text-black rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:scale-[1.02] transition-all shadow-[0_20px_40px_rgba(0,245,212,0.2)] disabled:opacity-50"
                >
                  <Download size={18} />
                  {isCapturing ? 'GENERATING...' : 'DOWNLOAD ASSET'}
                </button>
                <button 
                  onClick={() => {
                    const text = encodeURIComponent(`Immense conviction for $${token.baseToken.symbol}. Live on Wavedex.app 🔥\n\n#Solana #WaveDex`);
                    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
                  }}
                  className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
                >
                  <Twitter size={18} />
                  POST TO X
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
