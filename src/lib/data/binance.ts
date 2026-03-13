import { Candle, Quote } from './types';

const BASE_URL = 'https://api.binance.com/api/v3';

export async function fetchBinanceKlines(
  symbol: string,
  interval: string,
  limit: number = 500
): Promise<Candle[]> {
  const url = `${BASE_URL}/klines?symbol=${symbol.toUpperCase()}&interval=${interval}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Binance API error: ${res.status}`);
  const data = await res.json();

  return data.map((k: number[]) => ({
    time: Math.floor(k[0] / 1000),
    open: parseFloat(String(k[1])),
    high: parseFloat(String(k[2])),
    low: parseFloat(String(k[3])),
    close: parseFloat(String(k[4])),
    volume: parseFloat(String(k[5])),
  }));
}

export async function fetchBinanceQuote(symbol: string): Promise<Quote> {
  const [tickerRes, infoRes] = await Promise.all([
    fetch(`${BASE_URL}/ticker/24hr?symbol=${symbol.toUpperCase()}`),
    fetch(`${BASE_URL}/ticker/price?symbol=${symbol.toUpperCase()}`),
  ]);

  if (!tickerRes.ok) throw new Error(`Binance ticker error: ${tickerRes.status}`);
  const ticker = await tickerRes.json();
  const price = parseFloat(ticker.lastPrice);
  const change = parseFloat(ticker.priceChange);
  const changePercent = parseFloat(ticker.priceChangePercent);

  return {
    symbol: symbol.toUpperCase(),
    name: symbol.toUpperCase(),
    price,
    change,
    changePercent,
    volume: parseFloat(ticker.volume),
    high24h: parseFloat(ticker.highPrice),
    low24h: parseFloat(ticker.lowPrice),
  };
}

export function parseBinanceKlineWsMessage(data: Record<string, unknown>): Candle | null {
  const k = data.k as Record<string, unknown> | undefined;
  if (!k) return null;
  return {
    time: Math.floor((k.t as number) / 1000),
    open: parseFloat(k.o as string),
    high: parseFloat(k.h as string),
    low: parseFloat(k.l as string),
    close: parseFloat(k.c as string),
    volume: parseFloat(k.v as string),
  };
}
