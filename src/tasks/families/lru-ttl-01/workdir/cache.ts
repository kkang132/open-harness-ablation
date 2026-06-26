// An LRU cache with per-entry TTL. See prompt.md for the full spec.
// This implementation is incomplete: get() ignores expiry and does not update
// recency, so entries never expire and a recent get does not protect an entry.
export class LRUCache<V> {
  private capacity: number;
  private ttlMs: number;
  private map = new Map<string, { value: V; expiry: number }>();

  constructor(capacity: number, ttlMs: number) {
    this.capacity = capacity;
    this.ttlMs = ttlMs;
  }

  set(key: string, value: V, now: number): void {
    if (!this.map.has(key) && this.map.size >= this.capacity) {
      const lru = this.map.keys().next().value;
      if (lru !== undefined) this.map.delete(lru);
    }
    this.map.delete(key);
    this.map.set(key, { value, expiry: now + this.ttlMs });
  }

  get(key: string, now: number): V | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    return entry.value;
  }
}
