'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useWatchlistStore } from '@/lib/stores/watchlistStore';
import { useChartStore } from '@/lib/stores/chartStore';
import { useConnectionStore } from '@/lib/stores/connectionStore';
import { WatchlistItem as WatchlistItemType, PriceUpdate } from '@/lib/data/types';
import { fetchBinanceQuote } from '@/lib/data/binance';
import { fetchYahooQuotes } from '@/lib/data/yahoo';
import WatchlistItemComponent from './WatchlistItem';
import WatchlistGroupComponent from './WatchlistGroup';
import AddTickerModal from './AddTickerModal';

export default function WatchlistPanel() {
  const { groups, toggleGroup, addItem, removeItem, updatePrices, loadFromStorage, saveToStorage } = useWatchlistStore();
  const { activeTicker, setActiveTicker } = useChartStore();
  const { setYahooStatus } = useConnectionStore();
  const [addModalGroup, setAddModalGroup] = useState<string | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load watchlist from localStorage on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Save watchlist to localStorage when it changes
  useEffect(() => {
    saveToStorage();
  }, [groups, saveToStorage]);

  // Poll prices
  const fetchPrices = useCallback(async () => {
    const allItems = groups.flatMap((g) => g.items);
    const binanceItems = allItems.filter((i) => i.source === 'binance');
    const yahooItems = allItems.filter((i) => i.source === 'yahoo');

    const updates: PriceUpdate[] = [];

    // Fetch Binance quotes
    await Promise.allSettled(
      binanceItems.map(async (item) => {
        try {
          const quote = await fetchBinanceQuote(item.symbol);
          updates.push({
            symbol: item.symbol,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            timestamp: Date.now(),
          });
        } catch {}
      })
    );

    // Fetch Yahoo quotes
    if (yahooItems.length > 0) {
      try {
        const symbols = yahooItems.map((i) => i.symbol);
        const quotes = await fetchYahooQuotes(symbols);
        for (const quote of quotes) {
          updates.push({
            symbol: quote.symbol,
            price: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            timestamp: Date.now(),
          });
        }
        setYahooStatus('connected');
      } catch {
        setYahooStatus('degraded');
      }
    }

    if (updates.length > 0) {
      updatePrices(updates);
    }
  }, [groups, updatePrices, setYahooStatus]);

  useEffect(() => {
    fetchPrices();
    pollingRef.current = setInterval(fetchPrices, 5000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchPrices]);

  const handleItemClick = (item: WatchlistItemType) => {
    setActiveTicker(item.symbol, item.assetClass, item.name);
  };

  return (
    <div className="h-full flex flex-col bg-bb-bg-secondary border-l border-bb-border">
      {/* Header */}
      <div className="h-[36px] flex items-center px-3 border-b border-bb-border shrink-0">
        <span className="text-[11px] font-bold text-bb-accent-orange uppercase tracking-wider">
          WATCHLIST
        </span>
      </div>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto">
        {groups.map((group) => (
          <WatchlistGroupComponent
            key={group.id}
            group={group}
            onToggle={() => toggleGroup(group.id)}
            onAdd={() => setAddModalGroup(group.id)}
          >
            {group.items.map((item) => (
              <WatchlistItemComponent
                key={item.symbol}
                item={item}
                isActive={item.symbol === activeTicker}
                onClick={() => handleItemClick(item)}
                onRemove={() => removeItem(group.id, item.symbol)}
              />
            ))}
          </WatchlistGroupComponent>
        ))}
      </div>

      {/* Add ticker modal */}
      {addModalGroup && (
        <AddTickerModal
          groupId={addModalGroup}
          onAdd={(item) => addItem(addModalGroup, item)}
          onClose={() => setAddModalGroup(null)}
        />
      )}
    </div>
  );
}
