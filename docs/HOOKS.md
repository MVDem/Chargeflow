# React Hooks Documentation

This document describes the custom hooks that manage application state and business logic.

## useTodos

**Location**: [src/hooks/useTodos.ts](../src/hooks/useTodos.ts)

Manages TODO data fetching, filtering, and mutations for a specific user.

### Signature

```typescript
function useTodos(selectedUserId: O.Option<UserId>): {
  todos: Todo[];
  isLoading: boolean;
  isError: boolean;
  error: DomainError | null;
  refetch: () => void;
  toggleTodo: (todo: Todo) => void;
  toastState: {
    message: string;
    type: 'success' | 'error';
  } | null;
  clearToast: () => void;
};
```

### Parameters

- **`selectedUserId`**: `O.Option<UserId>` - Selected user ID wrapped in fp-ts Option
  - `O.none` when no user selected
  - `O.some(userId)` when user selected

### Return Values

| Property     | Type                   | Description                                         |
| ------------ | ---------------------- | --------------------------------------------------- |
| `todos`      | `Todo[]`               | Filtered array of todos (empty if no user selected) |
| `isLoading`  | `boolean`              | True during initial fetch                           |
| `isError`    | `boolean`              | True if fetch failed                                |
| `error`      | `DomainError \| null`  | Error details from API call                         |
| `refetch`    | `() => void`           | Manually refetch todos                              |
| `toggleTodo` | `(todo: Todo) => void` | Toggle todo completion status                       |
| `toastState` | `object \| null`       | Toast notification state                            |
| `clearToast` | `() => void`           | Dismiss toast notification                          |

### Features

#### 1. Conditional Fetching

Only fetches when a user is selected:

```typescript
const { data } = useQuery({
  queryKey: ['todos', O.getOrElse(() => 0)(selectedUserId)],
  queryFn: () => unwrapTaskEither(fetchUserTodos(userId)),
  enabled: O.isSome(selectedUserId), // Only fetch if user selected
  staleTime: 5 * 60 * 1000,
});
```

#### 2. Optimistic Updates

Updates UI immediately when toggling todo completion:

```typescript
const mutation = useMutation({
  mutationFn: (todo: Todo) => unwrapTaskEither(updateTodo(todo)),
  onMutate: async (updatedTodo) => {
    // Cancel in-flight requests
    await queryClient.cancelQueries({ queryKey: ['todos', userId] });

    // Snapshot previous value
    const previousTodos = queryClient.getQueryData(['todos', userId]);

    // Optimistically update cache
    queryClient.setQueryData(['todos', userId], (old: Todo[]) =>
      pipe(
        old,
        A.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
      )
    );

    return { previousTodos };
  },
  onError: (_err, _variables, context) => {
    // Rollback on error
    queryClient.setQueryData(['todos', userId], context?.previousTodos);
  },
});
```

#### 3. monocle-ts Lens for Immutable Updates

Uses lenses to update nested properties immutably:

```typescript
import { TodoLens } from '@/utils/lenses';

const toggledTodo = TodoLens.completed.modify((completed) => !completed)(todo);
```

**Why lenses?**

- Type-safe property access
- Immutable updates without spread operators
- Composable for nested data

#### 4. Toast Notifications

Shows success/error messages after mutations:

```typescript
onSuccess: () => {
  setToastState({
    message: 'TODO updated successfully!',
    type: 'success',
  });
},
onError: (error: DomainError) => {
  setToastState({
    message: getUserFriendlyMessage(error),
    type: 'error',
  });
},
```

### Example Usage

```typescript
import { useTodos } from '@/hooks/useTodos';

function TodosPage() {
  const { selectedUserId } = useUserSelection();
  const {
    todos,
    isLoading,
    isError,
    error,
    toggleTodo,
    toastState,
    clearToast,
  } = useTodos(selectedUserId);

  if (isLoading) return <Skeleton count={5} />;
  if (isError) return <Error message={getUserFriendlyMessage(error)} />;

  return (
    <>
      <TodoList todos={todos} onToggle={toggleTodo} />
      {toastState && (
        <Toast
          message={toastState.message}
          type={toastState.type}
          onClose={clearToast}
        />
      )}
    </>
  );
}
```

---

## useUserSelection

**Location**: [src/hooks/useUserSelection.ts](../src/hooks/useUserSelection.ts)

