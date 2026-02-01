export interface DexPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  marketCap: number;
  pairCreatedAt: number;
  info?: {
    imageUrl?: string;
    websites?: { label: string; url: string }[];
    socials?: { type: string; url: string }[];
  };
}

export interface DexResponse {
  schemaVersion: string;
  pairs: DexPair[];
}

export async function getLatestTokenProfiles(): Promise<any[]> {
  try {
    const response = await fetch('https://api.dexscreener.com/token-profiles/latest/v1');
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Error fetching token profiles:', error);
    return [];
  }
}

export async function getPairData(chainId: string, pairId: string): Promise<DexPair | null> {
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/pairs/${chainId}/${pairId}`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.pair || (data.pairs ? data.pairs[0] : null);
  } catch (error) {
    console.error('Error fetching pair data:', error);
    return null;
  }
}

export async function getTokenPairs(chainId: string, tokenAddress: string): Promise<DexPair[]> {
  try {
    const response = await fetch(`https://api.dexscreener.com/token-pairs/v1/${chainId}/${tokenAddress}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Error fetching token pairs:', error);
    return [];
  }
}

const BLACKLIST_SYMBOLS = ['MOODENG', 'POPCAT', 'GOAT', 'CATFROG', 'CATFROGDOGSHARK'];
const BLACKLIST_ADDRESSES = [
  'fESbUKjuMY6jzDH9VP8cy4p3pu2q5W2rK2XghVfNseP', // CatFrogDogShark
];

export async function getSolanaTokenData(tokenAddresses: string[]): Promise<DexResponse> {
  if (!tokenAddresses.length) return { schemaVersion: '1.0.0', pairs: [] };
  
  const filteredAddresses = tokenAddresses.filter(addr => !BLACKLIST_ADDRESSES.includes(addr));
  if (!filteredAddresses.length) return { schemaVersion: '1.0.0', pairs: [] };

  try {
    // 1. Fetch from Dexscreener first as it gives us pairs and initial metrics
    const chunks = [];
    for (let i = 0; i < filteredAddresses.length; i += 30) {
      chunks.push(filteredAddresses.slice(i, i + 30));
    }

    const allPairs: DexPair[] = [];
    await Promise.all(chunks.map(async (chunk) => {
      const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/solana/${chunk.join(',')}`);
      if (response.ok) {
        const data: DexResponse = await response.json();
        if (data.pairs) {
          allPairs.push(...data.pairs.filter(p => 
            !BLACKLIST_SYMBOLS.includes(p.baseToken.symbol.toUpperCase()) &&
            !BLACKLIST_ADDRESSES.includes(p.baseToken.address)
          ));
        }
      }
    }));

    // 2. Enrichment from GeckoTerminal for accuracy
    // Use GeckoTerminal for ALL tokens to ensure we have the best data
    const uniqueTokens = Array.from(new Set(filteredAddresses));

    // GeckoTerminal Simple Price API for bulk prices
    try {
      const endpoint = `simple/networks/solana/token_price/${uniqueTokens.join(',')}`;
      const priceRes = await fetch(`/api/gecko?endpoint=${encodeURIComponent(endpoint)}&include_market_cap=true&include_24hr_vol=true`);
      if (priceRes.ok) {
        const priceData = await priceRes.json();
        const prices = priceData.data?.attributes?.token_prices || {};
        
        allPairs.forEach(p => {
          const addr = p.baseToken.address;
          if (prices[addr]) {
            p.priceUsd = prices[addr];
          }
        });
      }
    } catch (e) {
      console.error('GeckoTerminal bulk price fetch failed:', e);
    }

    // Individual enrichment for missing metrics (mcap, liq, vol)
    await Promise.all(uniqueTokens.map(async (address) => {
      try {
        const endpoint = `networks/solana/tokens/${address}`;
        const geckoRes = await fetch(`/api/gecko?endpoint=${encodeURIComponent(endpoint)}&include=top_pools`);
        if (geckoRes.ok) {
          const geckoData = await geckoRes.json();
          const attr = geckoData.data?.attributes;
          if (attr) {
            allPairs.forEach(p => {
              if (p.baseToken.address === address) {
                if (attr.price_usd) p.priceUsd = attr.price_usd;
                if (attr.fdv_usd) p.fdv = parseFloat(attr.fdv_usd);
                if (attr.market_cap_usd) p.marketCap = parseFloat(attr.market_cap_usd);
                if (attr.total_reserve_in_usd) {
                  p.liquidity = { ...p.liquidity, usd: parseFloat(attr.total_reserve_in_usd) };
                }
                if (attr.volume_usd?.h24) {
                  p.volume = { ...p.volume, h24: parseFloat(attr.volume_usd.h24) };
                }
                // Price change from GeckoTerminal if Dexscreener is missing it
                if (p.priceChange.h24 === 0 && attr.price_change_percentage?.h24) {
                  p.priceChange.h24 = parseFloat(attr.price_change_percentage.h24);
                }
              }
            });

            // If no pairs found in Dexscreener but GeckoTerminal has data, create a mock pair
            if (!allPairs.some(p => p.baseToken.address === address)) {
              allPairs.push({
                chainId: 'solana',
                dexId: 'geckoterminal',
                url: `https://dexscreener.com/solana/${address}`,
                pairAddress: address,
                baseToken: {
                  address: address,
                  name: attr.name,
                  symbol: attr.symbol,
                },
                quoteToken: {
                  address: 'So11111111111111111111111111111111111111112',
                  name: 'SOL',
                  symbol: 'SOL',
                },
                priceNative: '0',
                priceUsd: attr.price_usd || '0',
                txns: { m5: { buys: 0, sells: 0 }, h1: { buys: 0, sells: 0 }, h6: { buys: 0, sells: 0 }, h24: { buys: 0, sells: 0 } },
                volume: { h24: parseFloat(attr.volume_usd?.h24 || '0'), h6: 0, h1: 0, m5: 0 },
                priceChange: { m5: 0, h1: 0, h6: 0, h24: parseFloat(attr.price_change_percentage?.h24 || '0') },
                liquidity: { usd: parseFloat(attr.total_reserve_in_usd || '0'), base: 0, quote: 0 },
                fdv: parseFloat(attr.fdv_usd || '0'),
                marketCap: parseFloat(attr.market_cap_usd || '0'),
                pairCreatedAt: Date.now(),
                info: { imageUrl: attr.image_url }
              } as DexPair);
            }
          }
        }
      } catch (e) {
        console.error(`GeckoTerminal enrichment failed for ${address}:`, e);
      }
    }));

    return { schemaVersion: '1.0.0', pairs: allPairs };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { schemaVersion: '1.0.0', pairs: [] };
  }
}

