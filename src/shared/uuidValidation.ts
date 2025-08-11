import { Response } from 'express';
import { logger } from './logger';

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
 * Validates a single UUID parameter and returns an error response if invalid
 * Use this in your controllers before processing requests
 */
export function validateUUIDParam(
  res: Response,
  paramName: string,
  paramValue: string,
  errorMessage?: string
): boolean {
  if (!isValidUUID(paramValue)) {
    log.warn({
      message: 'UUID validation failed',
      paramName,
      paramValue,
      path: res.req?.path,
      method: res.req?.method
    });

    res.status(400).json({
      error: 'Bad Request',
      message: errorMessage || 'Invalid UUID format',
      details: {
        invalidParameter: paramName,
        receivedValue: paramValue,
        expectedFormat: 'UUID v4 (e.g., 123e4567-e89b-12d3-a456-426614174000)'
      }
    });

    return false;
  }

  return true;
}

/**
 * Validates multiple UUID parameters at once
 * Returns false if any validation fails (response is already sent)
 */
export function validateMultipleUUIDs(
  res: Response,
  params: Record<string, string>,
  errorMessage?: string
): boolean {
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

  // If any UUIDs are invalid, return error
  if (invalidParams.length > 0) {
    log.warn({
      message: 'Multiple UUID validation failed',
      invalidParams,
      validationResults,
      path: res.req?.path,
      method: res.req?.method
    });

    res.status(400).json({
      error: 'Bad Request',
      message: errorMessage || 'One or more UUID parameters are invalid',
      details: {
        invalidParameters: invalidParams,
        expectedFormat: 'UUID v4 (e.g., 123e4567-e89b-12d3-a456-426614174000)',
        receivedValues: invalidParams.reduce((acc, param) => {
          acc[param] = validationResults[param].value;
          return acc;
        }, {} as Record<string, string>)
      }
    });

    return false;
  }

  return true;
}

/**
 * Convenience function for common UUID parameter validation
 * Use this for most endpoints with standard UUID parameters
 */
export function validateCommonUUIDs(
  res: Response,
  params: Record<string, string>
): boolean {
  return validateMultipleUUIDs(
    res,
    params,
    'One or more UUID parameters are invalid'
  );
}