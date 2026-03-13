'use client';

import { useEffect } from 'react';
import { useChartStore } from '@/lib/stores/chartStore';
import { useWatchlistStore } from '@/lib/stores/watchlistStore';
import { INTERVALS } from '@/lib/utils/intervals';
import { Interval } from '@/lib/data/types';
import CommandBar from './CommandBar';
import StatusBar from './StatusBar';
import ChartToolbar from '../Chart/ChartToolbar';
import ChartContainer from '../Chart/ChartContainer';
import WatchlistPanel from '../Watchlist/WatchlistPanel';

export default function TerminalLayout() {
  const { setActiveInterval } = useChartStore();
  const { groups } = useWatchlistStore();

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Don't handle when input is focused
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      // Number keys 1-8 for interval switching
      const idx = parseInt(e.key) - 1;
      if (idx >= 0 && idx < INTERVALS.length) {
        e.preventDefault();
        setActiveInterval(INTERVALS[idx].value as Interval);
        return;
      }

      // [ and ] for watchlist navigation
      if (e.key === '[' || e.key === ']') {
        e.preventDefault();
        const allItems = groups.flatMap((g) => g.items);
        const { activeTicker, setActiveTicker } = useChartStore.getState();
        const currentIdx = allItems.findIndex((i) => i.symbol === activeTicker);
        let nextIdx: number;
        if (e.key === ']') {
          nextIdx = currentIdx < allItems.length - 1 ? currentIdx + 1 : 0;
        } else {
          nextIdx = currentIdx > 0 ? currentIdx - 1 : allItems.length - 1;
        }
        const next = allItems[nextIdx];
        if (next) {
          setActiveTicker(next.symbol, next.assetClass, next.name);
        }
      }
    }

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [setActiveInterval, groups]);

  return (
    <div className="flex flex-col h-screen w-screen bg-bb-bg-primary overflow-hidden">
      <CommandBar />
      <div className="flex flex-1 min-h-0">
        {/* Chart area */}
        <div className="flex flex-col flex-1 min-w-0">
          <ChartToolbar />
          <div className="flex-1 min-h-0">
            <ChartContainer />
          </div>
        </div>
        {/* Watchlist */}
        <div className="w-[320px] shrink-0">
          <WatchlistPanel />
        </div>
      </div>
      <StatusBar />
    </div>
  );
}
