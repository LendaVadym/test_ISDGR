// Configuration manager with environment support

class Config {
  constructor(defaults = {}) {
    this.values = { ...defaults };
    this.watchers = new Map();
    this.readonly = new Set();
    this.validators = new Map();
  }

  /**
   * Loads config from object
   */
  static load(obj) {
    return new Config(obj);
  }

  /**
   * Loads config from JSON file
   */
  static loadJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      return new Config(parsed);
    } catch (error) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
  }

  /**
   * Loads from environment variables
   */
  static loadEnv(prefix = '') {
    const config = new Config();
    for (const key in process.env) {
      if (!prefix || key.startsWith(prefix)) {
        const configKey = prefix ? 
          key.substring(prefix.length).toLowerCase() : 
          key.toLowerCase();
        config.set(configKey, process.env[key]);
      }
    }
    return config;
  }

  /**
   * Gets a config value
   */
  get(key, defaultValue = undefined) {
    const keys = key.split('.');
    let value = this.values;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }

    return value;
  }

  /**
   * Sets a config value
   */
  set(key, value) {
    if (this.readonly.has(key)) {
      throw new Error(`Config key "${key}" is read-only`);
    }

    const validator = this.validators.get(key);
    if (validator && !validator(value)) {
      throw new Error(`Invalid value for "${key}"`);
    }

    const keys = key.split('.');
    let current = this.values;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current)) {
        current[k] = {};
      }
      current = current[k];
    }

    const lastKey = keys[keys.length - 1];
    const oldValue = current[lastKey];
    current[lastKey] = value;

    // Notify watchers
    if (this.watchers.has(key)) {
      const watchers = this.watchers.get(key);
      watchers.forEach(cb => cb(value, oldValue));
    }

    return this;
  }

  /**
   * Checks if key exists
   */
  has(key) {
    return this.get(key) !== undefined;
  }

  /**
   * Deletes a key
   */
  delete(key) {
    if (this.readonly.has(key)) {
      throw new Error(`Config key "${key}" is read-only`);
    }

    const keys = key.split('.');
    let current = this.values;

    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current)) return this;
      current = current[k];
    }

    delete current[keys[keys.length - 1]];
    return this;
  }

  /**
   * Gets all config items
   */
  all() {
    return { ...this.values };
  }

  /**
   * Merges another config
   */
  merge(other) {
    const mergeDeep = (target, source) => {
      for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          if (typeof target[key] !== 'object') {
            target[key] = {};
          }
          mergeDeep(target[key], source[key]);
        } else {
          target[key] = source[key];
        }
      }
    };

    mergeDeep(this.values, other instanceof Config ? other.all() : other);
    return this;
  }

  /**
   * Sets a key as read-only
   */
  makeReadonly(key) {
    this.readonly.add(key);
    return this;
  }

  /**
   * Adds a validator for a key
   */
  addValidator(key, validatorFunc) {
    this.validators.set(key, validatorFunc);
    return this;
  }

  /**
   * Watches a key for changes
   */
  watch(key, callback) {
    if (!this.watchers.has(key)) {
      this.watchers.set(key, []);
    }
    this.watchers.get(key).push(callback);
    return this;
  }

  /**
   * Stops watching a key
   */
  unwatch(key, callback) {
    if (!this.watchers.has(key)) return this;

    const watchers = this.watchers.get(key);
    const index = watchers.indexOf(callback);
    if (index > -1) {
      watchers.splice(index, 1);
    }

    return this;
  }

  /**
   * Clears all config
   */
  clear() {
    this.values = {};
    this.watchers.clear();
    this.readonly.clear();
    this.validators.clear();
    return this;
  }

  /**
   * Gets config as env object
   */
  toEnv(prefix = '') {
    const env = {};
    const flatten = (obj, parentKey = '') => {
      for (const key in obj) {
        const value = obj[key];
        const fullKey = parentKey ? `${parentKey}_${key}` : key;
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          flatten(value, fullKey);
        } else {
          env[prefix + fullKey.toUpperCase()] = String(value);
        }
      }
    };

    flatten(this.values);
    return env;
  }

  /**
   * Creates a copy
   */
  clone() {
    return new Config(JSON.parse(JSON.stringify(this.values)));
  }

  /**
   * Gets config as JSON string
   */
  toJSON() {
    return JSON.stringify(this.values, null, 2);
  }
}

module.exports = Config;
