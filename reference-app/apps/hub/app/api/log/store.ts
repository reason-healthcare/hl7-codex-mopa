/**
 * In-memory log store for the Hub Activity viewer.
 *
 * Ring buffer holds the last MAX_ENTRIES log entries.
 * SSE subscribers are notified synchronously on every push.
 *
 * This module is intentionally stateful (module-level singleton).
 * In Next.js, each worker process has its own instance; in dev the
 * single process holds all entries for the session lifetime.
 */
import type { LogEntry } from "@mopa/logger";

const MAX_ENTRIES = 500;

const entries: LogEntry[] = [];
const subscribers = new Set<(entry: LogEntry) => void>();

export function push(entry: LogEntry): void {
  entries.push(entry);
  if (entries.length > MAX_ENTRIES) entries.shift();
  for (const sub of subscribers) {
    try {
      sub(entry);
    } catch {
      /* subscriber may have disconnected */
    }
  }
}

/** Flush all entries from the ring buffer. */
export function clear(): void {
  entries.length = 0;
}

/** Return a snapshot of recent entries, newest last. */
export function recent(limit = 200): LogEntry[] {
  return entries.slice(-limit);
}

/** Subscribe to new entries. Returns an unsubscribe function. */
export function subscribe(fn: (entry: LogEntry) => void): () => void {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}
