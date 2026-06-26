# Fix `LRUCache`

`workdir/cache.ts` exports `LRUCache`, a least-recently-used cache with a
per-entry time-to-live. The implementation is incomplete and several cases fail.

Time is passed in explicitly as `now` (milliseconds); the cache never reads a
clock itself, so behaviour is deterministic.

## Spec

`new LRUCache(capacity, ttlMs)`

- `set(key, value, now)`: store `value` under `key` with expiry `now + ttlMs`.
  Storing marks the key most-recently-used. Updating an existing key does not
  grow the size. When inserting a **new** key would exceed `capacity`, first
  evict the least-recently-used key.
- `get(key, now)`:
  - returns `undefined` if the key is absent.
  - if the entry has expired (`now >= expiry`), remove it and return `undefined`.
  - otherwise mark the key most-recently-used and return its value.

"Most-recently-used" must be updated by **both** `set` and a successful `get`,
so a recent `get` protects an entry from eviction.

Fix `workdir/cache.ts` so its behaviour matches the spec. Do not edit the tests.
