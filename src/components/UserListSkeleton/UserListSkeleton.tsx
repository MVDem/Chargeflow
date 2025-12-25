import { Skeleton } from '../Skeleton/Skeleton';
import styles from './UserListSkeleton.module.css';

interface UserListSkeletonProps {
  /**
   * Number of skeleton cards to display
   */
  count?: number;
}

/**
 * Loading skeleton for UserList
 * Displays placeholder cards while users are being fetched
 */
export function UserListSkeleton({ count = 6 }: UserListSkeletonProps) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.skeletonCard}>
          <Skeleton height="1.5rem" width="70%" />
          <Skeleton height="1rem" width="50%" style={{ marginTop: '0.5rem' }} />
          <Skeleton
            height="2.5rem"
            variant="rectangular"
            style={{ marginTop: '1rem' }}
          />
        </div>
      ))}
    </div>
  );
}
