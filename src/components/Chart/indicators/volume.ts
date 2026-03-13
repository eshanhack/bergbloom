import { Candle } from '@/lib/data/types';

export interface VolumePoint {
  time: number;
  value: number;
  color: string;
}

export function calculateVolume(candles: Candle[]): VolumePoint[] {
  return candles.map((c) => ({
    time: c.time,
    value: c.volume,
    color: c.close >= c.open ? 'rgba(0, 200, 83, 0.25)' : 'rgba(255, 23, 68, 0.25)',
  }));
}
