# fp-ts Patterns & Best Practices

This document describes functional programming patterns used throughout the project with fp-ts.

## Core Concepts

### What is fp-ts?

fp-ts is a TypeScript library for typed functional programming, providing:

- **Type-safe abstractions**: Option, Either, TaskEither
- **Function composition**: pipe, flow
- **Algebraic Data Types**: ADTs with pattern matching
- **Category theory**: Functors, Monads, Applicatives

### Why fp-ts?

**Benefits**:

- ✅ **Explicit error handling** - Errors in type signatures
- ✅ **No null/undefined bugs** - Option type eliminates null
- ✅ **Composable code** - Functions chain elegantly
- ✅ **Type safety** - Compiler catches more bugs
- ✅ **Refactor confidence** - Pattern matching ensures exhaustiveness

**In this project**: 90% of business logic uses fp-ts patterns.

---

## TaskEither

### What is TaskEither?

```typescript
type TaskEither<E, A> = () => Promise<Either<E, A>>;
```

A lazy async computation that can fail with error `E` or succeed with value `A`.

**Think of it as**: `async` function that returns `Result<A, E>` instead of throwing.

### Why TaskEither Over Promise?

| Promise                  | TaskEither              |
| ------------------------ | ----------------------- |
| Throws on error          | Returns `Left(error)`   |
| Eager (runs immediately) | Lazy (runs when called) |
| No error type            | Error type in signature |
| try/catch required       | Pattern matching        |

### Basic Example

```typescript
// ❌ Promise with throwing
async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  if (!response.ok) throw new Error('Failed');
  return response.json();
}

// ✅ TaskEither with typed errors
function fetchUser(id: UserId): TE.TaskEither<DomainError, User> {
  return pipe(
    TE.tryCatch(
      () => fetch(`/api/users/${UserId.unwrap(id)}`),
      (error) => DomainError.NetworkError('Failed to fetch', error)
    ),
    TE.chain((response) =>
      response.ok
        ? TE.right(response.json())
        : TE.left(DomainError.NotFoundError('User not found'))
    )
  );
}
```

### Chaining Operations

```typescript
const result = pipe(
  fetchUser(userId),
  TE.map((user) => user.name.toUpperCase()), // Transform success
  TE.mapLeft((error) => console.error(error)), // Transform error
  TE.chain((name) => TE.right(`Hello, ${name}!`)) // Chain another TaskEither
);

// Execute
const either = await result();
```

### Error Handling with fold

```typescript
const message = await pipe(
  fetchUsers(),
  TE.fold(
    (error) => TE.of(`Error: ${getUserFriendlyMessage(error)}`),
    (users) => TE.of(`Loaded ${users.length} users`)
  )
)();
```

---

## Either

### What is Either?

```typescript
type Either<E, A> = Left<E> | Right<A>;
```

Represents a value that can be one of two types: error (`Left`) or success (`Right`).

**Use cases**:

- Parsing results
- Validation results
- Synchronous error handling

### Basic Usage

```typescript
import * as E from 'fp-ts/Either';

function divide(a: number, b: number): E.Either<string, number> {
  return b === 0 ? E.left('Division by zero') : E.right(a / b);
}

const result = divide(10, 2);

pipe(
  result,
  E.match(
    (error) => console.error(error),
    (value) => console.log(`Result: ${value}`)
  )
);
```

### Pattern Matching

```typescript
const message = pipe(
  parseUser(data),
  E.match(
    (error) => `Validation failed: ${error}`, // Left branch
    (user) => `Welcome, ${user.name}!` // Right branch
  )
);
```

### Combining Eithers

```typescript
import { sequenceS } from 'fp-ts/Apply';

const result = sequenceS(E.Apply)({
  name: validateName(input.name),
  email: validateEmail(input.email),
  age: validateAge(input.age),
});

// result: Either<ValidationError, { name, email, age }>
```

---

## Option

### What is Option?

```typescript
type Option<A> = None | Some<A>;
```

Represents a value that might not exist. **Type-safe alternative to `null`/`undefined`**.

### Basic Usage

```typescript
import * as O from 'fp-ts/Option';

// Creating Options
const some = O.some(42); // O.Some(42)
const none = O.none; // O.None
const fromNullable = O.fromNullable(null); // O.None

// Checking Options
O.isSome(some); // true
O.isNone(none); // true

// Extracting values
O.getOrElse(() => 0)(some); // 42
O.getOrElse(() => 0)(none); // 0
```

### Pattern Matching

```typescript
const message = pipe(
  selectedUserId,
  O.match(
    () => 'No user selected', // None branch
    (userId) => `Selected: ${userId}` // Some branch
  )
);
```

