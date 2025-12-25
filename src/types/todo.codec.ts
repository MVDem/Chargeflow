import * as t from 'io-ts';

/**
 * io-ts codec for Todo
 * Validates the entire Todo structure at runtime
 */
export const TodoCodec = t.type({
  userId: t.number,
  id: t.number,
  title: t.string,
  completed: t.boolean,
});

/**
 * io-ts codec for array of Todos
 */
export const TodosCodec = t.array(TodoCodec);

/**
 * TypeScript type derived from io-ts codec
 * This ensures perfect sync between runtime validation and compile-time types
 */
export type Todo = t.TypeOf<typeof TodoCodec>;
