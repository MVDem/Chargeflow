import styles from './UserCard.module.css';
import type { User } from '../../types/user';

interface UserCardProps {
  user: User;
  isSelected: boolean;
  onShowTodos: () => void;
}

export function UserCard({ user, isSelected, onShowTodos }: UserCardProps) {
  return (
    <div className={`${styles.card} ${isSelected ? styles.selected : ''}`}>
      <div className={styles.content}>
        <h3 className={styles.name}>{user.name}</h3>
        <p className={styles.username}>@{user.username}</p>
      </div>
      <button
        className={styles.button}
        onClick={onShowTodos}
        aria-label={`Show todos for ${user.name}`}
      >
        Show TODOs
      </button>
    </div>
  );
}
