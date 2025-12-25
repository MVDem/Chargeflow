import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';
import { pipe } from 'fp-ts/function';
import type * as t from 'io-ts';
import { DomainError } from '../../types/errors';

/**
 * Configuration for HTTP requests
 */
interface FetchConfig {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

const DEFAULT_CONFIG: Required<FetchConfig> = {
  timeout: 30000, // 30 seconds
  retries: 3,
  retryDelay: 1000, // 1 second
};

/**
 * Creates a timeout promise that rejects after specified duration
 */
const createTimeout = (ms: number): Promise<never> =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Request timeout after ${ms}ms`)), ms)
  );

/**
 * Fetches JSON data with timeout support
 */
const fetchWithTimeout = (
  url: string,
  timeout: number
): TE.TaskEither<DomainError, unknown> =>
  TE.tryCatch(
    async () => {
      const response = await Promise.race([fetch(url), createTimeout(timeout)]);

      if (!response.ok) {
        const status = response.status;

        if (status === 404) {
          throw DomainError.notFoundError(`Resource not found: ${url}`, url);
        }

        if (status === 401 || status === 403) {
          throw DomainError.unauthorizedError(`Unauthorized access to: ${url}`);
        }

        if (status >= 500) {
          throw DomainError.serverError(`Server error: ${status}`, status, {
            url,
          });
        }

        throw DomainError.serverError(`HTTP error: ${status}`, status, { url });
      }

      return response.json();
    },
    (error) => {
      if (error instanceof Error) {
        return DomainError.networkError(error.message, error);
      }
      // If it's already a DomainError, return it
      if (typeof error === 'object' && error !== null && '_tag' in error) {
        return error as DomainError;
      }
      return DomainError.networkError('Unknown network error', error);
    }
  );

/**
 * Validates JSON data against io-ts codec
 */
const validateData = <A>(
  codec: t.Type<A>,
  data: unknown
): E.Either<DomainError, A> =>
  pipe(
    codec.decode(data),
    E.mapLeft((errors) =>
      DomainError.validationError(
        'Invalid response format from API',
        errors,
        data
      )
    )
  );

/**
 * Retry logic for failed requests
 */
const withRetry = <A>(
  task: TE.TaskEither<DomainError, A>,
  retries: number,
  delay: number
): TE.TaskEither<DomainError, A> =>
  pipe(
    task,
    TE.orElse((error) => {
      // Only retry network errors, not validation or 404s
      if (error._tag === 'NetworkError' && retries > 0) {
        return pipe(
          TE.fromTask(
            () => new Promise((resolve) => setTimeout(resolve, delay))
          ),
          TE.chain(() => withRetry(task, retries - 1, delay * 2)) // Exponential backoff
        );
      }
      return TE.left(error);
    })
  );

/**
 * Generic HTTP GET request with io-ts validation
 * Includes timeout, retry, and runtime type checking
 *
 * @param url - The URL to fetch from
 * @param codec - io-ts codec for runtime validation
 * @param config - Optional configuration (timeout, retries, etc.)
 * @returns TaskEither with validated data or DomainError
 */
export const fetchJson = <A>(
  url: string,
  codec: t.Type<A>,
  config: FetchConfig = {}
): TE.TaskEither<DomainError, A> => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const fetchTask = pipe(
    fetchWithTimeout(url, finalConfig.timeout),
    TE.chainEitherKW((data) => validateData(codec, data))
  );

  return withRetry(fetchTask, finalConfig.retries, finalConfig.retryDelay);
};

/**
 * Generic HTTP POST/PUT/PATCH request with io-ts validation
 *
 * @param url - The URL to send request to
 * @param method - HTTP method
 * @param body - Request body
 * @param codec - io-ts codec for response validation
 * @param config - Optional configuration
 * @returns TaskEither with validated response or DomainError
 */
export const fetchJsonWithBody = <A>(
  url: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body: unknown,
  codec: t.Type<A>,
  config: FetchConfig = {}
): TE.TaskEither<DomainError, A> => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  const fetchTask = TE.tryCatch(
    async () => {
      const response = await Promise.race([
        fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }),
        createTimeout(finalConfig.timeout),
      ]);

      if (!response.ok) {
        const status = response.status;

        if (status === 404) {
          throw DomainError.notFoundError(`Resource not found: ${url}`, url);
        }

        if (status === 401 || status === 403) {
          throw DomainError.unauthorizedError(`Unauthorized access to: ${url}`);
        }

        if (status >= 500) {
          throw DomainError.serverError(`Server error: ${status}`, status, {
            url,
            method,
          });
        }

        throw DomainError.serverError(`HTTP error: ${status}`, status, {
          url,
          method,
        });
      }

      return response.json();
    },
    (error) => {
      if (error instanceof Error) {
        return DomainError.networkError(error.message, error);
      }
      if (typeof error === 'object' && error !== null && '_tag' in error) {
        return error as DomainError;
      }
      return DomainError.networkError('Unknown network error', error);
    }
  );

  return pipe(
    withRetry(fetchTask, finalConfig.retries, finalConfig.retryDelay),
    TE.chainEitherKW((data) => validateData(codec, data))
  );
};
