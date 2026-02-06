// String and text manipulation utilities

class StringUtils {
  /**
   * Capitalizes first letter
   */
  static capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Lowercases first letter
   */
  static uncapitalize(str) {
    return str.charAt(0).toLowerCase() + str.slice(1);
  }

  /**
   * Converts to camelCase
   */
  static toCamelCase(str) {
    return str
      .split(/[-_\s]+/)
      .map((word, i) => i === 0 ? word : this.capitalize(word))
      .join('');
  }

  /**
   * Converts to kebab-case
   */
  static toKebabCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  /**
   * Converts to snake_case
   */
  static toSnakeCase(str) {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }

  /**
   * Converts to PascalCase
   */
  static toPascalCase(str) {
    return str
      .split(/[-_\s]+/)
      .map(word => this.capitalize(word))
      .join('');
  }

  /**
   * Removes whitespace
   */
  static trim(str) {
    return str.trim();
  }

  /**
   * Repeats string
   */
  static repeat(str, count) {
    return str.repeat(count);
  }

  /**
   * Pads string on left
   */
  static padStart(str, length, padStr = ' ') {
    return str.padStart(length, padStr);
  }

  /**
   * Pads string on right
   */
  static padEnd(str, length, padStr = ' ') {
    return str.padEnd(length, padStr);
  }

  /**
   * Truncates string
   */
  static truncate(str, length, suffix = '...') {
    if (str.length <= length) return str;
    return str.slice(0, length - suffix.length) + suffix;
  }

  /**
   * Gets substring before first occurrence
   */
  static before(str, delimiter) {
    const index = str.indexOf(delimiter);
    return index === -1 ? str : str.slice(0, index);
  }

  /**
   * Gets substring after first occurrence
   */
  static after(str, delimiter) {
    const index = str.indexOf(delimiter);
    return index === -1 ? '' : str.slice(index + delimiter.length);
  }

  /**
   * Reverses string
   */
  static reverse(str) {
    return str.split('').reverse().join('');
  }

  /**
   * Checks if palindrome
   */
  static isPalindrome(str) {
    const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
    return cleaned === this.reverse(cleaned);
  }

  /**
   * Counts occurrence of substring
   */
  static count(str, substring) {
    return str.split(substring).length - 1;
  }

  /**
   * Replaces all occurrences
   */
  static replaceAll(str, find, replace) {
    return str.split(find).join(replace);
  }

  /**
   * Joins strings with condition
   */
  static join(separator, ...items) {
    return items.filter(item => item).join(separator);
  }

  /**
   * Generates random string
   */
  static random(length = 10, charset = 'abcdefghijklmnopqrstuvwxyz0123456789') {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  /**
   * Generates slug from string
   */
  static slug(str) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Generates hash code
   */
  static hash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Escapes HTML entities
   */
  static escapeHtml(str) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return str.replace(/[&<>"']/g, char => map[char]);
  }

  /**
   * Unescapes HTML entities
   */
  static unescapeHtml(str) {
    const map = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'"
    };
    return str.replace(/&[a-z]+;/g, entity => map[entity] || entity);
  }

  /**
   * Decodes base64
   */
  static base64Decode(str) {
    return Buffer.from(str, 'base64').toString('utf-8');
  }

  /**
   * Encodes to base64
   */
  static base64Encode(str) {
    return Buffer.from(str, 'utf-8').toString('base64');
  }

  /**
   * Levenshtein distance
   */
  static distance(str1, str2) {
    const matrix = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Similarity score
   */
  static similarity(str1, str2) {
    const distance = this.distance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    return maxLength === 0 ? 1 : 1 - (distance / maxLength);
  }

  /**
   * Generates Lorem Ipsum
   */
  static loremIpsum(wordCount = 50) {
    const words = [
      'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur',
      'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor'
    ];

    let result = [];
    for (let i = 0; i < wordCount; i++) {
      result.push(words[Math.floor(Math.random() * words.length)]);
    }
    return result.join(' ');
  }
}

module.exports = StringUtils;
