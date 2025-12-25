import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import * as E from 'fp-ts/Either';
import type { Todo } from '../types/todo';
import type { ApiError } from '../api/users';
import { fetchTodosByUserId, updateTodo } from '../api/todos';

interface UseTodosOptions {
  userId: number | null;
  enabled?: boolean;
}

interface ToastState {
  message: string;
  type: 'success' | 'error' | 'info';
}

interface UseTodosReturn {
  todos: Todo[];
  isLoading: boolean;
  isError: boolean;
  error: ApiError | null;
  refetch: () => void;
  toggleTodo: (todo: Todo) => Promise<void>;
  toast: ToastState | null;
  clearToast: () => void;
}

export const useTodos = ({
  userId,
  enabled = true,
}: UseTodosOptions): UseTodosReturn => {
  const queryClient = useQueryClient();
  const [toast, setToast] = useState<ToastState | null>(null);

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

  const mutation = useMutation({
    mutationFn: async (todo: Todo) => {
      console.log('Mutation started for todo:', todo);
      const result = await updateTodo(todo)();

      if (E.isLeft(result)) {
        throw result.left;
      }

      return result.right;
    },
    onMutate: async (updatedTodo: Todo) => {
      console.log('onMutate - Optimistic update for:', updatedTodo);
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos', userId] });

      // Snapshot previous value
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos', userId]);

      // Optimistically update
      if (previousTodos) {
        queryClient.setQueryData<Todo[]>(['todos', userId], (old) =>
          old?.map((todo) =>
            todo.id === updatedTodo.id ? updatedTodo : todo
          ) ?? []
        );
      }

      return { previousTodos };
    },
    onError: (error, _updatedTodo, context) => {
      console.error('onError - Mutation failed:', error);
      // Rollback on error
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos', userId], context.previousTodos);
      }

      setToast({
        message:
          error instanceof Error ? error.message : 'Failed to update TODO',
        type: 'error',
      });
    },
    onSuccess: () => {
      console.log('onSuccess - Mutation succeeded');
      setToast({
        message:
          'Note: JSONPlaceholder is a fake API. Changes are not persisted and will be reverted.',
        type: 'info',
      });
    },
    onSettled: () => {
      console.log('onSettled - Refetching data');
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['todos', userId] });
    },
  });

  const toggleTodo = async (todo: Todo): Promise<void> => {
    console.log('toggleTodo called for:', todo);
    const updatedTodo = { ...todo, completed: !todo.completed };
    await mutation.mutateAsync(updatedTodo);
  };

  const clearToast = () => {
    setToast(null);
  };

  return {
    todos: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as ApiError | null,
    refetch: query.refetch,
    toggleTodo,
    toast,
    clearToast,
  };
};
