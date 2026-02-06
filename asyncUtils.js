// Promise and async utilities

class PromisePool {
  constructor(concurrency = 3) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  /**
   * Adds a task to the pool
   */
  add(task) {
    return new Promise((resolve, reject) => {
      this.queue.push({ task, resolve, reject });
      this._process();
    });
  }

  /**
   * Executes array of tasks with concurrency limit
   */
  static execute(tasks, concurrency = 3) {
    const pool = new PromisePool(concurrency);
    return Promise.all(tasks.map(task => pool.add(task)));
  }

  /**
   * Processes next task in queue
   */
  _process() {
    while (this.running < this.concurrency && this.queue.length > 0) {
      this.running++;
      const { task, resolve, reject } = this.queue.shift();

      Promise.resolve(task())
        .then(resolve)
        .catch(reject)
        .finally(() => {
          this.running--;
          this._process();
        });
    }
  }
}

class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

class AsyncQueue {
  constructor() {
    this.tasks = [];
    this.processing = false;
  }

  /**
   * Adds task to queue
   */
  add(task) {
    return new Promise((resolve, reject) => {
      this.tasks.push({ task, resolve, reject });
      this._processNext();
    });
  }

  /**
   * Gets queue size
   */
  size() {
    return this.tasks.length;
  }

  /**
   * Clears queue
   */
  clear() {
    this.tasks = [];
    return this;
  }

  /**
   * Waits for all tasks to complete
   */
  async waitAll() {
    while (this.tasks.length > 0 || this.processing) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  /**
   * Processes next task
   */
  async _processNext() {
    if (this.processing || this.tasks.length === 0) return;

    this.processing = true;
    const { task, resolve, reject } = this.tasks.shift();

    try {
      const result = await Promise.resolve(task());
      resolve(result);
    } catch (error) {
      reject(error);
    } finally {
      this.processing = false;
      this._processNext();
    }
  }
}

class RetryPolicy {
  constructor(maxRetries = 3, delay = 1000, backoff = 2) {
    this.maxRetries = maxRetries;
    this.delay = delay;
    this.backoff = backoff;
  }

  /**
   * Executes function with retry
   */
  async execute(fn) {
    let lastError;
    let currentDelay = this.delay;

    for (let i = 0; i <= this.maxRetries; i++) {
      try {
        return await Promise.resolve(fn());
      } catch (error) {
        lastError = error;

        if (i < this.maxRetries) {
          await this._sleep(currentDelay);
          currentDelay *= this.backoff;
        }
      }
    }

    throw lastError;
  }

  /**
   * Sleeps for duration
   */
  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class Timeout {
  /**
   * Creates promise with timeout
   */
  static promise(promise, timeoutMs) {
    return Promise.race([
      promise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Promise timed out')), timeoutMs)
      )
    ]);
  }

  /**
   * Delays execution
   */
  static delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

class CachePromise {
  constructor() {
    this.cache = new Map();
  }

  /**
   * Caches promise result
   */
  async memoize(key, fn, ttl = null) {
    if (this.cache.has(key)) {
      const cached = this.cache.get(key);
      if (!cached.expiry || Date.now() < cached.expiry) {
        return cached.value;
      } else {
        this.cache.delete(key);
      }
    }

    const value = await Promise.resolve(fn());
    const expiry = ttl ? Date.now() + ttl : null;

    this.cache.set(key, { value, expiry });
    return value;
  }

  /**
   * Clears cache
   */
  clear(key) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
    return this;
  }

  /**
   * Gets cache size
   */
  size() {
    return this.cache.size;
  }
}

class AsyncIterator {
  /**
   * Creates async iterator from array
   */
  static async *fromArray(arr) {
    for (const item of arr) {
      yield item;
    }
  }

  /**
   * Creates async iterator with delay
   */
  static async *delayed(arr, delayMs) {
    for (const item of arr) {
      yield item;
      await Timeout.delay(delayMs);
    }
  }

  /**
   * Batches async iteration
   */
  static async *batch(asyncIterable, batchSize) {
    let batch = [];
    for await (const item of asyncIterable) {
      batch.push(item);
      if (batch.length === batchSize) {
        yield batch;
        batch = [];
      }
    }
    if (batch.length > 0) {
      yield batch;
    }
  }
}

module.exports = {
  PromisePool,
  Deferred,
  AsyncQueue,
  RetryPolicy,
  Timeout,
  CachePromise,
  AsyncIterator
};
