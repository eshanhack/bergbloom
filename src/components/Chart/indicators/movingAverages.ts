import { Candle } from '@/lib/data/types';

export interface MAPoint {
  time: number;
  value: number;
}

export function calculateSMA(candles: Candle[], period: number): MAPoint[] {
  if (candles.length < period) return [];
  const result: MAPoint[] = [];

  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += candles[j].close;
    }
    result.push({ time: candles[i].time, value: sum / period });
  }
  return result;
}

export function calculateEMA(candles: Candle[], period: number): MAPoint[] {
  if (candles.length < period) return [];
  const result: MAPoint[] = [];
  const multiplier = 2 / (period + 1);

  // Start with SMA for the first value
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += candles[i].close;
  }
  let ema = sum / period;
  result.push({ time: candles[period - 1].time, value: ema });

  for (let i = period; i < candles.length; i++) {
    ema = (candles[i].close - ema) * multiplier + ema;
    result.push({ time: candles[i].time, value: ema });
  }
  return result;
}
