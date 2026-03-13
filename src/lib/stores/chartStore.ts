import { create } from 'zustand';
import { Interval, IndicatorConfig, AssetClass } from '../data/types';

interface ChartState {
  activeTicker: string;
  activeAssetClass: AssetClass;
  activeInterval: Interval;
  tickerName: string;
  indicators: IndicatorConfig[];
  setActiveTicker: (ticker: string, assetClass: AssetClass, name?: string) => void;
  setActiveInterval: (interval: Interval) => void;
  toggleIndicator: (id: string) => void;
  updateIndicatorParams: (id: string, params: Record<string, number>) => void;
}

const defaultIndicators: IndicatorConfig[] = [
  { id: 'bb', type: 'bollingerBands', enabled: false, params: { period: 20, stdDev: 2 }, color: '#6366f1' },
  { id: 'kc', type: 'keltnerChannels', enabled: false, params: { emaPeriod: 20, atrPeriod: 10, atrMultiplier: 1.5 }, color: '#f59e0b' },
  { id: 'psar', type: 'parabolicSAR', enabled: false, params: { afStart: 0.02, afIncrement: 0.02, afMax: 0.2 }, color: '#8b5cf6' },
  { id: 'ema20', type: 'ema', enabled: true, params: { period: 20 }, color: '#ff8c00' },
  { id: 'sma50', type: 'sma', enabled: true, params: { period: 50 }, color: '#4488ff' },
  { id: 'sma200', type: 'sma', enabled: false, params: { period: 200 }, color: '#888888' },
  { id: 'rsi', type: 'rsi', enabled: false, params: { period: 14 }, color: '#22d3ee' },
  { id: 'macd', type: 'macd', enabled: false, params: { fast: 12, slow: 26, signal: 9 }, color: '#4488ff' },
  { id: 'volume', type: 'volume', enabled: true, params: {} },
];

export const useChartStore = create<ChartState>((set) => ({
  activeTicker: 'BTCUSDT',
  activeAssetClass: 'crypto',
  activeInterval: '1h',
  tickerName: 'Bitcoin / USDT',
  indicators: defaultIndicators,

  setActiveTicker: (ticker, assetClass, name) =>
    set({ activeTicker: ticker, activeAssetClass: assetClass, tickerName: name || ticker }),

  setActiveInterval: (interval) => set({ activeInterval: interval }),

  toggleIndicator: (id) =>
    set((state) => ({
      indicators: state.indicators.map((ind) =>
        ind.id === id ? { ...ind, enabled: !ind.enabled } : ind
      ),
    })),

  updateIndicatorParams: (id, params) =>
    set((state) => ({
      indicators: state.indicators.map((ind) =>
        ind.id === id ? { ...ind, params: { ...ind.params, ...params } } : ind
      ),
    })),
}));
