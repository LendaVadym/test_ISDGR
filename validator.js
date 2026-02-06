// Data validation and schema checking

class ValidationError extends Error {
  constructor(message, path = '') {
    super(message);
    this.name = 'ValidationError';
    this.path = path;
  }
}

class Schema {
  constructor(type, options = {}) {
    this.type = type;
    this.options = options;
    this.validators = [];
    this.transformers = [];
    this.required = options.required || false;
    this.default = options.default;
  }

  /**
   * Creates string schema
   */
  static string(options = {}) {
    return new Schema('string', options);
  }

  /**
   * Creates number schema
   */
  static number(options = {}) {
    return new Schema('number', options);
  }

  /**
   * Creates boolean schema
   */
  static boolean(options = {}) {
    return new Schema('boolean', options);
  }

  /**
   * Creates array schema
   */
  static array(itemSchema, options = {}) {
    const schema = new Schema('array', options);
    schema.itemSchema = itemSchema;
    return schema;
  }

  /**
   * Creates object schema
   */
  static object(schemaObject, options = {}) {
    const schema = new Schema('object', options);
    schema.schemaObject = schemaObject;
    return schema;
  }

  /**
   * Marks as required
   */
  required() {
    this.required = true;
    return this;
  }

  /**
   * Sets default value
   */
  default(value) {
    this.default = value;
    return this;
  }

  /**
   * Adds custom validator
   */
  custom(validatorFunc) {
    this.validators.push(validatorFunc);
    return this;
  }

  /**
   * Adds transformer
   */
  transform(transformFunc) {
    this.transformers.push(transformFunc);
    return this;
  }

  /**
   * Adds minimum value (for numbers)
   */
  min(value) {
    this.validators.push(val => {
      if (typeof val === 'number' && val < value) {
        throw new ValidationError(`Value must be >= ${value}`);
      }
      if (typeof val === 'string' && val.length < value) {
        throw new ValidationError(`String length must be >= ${value}`);
      }
    });
    return this;
  }

  /**
   * Adds maximum value
   */
  max(value) {
    this.validators.push(val => {
      if (typeof val === 'number' && val > value) {
        throw new ValidationError(`Value must be <= ${value}`);
      }
      if (typeof val === 'string' && val.length > value) {
        throw new ValidationError(`String length must be <= ${value}`);
      }
    });
    return this;
  }

  /**
   * Adds pattern matching (for strings)
   */
  pattern(regex) {
    this.validators.push(val => {
      if (typeof val === 'string' && !regex.test(val)) {
        throw new ValidationError(`Value does not match pattern: ${regex}`);
      }
    });
    return this;
  }

  /**
   * Adds enum validation
   */
  enum(...values) {
    this.validators.push(val => {
      if (!values.includes(val)) {
        throw new ValidationError(`Value must be one of: ${values.join(', ')}`);
      }
    });
    return this;
  }

  /**
   * Validates a value
   */
  validate(value, path = '') {
    // Check required
    if (this.required && (value === undefined || value === null)) {
      throw new ValidationError(`Value is required`, path);
    }

    // Use default if not provided
    if ((value === undefined || value === null) && this.default !== undefined) {
      value = typeof this.default === 'function' ? this.default() : this.default;
    }

    // Check type
    if (value !== undefined && value !== null) {
      const actualType = Array.isArray(value) ? 'array' : typeof value;
      
      if (this.type !== actualType) {
        throw new ValidationError(
          `Expected type ${this.type}, got ${actualType}`,
          path
        );
      }

      // Apply transformers
      for (const transformer of this.transformers) {
        value = transformer(value);
      }

      // Apply validators
      for (const validator of this.validators) {
        validator(value);
      }

      // Validate nested structures
      if (this.type === 'array' && this.itemSchema) {
        for (let i = 0; i < value.length; i++) {
          this.itemSchema.validate(value[i], `${path}[${i}]`);
        }
      }

      if (this.type === 'object' && this.schemaObject) {
        for (const key in this.schemaObject) {
          const schema = this.schemaObject[key];
          const nestedPath = path ? `${path}.${key}` : key;
          schema.validate(value[key], nestedPath);
        }
      }
    }

    return value;
  }
}

class Validator {
  constructor() {
    this.schemas = {};
  }

  /**
   * Adds a named schema
   */
  addSchema(name, schema) {
    this.schemas[name] = schema;
    return this;
  }

  /**
   * Gets a schema
   */
  getSchema(name) {
    return this.schemas[name];
  }

  /**
   * Validates data against schema
   */
  validate(data, schema) {
    if (typeof schema === 'string') {
      schema = this.getSchema(schema);
    }

    try {
      return schema.validate(data);
    } catch (error) {
      return {
        valid: false,
        error: error.message,
        path: error.path
      };
    }
  }

  /**
   * Validates multiple data items
   */
  validateBatch(dataArray, schema) {
    if (typeof schema === 'string') {
      schema = this.getSchema(schema);
    }

    const results = dataArray.map((data, index) => ({
      index,
      valid: true,
      data,
      error: null
    }));

    for (let i = 0; i < results.length; i++) {
      try {
        results[i].data = schema.validate(results[i].data);
      } catch (error) {
        results[i].valid = false;
        results[i].error = error.message;
      }
    }

    return results;
  }
}

module.exports = { Schema, Validator, ValidationError };
