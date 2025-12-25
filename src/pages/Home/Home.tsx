import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import styles from './Home.module.css';
import { UserList } from '../../components/UserList/UserList';
import { TodoList } from '../../components/TodoList/TodoList';
import { ErrorMessage } from '../../components/ErrorMessage/ErrorMessage';
import { EmptyState } from '../../components/EmptyState/EmptyState';
import { TodoListSkeleton } from '../../components/TodoListSkeleton/TodoListSkeleton';
import { Toast } from '../../components/Toast/Toast';
import { MobileNav } from '../../components/MobileNav/MobileNav';
import { useUserSelection } from '../../hooks/useUserSelection';
import { useTodos } from '../../hooks/useTodos';
import { UserId } from '../../types/branded';

export function Home() {
  const { selectedUserId, selectUser, hideCompleted, toggleHideCompleted } =
    useUserSelection();

  const {
    todos,
    isLoading,
    isError,
    error,
    refetch,
    toggleTodo,
    toast,
    clearToast,
  } = useTodos({
    userId: selectedUserId,
    enabled: O.isSome(selectedUserId),
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>TODO Manager</h1>
          <p className={styles.subtitle}>Manage tasks efficiently</p>
        </div>
      </header>

      <MobileNav>
        <UserList selectedUserId={selectedUserId} onSelectUser={selectUser} />
      </MobileNav>

      <div className={styles.content}>
        <section className={`${styles.section} ${styles.users}`}>
          <h2 className={styles.sectionTitle}>Users</h2>
          <UserList selectedUserId={selectedUserId} onSelectUser={selectUser} />
        </section>

        <section className={`${styles.section} ${styles.todos}`}>
          {pipe(
            selectedUserId,
            O.match(
              // None case: no user selected
              () => (
                <EmptyState
                  message="Please select a user from the sidebar to view their TODOs"
                  icon="👈"
                />
              ),
              // Some case: user is selected
              (userId) => (
                <>
                  <h2 className={styles.sectionTitle}>
                    TODOs for User #{UserId.unwrap(userId)}
                  </h2>

                  {isLoading && <TodoListSkeleton />}

                  {isError && (
                    <ErrorMessage
                      title="Error loading TODOs"
                      error={error}
                      fallbackMessage="Failed to load TODOs. Please try again."
                      onRetry={refetch}
                    />
                  )}

                  {!isLoading && !isError && (
                    <TodoList
                      todos={todos}
                      hideCompleted={hideCompleted}
                      onToggleHideCompleted={toggleHideCompleted}
                      onToggleTodo={toggleTodo}
                    />
                  )}
                </>
              )
            )
          )}
        </section>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={clearToast} />
      )}
    </div>
  );
}
