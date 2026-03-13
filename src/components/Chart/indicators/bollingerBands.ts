import { Candle } from '@/lib/data/types';

export interface BBPoint {
  time: number;
  upper: number;
  middle: number;
  lower: number;
}

export function calculateBollingerBands(
  candles: Candle[],
  period: number = 20,
  stdDevMultiplier: number = 2
): BBPoint[] {
  if (candles.length < period) return [];
  const result: BBPoint[] = [];

  for (let i = period - 1; i < candles.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += candles[j].close;
    }
    const sma = sum / period;

    let sumSqDiff = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sumSqDiff += Math.pow(candles[j].close - sma, 2);
    }
    const stdDev = Math.sqrt(sumSqDiff / period);

    result.push({
      time: candles[i].time,
      upper: sma + stdDev * stdDevMultiplier,
      middle: sma,
      lower: sma - stdDev * stdDevMultiplier,
    });
  }
  return result;
}
