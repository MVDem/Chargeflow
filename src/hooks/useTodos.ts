import { useQuery } from '@tanstack/react-query';
import * as E from 'fp-ts/Either';
import type { Todo } from '../types/todo';
import type { ApiError } from '../api/users';
import { fetchTodosByUserId } from '../api/todos';

interface UseTodosOptions {
  userId: number | null;
  enabled?: boolean;
}

interface UseTodosReturn {
  todos: Todo[];
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  refetch: () => void;
}

export const useTodos = ({
  userId,
  enabled = true,
}: UseTodosOptions): UseTodosReturn => {
  const query = useQuery({
    queryKey: ['todos', userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const result = await fetchTodosByUserId(userId)();

      if (E.isLeft(result)) {
        throw result.left;
      }

      return result.right;
    },
    enabled: enabled && userId !== null,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    todos: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as ApiError | null,
    refetch: query.refetch,
  };
};
