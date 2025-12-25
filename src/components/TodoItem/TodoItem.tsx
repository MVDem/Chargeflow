import styles from './TodoItem.module.css';
import type { Todo } from '../../types/todo';

interface TodoItemProps {
  todo: Todo;
  onToggle?: (todo: Todo) => Promise<void>;
}

export function TodoItem({ todo, onToggle }: TodoItemProps) {
  const handleChange = () => {
    if (onToggle) {
      onToggle(todo);
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
