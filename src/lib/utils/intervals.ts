import { Interval } from '../data/types';

export const INTERVALS: { label: string; value: Interval; key: string }[] = [
  { label: '1m', value: '1m', key: '1' },
  { label: '5m', value: '5m', key: '2' },
  { label: '15m', value: '15m', key: '3' },
  { label: '1H', value: '1h', key: '4' },
  { label: '4H', value: '4h', key: '5' },
  { label: '1D', value: '1d', key: '6' },
  { label: '1W', value: '1w', key: '7' },
  { label: '1M', value: '1M', key: '8' },
];

export function toBinanceInterval(interval: Interval): string {
  const map: Record<Interval, string> = {
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '1h': '1h',
    '4h': '4h',
    '1d': '1d',
    '1w': '1w',
    '1M': '1M',
  };
  return map[interval];
}

export function toYahooInterval(interval: Interval): string {
  const map: Record<Interval, string> = {
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '1h': '1h',
    '4h': '1h', // Yahoo doesn't support 4h, use 1h
    '1d': '1d',
    '1w': '1wk',
    '1M': '1mo',
  };
  return map[interval];
}

export function toYahooRange(interval: Interval): string {
  const map: Record<Interval, string> = {
    '1m': '1d',
    '5m': '5d',
    '15m': '5d',
    '1h': '1mo',
    '4h': '6mo',
    '1d': '1y',
    '1w': '5y',
    '1M': 'max',
  };
  return map[interval];
}

export function intervalToMs(interval: Interval): number {
  const map: Record<Interval, number> = {
    '1m': 60000,
    '5m': 300000,
    '15m': 900000,
    '1h': 3600000,
    '4h': 14400000,
    '1d': 86400000,
    '1w': 604800000,
    '1M': 2592000000,
  };
  return map[interval];
}
