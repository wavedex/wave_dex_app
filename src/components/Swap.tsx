'use client';

import { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { VersionedTransaction, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown, Zap, ChevronDown, Search, X, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { searchTokens, getTokenImageUrl, DexPair, getTokenData } from '@/lib/dexscreener';

interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI?: string;
  balance?: number;
}

const SOL_TOKEN: TokenInfo = {
  symbol: 'SOL',
  name: 'Solana',
  address: 'So11111111111111111111111111111111111111112',
  decimals: 9,
  logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
};

const USDC_TOKEN: TokenInfo = {
  symbol: 'USDC',
  name: 'USD Coin',
  address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  decimals: 6,
  logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
};

interface SwapProps {
  initialOutputMint?: string;
  onTokenSelect?: (token: DexPair) => void;
}

export function Swap({ initialOutputMint = '5sB53PmfbCdggGaVi1EPzvuCv4yDtYsYSYQpP34owave', onTokenSelect }: SwapProps) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction, connected: walletConnected } = useWallet();
  
  const [targetToken, setTargetToken] = useState<TokenInfo | null>(null);
  const [mode, setMode] = useState<'buy' | 'sell'>('buy');
  
  const [inputAmount, setInputAmount] = useState<string>('');
  const [outputAmount, setOutputAmount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const [quoteResponse, setQuoteResponse] = useState<any>(null);
  const [slippage, setSlippage] = useState(0.5);

  const [inputBalance, setInputBalance] = useState<number>(0);
  const [outputBalance, setOutputBalance] = useState<number>(0);

  // Token Selector Modal State
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectorTarget, setSelectorTarget] = useState<'input' | 'output'>('input');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DexPair[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Determine current input/output tokens based on mode
  const inputToken = mode === 'buy' ? SOL_TOKEN : (targetToken || USDC_TOKEN);
  const outputToken = mode === 'buy' ? (targetToken || USDC_TOKEN) : SOL_TOKEN;

  // Fetch balances
  const fetchBalances = useCallback(async () => {
    if (!publicKey || !connection) return;

    try {
      // Fetch SOL balance
      const solBalance = await connection.getBalance(publicKey);
      const solAmount = solBalance / LAMPORTS_PER_SOL;

      // Fetch target token balance
      let tokenBalance = 0;
      if (targetToken && targetToken.address !== SOL_TOKEN.address) {
        try {
          const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
            mint: new PublicKey(targetToken.address)
          });
          if (tokenAccounts.value.length > 0) {
            tokenBalance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount || 0;
          }
        } catch (e) {
          console.error('Failed to fetch token balance:', e);
        }
      }

      if (mode === 'buy') {
        setInputBalance(solAmount);
        setOutputBalance(tokenBalance);
      } else {
        setInputBalance(tokenBalance);
        setOutputBalance(solAmount);
      }
    } catch (e) {
      console.error('Failed to fetch balances:', e);
    }
  }, [publicKey, connection, mode, targetToken]);

  useEffect(() => {
    if (walletConnected) {
      fetchBalances();
      const interval = setInterval(fetchBalances, 10000);
      return () => clearInterval(interval);
    }
  }, [walletConnected, fetchBalances]);

  // Fetch target token info using initialOutputMint
  useEffect(() => {
    if (initialOutputMint) {
      const fetchTokenInfo = async () => {
        try {
          const data = await getTokenData(initialOutputMint);
          if (data) {
            setTargetToken({
              symbol: data.baseToken.symbol,
              name: data.baseToken.name,
              address: data.baseToken.address,
              decimals: 9, // Dexscreener doesn't always provide decimals, but most new SOL tokens are 9
              logoURI: getTokenImageUrl(data.baseToken.address, data.info?.imageUrl)
            });
          } else {
            // Fallback for known tokens if dexscreener fails
            if (initialOutputMint === USDC_TOKEN.address) setTargetToken(USDC_TOKEN);
          }
        } catch (e) {
          console.error('Failed to fetch output token info:', e);
        }
      };
      fetchTokenInfo();
    }
  }, [initialOutputMint]);

  const getQuote = useCallback(async (amount: string) => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0 || !outputToken) {
      setOutputAmount('');
      setQuoteResponse(null);
      return;
    }

    setQuoting(true);
    try {
      const lamports = Math.floor(Number(amount) * Math.pow(10, inputToken.decimals));
      const url = `/api/jupiter/quote?inputMint=${inputToken.address}&outputMint=${outputToken.address}&amount=${lamports}&slippageBps=${slippage * 100}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setQuoteResponse(data);
        const outAmount = Number(data.outAmount) / Math.pow(10, outputToken.decimals);
        setOutputAmount(outAmount.toLocaleString(undefined, { maximumFractionDigits: 6 }));
      }
    } catch (e) {
      console.error('Quote error:', e);
    } finally {
      setQuoting(false);
    }
  }, [inputToken.address, inputToken.decimals, outputToken, slippage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputAmount) getQuote(inputAmount);
    }, 500);
    return () => clearTimeout(timer);
  }, [inputAmount, getQuote]);

  const handleSwap = useCallback(async () => {
    if (!walletConnected || !publicKey || !quoteResponse) {
      if (!walletConnected) {
        // Trigger wallet connect if not connected (optional, usually handled by button)
        return;
      }
      return;
    }

    setLoading(true);
    const id = toast.loading('Building transaction...');

    try {
      const swapRes = await fetch('/api/jupiter/swap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteResponse,
          userPublicKey: publicKey.toBase58(),
          wrapAndUnwrapSol: true,
        }),
      });

      if (!swapRes.ok) throw new Error('Failed to build swap transaction');
      
      const { swapTransaction } = await swapRes.json();
      const swapTransactionBuf = Buffer.from(swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(swapTransactionBuf);
      
      const signature = await sendTransaction(transaction, connection);
      const latestBlockhash = await connection.getLatestBlockhash();
      await connection.confirmTransaction({
        signature,
        ...latestBlockhash,
      }, 'confirmed');

      toast.success('Swap successful!', { id });
      setInputAmount('');
      setOutputAmount('');
      setQuoteResponse(null);
      fetchBalances();
    } catch (e: any) {
      toast.error(e.message || 'Swap failed', { id });
    } finally {
      setLoading(false);
    }
  }, [walletConnected, publicKey, quoteResponse, connection, sendTransaction, fetchBalances]);

  const handlePercentage = (pct: number) => {
    if (!inputBalance) return;
    const amount = (inputBalance * pct).toFixed(inputToken.decimals === 9 ? 4 : 2);
    setInputAmount(amount);
  };

  const openSelector = (target: 'input' | 'output') => {
    setSelectorTarget(target);
    setIsSelectorOpen(true);
  };

  const selectToken = (token: DexPair) => {
    const info: TokenInfo = {
      symbol: token.baseToken?.symbol || token.symbol,
      name: token.baseToken?.name || token.name,
      address: token.baseToken?.address || token.address,
      decimals: token.decimals || 9,
      logoURI: getTokenImageUrl(token.baseToken?.address || token.address, token.info?.imageUrl || token.logoURI)
    };

    setTargetToken(info);
    setIsSelectorOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    
    // Reset amounts when token changes
    setInputAmount('');
    setOutputAmount('');
    setQuoteResponse(null);

    // Call callback if provided
    if (onTokenSelect) {
      onTokenSelect(token);
    }
  };

  useEffect(() => {
    const search = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const results = await searchTokens(searchQuery);
        setSearchResults(results);
      } catch (e) {
        console.error('Search error:', e);
      } finally {
        setIsSearching(false);
      }
    };

    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="w-full max-w-[380px] bg-[#0A0A0A] border border-white/5 rounded-[35px] p-5 shadow-2xl relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-wave-cyan" />
          <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Swap</h2>
        </div>
        <div className="flex bg-[#121414] p-1 rounded-[18px] border border-white/[0.02]">
          <button 
            onClick={() => setMode('buy')}
            className={`px-5 py-1.5 rounded-[14px] text-[9px] font-black transition-all ${
              mode === 'buy' 
                ? 'bg-wave-cyan text-black' 
                : 'text-zinc-600 hover:text-white'
            }`}
          >
            BUY
          </button>
          <button 
            onClick={() => setMode('sell')}
            className={`px-5 py-1.5 rounded-[14px] text-[9px] font-black transition-all ${
              mode === 'sell' 
                ? 'bg-wave-cyan text-black' 
                : 'text-zinc-600 hover:text-white'
            }`}
          >
            SELL
          </button>
        </div>
      </div>

      {/* Pay Section */}
      <div className="bg-[#121414] border border-white/[0.02] rounded-[25px] p-4 mb-0.5 relative group focus-within:border-white/10 transition-all">
        <div className="flex justify-between mb-3">
          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Pay</span>
          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Bal: {inputBalance.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
        </div>
        <div className="flex items-center gap-3 mb-4">
          <input
            type="number"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
            placeholder="0.0"
            className="bg-transparent border-none p-0 text-2xl font-black text-white focus:outline-none focus:ring-0 w-full placeholder:text-zinc-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <button 
            onClick={() => openSelector('input')}
            className="flex items-center gap-2 px-2.5 py-1 bg-[#1A1D1D] border border-white/5 rounded-[12px] hover:bg-white/10 transition-all shrink-0"
          >
            <img src={inputToken.logoURI} alt="" className="w-3.5 h-3.5 rounded-full" />
            <span className="font-black text-[9px] text-white tracking-widest uppercase">{inputToken.symbol}</span>
          </button>
        </div>
        <div className="flex gap-1">
          {[0.25, 0.5, 0.75, 1].map((pct) => (
            <button
              key={pct}
              onClick={() => handlePercentage(pct)}
              className="flex-1 py-2 bg-[#1A1D1D]/30 border border-white/[0.01] rounded-[10px] text-[8px] font-black text-zinc-600 hover:bg-white/[0.02] hover:text-white transition-all uppercase tracking-tighter"
            >
              {pct * 100}%
            </button>
          ))}
        </div>
      </div>

      {/* Separator */}
      <div className="flex justify-center -my-3 relative z-10">
        <div 
          onClick={() => setMode(mode === 'buy' ? 'sell' : 'buy')}
          className="w-8 h-8 rounded-full bg-[#0A0A0A] border border-white/[0.02] flex items-center justify-center text-zinc-600 shadow-2xl cursor-pointer hover:text-wave-cyan transition-colors"
        >
          <ArrowDown size={14} />
        </div>
      </div>

      {/* Receive Section */}
      <div className="bg-[#121414] border border-white/[0.02] rounded-[25px] p-4 mt-0.5 transition-all">
        <div className="flex justify-between mb-3">
          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Receive</span>
          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Bal: {outputBalance.toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            {quoting ? (
              <div className="h-8 w-20 bg-white/5 animate-pulse rounded-lg" />
            ) : (
              <input
                type="text"
                readOnly
                value={outputAmount}
                placeholder="0.0"
                className="bg-transparent border-none p-0 text-2xl font-black text-white focus:outline-none focus:ring-0 w-full placeholder:text-zinc-900"
              />
            )}
          </div>
          {outputToken && (
            <button 
              onClick={() => openSelector('output')}
              className="flex items-center gap-2 px-2.5 py-1 bg-[#1A1D1D]/50 border border-wave-cyan/10 rounded-[12px] hover:bg-wave-cyan/5 transition-all shrink-0"
            >
              <img src={outputToken.logoURI} alt="" className="w-3.5 h-3.5 rounded-full bg-zinc-900" />
              <span className="font-black text-[9px] text-wave-cyan tracking-widest uppercase">{outputToken.symbol}</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Button */}
      <button
        disabled={loading || quoting || (walletConnected && !inputAmount)}
        onClick={walletConnected ? handleSwap : undefined}
        className="w-full mt-6 py-4 bg-white text-black rounded-[20px] font-black text-[12px] uppercase tracking-[0.2em] hover:bg-zinc-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] shadow-2xl"
      >
        {!walletConnected ? 'Connect Wallet' : loading ? 'Processing...' : quoting ? 'Quoting...' : !inputAmount ? 'Enter Amount' : 'Execute Swap'}
      </button>

      {/* Footer Info */}
      <div className="mt-6 flex items-center justify-center gap-6">
        <div className="flex items-center gap-1 text-wave-cyan">
          <Zap size={10} fill="currentColor" />
          <span className="text-[9px] font-black uppercase tracking-[0.1em]">200ms Quote</span>
        </div>
        <div className="flex items-center gap-1 text-wave-cyan">
          <Zap size={10} fill="currentColor" />
          <span className="text-[9px] font-black uppercase tracking-[0.1em]">Jup V6</span>
        </div>
      </div>



      {/* Token Selector Modal */}
      <AnimatePresence>
        {isSelectorOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSelectorOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-[400px] bg-[#0A0B0B] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Select Token</h3>
                  <button onClick={() => setIsSelectorOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500">
                    <X size={20} />
                  </button>
                </div>

                <div className="relative mb-6">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                  <input
                    autoFocus
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name or address..."
                    className="w-full bg-[#121414] border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold text-white focus:outline-none focus:border-[#14F195]/30 transition-all placeholder:text-zinc-800 uppercase"
                  />
                </div>

                <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
                  {isSearching ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="h-16 bg-white/[0.02] border border-white/[0.02] rounded-2xl animate-pulse" />
                    ))
                  ) : searchQuery.length > 0 ? (
                    searchResults.map((token) => (
                      <button
                        key={token.pairAddress}
                        onClick={() => selectToken(token)}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-white/5"
                      >
                        <div className="flex items-center gap-4">
                          <img src={getTokenImageUrl(token.baseToken.address, token.info?.imageUrl)} className="w-10 h-10 rounded-xl bg-zinc-900" alt="" />
                          <div className="text-left">
                            <div className="text-sm font-black text-white uppercase tracking-tight">{token.baseToken.symbol}</div>
                            <div className="text-[10px] font-bold text-zinc-600 uppercase truncate max-w-[150px]">{token.baseToken.name}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono text-white">${parseFloat(token.priceUsd).toLocaleString(undefined, { maximumFractionDigits: 6 })}</div>
                          <div className={`text-[10px] font-black ${token.priceChange.h24 >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            {token.priceChange.h24 >= 0 ? '+' : ''}{token.priceChange.h24}%
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <>
                      <div className="text-[10px] font-black text-zinc-700 uppercase tracking-widest mb-2 px-2">Popular</div>
                      {[SOL_TOKEN, USDC_TOKEN].map((token) => (
                        <button
                          key={token.address}
                          onClick={() => selectToken(token)}
                          className="w-full flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-white/5"
                        >
                          <img src={token.logoURI} className="w-10 h-10 rounded-xl bg-zinc-900" alt="" />
                          <div className="text-left">
                            <div className="text-sm font-black text-white uppercase tracking-tight">{token.symbol}</div>
                            <div className="text-[10px] font-bold text-zinc-600 uppercase">{token.name}</div>
                          </div>
                        </button>
                      ))}
                    </>
                  )}
                  {searchQuery.length > 0 && searchResults.length === 0 && !isSearching && (
                    <div className="py-12 text-center">
                      <Activity size={32} className="text-zinc-800 mx-auto mb-3" />
                      <p className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">No tokens found</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
