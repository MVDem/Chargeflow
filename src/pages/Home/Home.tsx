import styles from './Home.module.css';
import { UserList } from '../../components/UserList/UserList';
import { TodoList } from '../../components/TodoList/TodoList';
import { Skeleton } from '../../components/Skeleton/Skeleton';
import { useUserSelection } from '../../hooks/useUserSelection';
import { useTodos } from '../../hooks/useTodos';

export function Home() {
  const { selectedUserId, selectUser, hideCompleted, toggleHideCompleted } =
    useUserSelection();

  const { todos, isLoading, isError, error } = useTodos({
    userId: selectedUserId,
    enabled: selectedUserId !== null,
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Users & TODOs</h1>
        <p className={styles.subtitle}>Select a user to view their TODO list</p>
      </header>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Users</h2>
          <UserList selectedUserId={selectedUserId} onSelectUser={selectUser} />
        </section>

        {selectedUserId && (
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>
              TODOs for User #{selectedUserId}
            </h2>

            {isLoading && (
              <div className={styles.todosLoading}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} height="3rem" variant="rectangular" />
                ))}
              </div>
            )}

            {isError && (
              <div className={styles.error}>
                <h3>Error loading TODOs</h3>
                <p>{error?.message || 'Unknown error'}</p>
              </div>
            )}

            {!isLoading && !isError && (
              <TodoList
                todos={todos}
                hideCompleted={hideCompleted}
                onToggleHideCompleted={toggleHideCompleted}
              />
            )}
          </section>
        )}
      </div>
    </div>
  );
}
