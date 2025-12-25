import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';

/**
 * Unwraps TaskEither for use with React Query
 * Converts fp-ts TaskEither to Promise (React Query's expected format)
 *
 * Left values (errors) are rejected, Right values are resolved
 *
 * @example
 * ```ts
 * const query = useQuery({
 *   queryKey: ['users'],
 *   queryFn: () => unwrapTaskEither(fetchUsers()),
 * });
 * ```
 */
export const unwrapTaskEither = <E, A>(
  taskEither: TE.TaskEither<E, A>
): Promise<A> =>
  taskEither().then(
    E.fold(
      (error) => Promise.reject(error),
      (value) => Promise.resolve(value)
    )
  );
