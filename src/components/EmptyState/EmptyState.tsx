import styles from './EmptyState.module.css';

interface EmptyStateProps {
  /**
   * Message to display
   */
  message: string;

  /**
   * Optional icon or emoji
   */
  icon?: string;

  /**
   * Additional CSS class
   */
  className?: string;
}

/**
 * Reusable empty state component
 * Displays consistent empty state UI across the application
 */
export function EmptyState({
  message,
  icon = '📭',
  className,
}: EmptyStateProps) {
  return (
    <div className={`${styles.empty} ${className || ''}`}>
      <span className={styles.icon} role="img" aria-label="Empty">
        {icon}
      </span>
      <p className={styles.message}>{message}</p>
    </div>
  );
}
