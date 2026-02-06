// Logger and monitoring utilities

class Logger {
  constructor(name = 'App') {
    this.name = name;
    this.level = Logger.LEVELS.DEBUG;
    this.handlers = [];
    this.context = {};
  }

  static LEVELS = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
    FATAL: 4
  };

  static LEVEL_NAMES = {
    0: 'DEBUG',
    1: 'INFO',
    2: 'WARN',
    3: 'ERROR',
    4: 'FATAL'
  };

  /**
   * Sets log level
   */
  setLevel(level) {
    this.level = level;
    return this;
  }

  /**
   * Adds log handler
   */
  addHandler(handler) {
    this.handlers.push(handler);
    return this;
  }

  /**
   * Removes handler
   */
  removeHandler(handler) {
    this.handlers = this.handlers.filter(h => h !== handler);
    return this;
  }

  /**
   * Sets context
   */
  setContext(context) {
    this.context = context;
    return this;
  }

  /**
   * Logs debug message
   */
  debug(message, data = null) {
    this._log(Logger.LEVELS.DEBUG, message, data);
    return this;
  }

  /**
   * Logs info message
   */
  info(message, data = null) {
    this._log(Logger.LEVELS.INFO, message, data);
    return this;
  }

  /**
   * Logs warning message
   */
  warn(message, data = null) {
    this._log(Logger.LEVELS.WARN, message, data);
    return this;
  }

  /**
   * Logs error message
   */
  error(message, error = null) {
    this._log(Logger.LEVELS.ERROR, message, error);
    return this;
  }

  /**
   * Logs fatal message
   */
  fatal(message, error = null) {
    this._log(Logger.LEVELS.FATAL, message, error);
    return this;
  }

  /**
   * Measures execution time
   */
  async time(label, func) {
    const start = Date.now();
    try {
      const result = await Promise.resolve(func());
      const duration = Date.now() - start;
      this.debug(`${label} completed in ${duration}ms`, { duration });
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      this.error(`${label} failed after ${duration}ms`, error);
      throw error;
    }
  }

  /**
   * Groups logs
   */
  group(label) {
    this.info(`--- ${label} ---`);
    return this;
  }

  /**
   * Ends group
   */
  groupEnd() {
    this.info(`--- End ---`);
    return this;
  }

  /**
   * Internal log method
   */
  _log(level, message, data) {
    if (level < this.level) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level: Logger.LEVEL_NAMES[level],
      name: this.name,
      message,
      data,
      context: this.context
    };

    this.handlers.forEach(handler => {
      try {
        handler(logEntry);
      } catch (error) {
        console.error('Handler error:', error);
      }
    });
  }
}

/**
 * Console handler
 */
class ConsoleHandler {
  constructor(colorized = true) {
    this.colorized = colorized;
  }

  __call__(logEntry) {
    const prefix = this._getPrefix(logEntry);
    const message = `[${logEntry.timestamp}] ${prefix} ${logEntry.name}: ${logEntry.message}`;

    if (logEntry.data) {
      console.log(message, logEntry.data);
    } else {
      console.log(message);
    }
  }

  _getPrefix(logEntry) {
    if (!this.colorized) return logEntry.level;

    const colors = {
      DEBUG: '\x1b[36m', // Cyan
      INFO: '\x1b[32m',  // Green
      WARN: '\x1b[33m',  // Yellow
      ERROR: '\x1b[31m', // Red
      FATAL: '\x1b[35m'  // Magenta
    };

    const reset = '\x1b[0m';
    const color = colors[logEntry.level] || '';
    return `${color}${logEntry.level}${reset}`;
  }
}

/**
 * File handler (mock for Node.js)
 */
class FileHandler {
  constructor(filename) {
    this.filename = filename;
    this.buffer = [];
  }

  __call__(logEntry) {
    const line = JSON.stringify(logEntry);
    this.buffer.push(line);

    if (this.buffer.length >= 10) {
      this.flush();
    }
  }

  flush() {
    // In real implementation, write buffer to file
    this.buffer = [];
  }
}

/**
 * Performance monitor
 */
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
  }

  /**
   * Records metric
   */
  record(name, value, unit = 'ms') {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name).push({ value, unit, timestamp: Date.now() });
    return this;
  }

  /**
   * Gets metric statistics
   */
  getStats(name) {
    const values = (this.metrics.get(name) || []).map(m => m.value);
    if (values.length === 0) return null;

    const sorted = [...values].sort((a, b) => a - b);
    return {
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)]
    };
  }

  /**
   * Gets all metrics
   */
  getAllStats() {
    const result = {};
    for (const [name, _] of this.metrics) {
      result[name] = this.getStats(name);
    }
    return result;
  }

  /**
   * Clears metrics
   */
  clear(name) {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
    return this;
  }
}

/**
 * Error tracker
 */
class ErrorTracker {
  constructor() {
    this.errors = [];
    this.maxErrors = 1000;
  }

  /**
   * Tracks error
   */
  track(error, context = {}) {
    const entry = {
      timestamp: Date.now(),
      message: error.message,
      stack: error.stack,
      context
    };

    this.errors.push(entry);

    if (this.errors.length > this.maxErrors) {
      this.errors.shift();
    }

    return this;
  }

  /**
   * Gets error summary
   */
  getSummary() {
    const summary = {};
    this.errors.forEach(error => {
      const key = error.message;
      summary[key] = (summary[key] || 0) + 1;
    });
    return summary;
  }

  /**
   * Gets all errors
   */
  getAll() {
    return [...this.errors];
  }

  /**
   * Clears errors
   */
  clear() {
    this.errors = [];
    return this;
  }

  /**
   * Gets error count
   */
  count() {
    return this.errors.length;
  }
}

module.exports = {
  Logger,
  ConsoleHandler,
  FileHandler,
  PerformanceMonitor,
  ErrorTracker
};
