# Types Documentation

This document describes the type system, including branded types, ADTs, and io-ts codecs.

## Branded Types

**Location**: [src/types/branded.ts](../src/types/branded.ts)

Branded types prevent mixing different kinds of IDs at compile time.

### UserId

```typescript
declare const UserIdBrand: unique symbol;
type UserId = number & { readonly [UserIdBrand]: typeof UserIdBrand };
```

A branded wrapper around `number` that ensures type safety for user IDs.

#### Constructors

##### `UserId.wrap(id: number): UserId`

**Unsafe** constructor that wraps a number without validation.

```typescript
const userId = UserId.wrap(1); // No validation!
```

⚠️ **Use with caution**: Only when you're certain the number is a valid user ID.

##### `UserId.unwrap(userId: UserId): number`

Extracts the underlying number from a UserId.

```typescript
const userId = UserId.wrap(42);
const num = UserId.unwrap(userId); // 42
```

##### `UserId.fromNumber(n: number): O.Option<UserId>`

**Safe** constructor that validates and wraps a number.

```typescript
const userId = UserId.fromNumber(1);
// O.some(UserId(1))

const invalid = UserId.fromNumber(-5);
// O.none (negative numbers not allowed)
```

**Validation Rules**:

- Must be a positive integer
- Returns `O.none` for invalid values

##### `UserId.fromString(s: string): O.Option<UserId>`

Parses a string to UserId with validation.

```typescript
const userId = UserId.fromString('42');
// O.some(UserId(42))

const invalid = UserId.fromString('abc');
// O.none (not a number)
```

**Validation Rules**:

- Must parse to a number
- Must be a positive integer
- Returns `O.none` for invalid strings

#### Type Safety Benefits

```typescript
declare function fetchUserTodos(userId: UserId): Promise<Todo[]>;
declare function fetchProductById(productId: ProductId): Promise<Product>;

const userId = UserId.wrap(1);
const productId = ProductId.wrap(1);

fetchUserTodos(userId); // ✅ Correct
fetchUserTodos(productId); // ❌ TypeScript error!
fetchUserTodos(1); // ❌ TypeScript error!
```

### TodoId

Same structure as UserId but for TODO IDs.

```typescript
declare const TodoIdBrand: unique symbol;
type TodoId = number & { readonly [TodoIdBrand]: typeof TodoIdBrand };
```

#### Constructors

- `TodoId.wrap(id: number): TodoId`
- `TodoId.unwrap(todoId: TodoId): number`
- `TodoId.fromNumber(n: number): O.Option<TodoId>`
- `TodoId.fromString(s: string): O.Option<TodoId>`

---

## Domain Errors

**Location**: [src/types/errors.ts](../src/types/errors.ts)

Algebraic Data Type (ADT) for representing all possible API errors.

### DomainError Type

```typescript
type DomainError =
  | NetworkError
  | ValidationError
  | NotFoundError
  | UnauthorizedError
  | ServerError;
```

### Error Variants

#### 1. NetworkError

Fetch operation failed (network issues, timeout, CORS).

```typescript
type NetworkError = {
  _tag: 'NetworkError';
  message: string;
  originalError?: unknown;
};
```

**When it occurs**:

- No internet connection
- Request timeout
- CORS issues
- DNS resolution failure

**Constructor**:

```typescript
const error = DomainError.NetworkError('Failed to fetch users', originalError);
```

#### 2. ValidationError

API response doesn't match expected shape (io-ts validation failure).

```typescript
type ValidationError = {
  _tag: 'ValidationError';
  message: string;
  errors: t.Errors;
};
```

**When it occurs**:

- API returns unexpected fields
- Missing required fields
- Wrong data types
- API contract changed

**Constructor**:

```typescript
const error = DomainError.ValidationError('Invalid user data', ioTsErrors);
```

**Accessing Details**:

```typescript
if (error._tag === 'ValidationError') {
  console.log('Validation errors:', error.errors);
  // Detailed path to invalid fields
}
```

#### 3. NotFoundError

Resource not found (404 response).

```typescript
type NotFoundError = {
  _tag: 'NotFoundError';
  message: string;
  resourceType?: string;
  resourceId?: string;
};
```

**When it occurs**:

- User doesn't exist
- TODO doesn't exist
- Invalid endpoint

**Constructor**:

```typescript
const error = DomainError.NotFoundError('User not found', 'User', '123');
```

#### 4. UnauthorizedError

Authentication or authorization failed (401/403 response).

```typescript
type UnauthorizedError = {
  _tag: 'UnauthorizedError';
  message: string;
  statusCode: 401 | 403;
};
```

**When it occurs**:

- Invalid credentials
- Expired token
- Insufficient permissions

**Constructor**:

```typescript
const error = DomainError.UnauthorizedError('Authentication required', 401);
```

#### 5. ServerError

Server-side error (5xx response).

```typescript
type ServerError = {
  _tag: 'ServerError';
  message: string;
  statusCode: number;
};
```

**When it occurs**:

