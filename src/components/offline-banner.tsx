'use client';

import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { getOfflineQueue, syncOfflineQueue } from '@/lib/offline-queue';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = async () => {
      setIsOffline(false);
      const queue = getOfflineQueue();
      if (queue.length > 0) {
        setSyncing(true);
        const count = await syncOfflineQueue();
        setPendingCount(0);
        setSyncing(false);
      }
    };

    const handleOffline = () => {
      setIsOffline(true);
      setPendingCount(getOfflineQueue().length);
    };

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      setPendingCount(getOfflineQueue().length);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      }
    };
  }, []);

  if (!isOffline && pendingCount === 0 && !syncing) return null;

  return (
    <div className="bg-amber-600 text-slate-950 px-4 py-2 text-xs md:text-sm font-semibold flex items-center justify-between shadow-md">
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-slate-950 animate-bounce" />
        <span>
          {isOffline
            ? `Offline Mode — ${pendingCount} report(s) queued for sync.`
            : syncing
              ? 'Connection restored! Syncing pending emergency reports...'
              : 'All offline reports synchronized.'}
        </span>
      </div>
      {pendingCount > 0 && !isOffline && (
        <button
          onClick={async () => {
            setSyncing(true);
            await syncOfflineQueue();
            setPendingCount(0);
            setSyncing(false);
          }}
          className="flex items-center gap-1 bg-slate-900 text-white px-2 py-1 rounded text-xs hover:bg-slate-800"
        >
          <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
          Sync Now
        </button>
      )}
    </div>
  );
}