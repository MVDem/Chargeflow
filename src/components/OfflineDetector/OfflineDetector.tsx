import { useState, useEffect } from 'react';
import styles from './OfflineDetector.module.css';

/**
 * Global offline detection component
 * Displays a banner when the user loses network connectivity
 */
export function OfflineDetector() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setWasOffline(true);

      // Hide "back online" message after 3 seconds
      setTimeout(() => {
        setWasOffline(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't show anything if online and was never offline
  if (isOnline && !wasOffline) {
    return null;
  }

  return (
    <div
      className={`${styles.banner} ${
        isOnline ? styles.online : styles.offline
      }`}
    >
      {isOnline ? (
        <>
          <span className={styles.icon}>✓</span>
          <span>Back online</span>
        </>
      ) : (
        <>
          <span className={styles.icon}>⚠️</span>
          <span>No internet connection. Some features may not work.</span>
        </>
      )}
    </div>
  );
}
