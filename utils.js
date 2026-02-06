// Utility functions library

/**
 * Deep clones an object or array
 * @param {*} obj - The object to clone
 * @returns {*} A deep copy of the object
 */
function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item));
  }

  if (obj instanceof Object) {
    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
}

/**
 * Merges multiple objects into one
 * @param {...Object} objects - Objects to merge
 * @returns {Object} Merged object
 */
function mergeObjects(...objects) {
  return objects.reduce((result, obj) => {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        result[key] = obj[key];
      }
    }
    return result;
  }, {});
}

/**
 * Flattens a nested array
 * @param {Array} arr - The array to flatten
 * @param {number} depth - How deep to flatten
 * @returns {Array} Flattened array
 */
function flattenArray(arr, depth = Infinity) {
  let level = 0;
  
  return arr.reduce((flat, item) => {
    if (Array.isArray(item) && level < depth) {
      level++;
      return flat.concat(flattenArray(item, depth - 1));
    }
    return flat.concat(item);
  }, []);
}

/**
 * Removes duplicates from array
 * @param {Array} arr - The array
 * @returns {Array} Array with unique values
 */
function getUnique(arr) {
  return [...new Set(arr)];
}

/**
 * Groups array items by a key function
 * @param {Array} arr - The array
 * @param {Function} keyFunc - Function to determine grouping key
 * @returns {Object} Grouped object
 */
function groupBy(arr, keyFunc) {
  return arr.reduce((groups, item) => {
    const key = keyFunc(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
}

/**
 * Transforms array elements by a mapping function
 * @param {Array} arr - The array
 * @param {Function} mapFunc - Mapping function
 * @returns {Array} Mapped array
 */
function map(arr, mapFunc) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    result.push(mapFunc(arr[i], i, arr));
  }
  return result;
}

/**
 * Filters array elements
 * @param {Array} arr - The array
 * @param {Function} predicate - Filter function
 * @returns {Array} Filtered array
 */
function filter(arr, predicate) {
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i], i, arr)) {
      result.push(arr[i]);
    }
  }
  return result;
}

/**
 * Reduces array to single value
 * @param {Array} arr - The array
 * @param {Function} reducer - Reducer function
 * @param {*} initial - Initial value
 * @returns {*} Reduced value
 */
function reduce(arr, reducer, initial) {
  let accumulator = initial;
  for (let i = 0; i < arr.length; i++) {
    accumulator = reducer(accumulator, arr[i], i, arr);
  }
  return accumulator;
}

/**
 * Checks if all elements pass a test
 * @param {Array} arr - The array
 * @param {Function} test - Test function
 * @returns {boolean} True if all pass
 */
function every(arr, test) {
  for (let i = 0; i < arr.length; i++) {
    if (!test(arr[i], i, arr)) {
      return false;
    }
  }
  return true;
}

/**
 * Checks if any element passes a test
 * @param {Array} arr - The array
 * @param {Function} test - Test function
 * @returns {boolean} True if any pass
 */
function some(arr, test) {
  for (let i = 0; i < arr.length; i++) {
    if (test(arr[i], i, arr)) {
      return true;
    }
  }
  return false;
}

/**
 * Finds first element matching predicate
 * @param {Array} arr - The array
 * @param {Function} predicate - Test function
 * @returns {*} Found element or undefined
 */
function find(arr, predicate) {
  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i], i, arr)) {
      return arr[i];
    }
  }
  return undefined;
}

/**
 * Creates a range of numbers
 * @param {number} start - Start number
 * @param {number} end - End number
 * @param {number} step - Step size
 * @returns {Array} Array of numbers
 */
function range(start, end, step = 1) {
  const result = [];
  for (let i = start; i < end; i += step) {
    result.push(i);
  }
  return result;
}

/**
 * Shuffles an array randomly
 * @param {Array} arr - The array
 * @returns {Array} Shuffled array
 */
function shuffle(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Chunks array into smaller arrays
 * @param {Array} arr - The array
 * @param {number} size - Chunk size
 * @returns {Array} Array of chunks
 */
function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * Zips multiple arrays together
 * @param {...Array} arrays - Arrays to zip
 * @returns {Array} Zipped array
 */
function zip(...arrays) {
  const minLength = Math.min(...arrays.map(a => a.length));
  const result = [];
  for (let i = 0; i < minLength; i++) {
    result.push(arrays.map(a => a[i]));
  }
  return result;
}

module.exports = {
  deepClone,
  mergeObjects,
  flattenArray,
  getUnique,
  groupBy,
  map,
  filter,
  reduce,
  every,
  some,
  find,
  range,
  shuffle,
  chunk,
  zip
};
