import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const inputMint = searchParams.get('inputMint');
  const outputMint = searchParams.get('outputMint');
  const amount = searchParams.get('amount');
  const slippageBps = searchParams.get('slippageBps') || '50';

  if (!inputMint || !outputMint || !amount) {
    return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
  }

  try {
    const apiKey = process.env.JUPITER_API_KEY;
    const baseUrl = 'https://api.jup.ag/swap/v1';
    
    // Try the new Swap V1 API (Keyed)
    const url = new URL(`${baseUrl}/quote`);
    url.searchParams.append('inputMint', inputMint);
    url.searchParams.append('outputMint', outputMint);
    url.searchParams.append('amount', amount);
    url.searchParams.append('slippageBps', slippageBps);
    url.searchParams.append('onlyDirectRoutes', 'false');
    url.searchParams.append('asLegacyTransaction', 'false');

    const headers: Record<string, string> = {};
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    const response = await fetch(url.toString(), {
      headers,
      next: { revalidate: 0 }
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Jupiter Quote API Error:', data);
      return NextResponse.json({ 
        error: data.error || 'Jupiter API error',
        details: data
      }, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Jupiter Quote Error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch quote',
      message: error.message 
    }, { status: 500 });
  }
}
