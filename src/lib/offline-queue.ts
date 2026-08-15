import { EmergencyReport } from '@/types';
import { SatarkStore } from './db/store';

const QUEUE_KEY = 'satark_offline_reports_queue';

export function getOfflineQueue(): Partial<EmergencyReport>[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(QUEUE_KEY);

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);

    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveReportToOfflineQueue(
  report: Partial<EmergencyReport>
): void {
  if (typeof window === 'undefined') {
    return;
  }

  const current = getOfflineQueue();

  const updated = [
    ...current,
    {
      ...report,
      createdAt: new Date().toISOString(),
    },
  ];

  localStorage.setItem(QUEUE_KEY, JSON.stringify(updated));
}

export function clearOfflineQueue(): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.removeItem(QUEUE_KEY);
}

export async function syncOfflineQueue(): Promise<number> {
  const queue = getOfflineQueue();

  if (queue.length === 0) {
    return 0;
  }

  const remaining: Partial<EmergencyReport>[] = [];
  let syncedCount = 0;

  for (const item of queue) {
    try {
      await SatarkStore.addReport(item as Omit<EmergencyReport, 'id' | 'createdAt' | 'updatedAt'>);
      syncedCount++;
    } catch (error) {
      console.error('Failed to sync report:', error);
      remaining.push(item);
    }
  }

  if (remaining.length > 0) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  } else {
    clearOfflineQueue();
  }

  return syncedCount;
}