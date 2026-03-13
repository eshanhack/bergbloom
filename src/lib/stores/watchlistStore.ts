import { create } from 'zustand';
import { WatchlistGroup, WatchlistItem, PriceUpdate } from '../data/types';

interface WatchlistState {
  groups: WatchlistGroup[];
  setGroups: (groups: WatchlistGroup[]) => void;
  toggleGroup: (groupId: string) => void;
  addItem: (groupId: string, item: WatchlistItem) => void;
  removeItem: (groupId: string, symbol: string) => void;
  updatePrices: (updates: PriceUpdate[]) => void;
  moveItem: (groupId: string, fromIndex: number, toIndex: number) => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const DEFAULT_GROUPS: WatchlistGroup[] = [
  {
    id: 'crypto',
    name: 'Crypto',
    collapsed: false,
    items: [
      { symbol: 'BTCUSDT', displaySymbol: 'BTC/USDT', name: 'Bitcoin', assetClass: 'crypto', source: 'binance' },
      { symbol: 'ETHUSDT', displaySymbol: 'ETH/USDT', name: 'Ethereum', assetClass: 'crypto', source: 'binance' },
      { symbol: 'SOLUSDT', displaySymbol: 'SOL/USDT', name: 'Solana', assetClass: 'crypto', source: 'binance' },
      { symbol: 'LINKUSDT', displaySymbol: 'LINK/USDT', name: 'Chainlink', assetClass: 'crypto', source: 'binance' },
      { symbol: 'AAVEUSDT', displaySymbol: 'AAVE/USDT', name: 'Aave', assetClass: 'crypto', source: 'binance' },
    ],
  },
  {
    id: 'us-equity',
    name: 'U.S. Equities',
    collapsed: false,
    items: [
      { symbol: 'AAPL', displaySymbol: 'AAPL', name: 'Apple Inc.', assetClass: 'us-equity', source: 'yahoo' },
      { symbol: 'MSFT', displaySymbol: 'MSFT', name: 'Microsoft', assetClass: 'us-equity', source: 'yahoo' },
      { symbol: 'NVDA', displaySymbol: 'NVDA', name: 'NVIDIA', assetClass: 'us-equity', source: 'yahoo' },
      { symbol: 'AMZN', displaySymbol: 'AMZN', name: 'Amazon', assetClass: 'us-equity', source: 'yahoo' },
      { symbol: 'TSLA', displaySymbol: 'TSLA', name: 'Tesla', assetClass: 'us-equity', source: 'yahoo' },
      { symbol: 'GOOG', displaySymbol: 'GOOG', name: 'Alphabet', assetClass: 'us-equity', source: 'yahoo' },
      { symbol: 'META', displaySymbol: 'META', name: 'Meta', assetClass: 'us-equity', source: 'yahoo' },
    ],
  },
  {
    id: 'au-equity',
    name: 'AU Equities',
    collapsed: false,
    items: [
      { symbol: 'BHP.AX', displaySymbol: 'BHP.AX', name: 'BHP Group', assetClass: 'au-equity', source: 'yahoo' },
      { symbol: 'CBA.AX', displaySymbol: 'CBA.AX', name: 'Commonwealth Bank', assetClass: 'au-equity', source: 'yahoo' },
      { symbol: 'CSL.AX', displaySymbol: 'CSL.AX', name: 'CSL Limited', assetClass: 'au-equity', source: 'yahoo' },
      { symbol: 'WBC.AX', displaySymbol: 'WBC.AX', name: 'Westpac', assetClass: 'au-equity', source: 'yahoo' },
      { symbol: 'NAB.AX', displaySymbol: 'NAB.AX', name: 'National Australia Bank', assetClass: 'au-equity', source: 'yahoo' },
    ],
  },
  {
    id: 'indices',
    name: 'Indices',
    collapsed: false,
    items: [
      { symbol: '^GSPC', displaySymbol: 'S&P 500', name: 'S&P 500', assetClass: 'index', source: 'yahoo' },
      { symbol: '^DJI', displaySymbol: 'DOW', name: 'Dow Jones', assetClass: 'index', source: 'yahoo' },
      { symbol: '^IXIC', displaySymbol: 'NASDAQ', name: 'Nasdaq Composite', assetClass: 'index', source: 'yahoo' },
      { symbol: '^AXJO', displaySymbol: 'ASX 200', name: 'S&P/ASX 200', assetClass: 'index', source: 'yahoo' },
      { symbol: '^VIX', displaySymbol: 'VIX', name: 'CBOE Volatility', assetClass: 'index', source: 'yahoo' },
    ],
  },
  {
    id: 'commodities',
    name: 'Commodities',
    collapsed: false,
    items: [
      { symbol: 'GC=F', displaySymbol: 'GOLD', name: 'Gold Futures', assetClass: 'commodity', source: 'yahoo' },
      { symbol: 'SI=F', displaySymbol: 'SILVER', name: 'Silver Futures', assetClass: 'commodity', source: 'yahoo' },
      { symbol: 'CL=F', displaySymbol: 'CRUDE', name: 'Crude Oil', assetClass: 'commodity', source: 'yahoo' },
      { symbol: 'NG=F', displaySymbol: 'NATGAS', name: 'Natural Gas', assetClass: 'commodity', source: 'yahoo' },
    ],
  },
  {
    id: 'bonds',
    name: 'Bonds',
    collapsed: false,
    items: [
      { symbol: '^TNX', displaySymbol: 'US 10Y', name: 'US 10Y Treasury', assetClass: 'bond', source: 'yahoo' },
      { symbol: '^TYX', displaySymbol: 'US 30Y', name: 'US 30Y Treasury', assetClass: 'bond', source: 'yahoo' },
      { symbol: '^FVX', displaySymbol: 'US 5Y', name: 'US 5Y Treasury', assetClass: 'bond', source: 'yahoo' },
    ],
  },
  {
    id: 'fx',
    name: 'FX',
    collapsed: false,
    items: [
      { symbol: 'AUDUSD=X', displaySymbol: 'AUD/USD', name: 'AUD/USD', assetClass: 'fx', source: 'yahoo' },
      { symbol: 'EURUSD=X', displaySymbol: 'EUR/USD', name: 'EUR/USD', assetClass: 'fx', source: 'yahoo' },
      { symbol: 'USDJPY=X', displaySymbol: 'USD/JPY', name: 'USD/JPY', assetClass: 'fx', source: 'yahoo' },
      { symbol: 'GBPUSD=X', displaySymbol: 'GBP/USD', name: 'GBP/USD', assetClass: 'fx', source: 'yahoo' },
      { symbol: 'DX-Y.NYB', displaySymbol: 'DXY', name: 'US Dollar Index', assetClass: 'fx', source: 'yahoo' },
    ],
  },
];

const STORAGE_KEY = 'bb-watchlist';

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  groups: DEFAULT_GROUPS,

