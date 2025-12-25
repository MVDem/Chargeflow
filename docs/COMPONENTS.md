# Components Documentation

This document describes all React components in the application.

## Component Organization

All components follow this structure:

```
ComponentName/
├── ComponentName.tsx          # Component implementation
├── ComponentName.module.css   # Scoped styles
├── useComponentName.ts        # Logic hook (if needed)
└── ComponentName.test.tsx     # Unit tests (if exists)
```

---

## UserCard

**Location**: [src/components/UserCard/UserCard.tsx](../src/components/UserCard/UserCard.tsx)

Displays a single user as a card with name, username, and action button.

### Props

```typescript
interface UserCardProps {
  user: User;
  isSelected: boolean;
  onSelect: (userId: UserId) => void;
}
```

| Prop         | Type                       | Description                             |
| ------------ | -------------------------- | --------------------------------------- |
| `user`       | `User`                     | User data object                        |
| `isSelected` | `boolean`                  | Whether this user is currently selected |
| `onSelect`   | `(userId: UserId) => void` | Callback when "Show TODOs" clicked      |

### Features

- **Highlight Selected**: Adds visual emphasis when user is selected
- **Branded UserId**: Uses type-safe UserId in callback
- **Responsive**: Adapts to grid layout

### Example Usage

```typescript
<UserCard
  user={user}
  isSelected={O.exists((id) => id === user.id)(selectedUserId)}
  onSelect={(userId) => selectUser(userId)}
/>
```

### CSS Classes

```css
.card          /* Base card styling */
/* Base card styling */
.card.selected /* Selected state with accent border */
.name          /* User's full name */
.username      /* Username with @ prefix */
.button; /* "Show TODOs" button */
```

---

## UserList

**Location**: [src/components/UserList/UserList.tsx](../src/components/UserList/UserList.tsx)

Grid of user cards with loading and error states.

### Props

```typescript
interface UserListProps {
  selectedUserId: O.Option<UserId>;
  onSelectUser: (userId: UserId) => void;
}
```

| Prop             | Type                       | Description                     |
| ---------------- | -------------------------- | ------------------------------- |
| `selectedUserId` | `O.Option<UserId>`         | Currently selected user         |
| `onSelectUser`   | `(userId: UserId) => void` | Callback when user card clicked |

### Features

#### 1. Automatic Data Fetching

Uses React Query to fetch users:

```typescript
const {
  data: users,
  isLoading,
  isError,
  error,
} = useQuery({
  queryKey: ['users'],
  queryFn: () => unwrapTaskEither(fetchUsers),
});
```

#### 2. Loading State

Shows 6 skeleton cards during initial fetch:

```typescript
if (isLoading) {
  return (
    <div className={styles.grid}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={200} />
      ))}
    </div>
  );
}
```

#### 3. Error Handling

Displays user-friendly error messages:

```typescript
if (isError) {
  return (
    <div className={styles.error}>
      <p>{getUserFriendlyMessage(error)}</p>
      <button onClick={() => refetch()}>Retry</button>
    </div>
  );
}
```

#### 4. Empty State

Handles case when API returns no users:

```typescript
if (users.length === 0) {
  return <p className={styles.empty}>No users found</p>;
}
```

#### 5. Option Pattern for Selection

Uses fp-ts `O.exists` to check if user is selected:

```typescript
<UserCard
  isSelected={O.exists((id: UserId) => id === user.id)(selectedUserId)}
/>
```

### Example Usage

```typescript
import { UserList } from '@/components/UserList/UserList';

function HomePage() {
  const { selectedUserId, selectUser } = useUserSelection();

  return <UserList selectedUserId={selectedUserId} onSelectUser={selectUser} />;
}
```

### CSS Layout

```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}
```

---

## TodoList

**Location**: [src/components/TodoList/TodoList.tsx](../src/components/TodoList/TodoList.tsx)

Displays a list of TODOs with statistics and filter controls.

### Props

