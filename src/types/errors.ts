/**
 * Domain Error ADT (Algebraic Data Type)
 * Represents all possible error states in the application
 * Uses tagged union for exhaustive pattern matching
 */
export type DomainError =
  | {
      readonly _tag: 'NetworkError';
      readonly message: string;
      readonly originalError?: unknown;
    }
  | {
      readonly _tag: 'ValidationError';
      readonly message: string;
      readonly errors: unknown;
      readonly rawData?: unknown;
    }
  | {
      readonly _tag: 'NotFoundError';
      readonly message: string;
      readonly resourceId: string;
      readonly status: 404;
    }
  | {
      readonly _tag: 'UnauthorizedError';
      readonly message: string;
      readonly status: 401;
    }
  | {
      readonly _tag: 'ServerError';
      readonly message: string;
      readonly status: number;
      readonly details?: unknown;
    };

/**
 * Constructors for creating domain errors
 */
export const DomainError = {
  networkError: (message: string, originalError?: unknown): DomainError => ({
    _tag: 'NetworkError',
    message,
    originalError,
  }),

  validationError: (
    message: string,
    errors: unknown,
    rawData?: unknown
  ): DomainError => ({
    _tag: 'ValidationError',
    message,
    errors,
    rawData,
  }),

  notFoundError: (message: string, resourceId: string): DomainError => ({
    _tag: 'NotFoundError',
    message,
    resourceId,
    status: 404,
  }),

  unauthorizedError: (message: string = 'Unauthorized'): DomainError => ({
    _tag: 'UnauthorizedError',
    message,
    status: 401,
  }),

  serverError: (
    message: string,
    status: number,
    details?: unknown
  ): DomainError => ({
    _tag: 'ServerError',
    message,
    status,
    details,
  }),
};

/**
 * Pattern matching function for exhaustive error handling
 * TypeScript will ensure all cases are handled
 */
export const matchDomainError = <R>(matchers: {
  NetworkError: (error: Extract<DomainError, { _tag: 'NetworkError' }>) => R;
  ValidationError: (
    error: Extract<DomainError, { _tag: 'ValidationError' }>
  ) => R;
  NotFoundError: (error: Extract<DomainError, { _tag: 'NotFoundError' }>) => R;
  UnauthorizedError: (
    error: Extract<DomainError, { _tag: 'UnauthorizedError' }>
  ) => R;
  ServerError: (error: Extract<DomainError, { _tag: 'ServerError' }>) => R;
}) => {
  return (error: DomainError): R => {
    switch (error._tag) {
      case 'NetworkError':
        return matchers.NetworkError(error);
      case 'ValidationError':
        return matchers.ValidationError(error);
      case 'NotFoundError':
        return matchers.NotFoundError(error);
      case 'UnauthorizedError':
        return matchers.UnauthorizedError(error);
      case 'ServerError':
        return matchers.ServerError(error);
    }
  };
};

/**
 * Convert DomainError to user-friendly message
 */
export const domainErrorToMessage = matchDomainError({
  NetworkError: (e) => `Network error: ${e.message}`,
  ValidationError: (e) => `Validation error: ${e.message}`,
  NotFoundError: (e) => `Not found: ${e.message}`,
  UnauthorizedError: (e) => e.message,
  ServerError: (e) => `Server error (${e.status}): ${e.message}`,
});

/**
 * Check if error is a specific type
 */
export const isDomainError = {
  networkError: (
    error: DomainError
  ): error is Extract<DomainError, { _tag: 'NetworkError' }> =>
    error._tag === 'NetworkError',
  validationError: (
    error: DomainError
  ): error is Extract<DomainError, { _tag: 'ValidationError' }> =>
    error._tag === 'ValidationError',
  notFoundError: (
    error: DomainError
  ): error is Extract<DomainError, { _tag: 'NotFoundError' }> =>
    error._tag === 'NotFoundError',
  unauthorizedError: (
    error: DomainError
  ): error is Extract<DomainError, { _tag: 'UnauthorizedError' }> =>
    error._tag === 'UnauthorizedError',
  serverError: (
    error: DomainError
  ): error is Extract<DomainError, { _tag: 'ServerError' }> =>
    error._tag === 'ServerError',
};
