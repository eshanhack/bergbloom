import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('q');
  if (!query) {
    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 });
  }

  try {
    // Check if this looks like a Binance crypto pair
    const upperQuery = query.toUpperCase();
    const cryptoResults: Array<{
      symbol: string;
      name: string;
      exchange: string;
      assetClass: string;
    }> = [];

    // Common crypto suffixes to check
    const cryptoPairs = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'XRPUSDT', 'DOGEUSDT',
      'ADAUSDT', 'AVAXUSDT', 'DOTUSDT', 'LINKUSDT', 'MATICUSDT', 'UNIUSDT', 'AAVEUSDT',
      'ATOMUSDT', 'LTCUSDT', 'NEARUSDT', 'APTUSDT', 'ARBUSDT', 'OPUSDT', 'FILUSDT'];

    const matchingCrypto = cryptoPairs.filter(
      (p) => p.includes(upperQuery) || upperQuery.includes(p.replace('USDT', ''))
    );

    for (const pair of matchingCrypto.slice(0, 5)) {
      cryptoResults.push({
        symbol: pair,
        name: `${pair.replace('USDT', '')}/USDT`,
        exchange: 'Binance',
        assetClass: 'crypto',
      });
    }

    // Yahoo Finance search
    const yahooResults = await yahooFinance.search(query, { quotesCount: 10 });
    const results = (yahooResults.quotes || []).map((q: Record<string, unknown>) => {
      const sym = (q.symbol as string) || '';
      let assetClass = 'us-equity';
      if (sym.endsWith('.AX')) assetClass = 'au-equity';
      else if (sym.startsWith('^')) assetClass = 'index';
      else if (sym.includes('=F')) assetClass = 'commodity';
      else if (sym.includes('=X')) assetClass = 'fx';

      return {
        symbol: sym,
        name: (q.shortname as string) || (q.longname as string) || sym,
        exchange: (q.exchange as string) || '',
        assetClass,
      };
    });

    return NextResponse.json([...cryptoResults, ...results]);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json([], { status: 200 });
  }
}