```typescript
interface TodoListProps {
  todos: Todo[];
  hideCompleted: boolean;
  onToggleHideCompleted: () => void;
  onToggleTodo: (todo: Todo) => void;
}
```

| Prop                    | Type                   | Description               |
| ----------------------- | ---------------------- | ------------------------- |
| `todos`                 | `Todo[]`               | Array of todos to display |
| `hideCompleted`         | `boolean`              | Current filter state      |
| `onToggleHideCompleted` | `() => void`           | Toggle filter callback    |
| `onToggleTodo`          | `(todo: Todo) => void` | Todo checkbox callback    |

### Features

#### 1. Statistics Display

Shows total, completed, and remaining counts:

```typescript
const stats = pipe(
  NEA.fromArray(todos),
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
  }))
);
```

**Why NonEmptyArray?**

- Guarantees at least one todo for stats calculation
- Type-safe alternative to `todos.length > 0` checks

#### 2. Filter Controls

Checkbox to hide completed TODOs:

```typescript
<label>
  <input
    type="checkbox"
    checked={hideCompleted}
    onChange={onToggleHideCompleted}
  />
  Hide completed
</label>
```

#### 3. Filtered Display

Applies filter to todo list:

```typescript
const visibleTodos = hideCompleted
  ? todos.filter((todo) => !todo.completed)
  : todos;
```

#### 4. Empty States

Two empty state variants:

```typescript
// No todos at all
if (todos.length === 0) {
  return <p>No TODOs found for this user</p>;
}

// All todos filtered out
if (visibleTodos.length === 0 && hideCompleted) {
  return <p>All TODOs completed! 🎉</p>;
}
```

### Example Usage

```typescript
import { TodoList } from '@/components/TodoList/TodoList';

function TodosPage() {
  const { todos, toggleTodo } = useTodos(selectedUserId);
  const { hideCompleted, toggleHideCompleted } = useUserSelection();

  return (
    <TodoList
      todos={todos}
      hideCompleted={hideCompleted}
      onToggleHideCompleted={toggleHideCompleted}
      onToggleTodo={toggleTodo}
    />
  );
}
```

---

## TodoItem

**Location**: [src/components/TodoItem/TodoItem.tsx](../src/components/TodoItem/TodoItem.tsx)

Single TODO item with checkbox and title.

### Props

```typescript
interface TodoItemProps {
  todo: Todo;
  onToggle: (todo: Todo) => void;
}
```

| Prop       | Type                   | Description                    |
| ---------- | ---------------------- | ------------------------------ |
| `todo`     | `Todo`                 | Todo data object               |
| `onToggle` | `(todo: Todo) => void` | Callback when checkbox clicked |

### Features

- **Checkbox Control**: Reflects `completed` status
- **Strikethrough**: Completed todos have strikethrough text
- **Optimistic Updates**: UI updates immediately on click
- **Accessible**: Proper labels and keyboard support

### Example Usage

```typescript
<TodoItem todo={todo} onToggle={(todo) => toggleTodo(todo)} />
```

### CSS Styling

```css
.item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
}

.item.completed .title {
  text-decoration: line-through;
  opacity: 0.6;
}
```

### Tests

**Location**: [src/components/TodoItem/TodoItem.test.tsx](../src/components/TodoItem/TodoItem.test.tsx)

7 unit tests covering:

1. Renders todo title
2. Shows checked checkbox when completed
3. Shows unchecked checkbox when not completed
4. Calls onToggle when checkbox clicked
5. Applies strikethrough to completed todos
6. Does not apply strikethrough to incomplete todos
7. Has accessible label

---

## Skeleton

**Location**: [src/components/Skeleton/Skeleton.tsx](../src/components/Skeleton/Skeleton.tsx)

Loading placeholder with shimmer animation.

### Props

```typescript
interface SkeletonProps {
  variant?: 'text' | 'rectangular' | 'circular';
  width?: number | string;
  height?: number | string;
  count?: number;
}
```

