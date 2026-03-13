'use client';

import { useEffect, useRef, useState } from 'react';
import { WatchlistItem as WatchlistItemType } from '@/lib/data/types';
import { formatPrice, formatChangePercent } from '@/lib/utils/formatting';

interface Props {
  item: WatchlistItemType;
  isActive: boolean;
  onClick: () => void;
  onRemove: () => void;
}

export default function WatchlistItem({ item, isActive, onClick, onRemove }: Props) {
  const [flashClass, setFlashClass] = useState('');
  const [showContext, setShowContext] = useState(false);
  const prevPriceRef = useRef(item.price);

  useEffect(() => {
    if (item.price !== undefined && prevPriceRef.current !== undefined && item.price !== prevPriceRef.current) {
      const cls = item.price > prevPriceRef.current ? 'flash-green' : 'flash-red';
      setFlashClass(cls);
      const timer = setTimeout(() => setFlashClass(''), 300);
      prevPriceRef.current = item.price;
      return () => clearTimeout(timer);
    }
    prevPriceRef.current = item.price;
  }, [item.price]);

  const changePercent = item.changePercent ?? 0;
  const isPositive = changePercent >= 0;

  return (
    <div
      className={`relative flex items-center h-[36px] px-2 cursor-pointer select-none transition-colors ${flashClass} ${
        isActive
          ? 'bg-bb-bg-tertiary border-l-2 border-l-bb-accent-orange'
          : 'border-l-2 border-l-transparent hover:bg-bb-bg-tertiary'
      }`}
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowContext(true);
      }}
    >
      {/* Ticker */}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-[12px] font-semibold text-bb-text-primary truncate leading-tight">
          {item.displaySymbol}
        </span>
        <span className="text-[9px] text-bb-text-muted truncate leading-tight">
          {item.name}
        </span>
      </div>

      {/* Price */}
      <div className="flex flex-col items-end ml-2">
        <span className="text-[12px] font-semibold text-bb-text-primary tabular-nums leading-tight">
          {item.price !== undefined ? formatPrice(item.price, item.assetClass) : '—'}
        </span>
        <span
          className={`text-[10px] tabular-nums leading-tight ${
            isPositive ? 'text-bb-green' : 'text-bb-red'
          }`}
        >
          {isPositive ? '▲' : '▼'} {formatChangePercent(changePercent)}
        </span>
      </div>

      {/* Context menu */}
      {showContext && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowContext(false)} />
          <div className="absolute right-0 top-full z-50 bg-bb-bg-secondary border border-bb-border">
            <button
              className="px-4 py-2 text-[11px] text-bb-red hover:bg-bb-bg-tertiary w-full text-left"
              onClick={(e) => {
                e.stopPropagation();
                setShowContext(false);
                onRemove();
              }}
            >
              REMOVE
            </button>
          </div>
        </>
      )}
    </div>
  );
}
