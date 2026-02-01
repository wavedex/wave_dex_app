import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ownerAddress = searchParams.get('address');

    if (!ownerAddress) {
      return NextResponse.json({ error: 'Owner address is required' }, { status: 400 });
    }

    const apiKey = process.env.HELIUS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Helius API key not configured' }, { status: 500 });
    }

    const url = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress,
          page: 1,
          limit: 1000,
          displayOptions: {
            showFungible: true,
            showNativeBalance: true,
          },
        },
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    let assets = data.result?.items || [];
    
    // If no assets found by owner, it might be a Token CA (Mint address)
    if (assets.length === 0) {
      const assetRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'get-asset',
          method: 'getAsset',
          params: {
            id: ownerAddress,
            displayOptions: {
              showFungible: true,
            },
          },
        }),
      });
      const assetData = await assetRes.json();
      if (assetData.result) {
        assets = [assetData.result];
      }
    }
    
    // Process assets to a cleaner format
    const formattedAssets = assets.map((asset: any) => {
      const metadata = asset.content?.metadata || {};
      const tokenInfo = asset.token_info || {};
      
      // Native SOL is handled slightly differently in Helius DAS
      if (asset.id === 'So11111111111111111111111111111111111111112' || asset.interface === 'NativeAsset') {
        return {
          mint: 'So11111111111111111111111111111111111111112',
          symbol: 'SOL',
          name: 'Solana',
          amount: (tokenInfo.balance || 0) / 10 ** 9,
          decimals: 9,
          price: tokenInfo.price_info?.price_per_token || 0,
          logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
        };
      }

      return {
        mint: asset.id,
        symbol: tokenInfo.symbol || metadata.symbol || 'UNKNOWN',
        name: metadata.name || 'Unknown Token',
        amount: (tokenInfo.balance || 0) / 10 ** (tokenInfo.decimals || 0),
        decimals: tokenInfo.decimals || 0,
        price: tokenInfo.price_info?.price_per_token || 0,
        logoURI: asset.content?.links?.image || asset.content?.files?.[0]?.uri || '',
      };
    }).filter((a: any) => a.amount > 0);

    return NextResponse.json({ assets: formattedAssets });
  } catch (error: any) {
    console.error('Helius API proxy error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { ownerAddress } = await req.json();

    if (!ownerAddress) {
      return NextResponse.json({ error: 'Owner address is required' }, { status: 400 });
    }

    const apiKey = process.env.HELIUS_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Helius API key not configured' }, { status: 500 });
    }

    const url = `https://mainnet.helius-rpc.com/?api-key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress,
          page: 1,
          limit: 1000,
          displayOptions: {
            showFungible: true,
            showNativeBalance: true,
          },
        },
      }),
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error.message }, { status: 500 });
    }

    let assets = data.result?.items || [];
    
    // If no assets found by owner, it might be a Token CA (Mint address)
    if (assets.length === 0) {
      const assetRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'get-asset',
          method: 'getAsset',
          params: {
            id: ownerAddress,
            displayOptions: {
              showFungible: true,
            },
          },
        }),
      });
      const assetData = await assetRes.json();
      if (assetData.result) {
        assets = [assetData.result];
      }
    }
    
    // Process assets to a cleaner format
    const formattedAssets = assets.map((asset: any) => {
      const metadata = asset.content?.metadata || {};
      const tokenInfo = asset.token_info || {};
      
      // Native SOL is handled slightly differently in Helius DAS
      if (asset.id === 'So11111111111111111111111111111111111111112' || asset.interface === 'NativeAsset') {
        return {
          mint: 'So11111111111111111111111111111111111111112',
          symbol: 'SOL',
          name: 'Solana',
          amount: (tokenInfo.balance || 0) / 10 ** 9,
          decimals: 9,
          price: tokenInfo.price_info?.price_per_token || 0,
          logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
        };
      }

      return {
        mint: asset.id,
        symbol: tokenInfo.symbol || metadata.symbol || 'UNKNOWN',
        name: metadata.name || 'Unknown Token',
        amount: (tokenInfo.balance || 0) / 10 ** (tokenInfo.decimals || 0),
        decimals: tokenInfo.decimals || 0,
        price: tokenInfo.price_info?.price_per_token || 0,
        logoURI: asset.content?.links?.image || asset.content?.files?.[0]?.uri || '',
      };
    }).filter((a: any) => a.amount > 0);

    return NextResponse.json({ assets: formattedAssets });
  } catch (error: any) {
    console.error('Helius API proxy error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