Manages user selection and filter state using URL search parameters for persistence.

### Signature

```typescript
function useUserSelection(): {
  selectedUserId: O.Option<UserId>;
  selectUser: (userId: UserId | null) => void;
  clearSelection: () => void;
  hideCompleted: boolean;
  toggleHideCompleted: () => void;
  setHideCompleted: (value: boolean) => void;
};
```

### Return Values

| Property              | Type                               | Description                              |
| --------------------- | ---------------------------------- | ---------------------------------------- |
| `selectedUserId`      | `O.Option<UserId>`                 | Currently selected user (O.none if none) |
| `selectUser`          | `(userId: UserId \| null) => void` | Select user and **reset filter**         |
| `clearSelection`      | `() => void`                       | Clear user and filter                    |
| `hideCompleted`       | `boolean`                          | Current filter state                     |
| `toggleHideCompleted` | `() => void`                       | Toggle filter on/off                     |
| `setHideCompleted`    | `(value: boolean) => void`         | Set filter explicitly                    |

### Features

#### 1. URL-Based Persistence

State stored in URL search parameters:

```
/?userId=1&hideCompleted=true
```

```typescript
const [searchParams, setSearchParams] = useSearchParams();

const selectedUserId = pipe(
  O.fromNullable(searchParams.get('userId')),
  O.chain(UserId.fromString) // Parse and validate
);

const hideCompleted = searchParams.get('hideCompleted') === 'true';
```

**Benefits**:

- Survives page refresh
- Shareable links
- Browser back/forward support

#### 2. Critical Filter Reset Logic

**⚠️ IMPORTANT**: When a user selects a different user, the filter automatically resets to unchecked.

```typescript
const selectUser = (userId: UserId | null) => {
  setSearchParams({
    ...(userId !== null && { userId: userId.toString() }),
    // hideCompleted is intentionally NOT included → resets to default (false)
  });
};
```

**Why?**

- Business requirement: Users should see all TODOs when switching users
- Prevents confusion from hidden TODOs
- Explicit in URL: no `hideCompleted` param = filter off

#### 3. Option Type Safety

Uses fp-ts `Option` instead of `null`:

```typescript
// ✅ Type-safe pattern matching
pipe(
  selectedUserId,
  O.match(
    () => <NoUserSelected />,
    (userId) => <TodoList userId={userId} />
  )
);

// ❌ Null checks
if (selectedUserId !== null) {
  // ...
}
```

#### 4. Branded UserId Parsing

Safely parses URL parameter to branded type:

```typescript
// UserId.fromString returns Option<UserId>
const userId = pipe(
  O.fromNullable(searchParams.get('userId')),
  O.chain(UserId.fromString) // Validates it's a positive number
);
```

### Example Usage

```typescript
import { useUserSelection } from '@/hooks/useUserSelection';

function HomePage() {
  const { selectedUserId, selectUser, hideCompleted, toggleHideCompleted } =
    useUserSelection();

  return (
    <div>
      <UserList
        selectedUserId={selectedUserId}
        onSelectUser={(userId) => selectUser(userId)}
      />

      {pipe(
        selectedUserId,
        O.match(
          () => <p>Select a user to view TODOs</p>,
          (userId) => (
            <>
              <FilterCheckbox
                checked={hideCompleted}
                onChange={toggleHideCompleted}
              />
              <TodoList userId={userId} hideCompleted={hideCompleted} />
            </>
          )
        )
      )}
    </div>
  );
}
```

---

## useMobileNav

**Location**: [src/components/MobileNav/useMobileNav.ts](../src/components/MobileNav/useMobileNav.ts)

Manages mobile navigation menu state and side effects.

### Signature

```typescript
function useMobileNav(): {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
};
```

### Return Values

| Property | Type         | Description                 |
| -------- | ------------ | --------------------------- |
| `isOpen` | `boolean`    | Whether mobile menu is open |
| `toggle` | `() => void` | Toggle menu open/closed     |
| `close`  | `() => void` | Close menu                  |

### Features

#### 1. Body Scroll Lock

Prevents background scrolling when menu is open:

```typescript
useEffect(() => {
  if (isOpen) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }

  return () => {
    document.body.style.overflow = '';
  };
}, [isOpen]);
```

#### 2. ESC Key Handling

Closes menu when user presses Escape:

