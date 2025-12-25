import * as O from 'fp-ts/Option';

/**
 * Branded type for User ID
 * Prevents mixing up user IDs with other numeric values
 */
declare const UserIdBrand: unique symbol;
export type UserId = number & { readonly [UserIdBrand]: typeof UserIdBrand };

/**
 * Branded type for Todo ID
 * Prevents mixing up todo IDs with other numeric values
 */
declare const TodoIdBrand: unique symbol;
export type TodoId = number & { readonly [TodoIdBrand]: typeof TodoIdBrand };

/**
 * UserId constructors and utilities
 */
export const UserId = {
  /**
   * Wraps a number as UserId without validation
   * Use only when you're certain the value is valid
   */
  wrap: (n: number): UserId => n as UserId,

  /**
   * Unwraps UserId back to plain number
   */
  unwrap: (id: UserId): number => id as number,

  /**
   * Safe constructor with validation
   * Returns Some(UserId) if valid, None otherwise
   */
  fromNumber: (n: number): O.Option<UserId> =>
    n > 0 && Number.isInteger(n) ? O.some(n as UserId) : O.none,

  /**
   * Safe constructor from string
   * Parses and validates the string as UserId
   */
  fromString: (s: string): O.Option<UserId> => {
    const parsed = parseInt(s, 10);
    return !isNaN(parsed) && parsed > 0 ? O.some(parsed as UserId) : O.none;
  },
};

/**
 * TodoId constructors and utilities
 */
export const TodoId = {
  /**
   * Wraps a number as TodoId without validation
   * Use only when you're certain the value is valid
   */
  wrap: (n: number): TodoId => n as TodoId,

  /**
   * Unwraps TodoId back to plain number
   */
  unwrap: (id: TodoId): number => id as number,

  /**
   * Safe constructor with validation
   * Returns Some(TodoId) if valid, None otherwise
   */
  fromNumber: (n: number): O.Option<TodoId> =>
    n > 0 && Number.isInteger(n) ? O.some(n as TodoId) : O.none,

  /**
   * Safe constructor from string
   * Parses and validates the string as TodoId
   */
  fromString: (s: string): O.Option<TodoId> => {
    const parsed = parseInt(s, 10);
    return !isNaN(parsed) && parsed > 0 ? O.some(parsed as TodoId) : O.none;
  },
};