### Chaining Operations

```typescript
const result = pipe(
  O.fromNullable(searchParams.get('userId')),
  O.chain(UserId.fromString), // Parse to UserId
  O.map((userId) => UserId.unwrap(userId)), // Extract number
  O.filter((id) => id > 0), // Validate positive
  O.getOrElse(() => 0) // Default value
);
```

### Real-World Example

```typescript
// ❌ Null checks everywhere
function fetchTodos(userId: number | null): Promise<Todo[]> {
  if (userId === null) {
    return Promise.resolve([]);
  }
  return fetch(`/api/todos/${userId}`).then((r) => r.json());
}

// ✅ Option type safety
function fetchTodos(
  userId: O.Option<UserId>
): TE.TaskEither<DomainError, Todo[]> {
  return pipe(
    userId,
    O.match(
      () => TE.right([]), // No user: empty array
      (id) => httpGet(`/api/todos/${id}`, TodosCodec) // Some user: fetch
    )
  );
}
```

---

## pipe & flow

### pipe: Left-to-Right Composition

Passes a value through a series of transformations.

```typescript
import { pipe } from 'fp-ts/function';

// Without pipe (hard to read, right-to-left)
const result = c(b(a(value)));

// With pipe (easy to read, left-to-right)
const result = pipe(value, a, b, c);
```

**Example**:

```typescript
const sortedUsers = pipe(
  users,
  A.filter((user) => user.name.startsWith('A')),
  A.sort(UserOrd.byName),
  A.map((user) => user.name.toUpperCase())
);
```

### flow: Function Composition

Creates a new function from a series of functions.

```typescript
import { flow } from 'fp-ts/function';

// Without flow
const processUser = (user: User) => formatName(validateName(user.name));

// With flow (reusable pipeline)
const processUser = flow((user: User) => user.name, validateName, formatName);
```

**Example**:

```typescript
const processCompletedTodos = flow(
  A.filter((todo: Todo) => todo.completed),
  A.sort(TodoOrd.byTitle),
  A.map((todo) => todo.title.toUpperCase())
);

const result = processCompletedTodos(todos);
```

### When to Use What?

- **pipe**: Transforming a specific value through steps
- **flow**: Creating a reusable transformation pipeline

```typescript
// pipe: One-time transformation
const result = pipe(value, transform1, transform2);

// flow: Reusable function
const transformer = flow(transform1, transform2);
const result1 = transformer(value1);
const result2 = transformer(value2);
```

---

## Array Operations

### Functional Array Transformations

```typescript
import * as A from 'fp-ts/Array';

const numbers = [1, 2, 3, 4, 5];

// Map
A.map((n: number) => n * 2)(numbers);
// [2, 4, 6, 8, 10]

// Filter
A.filter((n: number) => n % 2 === 0)(numbers);
// [2, 4]

// Reduce
A.reduce(0, (acc, n) => acc + n)(numbers);
// 15

// Sort
A.sort(N.Ord)(numbers);
// [1, 2, 3, 4, 5]
```

### Chaining with pipe

```typescript
const result = pipe(
  users,
  A.filter((user) => user.active),
  A.sort(UserOrd.byName),
  A.map((user) => user.name),
  A.takeLeft(10) // First 10 elements
);
```

### Parallel Operations with sequence

```typescript
import { sequence } from 'fp-ts/Array';

// Fetch multiple users in parallel
const fetchMultiple = (userIds: UserId[]) =>
  pipe(
    userIds.map(fetchUserTodos),
    sequence(TE.ApplicativePar) // Execute in parallel!
  );

// Usage
const result = await fetchMultiple([userId1, userId2, userId3])();
// Either<DomainError, [Todo[], Todo[], Todo[]]>
```

---

## NonEmptyArray

### What is NonEmptyArray?

An array that is guaranteed to have at least one element.

```typescript
import * as NEA from 'fp-ts/NonEmptyArray';

type NonEmptyArray<A> = [A, ...A[]];
```

### Creating NonEmptyArrays

```typescript
// From array (returns Option)
const maybeNEA = NEA.fromArray([1, 2, 3]);
// O.some([1, 2, 3])

const emptyNEA = NEA.fromArray([]);
// O.none

// Direct construction
const nea: NEA.NonEmptyArray<number> = [1, 2, 3];
```

### Why Use NonEmptyArray?

**Type-safe operations that require at least one element**:

