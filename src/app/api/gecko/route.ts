import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint) {
    return NextResponse.json({ error: 'Endpoint is required' }, { status: 400 });
  }

  try {
    const fullUrl = `https://api.geckoterminal.com/api/v2/${endpoint}?${searchParams.toString().replace(`endpoint=${encodeURIComponent(endpoint)}`, '')}`;
    
    const response = await fetch(fullUrl, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 30 } // Cache for 30 seconds
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch from GeckoTerminal' }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('GeckoTerminal Proxy Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
