import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';
import styles from './Error.module.css';
import { routes } from '../../config/routes';

export function ErrorPage() {
  const error = useRouteError();

  let errorMessage: string;

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText || error.data?.message;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    errorMessage = 'Unknown error';
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Oops!</h1>
      <p className={styles.message}>Sorry, an unexpected error has occurred.</p>
      <p className={styles.error}>
        <i>{errorMessage}</i>
      </p>
      <Link to={routes.home.path} className={styles.link}>
        Go back home
      </Link>
    </div>
  );
}
