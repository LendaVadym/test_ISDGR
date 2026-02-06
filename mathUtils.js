// Mathematical utilities and calculations

class MathUtils {
  /**
   * Calculates factorial
   */
  static factorial(n) {
    if (n < 0) throw new Error('Factorial of negative number');
    if (n === 0 || n === 1) return 1;
    return n * this.factorial(n - 1);
  }

  /**
   * Calculates GCD (Greatest Common Divisor)
   */
  static gcd(a, b) {
    return b === 0 ? a : this.gcd(b, a % b);
  }

  /**
   * Calculates LCM (Least Common Multiple)
   */
  static lcm(a, b) {
    return Math.abs(a * b) / this.gcd(a, b);
  }

  /**
   * Checks if prime
   */
  static isPrime(n) {
    if (n <= 1) return false;
    if (n <= 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;

    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
  }

  /**
   * Gets prime factors
   */
  static primeFactors(n) {
    const factors = [];
    for (let i = 2; i * i <= n; i++) {
      while (n % i === 0) {
        factors.push(i);
        n /= i;
      }
    }
    if (n > 1) factors.push(n);
    return factors;
  }

  /**
   * Checks if perfect square
   */
  static isPerfectSquare(n) {
    const sqrt = Math.sqrt(n);
    return sqrt === Math.floor(sqrt);
  }

  /**
   * Calculates sum of range
   */
  static sumRange(from, to) {
    return (to - from + 1) * (from + to) / 2;
  }

  /**
   * Calculates average
   */
  static average(numbers) {
    if (numbers.length === 0) return 0;
    return this.sum(numbers) / numbers.length;
  }

  /**
   * Calculates sum
   */
  static sum(numbers) {
    return numbers.reduce((acc, num) => acc + num, 0);
  }

  /**
   * Calculates median
   */
  static median(numbers) {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  /**
   * Calculates mode
   */
  static mode(numbers) {
    const frequency = {};
    let maxFreq = 0;
    let modes = [];

    numbers.forEach(num => {
      frequency[num] = (frequency[num] || 0) + 1;
      maxFreq = Math.max(maxFreq, frequency[num]);
    });

    for (const num in frequency) {
      if (frequency[num] === maxFreq) {
        modes.push(Number(num));
      }
    }

    return modes.length === Object.keys(frequency).length ? [] : modes;
  }

  /**
   * Calculates variance
   */
  static variance(numbers) {
    const avg = this.average(numbers);
    const squaredDiffs = numbers.map(num => Math.pow(num - avg, 2));
    return this.average(squaredDiffs);
  }

  /**
   * Calculates standard deviation
   */
  static stdDev(numbers) {
    return Math.sqrt(this.variance(numbers));
  }

  /**
   * Calculates range
   */
  static range(numbers) {
    return Math.max(...numbers) - Math.min(...numbers);
  }

  /**
   * Calculates percentage
   */
  static percentage(value, total) {
    return (value / total) * 100;
  }

  /**
   * Calculates percentage of total
   */
  static percentOf(percent, total) {
    return (percent / 100) * total;
  }

  /**
   * Rounds to decimal places
   */
  static round(num, decimals = 0) {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
  }

  /**
   * Generates random integer in range
   */
  static random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Clamps value between min and max
   */
  static clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Linear interpolation
   */
  static lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /**
   * Inverse linear interpolation
   */
  static inverseLerp(a, b, value) {
    return (value - a) / (b - a);
  }

  /**
   * Maps value from one range to another
   */
  static map(value, fromMin, fromMax, toMin, toMax) {
    const t = this.inverseLerp(fromMin, fromMax, value);
    return this.lerp(toMin, toMax, t);
  }

  /**
   * Smoothstep interpolation
   */
  static smoothstep(t) {
    return t * t * (3 - 2 * t);
  }

  /**
   * Distance between two points
   */
  static distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Distance in 3D
   */
  static distance3D(x1, y1, z1, x2, y2, z2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dz = z2 - z1;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Manhattan distance
   */
  static manhattanDistance(x1, y1, x2, y2) {
    return Math.abs(x2 - x1) + Math.abs(y2 - y1);
  }

  /**
   * Angle between two points
   */
  static angle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  }

  /**
   * Converts degrees to radians
   */
  static toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Converts radians to degrees
   */
  static toDegrees(radians) {
    return radians * (180 / Math.PI);
  }

  /**
   * Calculates combinations
   */
  static combinations(n, k) {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    k = Math.min(k, n - k);

    let result = 1;
    for (let i = 0; i < k; i++) {
      result *= (n - i);
      result /= (i + 1);
    }
    return result;
  }

  /**
   * Calculates permutations
   */
  static permutations(n, k) {
    if (k > n) return 0;
    return this.factorial(n) / this.factorial(n - k);
  }

  /**
   * Fibonacci number at index
   */
  static fibonacci(n) {
    if (n <= 1) return n;
    const fib = [0, 1];
    for (let i = 2; i <= n; i++) {
      fib[i] = fib[i - 1] + fib[i - 2];
    }
    return fib[n];
  }

  /**
   * Checks if number is power of 2
   */
  static isPowerOfTwo(n) {
    return n > 0 && (n & (n - 1)) === 0;
  }

  /**
   * Next power of 2
   */
  static nextPowerOfTwo(n) {
    n--;
    for (let i = 1; i < 32; i *= 2) {
      n |= n >> i;
    }
    return n + 1;
  }

  /**
   * Generates range of numbers
   */
  static range(from, to, step = 1) {
    const result = [];
    for (let i = from; i < to; i += step) {
      result.push(i);
    }
    return result;
  }

  /**
   * Checks if approximately equal
   */
  static approxEqual(a, b, epsilon = 1e-10) {
    return Math.abs(a - b) < epsilon;
  }

  /**
   * Normalizes number to 0-1 range
   */
  static normalize(value, min, max) {
    return (value - min) / (max - min);
  }

  /**
   * Sigmoid function
   */
  static sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  /**
   * ReLU activation
   */
  static relu(x) {
    return Math.max(0, x);
  }

  /**
   * Tanh activation
   */
  static tanh(x) {
    return Math.tanh(x);
  }
}

module.exports = MathUtils;
