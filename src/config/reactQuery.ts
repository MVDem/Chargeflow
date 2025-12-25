/**
 * Centralized React Query configuration
 * Used across all queries and mutations for consistency
 */

export const QUERY_CONFIG = {
  /**
   * Time before data is considered stale (5 minutes)
   */
  STALE_TIME: 1000 * 60 * 5,

  /**
   * Time before inactive data is garbage collected (10 minutes)
   */
  GC_TIME: 1000 * 60 * 10,

  /**
   * Number of retry attempts for failed queries
   */
  RETRY: 1,

  /**
   * Retry delay function with exponential backoff
   */
  RETRY_DELAY: (attemptIndex: number) =>
    Math.min(1000 * 2 ** attemptIndex, 30000),
} as const;

/**
 * Default query options
 */
export const defaultQueryOptions = {
  staleTime: QUERY_CONFIG.STALE_TIME,
  gcTime: QUERY_CONFIG.GC_TIME,
  retry: QUERY_CONFIG.RETRY,
  retryDelay: QUERY_CONFIG.RETRY_DELAY,
} as const;

/**
 * Default mutation options
 */
export const defaultMutationOptions = {
  retry: QUERY_CONFIG.RETRY,
  retryDelay: QUERY_CONFIG.RETRY_DELAY,
} as const;
