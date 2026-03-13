'use client';

import { useState, useEffect } from 'react';
import { useConnectionStore } from '@/lib/stores/connectionStore';
import { useChartStore } from '@/lib/stores/chartStore';

export default function StatusBar() {
  const [time, setTime] = useState('');
  const { binanceStatus, yahooStatus } = useConnectionStore();
  const { activeTicker, activeAssetClass } = useChartStore();

  useEffect(() => {
    function updateTime() {
      const now = new Date();
      const utc = now.toUTCString().slice(17, 25);
      const local = now.toLocaleTimeString('en-US', { hour12: false });
      setTime(`${local} LOCAL | ${utc} UTC`);
    }
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const statusDot = (status: string) => {
    const colors = {
      connected: 'bg-bb-green',
      degraded: 'bg-bb-yellow',
      disconnected: 'bg-bb-red',
    };
    return colors[status as keyof typeof colors] || 'bg-bb-red';
  };

  const sourceLabel = activeAssetClass === 'crypto' ? 'BINANCE' : activeAssetClass === 'dex' ? 'DEXSCREENER' : 'YAHOO';
  const sourceStatus = activeAssetClass === 'crypto' ? binanceStatus : yahooStatus;

  return (
    <div className="h-[28px] w-full border-t border-bb-border bg-bb-bg-secondary flex items-center px-3 text-[10px] text-bb-text-muted">
      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${statusDot(sourceStatus)}`} />
        <span>{sourceLabel}</span>
      </div>

      <div className="w-px h-3 bg-bb-border mx-3" />

      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${statusDot(binanceStatus)}`} />
        <span>WS</span>
      </div>

      <div className="w-px h-3 bg-bb-border mx-3" />

      <div className="flex items-center gap-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${statusDot(yahooStatus)}`} />
        <span>POLL</span>
      </div>

      <div className="flex-1" />

      <span className="text-bb-text-muted mr-4 uppercase tracking-wider">
        {activeTicker} | {activeAssetClass}
      </span>

      <span className="text-bb-text-secondary font-mono">{time}</span>
    </div>
  );
}
