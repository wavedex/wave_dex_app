'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Lock, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

        if (response.ok) {
          toast.success('Admin access granted');
          router.push('/auth/admin/dashboard');
          router.refresh();
        } else {
        toast.error(data.error || 'Login failed');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-wave-cyan/5 via-transparent to-transparent opacity-50" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-wave-cyan/10 border border-wave-cyan/20 text-wave-cyan mb-4">
            <Shield size={32} />
          </div>
          <h1 className="text-3xl font-black tracking-tighter mb-2">ADMIN <span className="text-wave-cyan">ACCESS</span></h1>
          <p className="text-zinc-500">Secure entry for Volume Bot management</p>
        </div>

        <div className="bg-zinc-900/50 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <User size={14} /> Username
              </label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin_lfg" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-wave-cyan/50 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Lock size={14} /> Password
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-wave-cyan/50 transition-all"
                required
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-wave-cyan text-wave-deep font-black text-lg hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_rgba(0,245,212,0.3)] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <><Loader2 className="animate-spin" size={20} /> AUTHORIZING...</>
              ) : (
                'LOGIN TO DASHBOARD'
              )}
            </button>
          </form>
        </div>
        
        <p className="text-center mt-8 text-xs text-zinc-600 uppercase tracking-widest font-bold">
          Restricted Area • Unauthorized Access Prohibited
        </p>
      </motion.div>
    </div>
  );
}
