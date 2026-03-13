import { Candle } from '@/lib/data/types';

export interface MACDPoint {
  time: number;
  macd: number;
  signal: number;
  histogram: number;
}

function emaValues(values: number[], period: number): number[] {
  if (values.length < period) return [];
  const result: number[] = [];
  const multiplier = 2 / (period + 1);

  let sum = 0;
  for (let i = 0; i < period; i++) sum += values[i];
  let ema = sum / period;
  // Pad with zeros for alignment
  for (let i = 0; i < period - 1; i++) result.push(0);
  result.push(ema);

  for (let i = period; i < values.length; i++) {
    ema = (values[i] - ema) * multiplier + ema;
    result.push(ema);
  }
  return result;
}

export function calculateMACD(
  candles: Candle[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDPoint[] {
  if (candles.length < slowPeriod + signalPeriod) return [];

  const closes = candles.map((c) => c.close);
  const fastEMA = emaValues(closes, fastPeriod);
  const slowEMA = emaValues(closes, slowPeriod);

  // Calculate MACD line
  const macdLine: number[] = [];
  const startIdx = slowPeriod - 1;

  for (let i = 0; i < closes.length; i++) {
    if (i < startIdx || fastEMA[i] === 0 || slowEMA[i] === 0) {
      macdLine.push(0);
    } else {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }
  }

  // Calculate signal line (EMA of MACD)
  const validMacd = macdLine.slice(startIdx);
  const signalEMA = emaValues(validMacd, signalPeriod);

  const result: MACDPoint[] = [];
  const resultStart = startIdx + signalPeriod - 1;

  for (let i = signalPeriod - 1; i < validMacd.length; i++) {
    const candleIdx = startIdx + i;
    if (candleIdx >= candles.length) break;
    const macdVal = validMacd[i];
    const signalVal = signalEMA[i];
    result.push({
      time: candles[candleIdx].time,
      macd: macdVal,
      signal: signalVal,
      histogram: macdVal - signalVal,
    });
  }

  return result;
}
