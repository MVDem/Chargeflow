import { DomainError, domainErrorToMessage } from '../types/errors';

/**
 * Extracts a user-friendly error message from various error types
 * @param error - The error to extract a message from
 * @param fallback - Fallback message if error cannot be processed
 * @returns A human-readable error message
 */
export const extractErrorMessage = (
  error: unknown,
  fallback = 'An unexpected error occurred'
): string => {
  // Handle DomainError from fp-ts TaskEither
  if (error && typeof error === 'object' && '_tag' in error) {
    return domainErrorToMessage(error as DomainError);
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }

  // Fallback for unknown error types
  return fallback;
};

/**
 * Type guard to check if an error is a DomainError
 */
export const isDomainError = (error: unknown): error is DomainError => {
  return error !== null && typeof error === 'object' && '_tag' in error;
};
