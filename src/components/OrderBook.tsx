'use client';

import { useEffect, useState } from 'react';
import { DexPair } from '@/lib/dexscreener';

interface OrderBookProps {
  token: DexPair;
}

interface Order {
  price: number;
  size: number;
  total: number;
}

export function OrderBook({ token }: OrderBookProps) {
  const [orders, setOrders] = useState<{ buys: Order[], sells: Order[] }>({ buys: [], sells: [] });
  const [spread, setSpread] = useState(0.02);

  useEffect(() => {
    const generateOrders = () => {
      const price = parseFloat(token.priceUsd);
      if (isNaN(price) || price === 0) return;

      const newSells: Order[] = [];
      const newBuys: Order[] = [];

      for (let i = 0; i < 20; i++) {
        const sellPrice = price * (1 + (i + 1) * 0.001);
        const sellSize = Math.random() * 5000 + 100;
        newSells.push({ price: sellPrice, size: sellSize, total: sellPrice * sellSize });

        const buyPrice = price * (1 - (i + 1) * 0.001);
        const buySize = Math.random() * 5000 + 100;
        newBuys.push({ price: buyPrice, size: buySize, total: buyPrice * buySize });
      }

      setOrders({ buys: newBuys, sells: newSells.reverse() });
      setSpread(Math.random() * 0.05 + 0.01);
    };

    generateOrders();
    const interval = setInterval(generateOrders, 3000);
    return () => clearInterval(interval);
  }, [token.priceUsd]);

  const formatPrice = (p: number) => {
    return p < 0.0001 ? p.toFixed(8) : p < 1 ? p.toFixed(6) : p.toFixed(4);
  };

  return (
    <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-3xl p-4 flex flex-col gap-3 min-h-[300px] lg:min-h-[950px] overflow-hidden">
      <div className="flex items-center justify-between shrink-0">
        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Order Book</span>
        <span className="text-[8px] font-mono text-zinc-600">Spread: {spread.toFixed(2)}%</span>
      </div>
      
      <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 flex flex-col justify-end overflow-hidden">
            {orders.sells.map((order, i) => (
              <div key={`sell-${i}`} className="flex items-center justify-between text-[10px] font-mono h-6 relative group cursor-pointer hover:bg-white/5 transition-colors">
                <div className="absolute right-0 h-full bg-red-500/10 transition-all" style={{ width: `${(order.size / 5000) * 100}%` }} />
                <span className="text-red-500 z-10">{formatPrice(order.price)}</span>
                <span className="text-zinc-500 z-10">{order.size.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            ))}
          </div>

          <div className="py-2 border-y border-white/5 my-1 text-center font-mono text-xs font-black text-white">
            ${parseFloat(token.priceUsd) < 0.0001 ? parseFloat(token.priceUsd).toFixed(8) : parseFloat(token.priceUsd).toLocaleString()}
          </div>

          <div className="flex-1 flex flex-col overflow-hidden">
            {orders.buys.map((order, i) => (
              <div key={`buy-${i}`} className="flex items-center justify-between text-[10px] font-mono h-6 relative group cursor-pointer hover:bg-white/5 transition-colors">
                <div className="absolute right-0 h-full bg-green-500/10 transition-all" style={{ width: `${(order.size / 5000) * 100}%` }} />
                <span className="text-green-500 z-10">{formatPrice(order.price)}</span>
                <span className="text-zinc-500 z-10">{order.size.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            ))}
          </div>
      </div>
    </div>
  );
}
