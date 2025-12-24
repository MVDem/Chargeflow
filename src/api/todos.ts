import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import type { Todo } from '../types/todo';
import type { ApiError } from './users';

const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

const createApiError = (message: string, status?: number): ApiError => ({
  message,
  status,
});

const fetchJson = <T>(url: string): TE.TaskEither<ApiError, T> =>
  TE.tryCatch(
    async () => {
      const response = await fetch(url);

      if (!response.ok) {
        throw createApiError(
          `HTTP error! status: ${response.status}`,
          response.status
        );
      }

      return response.json() as Promise<T>;
    },
    (error) => {
      if (error instanceof Error) {
        return createApiError(error.message);
      }
      return createApiError('Unknown error occurred');
    }
  );

export const fetchTodosByUserId = (
  userId: number
): TE.TaskEither<ApiError, Todo[]> =>
  pipe(
    fetchJson<Todo[]>(`${API_BASE_URL}/users/${userId}/todos`),
    TE.map((todos) => todos.filter((todo) => todo.userId === userId))
  );

export const fetchAllTodos = (): TE.TaskEither<ApiError, Todo[]> =>
  fetchJson<Todo[]>(`${API_BASE_URL}/todos`);
