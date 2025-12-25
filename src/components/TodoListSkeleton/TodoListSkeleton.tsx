import { Skeleton } from '../Skeleton/Skeleton';
import styles from './TodoListSkeleton.module.css';

interface TodoListSkeletonProps {
  /**
   * Number of skeleton items to display
   */
  count?: number;
}

/**
 * Loading skeleton for TodoList
 * Displays placeholder items while todos are being fetched
 */
export function TodoListSkeleton({ count = 5 }: TodoListSkeletonProps) {
  return (
    <div className={styles.container}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton
          key={i}
          height="3rem"
          variant="rectangular"
          className={styles.item}
        />
      ))}
    </div>
  );
}
