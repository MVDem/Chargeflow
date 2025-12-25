import styles from './TodoItem.module.css';
import type { Todo } from '../../types/todo.codec';

interface TodoItemProps {
  todo: Todo;
  onToggle?: (todo: Todo) => Promise<void>;
}

export function TodoItem({ todo, onToggle }: TodoItemProps) {
  const handleChange = async () => {
    if (onToggle) {
      try {
        await onToggle(todo);
      } catch (error) {
        // Error is already handled in useTodos with toast notification
        // This prevents unhandled promise rejection warnings
        console.error('Failed to toggle todo:', error);
      }
    }
  };

  return (
    <div className={`${styles.item} ${todo.completed ? styles.completed : ''}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={handleChange}
        className={styles.checkbox}
        aria-label={`${todo.title} - ${
          todo.completed ? 'completed' : 'not completed'
        }`}
      />
      <span className={styles.title}>{todo.title}</span>
    </div>
  );
}
