'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { SearchResult, AssetClass, WatchlistItem } from '@/lib/data/types';
import { detectAssetClass, getDataSource } from '@/lib/utils/formatting';

interface Props {
  groupId: string;
  onAdd: (item: WatchlistItem) => void;
  onClose: () => void;
}

export default function AddTickerModal({ groupId, onAdd, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  const search = useCallback(async (q: string) => {
    if (q.length < 1) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.slice(0, 10));
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, []);

  const handleInput = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
  };

  const selectResult = (result: SearchResult) => {
    const assetClass = result.assetClass as AssetClass;
    const source = getDataSource(assetClass);
    onAdd({
      symbol: result.symbol,
      displaySymbol: result.symbol,
      name: result.name,
      assetClass,
      source,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20" onClick={onClose}>
      <div
        className="bg-bb-bg-secondary border border-bb-border w-[400px] max-h-[500px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center h-[40px] px-3 border-b border-bb-border">
          <span className="text-bb-accent-orange text-[11px] font-bold mr-2">ADD&gt;</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="Search ticker..."
            className="flex-1 bg-transparent border-none outline-none text-bb-text-primary text-[13px] font-mono placeholder:text-bb-text-muted"
            spellCheck={false}
          />
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {loading && (
            <div className="px-3 py-4">
              <div className="w-full h-2 skeleton mb-2" />
              <div className="w-3/4 h-2 skeleton" />
            </div>
          )}
          {!loading && results.map((result, idx) => (
            <div
              key={`${result.symbol}-${idx}`}
              className="flex items-center px-3 py-2 cursor-pointer hover:bg-bb-bg-tertiary"
              onClick={() => selectResult(result)}
            >
              <span className="text-bb-text-primary text-[12px] font-semibold w-24 truncate">
                {result.symbol}
              </span>
              <span className="text-bb-text-secondary text-[11px] flex-1 truncate">
                {result.name}
              </span>
              <span className="text-[10px] text-bb-text-muted uppercase">
                {result.assetClass}
              </span>
            </div>
          ))}
          {!loading && query && results.length === 0 && (
            <div className="px-3 py-4 text-bb-text-muted text-[11px] text-center">
              No results found
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
