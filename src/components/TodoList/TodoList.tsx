import { useMemo } from 'react';
import styles from './TodoList.module.css';
import { TodoItem } from '../TodoItem/TodoItem';
import type { Todo } from '../../types/todo';

interface TodoListProps {
  todos: Todo[];
  hideCompleted: boolean;
  onToggleHideCompleted: () => void;
}

export function TodoList({
  todos,
  hideCompleted,
  onToggleHideCompleted,
}: TodoListProps) {
  const filteredTodos = useMemo(() => {
    if (hideCompleted) {
      return todos.filter((todo) => !todo.completed);
    }
    return todos;
  }, [todos, hideCompleted]);

  const stats = useMemo(() => {
    const completed = todos.filter((t) => t.completed).length;
    const total = todos.length;
    return { completed, total, remaining: total - completed };
  }, [todos]);

  if (todos.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No TODOs found for this user.</p>
      </div>
    );
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
          <TodoItem key={todo.id} todo={todo} />
        ))}
      </div>

      {filteredTodos.length === 0 && hideCompleted && (
        <p className={styles.emptyFiltered}>All TODOs are completed! 🎉</p>
      )}
    </div>
  );
}
