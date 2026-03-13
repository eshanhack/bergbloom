import { AssetClass } from '../data/types';

export function formatPrice(price: number, assetClass?: AssetClass): string {
  if (price === 0 || isNaN(price)) return '—';

  if (assetClass === 'fx') {
    return price.toFixed(price < 10 ? 5 : 4);
  }

  if (assetClass === 'crypto' || assetClass === 'dex') {
    if (price >= 1000) return formatWithCommas(price, 2);
    if (price >= 1) return price.toFixed(4);
    if (price >= 0.01) return price.toFixed(6);
    return price.toFixed(8);
  }

  if (assetClass === 'bond') {
    return price.toFixed(3);
  }

  // Equities, indices, commodities
  return formatWithCommas(price, 2);
}

function formatWithCommas(value: number, decimals: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatChange(change: number, decimals: number = 2): string {
  const sign = change >= 0 ? '+' : '';
  return `${sign}${change.toFixed(decimals)}`;
}

export function formatChangePercent(percent: number): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

export function formatVolume(volume: number): string {
  if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
  if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
  if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
  return volume.toString();
}

export function detectAssetClass(symbol: string): AssetClass {
  const s = symbol.toUpperCase();
  if (s.endsWith('USDT') || s.endsWith('BUSD') || s.endsWith('BTC') || s.endsWith('ETH')) return 'crypto';
  if (s.endsWith('.AX')) return 'au-equity';
  if (s.startsWith('^')) return s.includes('TNX') || s.includes('TYX') || s.includes('FVX') || s.includes('IRX') ? 'bond' : 'index';
  if (s.includes('=F')) return 'commodity';
  if (s.includes('=X') || s === 'DXY') return 'fx';
  if (s.startsWith('0X') || s.length === 42) return 'dex';
  return 'us-equity';
}

export function getDataSource(assetClass: AssetClass): 'binance' | 'yahoo' | 'dexscreener' {
  if (assetClass === 'crypto') return 'binance';
  if (assetClass === 'dex') return 'dexscreener';
  return 'yahoo';
}
