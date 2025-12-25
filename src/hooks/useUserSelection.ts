import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import { UserId } from '../types/branded';

interface UseUserSelectionReturn {
  selectedUserId: O.Option<UserId>;
  selectUser: (userId: UserId) => void;
  clearSelection: () => void;
  hideCompleted: boolean;
  toggleHideCompleted: () => void;
  setHideCompleted: (value: boolean) => void;
}

export const useUserSelection = (): UseUserSelectionReturn => {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedUserId = useMemo(
    () =>
      pipe(
        O.fromNullable(searchParams.get('userId')),
        O.chain(UserId.fromString)
      ),
    [searchParams]
  );

  const hideCompleted = useMemo(() => {
    return searchParams.get('hideCompleted') === 'true';
  }, [searchParams]);

  const selectUser = useCallback(
    (userId: UserId) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('userId', String(UserId.unwrap(userId)));
        // CRITICAL: Reset hideCompleted filter when user changes
        newParams.delete('hideCompleted');
        return newParams;
      });
    },
    [setSearchParams]
  );

  const clearSelection = useCallback(() => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.delete('userId');
      newParams.delete('hideCompleted');
      return newParams;
    });
  }, [setSearchParams]);

  const toggleHideCompleted = useCallback(() => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      const current = newParams.get('hideCompleted') === 'true';
      if (current) {
        newParams.delete('hideCompleted');
      } else {
        newParams.set('hideCompleted', 'true');
      }
      return newParams;
    });
  }, [setSearchParams]);

  const setHideCompleted = useCallback(
    (value: boolean) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        if (value) {
          newParams.set('hideCompleted', 'true');
        } else {
          newParams.delete('hideCompleted');
        }
        return newParams;
      });
    },
    [setSearchParams]
  );

  return {
    selectedUserId,
    selectUser,
    clearSelection,
    hideCompleted,
    toggleHideCompleted,
    setHideCompleted,
  };
};
