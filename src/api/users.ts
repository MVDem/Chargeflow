import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/function';
import type { User } from '../types/user';

const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

export interface ApiError {
  message: string;
  status?: number;
}

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

export const fetchUsers = (): TE.TaskEither<ApiError, User[]> =>
  pipe(
    fetchJson<User[]>(`${API_BASE_URL}/users`),
    TE.map((users) => users.sort((a, b) => a.name.localeCompare(b.name)))
  );

export const fetchUserById = (userId: number): TE.TaskEither<ApiError, User> =>
  pipe(
    fetchJson<User>(`${API_BASE_URL}/users/${userId}`),
    TE.chain((user) =>
      user.id === userId
        ? TE.right(user)
        : TE.left(createApiError(`User with id ${userId} not found`, 404))
    )
  );
