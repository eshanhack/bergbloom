import { SearchResult } from './types';

const BASE_URL = 'https://api.dexscreener.com/latest/dex';

export async function searchDexScreener(query: string): Promise<SearchResult[]> {
  const res = await fetch(`/api/dex?q=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  const data = await res.json();
  return data;
}
