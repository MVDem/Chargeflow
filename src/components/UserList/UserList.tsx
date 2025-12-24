import { useQuery } from '@tanstack/react-query';
import * as E from 'fp-ts/Either';
import styles from './UserList.module.css';
import { UserCard } from '../UserCard/UserCard';
import { Skeleton } from '../Skeleton/Skeleton';
import type { User } from '../../types/user';
import { fetchUsers } from '../../api/users';

interface UserListProps {
  selectedUserId: number | null;
  onSelectUser: (userId: number) => void;
}

export function UserList({ selectedUserId, onSelectUser }: UserListProps) {
  const {
    data: users,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const result = await fetchUsers()();

      if (E.isLeft(result)) {
        throw result.left;
      }

      return result.right;
    },
  });

  if (isLoading) {
    return (
      <div className={styles.grid}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={styles.skeletonCard}>
            <Skeleton height="1.5rem" width="70%" />
            <Skeleton height="1rem" width="50%" />
            <Skeleton height="2.5rem" variant="rectangular" />
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className={styles.error}>
        <h3>Error loading users</h3>
        <p>{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No users found.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {users.map((user: User) => (
        <UserCard
          key={user.id}
          user={user}
          isSelected={user.id === selectedUserId}
          onShowTodos={() => onSelectUser(user.id)}
        />
      ))}
    </div>
  );
}
