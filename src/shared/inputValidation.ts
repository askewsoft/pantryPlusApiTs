import { logger } from './logger';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedData?: any;
}

export interface ValidationOptions {
  maxLength?: number;
  allowEmpty?: boolean;
  pattern?: RegExp;
  customValidator?: (value: any) => boolean;
}

/**
 * Validates if a string contains valid UTF-8 characters
 */
export function isValidUtf8(str: string): boolean {
  try {
    // Check if the string can be properly encoded/decoded
    const encoded = Buffer.from(str, 'utf8');
    const decoded = encoded.toString('utf8');
    return decoded === str;
  } catch {
    return false;
  }
}

/**
 * Sanitizes a string by removing or replacing invalid UTF-8 characters
 */
export function sanitizeUtf8(str: string): string {
  try {
    // Remove invalid UTF-8 sequences
    return str.replace(/[\uFFFD\uFFFE\uFFFF]|[\uD800-\uDFFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '');
  } catch {
    return '';
  }
}

/**
 * Validates a string field with various options
 */
export function validateString(
  value: any,
  fieldName: string,
  options: ValidationOptions = {}
): ValidationResult {
  const errors: string[] = [];

  // Check if value exists
  if (value === null || value === undefined) {
    if (!options.allowEmpty) {
      errors.push(`${fieldName} is required`);
    }
    return { isValid: errors.length === 0, errors };
  }

  // Convert to string if needed
  const stringValue = String(value);

  // Check if empty
  if (stringValue.trim() === '') {
    if (!options.allowEmpty) {
      errors.push(`${fieldName} cannot be empty`);
    }
    return { isValid: errors.length === 0, errors };
  }

  // Check UTF-8 validity
  if (!isValidUtf8(stringValue)) {
    errors.push(`${fieldName} contains invalid UTF-8 characters`);
    return { isValid: false, errors };
  }

  // Check length
  if (options.maxLength && stringValue.length > options.maxLength) {
    errors.push(`${fieldName} exceeds maximum length of ${options.maxLength} characters`);
  }

  // Check pattern
  if (options.pattern && !options.pattern.test(stringValue)) {
    errors.push(`${fieldName} does not match required format`);
  }

  // Custom validation
  if (options.customValidator && !options.customValidator(stringValue)) {
    errors.push(`${fieldName} failed custom validation`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: stringValue.trim()
  };
}

/**
 * Validates an email field specifically
 */
export function validateEmail(email: any): ValidationResult {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return validateString(email, 'email', {
    maxLength: 255,
    pattern: emailRegex,
    customValidator: (value) => {
      // Additional email-specific validation
      const parts = value.split('@');
      if (parts.length !== 2) return false;
      if (parts[0].length === 0 || parts[1].length === 0) return false;
      if (parts[1].indexOf('.') === -1) return false;
      return true;
    }
  });
}

/**
 * Validates a UUID field
 */
export function validateUuid(uuid: any): ValidationResult {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  return validateString(uuid, 'UUID', {
    pattern: uuidRegex
  });
}

/**
 * Validates an object with multiple fields
 */
export function validateObject(
  data: any,
  validations: Record<string, ValidationOptions>
): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: any = {};

  for (const [fieldName, options] of Object.entries(validations)) {
    const result = validateString(data[fieldName], fieldName, options);

    if (!result.isValid) {
      errors.push(...result.errors);
    } else if (result.sanitizedData !== undefined) {
      sanitizedData[fieldName] = result.sanitizedData;
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    sanitizedData: Object.keys(sanitizedData).length > 0 ? sanitizedData : undefined
  };
}

/**
 * Middleware factory for Express input validation
 */
export function createValidationMiddleware(validations: Record<string, ValidationOptions>) {
  return (req: any, res: any, next: any) => {
    const result = validateObject(req.body, validations);

    if (!result.isValid) {
      const log = logger('inputValidation');
      log.warn({
        message: 'Input validation failed',
        errors: result.errors,
        body: req.body,
        url: req.url,
        method: req.method
      });

      return res.status(400).json({
        error: 'Validation failed',
        details: result.errors
      });
    }

    // Replace body with sanitized data if available
    if (result.sanitizedData) {
      req.body = { ...req.body, ...result.sanitizedData };
    }

    next();
  };
}

/**
 * Quick validation for common fields
 */
export const commonValidations = {
  email: { maxLength: 255, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  nickname: { maxLength: 100, allowEmpty: false },
  name: { maxLength: 255 },
  description: { maxLength: 1000, allowEmpty: true },
  uuid: { pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i }
};
