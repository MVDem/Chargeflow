# Testing Documentation

This document describes the testing setup and practices used in the project.

## Test Setup

**Location**: [src/test/setup.ts](../src/test/setup.ts)

### Test Runner: Vitest

Configuration in [vite.config.ts](../vite.config.ts):

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: true,
  },
});
```

**Settings**:

- `globals: true` - No need to import `describe`, `it`, `expect`
- `environment: 'jsdom'` - Browser-like environment for React testing
- `setupFiles` - Runs before each test file
- `css: true` - Allows importing CSS modules in tests

### Testing Libraries

```json
{
  "devDependencies": {
    "vitest": "^4.0.0",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.5.2",
    "@testing-library/jest-dom": "^6.6.3"
  }
}
```

### Setup File

```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});
```

---

## TodoItem Tests

**Location**: [src/components/TodoItem/TodoItem.test.tsx](../src/components/TodoItem/TodoItem.test.tsx)

Complete test suite with 7 tests covering all component behavior.

### Test Structure

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TodoItem } from './TodoItem';
import type { Todo } from '@/types/todo';
import { TodoId } from '@/types/branded';

describe('TodoItem', () => {
  const mockTodo: Todo = {
    userId: 1,
    id: TodoId.wrap(1),
    title: 'Test todo',
    completed: false,
  };

  // Tests here...
});
```

### 1. Renders Todo Title

```typescript
it('renders todo title', () => {
  render(<TodoItem todo={mockTodo} onToggle={() => {}} />);

  expect(screen.getByText('Test todo')).toBeInTheDocument();
});
```

**Verifies**: Component displays todo title text.

### 2. Shows Checked Checkbox When Completed

```typescript
it('shows checked checkbox when completed', () => {
  const completedTodo = { ...mockTodo, completed: true };

  render(<TodoItem todo={completedTodo} onToggle={() => {}} />);

  const checkbox = screen.getByRole('checkbox');
  expect(checkbox).toBeChecked();
});
```

**Verifies**: Checkbox reflects `completed` state.

### 3. Shows Unchecked Checkbox When Not Completed

```typescript
it('shows unchecked checkbox when not completed', () => {
  render(<TodoItem todo={mockTodo} onToggle={() => {}} />);

  const checkbox = screen.getByRole('checkbox');
  expect(checkbox).not.toBeChecked();
});
```

**Verifies**: Checkbox is unchecked for incomplete todos.

### 4. Calls onToggle When Checkbox Clicked

```typescript
it('calls onToggle when checkbox is clicked', async () => {
  const onToggle = vi.fn();
  const user = userEvent.setup();

  render(<TodoItem todo={mockTodo} onToggle={onToggle} />);

  const checkbox = screen.getByRole('checkbox');
  await user.click(checkbox);

  expect(onToggle).toHaveBeenCalledTimes(1);
  expect(onToggle).toHaveBeenCalledWith(mockTodo);
});
```

**Verifies**:

- Callback is invoked on click
- Correct todo object is passed
- Called exactly once

### 5. Applies Strikethrough to Completed Todos

```typescript
it('applies strikethrough style to completed todos', () => {
  const completedTodo = { ...mockTodo, completed: true };

  render(<TodoItem todo={completedTodo} onToggle={() => {}} />);

  const title = screen.getByText('Test todo');
  expect(title).toHaveClass('completed');
});
```

**Verifies**: CSS class applied for visual strikethrough.

### 6. Does Not Apply Strikethrough to Incomplete Todos

```typescript
it('does not apply strikethrough to incomplete todos', () => {
  render(<TodoItem todo={mockTodo} onToggle={() => {}} />);

  const title = screen.getByText('Test todo');
  expect(title).not.toHaveClass('completed');
});
```

**Verifies**: No strikethrough for active todos.

### 7. Has Accessible Label

```typescript
it('has accessible label for checkbox', () => {
  render(<TodoItem todo={mockTodo} onToggle={() => {}} />);

  const checkbox = screen.getByRole('checkbox', { name: /test todo/i });
  expect(checkbox).toBeInTheDocument();
});
```

