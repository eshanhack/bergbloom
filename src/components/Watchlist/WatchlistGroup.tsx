'use client';

import { WatchlistGroup as WatchlistGroupType } from '@/lib/data/types';

interface Props {
  group: WatchlistGroupType;
  onToggle: () => void;
  onAdd: () => void;
  children: React.ReactNode;
}

export default function WatchlistGroup({ group, onToggle, onAdd, children }: Props) {
  return (
    <div className="border-b border-bb-border">
      <div
        className="flex items-center h-[28px] px-2 cursor-pointer select-none hover:bg-bb-bg-tertiary"
        onClick={onToggle}
      >
        <span className="text-[10px] text-bb-text-muted mr-1.5 w-3">
          {group.collapsed ? '▶' : '▼'}
        </span>
        <span className="text-[11px] font-bold text-bb-accent-orange uppercase tracking-wider flex-1">
          {group.name}
        </span>
        <span className="text-[10px] text-bb-text-muted">
          {group.items.length}
        </span>
      </div>
      {!group.collapsed && (
        <div>
          {children}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            className="flex items-center justify-center w-full h-[28px] text-[11px] text-bb-text-muted hover:text-bb-accent-orange hover:bg-bb-bg-tertiary transition-colors"
          >
            + ADD
          </button>
        </div>
      )}
    </div>
  );
}
