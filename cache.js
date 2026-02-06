// Cache implementation with LRU eviction

class CacheEntry {
  constructor(key, value, ttl = null) {
    this.key = key;
    this.value = value;
    this.createdAt = Date.now();
    this.accessedAt = Date.now();
    this.ttl = ttl;
    this.hits = 0;
  }

  isExpired() {
    if (!this.ttl) return false;
    return Date.now() - this.createdAt > this.ttl;
  }

  touch() {
    this.accessedAt = Date.now();
    this.hits++;
  }
}

class Cache {
  constructor(maxSize = 100, defaultTTL = null) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL;
    this.entries = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      expirations: 0
    };
  }

  /**
   * Gets value from cache
   */
  get(key) {
    const entry = this.entries.get(key);

    if (!entry) {
      this.stats.misses++;
      return undefined;
    }

    if (entry.isExpired()) {
      this.entries.delete(key);
      this.stats.expirations++;
      this.stats.misses++;
      return undefined;
    }

    entry.touch();
    this.stats.hits++;
    return entry.value;
  }

  /**
   * Sets value in cache
   */
  set(key, value, ttl = this.defaultTTL) {
    // Remove if already exists
    if (this.entries.has(key)) {
      this.entries.delete(key);
    }

    // Evict LRU if at capacity
    if (this.entries.size >= this.maxSize) {
      const lruKey = this._getLRUKey();
      this.entries.delete(lruKey);
      this.stats.evictions++;
    }

    const entry = new CacheEntry(key, value, ttl);
    this.entries.set(key, entry);
    return this;
  }

  /**
   * Checks if key exists and is not expired
   */
  has(key) {
    const entry = this.entries.get(key);
    if (!entry) return false;
    if (entry.isExpired()) {
      this.entries.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Deletes a key
   */
  delete(key) {
    return this.entries.delete(key);
  }

  /**
   * Clears all cache
   */
  clear() {
    this.entries.clear();
    return this;
  }

  /**
   * Gets cache size
   */
  size() {
    return this.entries.size;
  }

  /**
   * Gets all keys
   */
  keys() {
    return Array.from(this.entries.keys());
  }

  /**
   * Gets all values
   */
  values() {
    return Array.from(this.entries.values())
      .filter(entry => !entry.isExpired())
      .map(entry => entry.value);
  }

  /**
   * Gets entries
   */
  entries() {
    return Array.from(this.entries.entries())
      .filter(([_, entry]) => !entry.isExpired())
      .map(([key, entry]) => [key, entry.value]);
  }

  /**
   * Gets cache statistics
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRate: total > 0 ? (this.stats.hits / total * 100).toFixed(2) + '%' : 'N/A',
      size: this.entries.size,
      maxSize: this.maxSize
    };
  }

  /**
   * Resets statistics
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      expirations: 0
    };
    return this;
  }

  /**
   * Gets value with compute function if missing
   */
  getOrCompute(key, computeFunc, ttl = this.defaultTTL) {
    const cached = this.get(key);
    if (cached !== undefined) return cached;

    const computed = computeFunc();
    this.set(key, computed, ttl);
    return computed;
  }

  /**
   * Batch gets multiple keys
   */
  mget(...keys) {
    return keys.reduce((result, key) => {
      result[key] = this.get(key);
      return result;
    }, {});
  }

  /**
   * Batch sets multiple keys
   */
  mset(obj, ttl = this.defaultTTL) {
    for (const key in obj) {
      this.set(key, obj[key], ttl);
    }
    return this;
  }

  /**
   * Gets least recently used key
   */
  _getLRUKey() {
    let lruKey = null;
    let lruTime = Infinity;

    for (const [key, entry] of this.entries) {
      if (entry.accessedAt < lruTime) {
        lruTime = entry.accessedAt;
        lruKey = key;
      }
    }

    return lruKey;
  }

  /**
   * Evicts expired entries
   */
  evictExpired() {
    const keysToDelete = [];
    for (const [key, entry] of this.entries) {
      if (entry.isExpired()) {
        keysToDelete.push(key);
      }
    }
    keysToDelete.forEach(key => {
      this.entries.delete(key);
      this.stats.expirations++;
    });
    return keysToDelete.length;
  }

  /**
   * Creates a copy of cache
   */
  clone() {
    const cloned = new Cache(this.maxSize, this.defaultTTL);
    for (const [key, entry] of this.entries) {
      if (!entry.isExpired()) {
        cloned.set(key, entry.value, entry.ttl);
      }
    }
    return cloned;
  }
}

module.exports = Cache;
