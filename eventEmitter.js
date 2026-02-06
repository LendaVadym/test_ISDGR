// Event Emitter with advanced features

class EventEmitter {
  constructor() {
    this.events = {};
    this.maxListeners = 10;
  }

  /**
   * Registers an event listener
   */
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    if (this.events[event].length >= this.maxListeners) {
      console.warn(`Warning: max listeners (${this.maxListeners}) exceeded for event "${event}"`);
    }

    this.events[event].push({
      listener,
      once: false
    });

    return this;
  }

  /**
   * Registers a one-time listener
   */
  once(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    this.events[event].push({
      listener,
      once: true
    });

    return this;
  }

  /**
   * Removes an event listener
   */
  off(event, listener) {
    if (!this.events[event]) return this;

    this.events[event] = this.events[event].filter(item =>
      item.listener !== listener
    );

    return this;
  }

  /**
   * Removes all listeners for an event
   */
  removeAllListeners(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
    return this;
  }

  /**
   * Emits an event with arguments
   */
  emit(event, ...args) {
    if (!this.events[event]) return false;

    const listeners = this.events[event].slice();
    let hasListeners = false;

    listeners.forEach(item => {
      hasListeners = true;
      try {
        item.listener(...args);
      } catch (error) {
        console.error(`Error in listener for event "${event}":`, error);
      }

      if (item.once) {
        this.off(event, item.listener);
      }
    });

    return hasListeners;
  }

  /**
   * Gets listener count
   */
  listenerCount(event) {
    return this.events[event] ? this.events[event].length : 0;
  }

  /**
   * Gets all event names
   */
  eventNames() {
    return Object.keys(this.events);
  }

  /**
   * Gets all listeners for an event
   */
  listeners(event) {
    return this.events[event] ? 
      this.events[event].map(item => item.listener) : 
      [];
  }

  /**
   * Sets max listeners
   */
  setMaxListeners(n) {
    this.maxListeners = n;
    return this;
  }

  /**
   * Prepends a listener before existing ones
   */
  prependListener(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    this.events[event].unshift({
      listener,
      once: false
    });

    return this;
  }

  /**
   * Prepends a one-time listener
   */
  prependOnceListener(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }

    this.events[event].unshift({
      listener,
      once: true
    });

    return this;
  }

  /**
   * Emits event asynchronously
   */
  async emitAsync(event, ...args) {
    if (!this.events[event]) return false;

    const listeners = this.events[event].slice();
    let hasListeners = false;

    for (const item of listeners) {
      hasListeners = true;
      try {
        await Promise.resolve(item.listener(...args));
      } catch (error) {
        console.error(`Error in listener for event "${event}":`, error);
      }

      if (item.once) {
        this.off(event, item.listener);
      }
    }

    return hasListeners;
  }

  /**
   * Pipes events from another emitter
   */
  pipe(sourceEmitter, events) {
    events.forEach(event => {
      sourceEmitter.on(event, (...args) => {
        this.emit(event, ...args);
      });
    });

    return this;
  }
}

module.exports = EventEmitter;
