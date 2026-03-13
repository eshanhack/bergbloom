import { Candle, Quote, SearchResult } from './types';
import { detectAssetClass } from '../utils/formatting';

export async function fetchYahooHistorical(
  symbol: string,
  interval: string,
  range: string
): Promise<Candle[]> {
  const res = await fetch(
    `/api/historical?symbol=${encodeURIComponent(symbol)}&interval=${interval}&range=${range}`
  );
  if (!res.ok) throw new Error(`Yahoo historical error: ${res.status}`);
  return res.json();
}

export async function fetchYahooQuotes(symbols: string[]): Promise<Quote[]> {
  const res = await fetch(
    `/api/quotes?symbols=${encodeURIComponent(symbols.join(','))}`
  );
  if (!res.ok) throw new Error(`Yahoo quotes error: ${res.status}`);
  return res.json();
}

export async function searchYahoo(query: string): Promise<SearchResult[]> {
  const res = await fetch(
    `/api/search?q=${encodeURIComponent(query)}`
  );
  if (!res.ok) throw new Error(`Yahoo search error: ${res.status}`);
  return res.json();
}