export async function getTokenData(tokenAddress: string): Promise<DexPair | null> {
  const data = await getSolanaTokenData([tokenAddress]);
  if (!data.pairs || data.pairs.length === 0) return null;
  return data.pairs.sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];
}

export async function searchTokens(query: string): Promise<DexPair[]> {
  try {
    // If it looks like a Solana address, try to fetch specific pair data
    if (query.length >= 32 && query.length <= 44) {
      const data = await getSolanaTokenData([query]);
      if (data.pairs && data.pairs.length > 0) {
        return data.pairs.filter(p => p.chainId === 'solana');
      }
      
      // If no pair yet, try to get basic token info from Jupiter to show something
      try {
        const jupRes = await fetch(`https://tokens.jup.ag/token/${query}`);
        if (jupRes.ok) {
          const jupToken = await jupRes.json();
          // Try GeckoTerminal for full metrics if Jupiter doesn't have it
          let price = '0';
          let mcap = 0;
          let liq = 0;
          let vol = 0;
            try {
              const endpoint = `networks/solana/tokens/${query}`;
              const gRes = await fetch(`/api/gecko?endpoint=${encodeURIComponent(endpoint)}`);
              if (gRes.ok) {
              const gData = await gRes.json();
              const attr = gData.data?.attributes;
              price = attr?.price_usd || '0';
              mcap = parseFloat(attr?.market_cap_usd || attr?.fdv_usd || '0');
              liq = parseFloat(attr?.total_reserve_in_usd || '0');
              vol = parseFloat(attr?.volume_usd?.h24 || '0');
            }
          } catch (e) {}

          return [{
            chainId: 'solana',
            dexId: 'jupiter',
            url: `https://dexscreener.com/solana/${query}`,
            pairAddress: query,
            baseToken: {
              address: query,
              name: jupToken.name,
              symbol: jupToken.symbol,
            },
            quoteToken: {
              address: 'So11111111111111111111111111111111111111112',
              name: 'SOL',
              symbol: 'SOL',
            },
            priceNative: '0',
            priceUsd: price,
            txns: { m5: { buys: 0, sells: 0 }, h1: { buys: 0, sells: 0 }, h6: { buys: 0, sells: 0 }, h24: { buys: 0, sells: 0 } },
            volume: { h24: vol, h6: 0, h1: 0, m5: 0 },
            priceChange: { m5: 0, h1: 0, h6: 0, h24: 0 },
            liquidity: { usd: liq, base: 0, quote: 0 },
            fdv: mcap,
            marketCap: mcap,
            pairCreatedAt: Date.now(),
            info: { imageUrl: jupToken.logoURI }
          } as DexPair];
        }
      } catch (e) {}
    }

    const response = await fetch(`https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) return [];
    
    const data: DexResponse = await response.json();
    return data.pairs ? data.pairs.filter(p => 
      p.chainId === 'solana' && 
      !BLACKLIST_SYMBOLS.includes(p.baseToken.symbol.toUpperCase()) &&
      !BLACKLIST_ADDRESSES.includes(p.baseToken.address)
    ) : [];
  } catch (error) {
    console.error('Error searching Dexscreener:', error);
    return [];
  }
}

export async function getTrendingTokens(): Promise<DexPair[]> {
  try {
    const response = await fetch('https://api.dexscreener.com/latest/dex/search?q=solana');
    if (!response.ok) return [];
    const data: DexResponse = await response.json();
    return data.pairs ? data.pairs.filter(p => 
      p.chainId === 'solana' && 
      !BLACKLIST_SYMBOLS.includes(p.baseToken.symbol.toUpperCase()) &&
      !BLACKLIST_ADDRESSES.includes(p.baseToken.address)
    ).slice(0, 10) : [];
  } catch (error) {
    console.error('Error fetching trending tokens:', error);
    return [];
  }
}

export function getTokenImageUrl(address: string, fallbackUrl?: string): string {
  if (!address) return fallbackUrl || '';
  
  const hardcoded: Record<string, string> = {
    'So11111111111111111111111111111111111111112': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
    'DezXAZ8z7PnrnRJjz3wXBoRgixeb6V1H47GEG5SDRptF': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/DezXAZ8z7PnrnRJjz3wXBoRgixeb6V1H47GEG5SDRptF/logo.png',
  };
  
  if (hardcoded[address]) return hardcoded[address];
  if (fallbackUrl && fallbackUrl.startsWith('http')) return fallbackUrl;
  
  return `https://dd.dexscreener.com/ds-data/tokens/solana/${address}.png`;
}