**Verifies**: Proper accessibility with labeled checkbox.

---

## Running Tests

### Commands

```bash
# Run all tests
npm test

# Watch mode (re-run on file changes)
npm run test:watch

# Coverage report
npm run test:coverage

# UI mode (interactive browser UI)
npm run test:ui
```

### Coverage Report

```bash
npm run test:coverage
```

**Output**:

```
File                | % Stmts | % Branch | % Funcs | % Lines
--------------------|---------|----------|---------|--------
TodoItem.tsx        | 100     | 100      | 100     | 100
```

---

## Testing Patterns

### 1. Arrange-Act-Assert

```typescript
it('calls callback when button clicked', async () => {
  // Arrange
  const onClick = vi.fn();
  render(<Button onClick={onClick} />);

  // Act
  const button = screen.getByRole('button');
  await userEvent.click(button);

  // Assert
  expect(onClick).toHaveBeenCalledTimes(1);
});
```

### 2. Testing with Branded Types

```typescript
const mockTodo: Todo = {
  userId: 1,
  id: TodoId.wrap(1), // ✅ Use branded type constructors
  title: 'Test',
  completed: false,
};
```

**Important**: Use `.wrap()` in tests to create branded types.

### 3. User Event for Interactions

```typescript
import userEvent from '@testing-library/user-event';

it('toggles checkbox', async () => {
  const user = userEvent.setup(); // Setup user event
  render(<Component />);

  await user.click(screen.getByRole('checkbox')); // Simulate click
  await user.type(screen.getByRole('textbox'), 'text'); // Simulate typing
});
```

**Why `userEvent` over `fireEvent`?**

- More realistic user interactions
- Better async handling
- Triggers proper event sequences

### 4. Testing Async Components

```typescript
it('displays loading state', async () => {
  render(<AsyncComponent />);

  expect(screen.getByText('Loading...')).toBeInTheDocument();

  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

### 5. Mocking API Calls

```typescript
import { vi } from 'vitest';
import * as api from '@/api/todos';

it('fetches and displays todos', async () => {
  // Mock API function
  vi.spyOn(api, 'fetchUserTodos').mockResolvedValue([mockTodo]);

  render(<TodoList userId={UserId.wrap(1)} />);

  await waitFor(() => {
    expect(screen.getByText('Test todo')).toBeInTheDocument();
  });
});
```

### 6. Testing Error States

```typescript
it('displays error message on failure', async () => {
  const error = DomainError.NetworkError('Failed to fetch');

  vi.spyOn(api, 'fetchUsers').mockRejectedValue(error);

  render(<UserList />);

  await waitFor(() => {
    expect(screen.getByText(/network connection failed/i)).toBeInTheDocument();
  });
});
```

---

## Testing Components with React Query

### Wrapping with QueryClientProvider

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false }, // Disable retries in tests
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}

it('fetches data', async () => {
  renderWithQuery(<UserList />);

  await waitFor(() => {
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

### Testing Mutations

```typescript
it('updates todo on toggle', async () => {
  const user = userEvent.setup();

  renderWithQuery(<TodoItem todo={mockTodo} />);

  const checkbox = screen.getByRole('checkbox');
  await user.click(checkbox);

  await waitFor(() => {
    expect(checkbox).toBeChecked();
  });
});
```

---

## Testing Best Practices

### 1. Query by Accessible Roles

```typescript
// ✅ Accessible queries
screen.getByRole('button', { name: /submit/i });
screen.getByRole('checkbox', { name: /agree/i });
screen.getByLabelText('Email');

