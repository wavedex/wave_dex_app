'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw } from 'lucide-react';
import { Swap } from './Swap';
import { useEffect, useState } from 'react';

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOutputMint?: string;
}

export function SwapModal({ isOpen, onClose, initialOutputMint }: SwapModalProps) {
  // Close on escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-[480px] bg-[#0A0B0B] border border-white/10 rounded-[48px] shadow-[0_0_100px_rgba(20,241,149,0.1)] overflow-hidden"
          >
            {/* Modal Header */}
            <div className="absolute top-6 right-6 z-20">
              <button 
                onClick={onClose}
                className="p-3 bg-white/5 border border-white/10 rounded-2xl text-zinc-500 hover:text-white hover:bg-white/10 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Swap Component Wrapper */}
            <div className="p-2 md:p-4">
               <Swap initialOutputMint={initialOutputMint} />
            </div>

            {/* Modal Footer Info (Optional) */}
            <div className="px-10 pb-10 text-center">
              <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">
                Secure Transaction via Jupiter V6
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