- Server crash
- Database error
- Timeout on server
- 500, 502, 503, 504 status codes

**Constructor**:

```typescript
const error = DomainError.ServerError('Internal server error', 500);
```

### Pattern Matching

#### Exhaustive Matching with `match`

```typescript
const result = DomainError.match(error, {
  NetworkError: (err) => `Network issue: ${err.message}`,
  ValidationError: (err) => `Invalid data: ${err.message}`,
  NotFoundError: (err) => `Not found: ${err.message}`,
  UnauthorizedError: (err) => `Access denied: ${err.message}`,
  ServerError: (err) => `Server error: ${err.message}`,
});
```

**Benefits**:

- Compiler ensures all cases handled
- Type-safe access to variant-specific fields
- Refactor-safe (adding new error type causes compile error)

#### User-Friendly Messages

```typescript
export const getUserFriendlyMessage = (error: DomainError): string =>
  DomainError.match(error, {
    NetworkError: () =>
      'Network connection failed. Please check your internet connection.',
    ValidationError: () =>
      'Received invalid data from server. Please try again.',
    NotFoundError: () => 'The requested resource was not found.',
    UnauthorizedError: () =>
      'You do not have permission to access this resource.',
    ServerError: () => 'Server error occurred. Please try again later.',
  });
```

**Usage in Components**:

```typescript
if (error) {
  return <ErrorMessage>{getUserFriendlyMessage(error)}</ErrorMessage>;
}
```

---

## User Types

### TypeScript Interface

**Location**: [src/types/user.ts](../src/types/user.ts)

```typescript
interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    };
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  };
}
```

### io-ts Codecs

**Location**: [src/types/user.codec.ts](../src/types/user.codec.ts)

Runtime validation codecs for User type.

```typescript
const GeoCodec = t.type({
  lat: t.string,
  lng: t.string,
});

const AddressCodec = t.type({
  street: t.string,
  suite: t.string,
  city: t.string,
  zipcode: t.string,
  geo: GeoCodec,
});

const CompanyCodec = t.type({
  name: t.string,
  catchPhrase: t.string,
  bs: t.string,
});

export const UserCodec = t.type({
  id: t.number,
  name: t.string,
  username: t.string,
  email: t.string,
  address: AddressCodec,
  phone: t.string,
  website: t.string,
  company: CompanyCodec,
});

export const UsersCodec = t.array(UserCodec);
```

**Derived Types**:

```typescript
type User = t.TypeOf<typeof UserCodec>;
type Users = t.TypeOf<typeof UsersCodec>;
```

**Why Both?**

- `user.ts`: Documentation and IDE autocomplete
- `user.codec.ts`: Runtime validation and type derivation
- Keeps them in sync

---

## Todo Types

### TypeScript Interface

**Location**: [src/types/todo.ts](../src/types/todo.ts)

```typescript
interface Todo {
  userId: number;
  id: number;
  title: string;
  completed: boolean;
}
```

### io-ts Codecs

**Location**: [src/types/todo.codec.ts](../src/types/todo.codec.ts)

```typescript
export const TodoCodec = t.type({
  userId: t.number,
  id: t.number,
  title: t.string,
  completed: t.boolean,
});

export const TodosCodec = t.array(TodoCodec);
```

**Derived Types**:

```typescript
type Todo = t.TypeOf<typeof TodoCodec>;
type Todos = t.TypeOf<typeof TodosCodec>;
```

---

## Ord Comparators

**Location**: [src/utils/ord.ts](../src/utils/ord.ts)

Type-safe comparators for sorting with fp-ts.

### User Comparators

```typescript
export const UserOrd = {
  byId: pipe(
    N.Ord,
    Ord.contramap((user: User) => user.id)
  ),

  byName: pipe(
    S.Ord,
    Ord.contramap((user: User) => user.name.toLowerCase())
  ),

  byUsername: pipe(
    S.Ord,
    Ord.contramap((user: User) => user.username.toLowerCase())
  ),

  byEmail: pipe(
    S.Ord,
    Ord.contramap((user: User) => user.email.toLowerCase())
  ),

  byCity: pipe(
    S.Ord,
    Ord.contramap((user: User) => user.address.city.toLowerCase())
  ),

  byCompany: pipe(
    S.Ord,
    Ord.contramap((user: User) => user.company.name.toLowerCase())
  ),
};
```

**Usage**:

```typescript
import { UserOrd } from '@/utils/ord';

const sortedUsers = pipe(
  users,
  A.sort(UserOrd.byName) // Sort A-Z by name
);
```

### Todo Comparators

```typescript
export const TodoOrd = {
  byId: pipe(
    N.Ord,
    Ord.contramap((todo: Todo) => todo.id)
  ),

  byUserId: pipe(
    N.Ord,
    Ord.contramap((todo: Todo) => todo.userId)
  ),

  byTitle: pipe(
    S.Ord,
    Ord.contramap((todo: Todo) => todo.title.toLowerCase())
  ),

  byCompleted: pipe(
    B.Ord,
    Ord.contramap((todo: Todo) => todo.completed)
  ),

  byCompletedThenTitle: pipe(
    TodoOrd.byCompleted,
    Ord.getSemigroup<Todo>().concat(TodoOrd.byTitle)
  ),
};
```

