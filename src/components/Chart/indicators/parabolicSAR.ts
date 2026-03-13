import { Candle } from '@/lib/data/types';

export interface PSARPoint {
  time: number;
  value: number;
  isBelow: boolean; // true = bullish (SAR below price), false = bearish
}

export function calculateParabolicSAR(
  candles: Candle[],
  afStart: number = 0.02,
  afIncrement: number = 0.02,
  afMax: number = 0.2
): PSARPoint[] {
  if (candles.length < 2) return [];

  const result: PSARPoint[] = [];
  let isUpTrend = candles[1].close > candles[0].close;
  let af = afStart;
  let ep = isUpTrend ? candles[0].high : candles[0].low;
  let sar = isUpTrend ? candles[0].low : candles[0].high;

  result.push({
    time: candles[1].time,
    value: sar,
    isBelow: isUpTrend,
  });

  for (let i = 2; i < candles.length; i++) {
    const prevSar = sar;

    if (isUpTrend) {
      sar = prevSar + af * (ep - prevSar);
      sar = Math.min(sar, candles[i - 1].low, candles[i - 2].low);

      if (candles[i].low < sar) {
        isUpTrend = false;
        sar = ep;
        ep = candles[i].low;
        af = afStart;
      } else {
        if (candles[i].high > ep) {
          ep = candles[i].high;
          af = Math.min(af + afIncrement, afMax);
        }
      }
    } else {
      sar = prevSar + af * (ep - prevSar);
      sar = Math.max(sar, candles[i - 1].high, candles[i - 2].high);

      if (candles[i].high > sar) {
        isUpTrend = true;
        sar = ep;
        ep = candles[i].high;
        af = afStart;
      } else {
        if (candles[i].low < ep) {
          ep = candles[i].low;
          af = Math.min(af + afIncrement, afMax);
        }
      }
    }

    result.push({
      time: candles[i].time,
      value: sar,
      isBelow: isUpTrend,
    });
  }

  return result;
}
