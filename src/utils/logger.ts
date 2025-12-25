/**
 * Logger service to centralize logging and enable future integrations
 * with services like Sentry, LogRocket, etc.
 */

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  /**
   * Log debug information (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Log informational messages
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || '');
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext): void {
    console.warn(`[WARN] ${message}`, context || '');
    // Future: Send to monitoring service
  }

  /**
   * Log error messages
   */
  error(message: string, error?: unknown, context?: LogContext): void {
    console.error(`[ERROR] ${message}`, error || '', context || '');

    // Future integration point for error monitoring (Sentry, etc.)
    // if (import.meta.env.PROD) {
    //   Sentry.captureException(error, { extra: { message, ...context } });
    // }
  }

  /**
   * Log React Query operation
   */
  query(operation: string, queryKey: unknown[], context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[QUERY] ${operation}`, { queryKey, ...context });
    }
  }

  /**
   * Log React Query mutation
   */
  mutation(operation: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[MUTATION] ${operation}`, context || '');
    }
  }
}

// Export singleton instance
export const logger = new Logger();
