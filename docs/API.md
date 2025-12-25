# API Documentation

This document describes the API layer implementation using fp-ts TaskEither for type-safe async operations.

## Core HTTP Module

**Location**: [src/api/core/http.ts](../src/api/core/http.ts)

The generic HTTP utility provides retry logic, timeout handling, and io-ts validation.

### `httpGet<A>`

Performs a GET request with automatic validation and error handling.

**Signature**:

```typescript
function httpGet<A>(
  url: string,
  codec: t.Type<A>,
  options?: {
    timeout?: number;
    retries?: number;
  }
): TE.TaskEither<DomainError, A>;
```

**Parameters**:

- `url`: API endpoint URL
- `codec`: io-ts codec for runtime validation
- `options.timeout`: Request timeout in milliseconds (default: 30000)
- `options.retries`: Number of retry attempts (default: 3)

**Returns**: `TaskEither<DomainError, A>` - Either an error or validated data

**Example**:

```typescript
const getUser = (id: UserId) =>
  httpGet(`https://api.example.com/users/${UserId.unwrap(id)}`, UserCodec, {
    timeout: 5000,
    retries: 2,
  });
```

**Error Handling**:

- `NetworkError`: Fetch fails (network issues, CORS)
- `ValidationError`: Response doesn't match codec
- `NotFoundError`: 404 status code
- `UnauthorizedError`: 401/403 status codes
- `ServerError`: 5xx status codes

### `httpMutate<A>`

Performs POST/PUT/PATCH requests with validation.

**Signature**:

```typescript
function httpMutate<A>(
  url: string,
  method: 'POST' | 'PUT' | 'PATCH',
  body: unknown,
  codec: t.Type<A>,
  options?: {
    timeout?: number;
    retries?: number;
  }
): TE.TaskEither<DomainError, A>;
```

**Example**:

```typescript
const updateTodo = (todo: Todo) =>
  httpMutate(
    `https://api.example.com/todos/${TodoId.unwrap(todo.id)}`,
    'PUT',
    todo,
    TodoCodec
  );
```

### Retry Logic

Implements exponential backoff with configurable attempts:

```typescript
const withRetry = <A>(
  task: TE.TaskEither<DomainError, A>,
  maxRetries: number
): TE.TaskEither<DomainError, A>
```

**Retry Strategy**:

- Initial delay: 1000ms
- Exponential multiplier: 2x
- Max attempts: 3 (default)
- Retries only on `NetworkError` (not validation errors)

**Delays**: 1s → 2s → 4s

### Timeout Implementation

```typescript
const withTimeout = <A>(
  task: TE.TaskEither<DomainError, A>,
  timeoutMs: number
): TE.TaskEither<DomainError, A>
```

Races the request against a timeout, returning `NetworkError` if timeout wins.

---

## Users API

**Location**: [src/api/users.ts](../src/api/users.ts)

### `fetchUsers()`

Fetches all users and sorts by name.

**Signature**:

```typescript
const fetchUsers: TE.TaskEither<DomainError, User[]>;
```

**Returns**: Sorted array of users (A-Z by name, case-insensitive)

**Implementation**:

```typescript
export const fetchUsers = pipe(
  httpGet('https://jsonplaceholder.typicode.com/users', UsersCodec),
  TE.map(A.sort(UserOrd.byName))
);
```

**Example Usage**:

```typescript
// In React Query hook
const { data, error, isLoading } = useQuery({
  queryKey: ['users'],
  queryFn: () => unwrapTaskEither(fetchUsers),
});
```

### `fetchUserById(userId: UserId)`

Fetches a single user with branded ID type safety.

**Signature**:

```typescript
const fetchUserById: (userId: UserId) => TE.TaskEither<DomainError, User>;
```

**Example**:

```typescript
const userId = UserId.wrap(1);
const result = await fetchUserById(userId)();
```

---

## Todos API

**Location**: [src/api/todos.ts](../src/api/todos.ts)

### `fetchUserTodos(userId: UserId)`

Fetches TODOs for a specific user, sorted by ID.

**Signature**:

```typescript
const fetchUserTodos: (userId: UserId) => TE.TaskEither<DomainError, Todo[]>;
```

**Returns**: Array of todos sorted by ID (ascending)

**Implementation**:

```typescript
export const fetchUserTodos = (userId: UserId) =>
  pipe(
    httpGet(
      `https://jsonplaceholder.typicode.com/users/${UserId.unwrap(
        userId
      )}/todos`,
      TodosCodec
    ),
    TE.map(A.sort(TodoOrd.byId))
  );
```

**Example Usage**:

```typescript
const { data: todos } = useQuery({
  queryKey: ['todos', userId],
  queryFn: () => unwrapTaskEither(fetchUserTodos(userId)),
  enabled: O.isSome(selectedUserId),
});
```

### `updateTodo(todo: Todo)`

Updates a TODO item (typically for marking complete/incomplete).

**Signature**:

```typescript
const updateTodo: (todo: Todo) => TE.TaskEither<DomainError, Todo>;
```

**Implementation**:

```typescript
export const updateTodo = (todo: Todo) =>
  httpMutate(
    `https://jsonplaceholder.typicode.com/todos/${TodoId.unwrap(todo.id)}`,
    'PUT',
    todo,
    TodoCodec,
    { retries: 2 } // Retry on network errors
  );