| Prop      | Type                                    | Default  | Description              |
| --------- | --------------------------------------- | -------- | ------------------------ |
| `variant` | `'text' \| 'rectangular' \| 'circular'` | `'text'` | Shape of skeleton        |
| `width`   | `number \| string`                      | `'100%'` | Width in px or %         |
| `height`  | `number \| string`                      | `20`     | Height in px or %        |
| `count`   | `number`                                | `1`      | Number of skeleton lines |

### Features

#### 1. Multiple Variants

```typescript
<Skeleton variant="text" />         // Single line
<Skeleton variant="rectangular" />  // Box shape
<Skeleton variant="circular" />     // Round shape
```

#### 2. Shimmer Animation

```css
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.skeleton {
  animation: shimmer 2s infinite linear;
  background: linear-gradient(
    90deg,
    var(--skeleton-base) 0%,
    var(--skeleton-highlight) 50%,
    var(--skeleton-base) 100%
  );
}
```

#### 3. Multiple Lines

```typescript
<Skeleton count={3} /> // 3 skeleton lines
```

### Example Usage

```typescript
// Loading user cards
{
  isLoading && (
    <div className={styles.grid}>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={200} />
      ))}
    </div>
  );
}

// Loading todo list
{
  isLoading && <Skeleton count={5} height={40} />;
}

// Loading avatar
{
  isLoading && <Skeleton variant="circular" width={48} height={48} />;
}
```

---

## ErrorBoundary

**Location**: [src/components/ErrorBoundary/ErrorBoundary.tsx](../src/components/ErrorBoundary/ErrorBoundary.tsx)

React error boundary for catching render errors.

### Props

```typescript
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}
```

| Prop       | Type        | Description              |
| ---------- | ----------- | ------------------------ |
| `children` | `ReactNode` | Child components to wrap |
| `fallback` | `ReactNode` | Optional custom error UI |

### Features

#### 1. Error Catching

Catches errors during render, lifecycle methods, and hooks:

```typescript
static getDerivedStateFromError(error: Error): State {
  return { hasError: true, error };
}

componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
  console.error('ErrorBoundary caught:', error, errorInfo);
}
```

#### 2. Retry Mechanism

Allows users to recover from errors:

```typescript
<button onClick={() => this.setState({ hasError: false })}>Try Again</button>
```

#### 3. Default Fallback UI

Shows error message with retry button:

```typescript
if (this.state.hasError) {
  return (
    this.props.fallback || (
      <div className={styles.error}>
        <h2>Something went wrong</h2>
        <p>{this.state.error?.message}</p>
        <button onClick={this.resetError}>Try Again</button>
      </div>
    )
  );
}
```

### Example Usage

```typescript
// Wrap entire app
<ErrorBoundary>
  <App />
</ErrorBoundary>

// Wrap specific section with custom fallback
<ErrorBoundary fallback={<CustomErrorUI />}>
  <ComplexComponent />
</ErrorBoundary>
```

---

## MobileNav

**Location**: [src/components/MobileNav/MobileNav.tsx](../src/components/MobileNav/MobileNav.tsx)

Mobile navigation with hamburger menu and backdrop.

### Props

```typescript
interface MobileNavProps {
  children: ReactNode;
  onSelectUser?: (userId: UserId) => void;
}
```

| Prop           | Type                       | Description                                     |
| -------------- | -------------------------- | ----------------------------------------------- |
| `children`     | `ReactNode`                | Content to display in menu (usually UserList)   |
| `onSelectUser` | `(userId: UserId) => void` | Optional callback to close menu after selection |

### Features

#### 1. Hamburger Button

Animated burger icon:

```css
.burger {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.burger span {
  width: 24px;
  height: 2px;
  background: currentColor;
  transition: transform 0.3s;
}

.burger.open span:nth-child(1) {
  transform: rotate(45deg) translateY(6px);
}
```

#### 2. Backdrop Overlay

Semi-transparent backdrop:

```typescript
{
  isOpen && (
    <div className={styles.backdrop} onClick={close} aria-hidden="true" />
  );
}
```

