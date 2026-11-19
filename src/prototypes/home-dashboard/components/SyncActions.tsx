import React from 'react';
import { RefreshCw } from 'lucide-react';

export function SyncActions({ lastSync, syncing, onSync }: { lastSync: string; syncing: boolean; onSync: () => void }) {
  return (
    <div className="hd-sync-actions" data-annotation-id="hd-sync">
      <span className="hd-sync-time">最近同步：{lastSync}</span>
      <span className="hd-sync-divider" />
      <button type="button" className="hd-sync-btn" onClick={onSync} disabled={syncing}>
        <RefreshCw size={14} className={syncing ? 'hd-sync-icon is-spinning' : 'hd-sync-icon'} />
        {syncing ? '同步中…' : '手动同步'}
      </button>
    </div>
  );
}
