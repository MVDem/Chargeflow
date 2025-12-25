import { useMobileNav } from './useMobileNav';
import styles from './MobileNav.module.css';
import { cloneElement, isValidElement } from 'react';
import type { ReactElement } from 'react';
import type { UserId } from '../../types/branded';

interface MobileNavProps {
  children: React.ReactNode;
  onUserSelect?: () => void;
}

interface UserListChildProps {
  onSelectUser?: (userId: UserId) => void;
}

export function MobileNav({ children, onUserSelect }: MobileNavProps) {
  const { isOpen, closeMenu, toggleMenu } = useMobileNav();

  const handleUserSelect = () => {
    if (onUserSelect) {
      onUserSelect();
    }
    closeMenu();
  };

  // Clone children and inject close handler
  const childrenWithProps = isValidElement(children)
    ? cloneElement(children as ReactElement<UserListChildProps>, {
        onSelectUser: (userId: UserId) => {
          const element = children as ReactElement<UserListChildProps>;
          const originalOnSelect = element.props.onSelectUser;
          if (originalOnSelect) {
            originalOnSelect(userId);
          }
          handleUserSelect();
        },
      })
    : children;

  return (
    <>
      <button
        className={`${styles.burgerButton} ${isOpen ? styles.open : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <div className={styles.burgerIcon}>
          <span />
          <span />
          <span />
        </div>
      </button>

      {isOpen && (
        <>
          <div className={styles.backdrop} onClick={closeMenu} />
          <div className={styles.panel}>
            <h2 className={styles.title}>Users</h2>
            {childrenWithProps}
          </div>
        </>
      )}
    </>
  );
}
