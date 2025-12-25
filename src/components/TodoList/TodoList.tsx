import { useMemo } from 'react';
import * as A from 'fp-ts/Array';
import * as NEA from 'fp-ts/NonEmptyArray';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import styles from './TodoList.module.css';
import { TodoItem } from '../TodoItem/TodoItem';
import { EmptyState } from '../EmptyState/EmptyState';
import type { Todo } from '../../types/todo.codec';

interface TodoListProps {
  todos: Todo[];
  hideCompleted: boolean;
  onToggleHideCompleted: () => void;
  onToggleTodo: (todo: Todo) => Promise<void>;
}

export function TodoList({
  todos,
  hideCompleted,
  onToggleHideCompleted,
  onToggleTodo,
}: TodoListProps) {
  const filteredTodos = useMemo(
    () =>
      pipe(
        todos,
        hideCompleted ? A.filter((todo) => !todo.completed) : (x) => x
      ),
    [todos, hideCompleted]
  );

  const stats = useMemo(
    () =>
      pipe(
        todos,
        NEA.fromArray,
        O.fold(
          // Empty array
          () => ({ completed: 0, total: 0, remaining: 0 }),
          // Non-empty array
          (nonEmptyTodos) => {
            const completed = pipe(
              nonEmptyTodos,
              A.filter((t: Todo) => t.completed)
            ).length;
            const total = nonEmptyTodos.length;
            return { completed, total, remaining: total - completed };
          }
        )
      ),
    [todos]
  );

  if (todos.length === 0) {
    return <EmptyState message="No TODOs found for this user." icon="📝" />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.stats}>
          <span className={styles.stat}>
            Total: <strong>{stats.total}</strong>
          </span>
          <span className={styles.stat}>
            Completed: <strong>{stats.completed}</strong>
          </span>
          <span className={styles.stat}>
            Remaining: <strong>{stats.remaining}</strong>
          </span>
        </div>
        <label className={styles.filter}>
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={onToggleHideCompleted}
            className={styles.filterCheckbox}
          />
          <span>Hide completed</span>
        </label>
      </div>

      <div className={styles.list}>
        {filteredTodos.map((todo) => (
          <TodoItem key={todo.id} todo={todo} onToggle={onToggleTodo} />
        ))}
      </div>

      {filteredTodos.length === 0 && hideCompleted && (
        <p className={styles.emptyFiltered}>All TODOs are completed! 🎉</p>
      )}
    </div>
  );
}
