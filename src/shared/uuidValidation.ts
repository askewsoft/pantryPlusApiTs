import { logger } from './logger';
import { ErrorCode } from './errorHandler';

const log = logger('uuidValidation');

/**
 * UUID validation utilities
 * These functions can be called from your controllers to validate UUIDs
 */

/**
 * Validates if a string is a valid UUID v4 format
 */
export function isValidUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }

  // UUID v4 regex pattern
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validates a single UUID parameter and throws an error if invalid
 * Use this in your controllers before processing requests
 */
export function validateUUIDParam(
  paramName: string,
  paramValue: string,
  errorMessage?: string
): void {
  if (!isValidUUID(paramValue)) {
    log.warn({
      message: 'UUID validation failed',
      paramName,
      paramValue
    });

    const error = new Error(errorMessage || 'Invalid UUID format') as any;
    error.name = ErrorCode.INVALID_UUID;
    error.details = {
      invalidParameter: paramName,
      receivedValue: paramValue,
      expectedFormat: 'UUID v4 (e.g., 123e4567-e89b-12d3-a456-426614174000)'
    };

    throw error;
  }
}

/**
 * Validates multiple UUID parameters at once
 * Throws an error if any validation fails
 */
export function validateMultipleUUIDs(
  params: Record<string, string>,
  errorMessage?: string
): void {
  const invalidParams: string[] = [];
  const validationResults: Record<string, { value: string; isValid: boolean }> = {};

  // Validate each parameter
  Object.entries(params).forEach(([paramName, paramValue]) => {
    const isValid = isValidUUID(paramValue);
    validationResults[paramName] = { value: paramValue, isValid };

    if (!isValid) {
      invalidParams.push(paramName);
    }
  });

  // If any UUIDs are invalid, throw error
  if (invalidParams.length > 0) {
    log.warn({
      message: 'Multiple UUID validation failed',
      invalidParams,
      validationResults
    });

    const error = new Error(errorMessage || 'One or more UUID parameters are invalid') as any;
    error.name = ErrorCode.INVALID_UUID;
    error.details = {
      invalidParameters: invalidParams,
      expectedFormat: 'UUID v4 (e.g., 123e4567-e89b-12d3-a456-426614174000)',
      receivedValues: invalidParams.reduce((acc, param) => {
        acc[param] = validationResults[param].value;
        return acc;
      }, {} as Record<string, string>)
    };

    throw error;
  }
}

/**
 * Convenience function for common UUID parameter validation
 * Use this for most endpoints with standard UUID parameters
 */
export function validateCommonUUIDs(
  params: Record<string, string>
): void {
  return validateMultipleUUIDs(
    params,
    'One or more UUID parameters are invalid'
  );
}

/**
 * Validates UUID fields in request body objects
 * Use this to validate UUIDs in POST/PUT request bodies
 */
export function validateBodyUUIDs(
  body: Record<string, any>,
  uuidFields: string[],
  errorMessage?: string
): void {
  const bodyUUIDs: Record<string, string> = {};

  // Extract UUID fields from body
  uuidFields.forEach(fieldName => {
    if (body[fieldName] && typeof body[fieldName] === 'string') {
      bodyUUIDs[fieldName] = body[fieldName];
    }
  });

  // If no UUID fields found, nothing to validate
  if (Object.keys(bodyUUIDs).length === 0) {
    return;
  }

  // Validate the UUIDs
  validateMultipleUUIDs(bodyUUIDs, errorMessage);
}