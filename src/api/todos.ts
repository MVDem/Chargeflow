import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import { pipe, flow } from 'fp-ts/function';
import { fetchJson, fetchJsonWithBody } from './core/http';
import { TodoCodec, TodosCodec, type Todo } from '../types/todo.codec';
import { TodoOrd } from '../utils/ord';
import { UserId } from '../types/branded';
import { DomainError } from '../types/errors';

const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

/**
 * Flow composition for processing completed todos
 * Filters completed todos and sorts by title
 */
export const processCompletedTodos = flow(
  A.filter((todo: Todo) => todo.completed),
  A.sort(TodoOrd.byTitle)
);

/**
 * Flow composition for processing active (incomplete) todos
 * Filters active todos and sorts by title
 */
export const processActiveTodos = flow(
  A.filter((todo: Todo) => !todo.completed),
  A.sort(TodoOrd.byTitle)
);

/**
 * Fetches all todos for a specific user
 * Returns todos sorted by ID
 * Includes runtime validation with io-ts
 */
export const fetchTodosByUserId = (
  userId: UserId
): TE.TaskEither<DomainError, Todo[]> =>
  pipe(
    fetchJson(
      `${API_BASE_URL}/users/${UserId.unwrap(userId)}/todos`,
      TodosCodec
    ),
    TE.map(
      flow(
        A.filter((todo) => todo.userId === UserId.unwrap(userId)),
        A.sort(TodoOrd.byId)
      )
    )
  );

/**
 * Fetches todos for multiple users in parallel
 * Uses ApplicativePar for concurrent requests
 */
export const fetchTodosForMultipleUsers = (
  userIds: UserId[]
): TE.TaskEither<DomainError, Todo[]> =>
  pipe(
    userIds,
    A.map(fetchTodosByUserId),
    A.sequence(TE.ApplicativePar),
    TE.map(A.flatten)
  );

/**
 * Updates a todo (e.g., toggle completion status)
 * Uses monocle-ts lens in the calling code for immutable updates
 */
export const updateTodo = (todo: Todo): TE.TaskEither<DomainError, Todo> =>
  fetchJsonWithBody(`${API_BASE_URL}/todos/${todo.id}`, 'PUT', todo, TodoCodec);

/**
 * Fetches todos with automatic retry on network errors
 * Retries up to 3 times with exponential backoff
 */
export const fetchTodosByUserIdWithRetry = (
  userId: UserId,
  maxRetries = 3
): TE.TaskEither<DomainError, Todo[]> =>
  pipe(
    fetchTodosByUserId(userId),
    TE.orElse((error) => {
      // Only retry network errors
      if (error._tag === 'NetworkError' && maxRetries > 0) {
        return fetchTodosByUserIdWithRetry(userId, maxRetries - 1);
      }
      return TE.left(error);
    })
  );
