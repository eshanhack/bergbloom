'use client';

import { useState } from 'react';
import { useChartStore } from '@/lib/stores/chartStore';
import { INTERVALS } from '@/lib/utils/intervals';
import { Interval } from '@/lib/data/types';

export default function ChartToolbar() {
  const { activeTicker, tickerName, activeInterval, setActiveInterval, indicators, toggleIndicator } = useChartStore();
  const [showIndicators, setShowIndicators] = useState(false);

  const indicatorLabels: Record<string, string> = {
    bb: 'BB',
    kc: 'KC',
    psar: 'PSAR',
    ema20: 'EMA 20',
    sma50: 'SMA 50',
    sma200: 'SMA 200',
    rsi: 'RSI',
    macd: 'MACD',
    volume: 'VOL',
  };

  return (
    <div className="flex items-center h-[36px] px-2 border-b border-bb-border bg-bb-bg-secondary gap-1">
      {/* Ticker info */}
      <div className="flex items-center gap-2 mr-4 min-w-0">
        <span className="text-bb-accent-orange font-bold text-[13px] whitespace-nowrap">{activeTicker}</span>
        <span className="text-bb-text-secondary text-[11px] truncate">{tickerName}</span>
      </div>

      {/* Interval buttons */}
      <div className="flex items-center gap-0.5">
        {INTERVALS.map((int) => (
          <button
            key={int.value}
            onClick={() => setActiveInterval(int.value as Interval)}
            className={`px-2 py-1 text-[11px] font-medium transition-colors ${
              activeInterval === int.value
                ? 'text-bb-accent-orange border-b border-bb-accent-orange'
                : 'text-bb-text-secondary hover:text-bb-text-primary'
            }`}
          >
            {int.label}
          </button>
        ))}
      </div>

      {/* Separator */}
      <div className="w-px h-4 bg-bb-border mx-2" />

      {/* Indicators toggle */}
      <div className="relative">
        <button
          onClick={() => setShowIndicators(!showIndicators)}
          className={`px-2 py-1 text-[11px] font-medium ${
            showIndicators ? 'text-bb-accent-orange' : 'text-bb-text-secondary hover:text-bb-text-primary'
          }`}
        >
          INDICATORS
        </button>

        {showIndicators && (
          <div className="absolute top-full left-0 mt-1 z-50 bg-bb-bg-secondary border border-bb-border p-2 min-w-[200px]">
            <div className="flex flex-wrap gap-1">
              {indicators.map((ind) => (
                <button
                  key={ind.id}
                  onClick={() => toggleIndicator(ind.id)}
                  className={`px-2 py-1 text-[10px] font-medium border transition-colors ${
                    ind.enabled
                      ? 'border-current text-bb-text-primary'
                      : 'border-bb-border text-bb-text-muted hover:text-bb-text-secondary'
                  }`}
                  style={ind.enabled && ind.color ? { color: ind.color, borderColor: ind.color } : undefined}
                >
                  {indicatorLabels[ind.id] || ind.type.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
