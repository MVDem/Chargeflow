import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

interface UseUserSelectionReturn {
  selectedUserId: number | null;
  selectUser: (userId: number) => void;
  clearSelection: () => void;
  hideCompleted: boolean;
  toggleHideCompleted: () => void;
  setHideCompleted: (value: boolean) => void;
}

export const useUserSelection = (): UseUserSelectionReturn => {
  const [searchParams, setSearchParams] = useSearchParams();

  const selectedUserId = useMemo(() => {
    const userIdParam = searchParams.get('userId');
    return userIdParam ? parseInt(userIdParam, 10) : null;
  }, [searchParams]);

  const hideCompleted = useMemo(() => {
    return searchParams.get('hideCompleted') === 'true';
  }, [searchParams]);

  const selectUser = useCallback(
    (userId: number) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        newParams.set('userId', userId.toString());
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
