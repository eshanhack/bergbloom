import { NextRequest, NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol');
  const interval = request.nextUrl.searchParams.get('interval') || '1d';
  const range = request.nextUrl.searchParams.get('range') || '1y';

  if (!symbol) {
    return NextResponse.json({ error: 'Missing symbol parameter' }, { status: 400 });
  }

  try {
    // Calculate period dates from range
    const now = new Date();
    const period2 = now;
    const period1 = new Date(now);

    switch (range) {
      case '1d': period1.setDate(now.getDate() - 1); break;
      case '5d': period1.setDate(now.getDate() - 5); break;
      case '1mo': period1.setMonth(now.getMonth() - 1); break;
      case '3mo': period1.setMonth(now.getMonth() - 3); break;
      case '6mo': period1.setMonth(now.getMonth() - 6); break;
      case '1y': period1.setFullYear(now.getFullYear() - 1); break;
      case '2y': period1.setFullYear(now.getFullYear() - 2); break;
      case '5y': period1.setFullYear(now.getFullYear() - 5); break;
      case 'max': period1.setFullYear(now.getFullYear() - 20); break;
      default: period1.setFullYear(now.getFullYear() - 1);
    }

    const result = await yahooFinance.chart(symbol, {
      period1: period1,
      period2: period2,
      interval: interval as '1m' | '5m' | '15m' | '1h' | '1d' | '1wk' | '1mo',
    });

    const candles = result.quotes.map((q) => ({
      time: Math.floor(new Date(q.date).getTime() / 1000),
      open: q.open ?? 0,
      high: q.high ?? 0,
      low: q.low ?? 0,
      close: q.close ?? 0,
      volume: q.volume ?? 0,
    })).filter((c) => c.open > 0 && c.close > 0);

    return NextResponse.json(candles);
  } catch (error) {
    console.error('Yahoo historical error:', error);
    return NextResponse.json({ error: 'Failed to fetch historical data' }, { status: 500 });
  }
}
