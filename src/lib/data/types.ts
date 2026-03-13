export interface Candle {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Quote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  marketCap?: number;
  high24h?: number;
  low24h?: number;
}

export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  assetClass: AssetClass;
}

export type AssetClass = 'crypto' | 'us-equity' | 'au-equity' | 'index' | 'commodity' | 'bond' | 'fx' | 'dex';

export type Interval = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w' | '1M';

export interface TickerInfo {
  symbol: string;
  displaySymbol: string;
  name: string;
  assetClass: AssetClass;
  source: 'binance' | 'yahoo' | 'dexscreener';
}

export interface WatchlistItem extends TickerInfo {
  price?: number;
  change?: number;
  changePercent?: number;
  prevPrice?: number;
}

export interface WatchlistGroup {
  id: string;
  name: string;
  collapsed: boolean;
  items: WatchlistItem[];
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  timestamp: number;
}

export interface IndicatorConfig {
  id: string;
  type: string;
  enabled: boolean;
  params: Record<string, number>;
  color?: string;
}
