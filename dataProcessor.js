// Data Processing and Transformation Module

class DataProcessor {
  constructor(data = []) {
    this.data = data;
    this.filters = [];
    this.transformations = [];
  }

  /**
   * Loads data into processor
   */
  static fromArray(arr) {
    return new DataProcessor(arr);
  }

  /**
   * Loads data from CSV string
   */
  static fromCSV(csvString) {
    const lines = csvString.trim().split('\n');
    const headers = lines[0].split(',');
    const data = lines.slice(1).map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((header, i) => {
        obj[header.trim()] = values[i].trim();
      });
      return obj;
    });
    return new DataProcessor(data);
  }

  /**
   * Adds a filter transformation
   */
  addFilter(predicate) {
    this.filters.push(predicate);
    return this;
  }

  /**
   * Adds a map transformation
   */
  addMap(mapFunc) {
    this.transformations.push(data => data.map(mapFunc));
    return this;
  }

  /**
   * Adds a custom transformation
   */
  addTransform(transformFunc) {
    this.transformations.push(transformFunc);
    return this;
  }

  /**
   * Applies all filters and transformations
   */
  process() {
    let result = this.data;

    // Apply filters
    this.filters.forEach(filter => {
      result = result.filter(filter);
    });

    // Apply transformations
    this.transformations.forEach(transform => {
      result = transform(result);
    });

    return result;
  }

  /**
   * Sorts data by property
   */
  sortBy(property, ascending = true) {
    const sorted = [...this.data].sort((a, b) => {
      if (a[property] < b[property]) return ascending ? -1 : 1;
      if (a[property] > b[property]) return ascending ? 1 : -1;
      return 0;
    });
    return new DataProcessor(sorted);
  }

  /**
   * Groups data by property
   */
  groupByProperty(property) {
    const grouped = {};
    this.data.forEach(item => {
      const key = item[property];
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(item);
    });
    return grouped;
  }

  /**
   * Aggregates data
   */
  aggregate(groupKey, aggregateFunc) {
    const grouped = this.groupByProperty(groupKey);
    const result = [];
    for (const key in grouped) {
      result.push({
        [groupKey]: key,
        ...aggregateFunc(grouped[key])
      });
    }
    return result;
  }

  /**
   * Selects specific columns
   */
  select(...columns) {
    const selected = this.data.map(item => {
      const obj = {};
      columns.forEach(col => {
        obj[col] = item[col];
      });
      return obj;
    });
    return new DataProcessor(selected);
  }

  /**
   * Renames columns
   */
  renameColumns(mapping) {
    const renamed = this.data.map(item => {
      const obj = {};
      for (const key in item) {
        const newKey = mapping[key] || key;
        obj[newKey] = item[key];
      }
      return obj;
    });
    return new DataProcessor(renamed);
  }

  /**
   * Joins with another dataset
   */
  join(other, leftKey, rightKey, type = 'inner') {
    const result = [];

    if (type === 'inner' || type === 'left') {
      this.data.forEach(leftItem => {
        const matches = other.data.filter(rightItem => 
          leftItem[leftKey] === rightItem[rightKey]
        );
        if (matches.length > 0) {
          matches.forEach(match => {
            result.push({ ...leftItem, ...match });
          });
        } else if (type === 'left') {
          result.push(leftItem);
        }
      });
    }

    if (type === 'right') {
      other.data.forEach(rightItem => {
        const matches = this.data.filter(leftItem => 
          leftItem[leftKey] === rightItem[rightKey]
        );
        if (matches.length > 0) {
          matches.forEach(match => {
            result.push({ ...match, ...rightItem });
          });
        } else {
          result.push(rightItem);
        }
      });
    }

    return new DataProcessor(result);
  }

  /**
   * Gets statistics
   */
  getStats(numericColumn) {
    const values = this.data
      .map(item => parseFloat(item[numericColumn]))
      .filter(v => !isNaN(v));

    if (values.length === 0) return null;

    const sorted = values.sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const mid = Math.floor(values.length / 2);
    const median = values.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return {
      count: values.length,
      sum,
      mean,
      median,
      min: Math.min(...values),
      max: Math.max(...values),
      variance,
      stdDev
    };
  }

  /**
   * Converts to array
   */
  toArray() {
    return this.process();
  }

  /**
   * Converts to CSV
   */
  toCSV() {
    const processed = this.process();
    if (processed.length === 0) return '';

    const headers = Object.keys(processed[0]);
    const headerLine = headers.join(',');
    const dataLines = processed.map(item =>
      headers.map(h => item[h]).join(',')
    );

    return [headerLine, ...dataLines].join('\n');
  }

  /**
   * Converts to JSON string
   */
  toJSON() {
    return JSON.stringify(this.process(), null, 2);
  }
}

module.exports = DataProcessor;
