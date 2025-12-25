import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import * as O from 'fp-ts/Option';
import { pipe } from 'fp-ts/function';
import type { Todo } from '../types/todo.codec';
import type { DomainError } from '../types/errors';
import { fetchTodosByUserId, updateTodo } from '../api/todos';
import { unwrapTaskEither } from '../utils/reactQuery';
import { TodoLens } from '../utils/lenses';
import { UserId } from '../types/branded';
import { logger } from '../utils/logger';
import { extractErrorMessage } from '../utils/errorHelpers';
import { defaultQueryOptions } from '../config/reactQuery';

interface UseTodosOptions {
  userId: O.Option<UserId>;
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
  error: DomainError | null;
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

  const query = useQuery<Todo[], DomainError>({
    queryKey: [
      'todos',
      pipe(
        userId,
        O.getOrElseW(() => null)
      ),
    ],
    queryFn: () =>
      pipe(
        userId,
        O.match(
          () => Promise.reject(new Error('User ID is required')),
          (id) => unwrapTaskEither(fetchTodosByUserId(id))
        )
      ),
    enabled: enabled && O.isSome(userId),
    ...defaultQueryOptions,
  });

  const mutation = useMutation<
    Todo,
    DomainError,
    Todo,
    { previousTodos?: Todo[] }
  >({
    mutationFn: (todo: Todo) => {
      logger.mutation('Started', { todoId: todo.id });
      return unwrapTaskEither(updateTodo(todo));
    },
    onMutate: async (updatedTodo: Todo) => {
      logger.mutation('Optimistic update', { todoId: updatedTodo.id });
      const userIdValue = pipe(
        userId,
        O.getOrElseW(() => null)
      );

      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos', userIdValue] });

      // Snapshot previous value
      const previousTodos = queryClient.getQueryData<Todo[]>([
        'todos',
        userIdValue,
      ]);

      // Optimistically update
      if (previousTodos) {
        queryClient.setQueryData<Todo[]>(
          ['todos', userIdValue],
          (old) =>
            old?.map((todo) =>
              todo.id === updatedTodo.id ? updatedTodo : todo
            ) ?? []
        );
      }

      return { previousTodos };
    },
    onError: (error, _updatedTodo, context) => {
      logger.error('Mutation failed', error, { todoId: _updatedTodo.id });
      const userIdValue = pipe(
        userId,
        O.getOrElseW(() => null)
      );

      // Rollback on error
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos', userIdValue], context.previousTodos);
      }

      const errorMessage = extractErrorMessage(error, 'Failed to update TODO');

      setToast({
        message: errorMessage,
        type: 'error',
      });
    },
    onSuccess: () => {
      logger.mutation('Success');
      setToast({
        message:
          'Note: JSONPlaceholder is a fake API. Changes are not persisted and will be reverted.',
        type: 'info',
      });
    },
    onSettled: () => {
      logger.mutation('Settled - Refetching data');
      const userIdValue = pipe(
        userId,
        O.getOrElseW(() => null)
      );
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['todos', userIdValue] });
    },
  });

  const toggleTodo = async (todo: Todo): Promise<void> => {
    logger.mutation('Toggle todo', {
      todoId: todo.id,
      completed: todo.completed,
    });
    // Use monocle-ts lens for immutable update
    const updatedTodo = TodoLens.completed.modify((c) => !c)(todo);
    await mutation.mutateAsync(updatedTodo);
  };

  const clearToast = () => {
    setToast(null);
  };

  return {
    todos: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error as DomainError | null,
    refetch: query.refetch,
    toggleTodo,
    toast,
    clearToast,
  };
};
