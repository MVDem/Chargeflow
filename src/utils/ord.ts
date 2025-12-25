import * as Ord from 'fp-ts/Ord';
import * as S from 'fp-ts/string';
import * as N from 'fp-ts/number';
import * as B from 'fp-ts/boolean';
import { pipe } from 'fp-ts/function';
import type { User } from '../types/user.codec';
import type { Todo } from '../types/todo.codec';

/**
 * Ord instances for User sorting
 */
export const UserOrd = {
  /**
   * Sort users by name (case-insensitive)
   */
  byName: pipe(
    S.Ord,
    Ord.contramap((user: User) => user.name.toLowerCase())
  ),

  /**
   * Sort users by username (case-insensitive)
   */
  byUsername: pipe(
    S.Ord,
    Ord.contramap((user: User) => user.username.toLowerCase())
  ),

  /**
   * Sort users by email (case-insensitive)
   */
  byEmail: pipe(
    S.Ord,
    Ord.contramap((user: User) => user.email.toLowerCase())
  ),

  /**
   * Sort users by ID
   */
  byId: pipe(
    N.Ord,
    Ord.contramap((user: User) => user.id)
  ),

  /**
   * Sort users by city
   */
  byCity: pipe(
    S.Ord,
    Ord.contramap((user: User) => user.address.city.toLowerCase())
  ),

  /**
   * Sort users by company name
   */
  byCompanyName: pipe(
    S.Ord,
    Ord.contramap((user: User) => user.company.name.toLowerCase())
  ),
};

/**
 * Ord instances for Todo sorting
 */
export const TodoOrd = {
  /**
   * Sort todos by title (case-insensitive)
   */
  byTitle: pipe(
    S.Ord,
    Ord.contramap((todo: Todo) => todo.title.toLowerCase())
  ),

  /**
   * Sort todos by ID
   */
  byId: pipe(
    N.Ord,
    Ord.contramap((todo: Todo) => todo.id)
  ),

  /**
   * Sort todos by userId
   */
  byUserId: pipe(
    N.Ord,
    Ord.contramap((todo: Todo) => todo.userId)
  ),

  /**
   * Sort todos by completion status (completed last)
   */
  byCompletion: pipe(
    B.Ord,
    Ord.contramap((todo: Todo) => todo.completed)
  ),

  /**
   * Sort todos by completion status (completed first)
   */
  byCompletionReverse: pipe(
    Ord.reverse(B.Ord),
    Ord.contramap((todo: Todo) => todo.completed)
  ),
};