```typescript
useEffect(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      close();
    }
  };

  if (isOpen) {
    document.addEventListener('keydown', handleEscape);
  }

  return () => {
    document.removeEventListener('keydown', handleEscape);
  };
}, [isOpen]);
```

### Example Usage

```typescript
import { useMobileNav } from './useMobileNav';

function MobileNav({ children }: { children: ReactNode }) {
  const { isOpen, toggle, close } = useMobileNav();

  return (
    <>
      <button onClick={toggle} aria-label="Toggle menu">
        <BurgerIcon />
      </button>

      {isOpen && (
        <>
          <div className={styles.backdrop} onClick={close} />
          <nav className={styles.menu}>{children}</nav>
        </>
      )}
    </>
  );
}
```

---

## React Query Integration Patterns

### Fetching with fp-ts TaskEither

Convert TaskEither to Promise using `unwrapTaskEither`:

```typescript
import { unwrapTaskEither } from '@/utils/reactQuery';

const { data } = useQuery({
  queryKey: ['users'],
  queryFn: () => unwrapTaskEither(fetchUsers),
});
```

### Conditional Queries with Option

Enable queries only when Option has a value:

```typescript
const { data } = useQuery({
  queryKey: ['todos', O.getOrElse(() => 0)(userId)],
  queryFn: () => unwrapTaskEither(fetchUserTodos(userId)),
  enabled: O.isSome(userId), // Only run when userId is O.some
});
```

### Error Handling with DomainError

```typescript
const { error } = useQuery({
  queryKey: ['users'],
  queryFn: () => unwrapTaskEither(fetchUsers),
});

if (error) {
  return <ErrorMessage message={getUserFriendlyMessage(error)} />;
}
```

### Optimistic Updates Pattern

1. Cancel in-flight queries
2. Snapshot current data
3. Update cache optimistically
4. Return context for rollback
5. Rollback on error
6. Invalidate on success

```typescript
const mutation = useMutation({
  mutationFn: mutationFunction,
  onMutate: async (variables) => {
    await queryClient.cancelQueries({ queryKey });
    const previous = queryClient.getQueryData(queryKey);
    queryClient.setQueryData(queryKey, optimisticData);
    return { previous };
  },
  onError: (_err, _vars, context) => {
    queryClient.setQueryData(queryKey, context?.previous);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey });
  },
});
```

---

## Best Practices

### 1. Use Option for Optional Values

```typescript
// ✅ Option type safety
const userId: O.Option<UserId> = O.fromNullable(value);

// ❌ Nullable types
const userId: UserId | null = value;
```

### 2. URL State for Shareable State

Store in URL if users should be able to:

- Share the link
- Bookmark the page
- Use browser back/forward

```typescript
// ✅ URL state
const [searchParams, setSearchParams] = useSearchParams();

// ❌ Local state (lost on refresh)
const [value, setValue] = useState();
```

### 3. Custom Hooks for Reusable Logic

```typescript
// ✅ Reusable custom hook
function useUserSelection() {
  /* ... */
}

// ❌ Inline in component
function Component() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  // ... 20 more lines
}
```

### 4. Exhaustive Pattern Matching with Option

```typescript
// ✅ Compiler-checked exhaustive handling
pipe(
  selectedUserId,
  O.match(
    () => handleNone(),
    (userId) => handleSome(userId)
  )
);

// ❌ Incomplete null check
if (selectedUserId) {
  // What about null case?
}
```

---

## Testing Hooks

### Example Test Structure

```typescript
import { renderHook, act } from '@testing-library/react';
import { useUserSelection } from './useUserSelection';

describe('useUserSelection', () => {
  it('should start with no selected user', () => {
    const { result } = renderHook(() => useUserSelection());
    expect(O.isNone(result.current.selectedUserId)).toBe(true);
  });

  it('should reset filter when selecting different user', () => {
    const { result } = renderHook(() => useUserSelection());

    act(() => {
      result.current.selectUser(UserId.wrap(1));
      result.current.setHideCompleted(true);
    });

    expect(result.current.hideCompleted).toBe(true);

    act(() => {
      result.current.selectUser(UserId.wrap(2));
    });

    expect(result.current.hideCompleted).toBe(false); // Reset!
  });
});
```

---

**Next**: See [COMPONENTS.md](./COMPONENTS.md) for UI component documentation.
