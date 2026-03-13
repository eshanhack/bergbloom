import { Candle } from '@/lib/data/types';

export interface KCPoint {
  time: number;
  upper: number;
  middle: number;
  lower: number;
}

function calculateATR(candles: Candle[], period: number): number[] {
  const trs: number[] = [];
  for (let i = 1; i < candles.length; i++) {
    const high = candles[i].high;
    const low = candles[i].low;
    const prevClose = candles[i - 1].close;
    const tr = Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose));
    trs.push(tr);
  }

  const result: number[] = [];
  if (trs.length < period) return result;

  let sum = 0;
  for (let i = 0; i < period; i++) sum += trs[i];
  let atr = sum / period;
  result.push(atr);

  for (let i = period; i < trs.length; i++) {
    atr = (atr * (period - 1) + trs[i]) / period;
    result.push(atr);
  }
  return result;
}

export function calculateKeltnerChannels(
  candles: Candle[],
  emaPeriod: number = 20,
  atrPeriod: number = 10,
  atrMultiplier: number = 1.5
): KCPoint[] {
  if (candles.length < Math.max(emaPeriod, atrPeriod + 1)) return [];

  // Calculate EMA
  const multiplier = 2 / (emaPeriod + 1);
  const emas: number[] = [];
  let sum = 0;
  for (let i = 0; i < emaPeriod; i++) sum += candles[i].close;
  let ema = sum / emaPeriod;
  for (let i = 0; i < emaPeriod; i++) emas.push(0);
  emas[emaPeriod - 1] = ema;
  for (let i = emaPeriod; i < candles.length; i++) {
    ema = (candles[i].close - ema) * multiplier + ema;
    emas.push(ema);
  }

  // Calculate ATR
  const atrs = calculateATR(candles, atrPeriod);

  // Combine — ATR starts at index atrPeriod (candle index atrPeriod)
  const result: KCPoint[] = [];
  const startIdx = Math.max(emaPeriod - 1, atrPeriod);

  for (let i = startIdx; i < candles.length; i++) {
    const emaVal = emas[i];
    const atrIdx = i - atrPeriod;
    if (atrIdx < 0 || atrIdx >= atrs.length || emaVal === 0) continue;
    const atrVal = atrs[atrIdx];
    result.push({
      time: candles[i].time,
      upper: emaVal + atrVal * atrMultiplier,
      middle: emaVal,
      lower: emaVal - atrVal * atrMultiplier,
    });
  }
  return result;
}