#### 3. Side Panel

Slide-in menu from left:

```css
.menu {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 80%;
  max-width: 320px;
  transform: translateX(-100%);
  transition: transform 0.3s;
}

.menu.open {
  transform: translateX(0);
}
```

#### 4. Auto-Close on Selection

Closes menu when user selects an item:

```typescript
const handleUserSelect = (userId: UserId) => {
  onSelectUser?.(userId);
  close();
};
```

#### 5. Keyboard Support

Uses `useMobileNav` hook for ESC key handling and scroll lock.

### Example Usage

```typescript
import { MobileNav } from '@/components/MobileNav/MobileNav';

function HomePage() {
  const { selectedUserId, selectUser } = useUserSelection();

  return (
    <MobileNav onSelectUser={selectUser}>
      <UserList selectedUserId={selectedUserId} onSelectUser={selectUser} />
    </MobileNav>
  );
}
```

---

## Toast

**Location**: [src/components/Toast/Toast.tsx](../src/components/Toast/Toast.tsx)

Notification toast for success/error messages.

### Props

```typescript
interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}
```

| Prop       | Type                             | Default | Description             |
| ---------- | -------------------------------- | ------- | ----------------------- |
| `message`  | `string`                         | -       | Message to display      |
| `type`     | `'success' \| 'error' \| 'info'` | -       | Toast variant           |
| `duration` | `number`                         | `3000`  | Auto-dismiss time (ms)  |
| `onClose`  | `() => void`                     | -       | Callback when dismissed |

### Features

#### 1. Auto-Dismiss

Automatically closes after duration:

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    onClose();
  }, duration);

  return () => clearTimeout(timer);
}, [duration, onClose]);
```

#### 2. Type Variants

Different colors for different message types:

```css
.toast.success {
  background: var(--success-bg);
}
.toast.error {
  background: var(--error-bg);
}
.toast.info {
  background: var(--info-bg);
}
```

#### 3. Close Button

Manual dismiss option:

```typescript
<button
  className={styles.close}
  onClick={onClose}
  aria-label="Close notification"
>
  ×
</button>
```

#### 4. Fade Animation

Smooth enter/exit:

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.toast {
  animation: fadeIn 0.3s ease-out;
}
```

### Example Usage

```typescript
{
  toastState && (
    <Toast
      message={toastState.message}
      type={toastState.type}
      onClose={clearToast}
      duration={5000}
    />
  );
}
```

---

## Component Best Practices

### 1. Dumb Components

Keep components focused on rendering:

```typescript
// ✅ Receives data via props
function UserCard({ user, onSelect }: UserCardProps) {
  return <div onClick={() => onSelect(user.id)}>{user.name}</div>;
}

// ❌ Fetches data internally
function UserCard({ userId }: { userId: UserId }) {
  const user = useQuery(/* ... */);
  // Component now knows too much
}
```

### 2. Custom Hooks for Logic

Extract logic into hooks:

```typescript
// ✅ Logic in hook
function useUserList() {
  const { data } = useQuery(/* ... */);
  return { users: data };
}

function UserList() {
  const { users } = useUserList();
  return <div>{/* render */}</div>;
}
```

### 3. CSS Modules for Scoping

```typescript
// ✅ Scoped styles
import styles from './Component.module.css';
<div className={styles.container} />

// ❌ Global styles
<div className="container" />
```

### 4. TypeScript for Props

Always define prop interfaces:

```typescript
// ✅ Explicit types
interface Props {
  user: User;
  onSelect: (id: UserId) => void;
}

// ❌ Implicit any
function Component({ user, onSelect }) {}
```

### 5. Branded Types in Callbacks

Use branded types for type safety:

```typescript
// ✅ Type-safe ID
onSelect: (userId: UserId) => void

// ❌ Primitive type
onSelect: (userId: number) => void
```

---

**Next**: See [TYPES.md](./TYPES.md) for type definitions and ADTs.
