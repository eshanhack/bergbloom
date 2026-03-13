import { create } from 'zustand';

type ConnectionStatus = 'connected' | 'degraded' | 'disconnected';

interface ConnectionState {
  binanceStatus: ConnectionStatus;
  yahooStatus: ConnectionStatus;
  setBinanceStatus: (status: ConnectionStatus) => void;
  setYahooStatus: (status: ConnectionStatus) => void;
  overallStatus: () => ConnectionStatus;
}

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  binanceStatus: 'disconnected',
  yahooStatus: 'disconnected',

  setBinanceStatus: (status) => set({ binanceStatus: status }),
  setYahooStatus: (status) => set({ yahooStatus: status }),

  overallStatus: () => {
    const { binanceStatus, yahooStatus } = get();
    if (binanceStatus === 'connected' && yahooStatus === 'connected') return 'connected';
    if (binanceStatus === 'disconnected' && yahooStatus === 'disconnected') return 'disconnected';
    return 'degraded';
  },
}));