```

**Example Usage in React Query**:

```typescript
const mutation = useMutation({
  mutationFn: (todo: Todo) => unwrapTaskEither(updateTodo(todo)),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['todos', userId] });
  },
});
```

### Flow Compositions

Reusable pipelines for filtering and sorting:

#### `processCompletedTodos`

```typescript
const processCompletedTodos: (todos: Todo[]) => Todo[];
```

Filters completed TODOs and sorts by title.

#### `processActiveTodos`

```typescript
const processActiveTodos: (todos: Todo[]) => Todo[];
```

Filters active (incomplete) TODOs and sorts by title.

**Usage**:

```typescript
const completedTodos = processCompletedTodos(allTodos);
const activeTodos = processActiveTodos(allTodos);
```

### Parallel Requests

Fetch multiple users' TODOs in parallel:

```typescript
const fetchMultipleTodos = (userIds: UserId[]) =>
  pipe(
    userIds.map(fetchUserTodos),
    A.sequence(TE.ApplicativePar) // Parallel execution!
  );

// Usage
const result = await fetchMultipleTodos([userId1, userId2, userId3])();
```

---

## React Query Integration

### `unwrapTaskEither<A>`

**Location**: [src/utils/reactQuery.ts](../src/utils/reactQuery.ts)

Converts fp-ts `TaskEither<DomainError, A>` to a Promise compatible with React Query.

**Signature**:

```typescript
const unwrapTaskEither = <A>(
  task: TE.TaskEither<DomainError, A>
): Promise<A>
```

**Implementation**:

```typescript
export const unwrapTaskEither = <A>(
  task: TE.TaskEither<DomainError, A>
): Promise<A> =>
  task().then(
    E.fold(
      (error: DomainError) => Promise.reject(error),
      (data: A) => Promise.resolve(data)
    )
  );
```

**Why This Pattern?**

- React Query expects promises
- fp-ts uses TaskEither for errors
- This adapter bridges the two worlds cleanly

**Example**:

```typescript
const { data } = useQuery({
  queryKey: ['users'],
  queryFn: () => unwrapTaskEither(fetchUsers),
});
```

---

## Error Types

All API functions return errors as `DomainError` ADT:

```typescript
type DomainError =
  | NetworkError // Fetch failed, timeout, CORS
  | ValidationError // io-ts codec mismatch
  | NotFoundError // 404 response
  | UnauthorizedError // 401/403 response
  | ServerError; // 5xx response
```

See [TYPES.md](./TYPES.md) for detailed error type documentation.

---

## API Endpoints

### JSONPlaceholder Base URL

```
https://jsonplaceholder.typicode.com
```

### Available Endpoints

| Endpoint           | Method | Description        |
| ------------------ | ------ | ------------------ |
| `/users`           | GET    | Fetch all users    |
| `/users/:id`       | GET    | Fetch single user  |
| `/users/:id/todos` | GET    | Fetch user's todos |
| `/todos/:id`       | PUT    | Update todo        |

---

## Configuration

### Query Client Setup

**Location**: [src/utils/queryClient.ts](../src/utils/queryClient.ts)

```typescript
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
```

**Rationale**:

- **staleTime**: Users list rarely changes, cache for 5 minutes
- **gcTime**: Keep data in memory for 10 minutes
- **refetchOnWindowFocus**: Disabled to avoid unnecessary requests
- **retry**: Only 1 retry (our HTTP layer already has retry logic)

---

## Best Practices

### 1. Always Use Branded Types

```typescript
// ✅ Correct
const userId = UserId.wrap(1);
fetchUserTodos(userId);

// ❌ Wrong
fetchUserTodos(1); // TypeScript error!
```

### 2. Handle All Error Cases

```typescript
const result = await fetchUsers()();

pipe(
  result,
  E.match(
    (error) => {
      // Handle error exhaustively
      switch (error._tag) {
        case 'NetworkError': /* ... */
        case 'ValidationError': /* ... */
        case 'NotFoundError': /* ... */
        // Compiler ensures all cases covered
      }
    },
    (users) => {
      // Handle success
    }
  )
);
```

### 3. Compose with pipe/flow

```typescript
// ✅ Readable pipeline
const fetchSortedUsers = pipe(
  fetchUsers,
  TE.map(A.filter((user) => user.name.startsWith('A'))),
  TE.map(A.sort(UserOrd.byEmail))
);

// ❌ Imperative nesting
const fetchSortedUsers = fetchUsers.then((users) =>
  users.filter((u) => u.name.startsWith('A')).sort(/* ... */)
);
```

### 4. Use io-ts for All API Responses

Never trust API data without validation:

```typescript
// ✅ Runtime validation
const data = await httpGet('/api/data', DataCodec);

// ❌ No validation (type assertion)
const data = (await fetch('/api/data').then((r) => r.json())) as Data;
```

---

## Troubleshooting

### CORS Errors

JSONPlaceholder has proper CORS headers, but if you encounter issues:

- Check browser console for specific CORS error
- Ensure URL is exactly `https://jsonplaceholder.typicode.com`
- Verify no proxy/VPN interference

### Timeout Issues

Default timeout is 30 seconds. For slower connections:

```typescript
httpGet(url, codec, { timeout: 60000 }); // 60 seconds
```

### Validation Errors

If io-ts validation fails:

1. Check API response in Network tab
2. Compare response shape to codec definition
3. Look at `ValidationError.errors` for details:

```typescript
pipe(
  result,
  E.mapLeft((error) => {
    if (error._tag === 'ValidationError') {
      console.log('Validation errors:', error.errors);
    }
  })
);
```

---

**Next**: See [HOOKS.md](./HOOKS.md) for React Query integration patterns.