// ❌ Fragile queries
screen.getByTestId('submit-btn');
screen.getByClassName('checkbox');
```

**Priority**:

1. `getByRole` (most accessible)
2. `getByLabelText` (for forms)
3. `getByPlaceholderText`
4. `getByText`
5. `getByTestId` (last resort)

### 2. Test User Behavior, Not Implementation

```typescript
// ✅ Test what user sees/does
it('shows error message when form invalid', async () => {
  render(<Form />);
  await user.click(screen.getByRole('button', { name: /submit/i }));
  expect(screen.getByText(/email is required/i)).toBeInTheDocument();
});

// ❌ Test implementation details
it('sets error state on validation failure', () => {
  const { result } = renderHook(() => useForm());
  act(() => result.current.validate());
  expect(result.current.errors.email).toBe('Email is required');
});
```

### 3. Avoid Testing Styles

```typescript
// ✅ Test class presence (semantic meaning)
expect(element).toHaveClass('error');

// ❌ Test computed styles
expect(element).toHaveStyle('color: red');
```

### 4. Use Mock Data Factories

```typescript
// Test utilities
function createMockTodo(overrides?: Partial<Todo>): Todo {
  return {
    userId: 1,
    id: TodoId.wrap(1),
    title: 'Test todo',
    completed: false,
    ...overrides,
  };
}

// Usage
const completedTodo = createMockTodo({ completed: true });
const customTodo = createMockTodo({ title: 'Custom title' });
```

### 5. Cleanup After Tests

```typescript
afterEach(() => {
  vi.clearAllMocks(); // Clear mock call counts
  cleanup(); // Unmount components
});
```

### 6. Test Edge Cases

```typescript
describe('TodoList', () => {
  it('shows empty state when no todos', () => {
    render(<TodoList todos={[]} />);
    expect(screen.getByText(/no todos/i)).toBeInTheDocument();
  });

  it('handles single todo', () => {
    render(<TodoList todos={[mockTodo]} />);
    expect(screen.getByRole('listitem')).toBeInTheDocument();
  });

  it('handles many todos', () => {
    const manyTodos = Array.from({ length: 100 }, (_, i) =>
      createMockTodo({ id: TodoId.wrap(i) })
    );
    render(<TodoList todos={manyTodos} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(100);
  });
});
```

---

## Testing fp-ts Code

### Testing TaskEither

```typescript
import * as TE from 'fp-ts/TaskEither';
import * as E from 'fp-ts/Either';

it('fetchUsers returns users on success', async () => {
  const result = await fetchUsers()();

  if (E.isRight(result)) {
    expect(result.right).toHaveLength(10);
    expect(result.right[0]).toHaveProperty('name');
  } else {
    throw new Error('Expected success');
  }
});

it('fetchUsers returns error on network failure', async () => {
  vi.spyOn(global, 'fetch').mockRejectedValue(new Error('Network error'));

  const result = await fetchUsers()();

  expect(E.isLeft(result)).toBe(true);
  if (E.isLeft(result)) {
    expect(result.left._tag).toBe('NetworkError');
  }
});
```

### Testing Option

```typescript
import * as O from 'fp-ts/Option';

it('fromString returns Some for valid ID', () => {
  const result = UserId.fromString('42');

  expect(O.isSome(result)).toBe(true);
  expect(O.getOrElse(() => 0)(result)).toBe(42);
});

it('fromString returns None for invalid ID', () => {
  const result = UserId.fromString('invalid');

  expect(O.isNone(result)).toBe(true);
});
```

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

## Future Testing Goals

### Recommended Additions

1. **Hook Tests**: Test custom hooks (`useTodos`, `useUserSelection`)
2. **Integration Tests**: Test page-level components with routing
3. **E2E Tests**: Use Playwright for full user flows
4. **Visual Regression**: Screenshot comparisons with Chromatic
5. **API Mocking**: MSW for realistic API mocking
6. **Accessibility Tests**: axe-core integration

### Coverage Targets

- **Statements**: 80%+
- **Branches**: 75%+
- **Functions**: 80%+
- **Lines**: 80%+

**Current Focus**: Critical business logic (TodoItem: 100%)

---

**Next**: See [FP_TS.md](./FP_TS.md) for functional programming patterns.
