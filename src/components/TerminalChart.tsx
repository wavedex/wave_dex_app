'use client';

interface TerminalChartProps {
  pairAddress?: string;
  chainId?: string;
}

export function TerminalChart({ pairAddress, chainId = 'solana' }: TerminalChartProps) {
  if (!pairAddress) {
    return (
      <div className="w-full h-full min-h-[500px] bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-wave-cyan/20 border-t-wave-cyan rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Loading Market Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <style>{`
        #dexscreener-embed {
          position: relative;
          width: 100%;
          padding-bottom: 125%;
        }
        @media(min-width: 1400px) {
          #dexscreener-embed {
            padding-bottom: 65%;
          }
        }
        #dexscreener-embed iframe {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          border: 0;
        }
      `}</style>
      <div id="dexscreener-embed">
        <iframe 
          src={`https://dexscreener.com/${chainId}/${pairAddress}?embed=1&loadChartSettings=0&trades=0&tabs=0&info=0&chartLeftToolbar=0&chartDefaultOnMobile=1&chartTheme=dark&theme=dark&chartStyle=1&chartType=usd&interval=5`}
          title="Dexscreener Chart"
        />
      </div>
    </div>
  );
}
