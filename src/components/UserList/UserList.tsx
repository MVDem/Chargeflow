import { useQuery } from '@tanstack/react-query';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import styles from './UserList.module.css';
import { UserCard } from '../UserCard/UserCard';
import { ErrorMessage } from '../ErrorMessage/ErrorMessage';
import { EmptyState } from '../EmptyState/EmptyState';
import { UserListSkeleton } from '../UserListSkeleton/UserListSkeleton';
import type { User } from '../../types/user.codec';
import type { DomainError } from '../../types/errors';
import { fetchUsers } from '../../api/users';
import { unwrapTaskEither } from '../../utils/reactQuery';
import { UserId } from '../../types/branded';

interface UserListProps {
  selectedUserId: O.Option<UserId>;
  onSelectUser: (userId: UserId) => void;
}

export function UserList({ selectedUserId, onSelectUser }: UserListProps) {
  const {
    data: users,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<User[], DomainError>({
    queryKey: ['users'],
    queryFn: () => unwrapTaskEither(fetchUsers()),
  });

  if (isLoading) {
    return <UserListSkeleton />;
  }

  if (isError) {
    return (
      <ErrorMessage
        title="Error loading users"
        error={error}
        fallbackMessage="Failed to load users. Please try again."
        onRetry={refetch}
      />
    );
  }

  if (!users || users.length === 0) {
    return <EmptyState message="No users found." icon="👥" />;
  }

  return (
    <div className={styles.grid}>
      {users.map((user: User) => (
        <UserCard
          key={user.id}
          user={user}
          isSelected={pipe(
            selectedUserId,
            O.exists((id) => UserId.unwrap(id) === user.id)
          )}
          onShowTodos={() => onSelectUser(UserId.wrap(user.id))}
        />
      ))}
    </div>
  );
}
