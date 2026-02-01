import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { balances, trades, address } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Groq API Key not configured' }, { status: 500 });
    }

    // Detect if this is a Token CA or a Wallet
    const isTokenCA = balances.length === 1 && (balances[0].mint === address || balances[0].symbol === address);
    
    let prompt = '';
    
    if (isTokenCA) {
      const token = balances[0];
      prompt = `
        You are a high-performance Solana trading assistant for the WaveDex Terminal. 
        Analyze the following TOKEN CONTRACT DATA and provide professional, concise, terminal-style insights.
        This is a Token Contract Analysis, NOT a wallet analysis.

        Token Name: ${token.name}
        Token Symbol: ${token.symbol}
        Contract Address: ${address}
        Current Price: $${token.price}
        
        Recent Token Activity (Trades involving this mint):
        ${JSON.stringify(trades.slice(0, 15).map((t: any) => ({ 
          type: t.type, 
          from: t.fromAsset.symbol, 
          to: t.toAsset.symbol, 
          amount: t.toAsset.amount,
          timestamp: t.timestamp 
        })), null, 2)}

        Output format:
        1. **Token Alpha Score**: (A score from 0-100 based on recent volume, buy/sell pressure, and "vibe")
        2. **Market Sentiment**: (Concise 1-2 sentence breakdown of the current trading momentum)
        3. **Volume Analysis**: (Professional commentary on recent buy/sell activity)
        4. **Risk Assessment**: (Honeypot risk, liquidity depth perception, volatility)
        5. **Trade Recommendation**: (Actionable insight for a high-frequency trader)

        Keep it brief, aggressive, and professional. Use markdown.
      `;
    } else {
      prompt = `
        You are a high-performance Solana trading assistant for the WaveDex Terminal. 
        Analyze the following WALLET data and provide professional, concise, terminal-style insights.
        This is a Wallet Portfolio Analysis.

        Wallet Address: ${address}
        
        Holdings:
        ${JSON.stringify(balances.map((b: any) => ({ symbol: b.symbol, amount: b.amount, value: b.value })), null, 2)}

        Recent Trades:
        ${JSON.stringify(trades.slice(0, 10).map((t: any) => ({ type: t.type, from: t.fromAsset.symbol, to: t.toAsset.symbol, timestamp: t.timestamp })), null, 2)}

        Output format:
        1. **Conviction Score**: (A score from 0-100 based on holding duration and concentration)
        2. **Portfolio Analysis**: (Concise 1-2 sentence breakdown)
        3. **Recent Activity**: (Professional commentary on recent trades)
        4. **Risk Profile**: (Low/Medium/High/Degen)
        5. **Strategy Recommendation**: (Actionable insight)

        Keep it brief, aggressive, and professional. Use markdown.
      `;
    }


    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a professional Solana trading terminal AI. You provide sharp, concise, and data-driven insights.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    const content = data.choices[0]?.message?.content || 'Failed to generate insights';

    return NextResponse.json({ insights: content });
  } catch (error: any) {
    console.error('Groq API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
