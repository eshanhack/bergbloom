import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(request: NextRequest) {
  const symbols = request.nextUrl.searchParams.get('symbols');
  if (!symbols) {
    return NextResponse.json({ error: 'Missing symbols parameter' }, { status: 400 });
  }

  try {
    const symbolList = symbols.split(',').map((s) => s.trim()).filter(Boolean);
    const results = await Promise.allSettled(
      symbolList.map(async (symbol) => {
        const quote = await yahooFinance.quote(symbol);
        return {
          symbol: quote.symbol,
          name: quote.shortName || quote.longName || quote.symbol,
          price: quote.regularMarketPrice ?? 0,
          change: quote.regularMarketChange ?? 0,
          changePercent: quote.regularMarketChangePercent ?? 0,
          volume: quote.regularMarketVolume ?? 0,
          high24h: quote.regularMarketDayHigh ?? 0,
          low24h: quote.regularMarketDayLow ?? 0,
          marketCap: quote.marketCap ?? 0,
        };
      })
    );

    const quotes = results
      .filter((r) => r.status === 'fulfilled')
      .map((r) => (r as PromiseFulfilledResult<unknown>).value);

    return NextResponse.json(quotes);
  } catch (error) {
    console.error('Yahoo quotes error:', error);
    return NextResponse.json({ error: 'Failed to fetch quotes' }, { status: 500 });
  }
}