**Multi-Level Sorting**:

```typescript
// Sort by completed status, then by title within each group
const sorted = pipe(todos, A.sort(TodoOrd.byCompletedThenTitle));
```

---

## Lenses (monocle-ts)

**Location**: [src/utils/lenses.ts](../src/utils/lenses.ts)

Optics for immutable updates on nested data.

### User Lenses

#### Direct Properties

```typescript
export const UserLens = {
  id: Lens.fromPath<User>()(['id']),
  name: Lens.fromPath<User>()(['name']),
  username: Lens.fromPath<User>()(['username']),
  email: Lens.fromPath<User>()(['email']),
  phone: Lens.fromPath<User>()(['phone']),
  website: Lens.fromPath<User>()(['website']),
};
```

**Usage**:

```typescript
const updatedUser = UserLens.name.set('John Doe')(user);
```

#### Nested Properties

```typescript
// Address lenses
export const UserAddressLens = {
  street: Lens.fromPath<User>()(['address', 'street']),
  city: Lens.fromPath<User>()(['address', 'city']),
  zipcode: Lens.fromPath<User>()(['address', 'zipcode']),
};

// Company lenses
export const UserCompanyLens = {
  name: Lens.fromPath<User>()(['company', 'name']),
  catchPhrase: Lens.fromPath<User>()(['company', 'catchPhrase']),
};
```

**Usage**:

```typescript
const updatedUser = pipe(
  user,
  UserAddressLens.city.set('San Francisco'),
  UserCompanyLens.name.set('Acme Corp')
);
```

**Why Lenses?**

- Immutable updates
- Type-safe nested property access
- Composable transformations
- Avoids verbose spread operators

### Todo Lenses

```typescript
export const TodoLens = {
  userId: Lens.fromPath<Todo>()(['userId']),
  id: Lens.fromPath<Todo>()(['id']),
  title: Lens.fromPath<Todo>()(['title']),
  completed: Lens.fromPath<Todo>()(['completed']),
};
```

**Modify Pattern**:

```typescript
// Toggle completed status
const toggledTodo = TodoLens.completed.modify((c) => !c)(todo);

// Update title
const renamedTodo = TodoLens.title.set('New title')(todo);
```

**Usage in React Query Mutation**:

```typescript
const mutation = useMutation({
  mutationFn: (todo: Todo) => {
    const updated = TodoLens.completed.modify((c) => !c)(todo);
    return updateTodo(updated);
  },
});
```

---

## Type Guards

### Option Type Guards

```typescript
import * as O from 'fp-ts/Option';

// Check if Option has value
if (O.isSome(maybeUserId)) {
  const userId = maybeUserId.value;
  // userId is UserId here
}

// Check if Option is empty
if (O.isNone(maybeUserId)) {
  // Handle empty case
}
```

### Either Type Guards

```typescript
import * as E from 'fp-ts/Either';

const result: E.Either<DomainError, User[]> = await fetchUsers()();

if (E.isLeft(result)) {
  const error = result.left;
  // Handle error
}

if (E.isRight(result)) {
  const users = result.right;
  // Handle success
}
```

---

## Best Practices

### 1. Use Branded Types for IDs

```typescript
// ✅ Type-safe
function fetchTodos(userId: UserId): Promise<Todo[]>;

// ❌ Unsafe
function fetchTodos(userId: number): Promise<Todo[]>;
```

### 2. Validate with io-ts at Boundaries

```typescript
// ✅ Validate API response
const validated = UserCodec.decode(apiResponse);

// ❌ Trust API blindly
const user = apiResponse as User;
```

### 3. Exhaustive Pattern Matching

```typescript
// ✅ Compiler-checked
const msg = DomainError.match(error, {
  NetworkError: (e) => e.message,
  ValidationError: (e) => e.message,
  // ... all cases
});

// ❌ Incomplete
if (error._tag === 'NetworkError') {
  // What about other cases?
}
```

### 4. Prefer Option Over Null

```typescript
// ✅ Type-safe
const userId: O.Option<UserId> = O.fromNullable(value);

// ❌ Nullable
const userId: UserId | null = value;
```

### 5. Use Lenses for Nested Updates

```typescript
// ✅ Lens composition
const updated = UserAddressLens.city.set('NYC')(user);

// ❌ Spread operator hell
const updated = {
  ...user,
  address: {
    ...user.address,
    city: 'NYC',
  },
};
```

### 6. NonEmptyArray for Guarantees

```typescript
// ✅ Guarantees at least one element
const stats = pipe(
  NEA.fromArray(todos),
  O.map((todosNEA) => ({ count: NEA.size(todosNEA) }))
);

// ❌ Requires runtime check
if (todos.length > 0) {
  // ...
}
```

---

**Next**: See [FP_TS.md](./FP_TS.md) for functional programming patterns.
