'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useChartStore } from '@/lib/stores/chartStore';
import { SearchResult, AssetClass } from '@/lib/data/types';
import { detectAssetClass, getDataSource } from '@/lib/utils/formatting';

export default function CommandBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { setActiveTicker } = useChartStore();

  // Focus command bar on / key
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        inputRef.current?.blur();
        setShowDropdown(false);
        setQuery('');
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const search = useCallback(async (q: string) => {
    if (q.length < 1) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    try {
      // Search Yahoo and Binance in parallel
      const [yahooRes, binanceRes] = await Promise.allSettled([
        fetch(`/api/search?q=${encodeURIComponent(q)}`).then((r) => r.json()),
        // Also try dex if it looks like an address
        q.startsWith('0x')
          ? fetch(`/api/dex?q=${encodeURIComponent(q)}`).then((r) => r.json())
          : Promise.resolve([]),
      ]);

      const yahoo = yahooRes.status === 'fulfilled' ? yahooRes.value : [];
      const dex = binanceRes.status === 'fulfilled' ? binanceRes.value : [];

      const combined = [...yahoo, ...dex].slice(0, 12);
      setResults(combined);
      setSelectedIndex(0);
      setShowDropdown(combined.length > 0);
    } catch {
      setResults([]);
      setShowDropdown(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(value), 300);
  };

  const selectTicker = (result: SearchResult) => {
    const assetClass = result.assetClass as AssetClass;
    setActiveTicker(result.symbol, assetClass, result.name);
    setQuery('');
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  const handleDirectSubmit = () => {
    if (results.length > 0 && selectedIndex < results.length) {
      selectTicker(results[selectedIndex]);
    } else if (query.trim()) {
      // Direct ticker entry
      const ticker = query.trim().toUpperCase();
      const assetClass = detectAssetClass(ticker);
      setActiveTicker(ticker, assetClass, ticker);
      setQuery('');
      setShowDropdown(false);
      inputRef.current?.blur();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleDirectSubmit();
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
      setQuery('');
      inputRef.current?.blur();
    }
  };

  const assetClassColors: Record<string, string> = {
    crypto: 'text-bb-yellow',
    'us-equity': 'text-bb-accent-blue',
    'au-equity': 'text-bb-accent-blue',
    index: 'text-bb-accent-orange',
    commodity: 'text-bb-green',
    bond: 'text-bb-text-secondary',
    fx: 'text-bb-accent-blue',
    dex: 'text-bb-yellow',
  };

  return (
    <div className="relative h-[40px] w-full border-b border-bb-border bg-bb-bg-secondary flex items-center px-3">
      <span className="text-bb-accent-orange text-[11px] font-bold mr-2 uppercase tracking-wider select-none">
        BB&gt;
      </span>
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          // Delay to allow click on dropdown
          setTimeout(() => setShowDropdown(false), 200);
        }}
        placeholder="Type ticker symbol or name... (/ to focus)"
        className="flex-1 bg-transparent border-none outline-none text-bb-text-primary text-[13px] font-mono placeholder:text-bb-text-muted"
        spellCheck={false}
        autoComplete="off"
      />
      <span className="text-bb-text-muted text-[10px] ml-2">
        {focused ? 'ESC to close' : '/ to search'}
      </span>

      {/* Search results dropdown */}
      {showDropdown && results.length > 0 && (
        <div className="absolute top-full left-0 w-full bg-bb-bg-secondary border border-bb-border border-t-0 z-50 max-h-[400px] overflow-y-auto">
          {results.map((result, idx) => (
            <div
              key={`${result.symbol}-${idx}`}
              className={`flex items-center px-3 py-2 cursor-pointer ${
                idx === selectedIndex ? 'bg-bb-bg-tertiary' : 'hover:bg-bb-bg-tertiary'
              }`}
              onMouseDown={() => selectTicker(result)}
              onMouseEnter={() => setSelectedIndex(idx)}
            >
              <span className="text-bb-text-primary text-[12px] font-semibold w-28 truncate">
                {result.symbol}
              </span>
              <span className="text-bb-text-secondary text-[11px] flex-1 truncate">
                {result.name}
              </span>
              <span className={`text-[10px] uppercase tracking-wider ${assetClassColors[result.assetClass] || 'text-bb-text-muted'}`}>
                {result.assetClass}
              </span>
              <span className="text-bb-text-muted text-[10px] ml-2 w-16 text-right truncate">
                {result.exchange}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
