import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://api.dexscreener.com/latest/dex/search?q=${encodeURIComponent(query)}`
    );
    if (!res.ok) return NextResponse.json([]);

    const data = await res.json();
    const pairs = (data.pairs || []).slice(0, 10).map((pair: Record<string, unknown>) => {
      const baseToken = pair.baseToken as Record<string, string>;
      return {
        symbol: baseToken?.address || '',
        name: `${baseToken?.symbol || '?'}/${(pair.quoteToken as Record<string, string>)?.symbol || '?'}`,
        exchange: `${pair.dexId || 'DEX'} (${pair.chainId || ''})`,
        assetClass: 'dex',
      };
    });

    return NextResponse.json(pairs);
  } catch (error) {
    console.error('DexScreener error:', error);
    return NextResponse.json([]);
  }
}
