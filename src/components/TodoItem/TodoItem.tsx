import styles from './TodoItem.module.css';
import type { Todo } from '../../types/todo';

interface TodoItemProps {
  todo: Todo;
}

export function TodoItem({ todo }: TodoItemProps) {
  return (
    <div className={`${styles.item} ${todo.completed ? styles.completed : ''}`}>
      <input
        type="checkbox"
        checked={todo.completed}
        readOnly
        className={styles.checkbox}
        aria-label={`${todo.title} - ${
          todo.completed ? 'completed' : 'not completed'
        }`}
      />
      <span className={styles.title}>{todo.title}</span>
    </div>
  );
}
