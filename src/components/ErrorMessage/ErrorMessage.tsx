import { extractErrorMessage } from '../../utils/errorHelpers';
import styles from './ErrorMessage.module.css';

interface ErrorMessageProps {
  /**
   * Title for the error message
   */
  title: string;

  /**
   * Error object (DomainError, Error, or unknown)
   */
  error?: unknown;

  /**
   * Fallback message if error cannot be extracted
   */
  fallbackMessage?: string;

  /**
   * Optional retry callback
   */
  onRetry?: () => void;

  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * Reusable error message component
 * Displays consistent error UI with optional retry functionality
 */
export function ErrorMessage({
  title,
  error,
  fallbackMessage = 'An unexpected error occurred',
  onRetry,
  className,
}: ErrorMessageProps) {
  const errorMessage = extractErrorMessage(error, fallbackMessage);

  return (
    <div className={`${styles.error} ${className || ''}`}>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{errorMessage}</p>
        {onRetry && (
          <button
            className={styles.retryButton}
            onClick={onRetry}
            type="button"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