  setGroups: (groups) => set({ groups }),

  toggleGroup: (groupId) =>
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId ? { ...g, collapsed: !g.collapsed } : g
      ),
    })),

  addItem: (groupId, item) =>
    set((state) => {
      const groups = state.groups.map((g) => {
        if (g.id !== groupId) return g;
        if (g.items.some((i) => i.symbol === item.symbol)) return g;
        return { ...g, items: [...g.items, item] };
      });
      return { groups };
    }),

  removeItem: (groupId, symbol) =>
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === groupId
          ? { ...g, items: g.items.filter((i) => i.symbol !== symbol) }
          : g
      ),
    })),

  updatePrices: (updates) =>
    set((state) => {
      const priceMap = new Map(updates.map((u) => [u.symbol, u]));
      return {
        groups: state.groups.map((g) => ({
          ...g,
          items: g.items.map((item) => {
            const update = priceMap.get(item.symbol);
            if (!update) return item;
            return {
              ...item,
              prevPrice: item.price,
              price: update.price,
              change: update.change,
              changePercent: update.changePercent,
            };
          }),
        })),
      };
    }),

  moveItem: (groupId, fromIndex, toIndex) =>
    set((state) => ({
      groups: state.groups.map((g) => {
        if (g.id !== groupId) return g;
        const items = [...g.items];
        const [removed] = items.splice(fromIndex, 1);
        items.splice(toIndex, 0, removed);
        return { ...g, items };
      }),
    })),

  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as WatchlistGroup[];
        set({ groups: parsed });
      }
    } catch {
      // Use defaults
    }
  },

  saveToStorage: () => {
    try {
      const { groups } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
    } catch {
      // Silently fail
    }
  },
}));
