import styles from './NotFound.module.css';
import { Link } from 'react-router-dom';
import { routes } from '../../config/routes';

export function NotFound() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>404</h1>
      <p className={styles.message}>Page not found</p>
      <Link to={routes.home.path} className={styles.link}>
        Go back home
      </Link>
    </div>
  );
}