```typescript
// ❌ Unsafe: What if array is empty?
const first = array[0]; // Could be undefined!
const max = Math.max(...array); // -Infinity if empty!

// ✅ Safe: Guaranteed to exist
const first = NEA.head(nea); // Always exists
const max = pipe(nea, NEA.max(N.Ord)); // Always valid
```

### Real-World Example

```typescript
// Calculate stats only if todos exist
const stats = pipe(
  todos,
  NEA.fromArray,
  O.map((todosNEA) => ({
    total: NEA.size(todosNEA),
    completed: pipe(
      todosNEA,
      NEA.filter((todo) => todo.completed),
      NEA.size
    ),
    remaining: pipe(
      todosNEA,
      NEA.filter((todo) => !todo.completed),
      NEA.size
    ),
  })),
  O.getOrElse(() => ({ total: 0, completed: 0, remaining: 0 }))
);
```

---

## Ord (Comparators)

### What is Ord?

Type class for ordering/comparing values.

```typescript
interface Ord<A> {
  readonly equals: (x: A, y: A) => boolean;
  readonly compare: (x: A, y: A) => -1 | 0 | 1;
}
```

### Built-in Ords

```typescript
import * as N from 'fp-ts/number';
import * as S from 'fp-ts/string';
import * as B from 'fp-ts/boolean';

N.Ord.compare(1, 2); // -1
S.Ord.compare('a', 'b'); // -1
B.Ord.compare(false, true); // -1
```

### Creating Custom Ords

```typescript
import { contramap } from 'fp-ts/Ord';

// Sort users by name (case-insensitive)
const UserByName: Ord<User> = pipe(
  S.Ord,
  contramap((user: User) => user.name.toLowerCase())
);

const sorted = pipe(users, A.sort(UserByName));
```

### Multi-Level Sorting

```typescript
import { getSemigroup } from 'fp-ts/Ord';

// Sort by completed status, then by title
const TodoByCompletedThenTitle = pipe(
  TodoOrd.byCompleted,
  getSemigroup<Todo>().concat(TodoOrd.byTitle)
);

const sorted = pipe(todos, A.sort(TodoByCompletedThenTitle));
```

---

## monocle-ts (Lenses)

### What are Lenses?

Composable getters and setters for immutable data structures.

```typescript
import { Lens } from 'monocle-ts';

interface Person {
  name: string;
  address: {
    city: string;
  };
}

const cityLens = Lens.fromPath<Person>()(['address', 'city']);
```

### Why Use Lenses?

**Without lenses** (verbose, error-prone):

```typescript
const updatedPerson = {
  ...person,
  address: {
    ...person.address,
    city: 'San Francisco',
  },
};
```

**With lenses** (concise, type-safe):

```typescript
const updatedPerson = cityLens.set('San Francisco')(person);
```

### Operations

#### Get

```typescript
const city = cityLens.get(person);
```

#### Set

```typescript
const updated = cityLens.set('New York')(person);
```

#### Modify

```typescript
const updated = cityLens.modify((city) => city.toUpperCase())(person);
```

### Composition

```typescript
const nameLens = Lens.fromPath<Person>()(['name']);
const cityLens = Lens.fromPath<Person>()(['address', 'city']);

const updated = pipe(person, nameLens.set('John'), cityLens.set('NYC'));
```

### Real-World Example

```typescript
// Toggle todo completion
const toggledTodo = TodoLens.completed.modify((c) => !c)(todo);

// Update nested user data
const updatedUser = pipe(
  user,
  UserAddressLens.city.set('San Francisco'),
  UserCompanyLens.name.set('Acme Corp'),
  UserLens.email.set('new@email.com')
);
```

---

## io-ts (Runtime Validation)

### What is io-ts?

Runtime type validation that syncs with TypeScript types.

```typescript
import * as t from 'io-ts';

const UserCodec = t.type({
  id: t.number,
  name: t.string,
  email: t.string,
});

type User = t.TypeOf<typeof UserCodec>;
```

### Why io-ts?

**Problem**: TypeScript types are erased at runtime. API responses are unvalidated.

```typescript
// ❌ No runtime validation
const user = (await fetch('/api/user').then((r) => r.json())) as User;
// If API returns { id: '1', name: 123 }, TypeScript won't catch it!

// ✅ Runtime validation
const response = await fetch('/api/user').then((r) => r.json());
const result = UserCodec.decode(response);

if (E.isLeft(result)) {
  console.error('Validation failed:', result.left);
} else {
  const user = result.right; // Guaranteed to match User type
}
```

### Codec Combinators

