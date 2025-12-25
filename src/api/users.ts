import * as TE from 'fp-ts/TaskEither';
import * as A from 'fp-ts/Array';
import { pipe } from 'fp-ts/function';
import { fetchJson } from './core/http';
import { UserCodec, UsersCodec, type User } from '../types/user.codec';
import { UserOrd } from '../utils/ord';
import { UserId } from '../types/branded';
import { DomainError } from '../types/errors';

const API_BASE_URL = 'https://jsonplaceholder.typicode.com';

/**
 * Fetches all users from the API
 * Returns users sorted by name (case-insensitive)
 * Includes runtime validation with io-ts
 */
export const fetchUsers = (): TE.TaskEither<DomainError, User[]> =>
  pipe(
    fetchJson(`${API_BASE_URL}/users`, UsersCodec),
    TE.map(A.sort(UserOrd.byName))
  );

/**
 * Fetches a single user by ID
 * Returns NotFoundError if user ID doesn't match
 */
export const fetchUserById = (
  userId: UserId
): TE.TaskEither<DomainError, User> =>
  pipe(
    fetchJson(`${API_BASE_URL}/users/${UserId.unwrap(userId)}`, UserCodec),
    TE.chain((user) =>
      user.id === UserId.unwrap(userId)
        ? TE.right(user)
        : TE.left(
            DomainError.notFoundError(
              `User with id ${UserId.unwrap(userId)} not found`,
              String(UserId.unwrap(userId))
            )
          )
    )
  );
