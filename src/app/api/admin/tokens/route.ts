import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { cookies } from 'next/headers';

async function checkAdmin() {
  const cookieStore = await cookies();
  const isAdmin = cookieStore.get('admin_session')?.value === 'true';
  return isAdmin;
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('tokens')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  let { address, symbol, name, logo_url, dexscreener_pair_address, is_featured, is_listed, twitter_content, decimals } = body;

  // If missing metadata, try to fetch from Dexscreener
  if (!symbol || !name || !decimals) {
    try {
      const res = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${address}`);
      const data = await res.json();
      const pair = data.pairs?.[0];
      if (pair) {
        symbol = symbol || pair.baseToken.symbol;
        name = name || pair.baseToken.name;
        logo_url = logo_url || pair.info?.imageUrl;
        dexscreener_pair_address = dexscreener_pair_address || pair.pairAddress;
        decimals = decimals || 9; // Default to 9 if unknown
      }
    } catch (e) {
      console.error('Metadata fetch failed:', e);
    }
  }

  const payload: any = {
    address,
    symbol: symbol || 'TOKEN',
    name: name || 'Token',
    decimals: decimals || 9,
    logo_url,
    dexscreener_pair_address,
    is_featured: !!is_featured,
    is_listed: !!is_listed
  };

  if (twitter_content) {
    payload.twitter_content = twitter_content;
    payload.tweet_generated_at = new Date().toISOString();
  }

  const { data: existing } = await supabase
    .from('tokens')
    .select('address')
    .eq('address', address)
    .maybeSingle();

  if (!existing) {
    payload.created_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('tokens')
    .upsert(payload)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const address = searchParams.get('address');

  if (!address) return NextResponse.json({ error: 'Missing address' }, { status: 400 });

  const { error } = await supabase
    .from('tokens')
    .delete()
    .eq('address', address);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