```typescript
// Required fields
const Person = t.type({
  name: t.string,
  age: t.number,
});

// Optional fields
const PartialPerson = t.partial({
  nickname: t.string,
  bio: t.string,
});

// Combined
const FullPerson = t.intersection([Person, PartialPerson]);

// Array
const People = t.array(Person);

// Union
const Status = t.union([
  t.literal('active'),
  t.literal('inactive'),
  t.literal('pending'),
]);
```

### Nested Structures

```typescript
const AddressCodec = t.type({
  street: t.string,
  city: t.string,
  zipcode: t.string,
});

const UserCodec = t.type({
  id: t.number,
  name: t.string,
  address: AddressCodec, // Nested codec
});
```

### Error Reporting

```typescript
const result = UserCodec.decode(invalidData);

if (E.isLeft(result)) {
  result.left.forEach((error) => {
    console.log(
      `Invalid value at path: ${error.context.map((c) => c.key).join('.')}`
    );
  });
}
```

---

## Common Patterns

### 1. API Request with Validation

```typescript
const fetchUsers = pipe(
  TE.tryCatch(
    () => fetch('/api/users').then((r) => r.json()),
    (error) => DomainError.NetworkError('Fetch failed', error)
  ),
  TE.chainEitherKW(UsersCodec.decode),
  TE.mapLeft((errors) => DomainError.ValidationError('Invalid data', errors))
);
```

### 2. Optional Chaining

```typescript
const email = pipe(
  O.fromNullable(user),
  O.chain((user) => O.fromNullable(user.contact)),
  O.chain((contact) => O.fromNullable(contact.email)),
  O.getOrElse(() => 'No email')
);
```

### 3. Error Recovery

```typescript
const result = pipe(
  fetchPrimaryData(),
  TE.alt(() => fetchBackupData()),
  TE.alt(() => TE.right(defaultData))
);
```

### 4. Conditional Execution

```typescript
const maybeResult = pipe(
  shouldExecute ? O.some(userId) : O.none,
  O.match(
    () => TE.right([]),
    (id) => fetchUserTodos(id)
  )
);
```

### 5. Aggregating Results

```typescript
const results = pipe(
  [task1, task2, task3],
  A.sequence(TE.ApplicativePar) // Run all in parallel
);
```

---

## Best Practices

### 1. Explicit Error Types in Signatures

```typescript
// ✅ Errors visible in type
function parse(input: string): E.Either<ParseError, Data>;

// ❌ Errors hidden
function parse(input: string): Data; // Throws on error
```

### 2. Lazy Evaluation

```typescript
// ✅ Lazy: doesn't execute until called
const task = fetchUsers();
// ... later
await task();

// ❌ Eager: executes immediately
const promise = fetch('/api/users');
```

### 3. Composition Over Nesting

```typescript
// ✅ Readable pipeline
const result = pipe(data, validate, transform, save);

// ❌ Nested callbacks
save(transform(validate(data)));
```

### 4. Pattern Matching Over Conditionals

```typescript
// ✅ Exhaustive pattern matching
pipe(
  option,
  O.match(
    () => handleNone(),
    (value) => handleSome(value)
  )
);

// ❌ Incomplete conditionals
if (option !== null) {
  handleSome(option);
}
// What about null case?
```

### 5. Type-Safe Parsing

```typescript
// ✅ Safe parsing with Option
UserId.fromString(input); // Returns Option<UserId>

// ❌ Unsafe casting
const userId = parseInt(input) as UserId;
```

---

## Migration Tips

### From Promises to TaskEither

```typescript
// Before
async function fetchData() {
  try {
    const response = await fetch('/api/data');
    return await response.json();
  } catch (error) {
    console.error(error);
    throw error;
  }
}

// After
const fetchData = pipe(
  TE.tryCatch(
    () => fetch('/api/data').then((r) => r.json()),
    (error) => DomainError.NetworkError('Fetch failed', error)
  )
);
```

### From Null to Option

```typescript
// Before
function findUser(id: number): User | null {
  return users.find((u) => u.id === id) || null;
}

// After
function findUser(id: UserId): O.Option<User> {
  return pipe(
    users,
    A.findFirst((u) => u.id === id)
  );
}
```

### From try-catch to Either

```typescript
// Before
function parseJSON(input: string): Data {
  try {
    return JSON.parse(input);
  } catch (error) {
    throw new Error('Invalid JSON');
  }
}

// After
function parseJSON(input: string): E.Either<ParseError, Data> {
  return E.tryCatch(
    () => JSON.parse(input),
    () => ({ _tag: 'ParseError', message: 'Invalid JSON' })
  );
}
```

---

**Next**: See [ARCHITECTURE.md](./ARCHITECTURE.md) for overall project structure.
