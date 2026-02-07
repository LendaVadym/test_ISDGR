/**
 * Data Validator Schema
 * Schema validation utility for complex data structures
 */

class SchemaValidator {
  constructor() {
    this.schemas = new Map();
  }

  defineSchema(name, rules) {
    this.schemas.set(name, rules);
  }

  validate(data, schemaName) {
    const schema = this.schemas.get(schemaName);
    if (!schema) {
      throw new Error(`Schema "${schemaName}" not found`);
    }

    const errors = [];
    for (const [field, rule] of Object.entries(schema)) {
      const value = data[field];
      const error = this.validateField(field, value, rule);
      if (error) errors.push(error);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  validateField(field, value, rule) {
    if (rule.required && (value === undefined || value === null)) {
      return `Field "${field}" is required`;
    }

    if (value !== undefined && value !== null) {
      if (rule.type && typeof value !== rule.type) {
        return `Field "${field}" must be of type ${rule.type}`;
      }

      if (rule.minLength && value.length < rule.minLength) {
        return `Field "${field}" must have minimum length of ${rule.minLength}`;
      }

      if (rule.maxLength && value.length > rule.maxLength) {
        return `Field "${field}" must have maximum length of ${rule.maxLength}`;
      }

      if (rule.pattern && !rule.pattern.test(value)) {
        return `Field "${field}" does not match required pattern`;
      }
    }

    return null;
  }

  getSchema(name) {
    return this.schemas.get(name);
  }

  listSchemas() {
    return Array.from(this.schemas.keys());
  }
}

module.exports = SchemaValidator;
