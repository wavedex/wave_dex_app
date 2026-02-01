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

  // Fetch from bot_settings (the one used in volume-bot/page.tsx)
  const { data, error } = await supabase
    .from('bot_settings')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || {});
}

export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { rpc_url, private_key, jupiter_api_key } = body;

  const { data: existing } = await supabase
    .from('bot_settings')
    .select('id')
    .limit(1)
    .maybeSingle();

  const payload: any = {
    rpc_url,
    private_key,
    jupiter_api_key,
    updated_at: new Date().toISOString()
  };

  if (existing?.id) {
    payload.id = existing.id;
  }

  const { data, error } = await supabase
    .from('bot_settings')
    .upsert(payload)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
