import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const apiKey = process.env.HELIUS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Helius API key not configured' }, { status: 500 });
    }

    // Using the Enriched Transactions API
    const url = `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${apiKey}&limit=25`;

    const response = await fetch(url);
    const data = await response.json();

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: 'Invalid response from Helius' }, { status: 500 });
    }

    // Process transactions to identify swaps
    const processedTrades = data.map((tx: any) => {
      // Look for swap events or token transfers
      const swapEvent = tx.events?.swap;
      
      if (swapEvent) {
        return {
          signature: tx.signature,
          timestamp: tx.timestamp,
          type: 'swap',
          dex: swapEvent.source || 'DEX',
          fromAsset: {
            symbol: swapEvent.nativeInput?.symbol || swapEvent.tokenInputs?.[0]?.symbol || 'TOKEN',
            amount: swapEvent.nativeInput ? swapEvent.nativeInput.amount / 10**9 : swapEvent.tokenInputs?.[0]?.tokenAmount || 0,
            mint: swapEvent.nativeInput ? 'So11111111111111111111111111111111111111112' : swapEvent.tokenInputs?.[0]?.mint || '',
          },
          toAsset: {
            symbol: swapEvent.nativeOutput?.symbol || swapEvent.tokenOutputs?.[0]?.symbol || 'TOKEN',
            amount: swapEvent.nativeOutput ? swapEvent.nativeOutput.amount / 10**9 : swapEvent.tokenOutputs?.[0]?.tokenAmount || 0,
            mint: swapEvent.nativeOutput ? 'So11111111111111111111111111111111111111112' : swapEvent.tokenOutputs?.[0]?.mint || '',
          },
          status: tx.description?.includes('failed') ? 'failed' : 'success'
        };
      }

      // Fallback: Check token transfers for basic buy/sell detection
      const tokenTransfers = tx.tokenTransfers || [];
      const nativeTransfers = tx.nativeTransfers || [];
      
      if (tokenTransfers.length > 0) {
        const userInvolved = tokenTransfers.find((t: any) => t.fromUser === address || t.toUser === address || t.mint === address);
        if (userInvolved) {
          const isBuy = userInvolved.toUser === address || (userInvolved.mint === address && userInvolved.toUser !== '');
          const solTransfer = nativeTransfers.find((n: any) => (isBuy ? n.fromUser === address : n.toUser === address));
          
          return {
            signature: tx.signature,
            timestamp: tx.timestamp,
            type: isBuy ? 'buy' : 'sell',
            dex: tx.source || 'DEX',
            fromAsset: isBuy ? {
              symbol: 'SOL',
              amount: (solTransfer?.amount || 0) / 10**9,
              mint: 'So11111111111111111111111111111111111111112'
            } : {
              symbol: userInvolved.symbol || 'TOKEN',
              amount: userInvolved.tokenAmount || 0,
              mint: userInvolved.mint
            },
            toAsset: isBuy ? {
              symbol: userInvolved.symbol || 'TOKEN',
              amount: userInvolved.tokenAmount || 0,
              mint: userInvolved.mint
            } : {
              symbol: 'SOL',
              amount: (solTransfer?.amount || 0) / 10**9,
              mint: 'So11111111111111111111111111111111111111112'
            },
            status: tx.description?.includes('failed') ? 'failed' : 'success'
          };
        }
      }

      return null;
    }).filter((t: any) => t !== null);

    return NextResponse.json({ transactions: processedTrades });
  } catch (error: any) {
    console.error('Helius Transactions API proxy error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { address } = await req.json();

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    const apiKey = process.env.HELIUS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Helius API key not configured' }, { status: 500 });
    }

    // Using the Enriched Transactions API
    const url = `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${apiKey}&limit=25`;

    const response = await fetch(url);
    const data = await response.json();

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: 'Invalid response from Helius' }, { status: 500 });
    }

    // Process transactions to identify swaps
    const processedTrades = data.map((tx: any) => {
      // Look for swap events or token transfers
      const swapEvent = tx.events?.swap;
      
      if (swapEvent) {
        return {
          signature: tx.signature,
          timestamp: tx.timestamp,
          type: 'swap',
          dex: swapEvent.source || 'DEX',
          fromAsset: {
            symbol: swapEvent.nativeInput?.symbol || swapEvent.tokenInputs?.[0]?.symbol || 'TOKEN',
            amount: swapEvent.nativeInput ? swapEvent.nativeInput.amount / 10**9 : swapEvent.tokenInputs?.[0]?.tokenAmount || 0,
            mint: swapEvent.nativeInput ? 'So11111111111111111111111111111111111111112' : swapEvent.tokenInputs?.[0]?.mint || '',
          },
          toAsset: {
            symbol: swapEvent.nativeOutput?.symbol || swapEvent.tokenOutputs?.[0]?.symbol || 'TOKEN',
            amount: swapEvent.nativeOutput ? swapEvent.nativeOutput.amount / 10**9 : swapEvent.tokenOutputs?.[0]?.tokenAmount || 0,
            mint: swapEvent.nativeOutput ? 'So11111111111111111111111111111111111111112' : swapEvent.tokenOutputs?.[0]?.mint || '',
          },
          status: tx.description?.includes('failed') ? 'failed' : 'success'
        };
      }

      // Fallback: Check token transfers for basic buy/sell detection
      const tokenTransfers = tx.tokenTransfers || [];
      const nativeTransfers = tx.nativeTransfers || [];
      
      if (tokenTransfers.length > 0) {
        const userInvolved = tokenTransfers.find((t: any) => t.fromUser === address || t.toUser === address || t.mint === address);
        if (userInvolved) {
          const isBuy = userInvolved.toUser === address || (userInvolved.mint === address && userInvolved.toUser !== '');
          const solTransfer = nativeTransfers.find((n: any) => (isBuy ? n.fromUser === address : n.toUser === address));
          
          return {
            signature: tx.signature,
            timestamp: tx.timestamp,
            type: isBuy ? 'buy' : 'sell',
            dex: tx.source || 'DEX',
            fromAsset: isBuy ? {
              symbol: 'SOL',
              amount: (solTransfer?.amount || 0) / 10**9,
              mint: 'So11111111111111111111111111111111111111112'
            } : {
              symbol: userInvolved.symbol || 'TOKEN',
              amount: userInvolved.tokenAmount || 0,
              mint: userInvolved.mint
            },
            toAsset: isBuy ? {
              symbol: userInvolved.symbol || 'TOKEN',
              amount: userInvolved.tokenAmount || 0,
              mint: userInvolved.mint
            } : {
              symbol: 'SOL',
              amount: (solTransfer?.amount || 0) / 10**9,
              mint: 'So11111111111111111111111111111111111111112'
            },
            status: tx.description?.includes('failed') ? 'failed' : 'success'
          };
        }
      }

      return null;
    }).filter((t: any) => t !== null);

    return NextResponse.json({ transactions: processedTrades });
  } catch (error: any) {
    console.error('Helius Transactions API proxy error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
