# Role & Context

You are a Lead Frontend Engineer. Build a high-quality React application based on the provided "Home Assignment". Focus on clean architecture, performance, and strict TypeScript.

# Setup & Scaffolding

- **Environment**: Vite + React + TypeScript.
- **State & Data**: TanStack Query (React Query) for server state handling.
- **Functional Programming**: Use `fp-ts` for API layers (TaskEither) and data transformations to demonstrate senior-level skills.
- **Styling**: Use **Pure CSS Modules** (`.module.css`).
- **STRICTLY FORBIDDEN**: Do NOT use SCSS, Tailwind, MUI, or Bootstrap.
- **Routing**: React Router v6.4+ using `createBrowserRouter`.
- **Route Config**: Define all routes using a strongly-typed object in `src/config/routes/index.ts`.

# Core Architecture

1. **Custom Hooks**: Mandatory. No inline logic in components. Components must be "dumb" and declarative. Logic for todos and user selection must reside in hooks like `useTodos` and `useUserSelection`.
2. **Folder Structure**: Strictly follow this hierarchy:
   - `src/api/` (users.ts, todos.ts)
   - `src/components/ComponentName/` (ComponentName.tsx, ComponentName.module.css, useComponentName.ts, ComponentName.test.tsx)
   - `src/pages/` (Home, NotFound, Error)
   - `src/config/routes/index.ts`
3. **State Persistence**: Preserve `selectedUserId` and `hideCompleted` filter across refreshes using **URL Search Parameters**.
4. **UX**: Handle Loading, Error (using Error Boundaries), and Empty states clearly. Use Skeleton loaders for a premium feel.

# Functional Requirements

- **User List**: Fetch from JSONPlaceholder. Display cards with Name, Username, and a "Show TODOS" button.
- **Selection**: Highlight the selected user's card when "Show TODOS" is clicked.
- **TODOs**: Fetch and display TODOs for the selected user only.
- **Filter**: Add a "Hide completed" checkbox.
- **CRITICAL LOGIC**: The filter state **MUST reset (unchecked)** whenever a different user is selected.
- **Testing**: Include at least one unit test for a component or hook using Vitest and React Testing Library.

# CSS Guidelines

- **Modern CSS**: Use CSS Variables for colors/spacing and Native CSS Nesting.
- **Layout**: Demonstrate proficiency in **CSS Grid** and **Flexbox**.
- **Responsiveness**: Ensure the app is fully responsive for mobile and desktop.
- **Animations**: Add smooth transitions (`transition: all 0.3s ease`) for hover effects and list entries.

# Additional Quality Standards

- **Strict Typing**: No `any`. Use interfaces for API models and component props.
- **Type-safe Routes**: Use the strongly-typed route object for all navigation and link generation.
- **Clean Code**: Follow SOLID principles and functional composition.

# Detailed Folder Structure

```
src/
├── api/
│   ├── users.ts
│   └── todos.ts
├── components/
│   ├── UserCard/
│   │   ├── UserCard.tsx
│   │   ├── UserCard.module.css
│   │   ├── useUserCard.ts
│   │   └── UserCard.test.tsx
│   ├── TodoList/
│   │   ├── TodoList.tsx
│   │   ├── TodoList.module.css
│   │   ├── useTodoList.ts
│   │   └── TodoList.test.tsx
│   ├── TodoItem/
│   │   ├── TodoItem.tsx
│   │   ├── TodoItem.module.css
│   │   └── TodoItem.test.tsx
│   ├── UserList/
│   │   ├── UserList.tsx
│   │   ├── UserList.module.css
│   │   └── useUserList.ts
│   ├── Skeleton/
│   │   ├── Skeleton.tsx
│   │   └── Skeleton.module.css
│   └── ErrorBoundary/
│       ├── ErrorBoundary.tsx
│       └── ErrorBoundary.module.css
├── pages/
│   ├── Home/
│   │   ├── Home.tsx
│   │   ├── Home.module.css
│   │   └── useHome.ts
│   ├── NotFound/
│   │   ├── NotFound.tsx
│   │   └── NotFound.module.css
│   └── Error/
│       ├── Error.tsx
│       └── Error.module.css
├── config/
│   └── routes/
│       └── index.ts
├── hooks/
│   ├── useTodos.ts
│   └── useUserSelection.ts
├── types/
│   ├── user.ts
│   └── todo.ts
├── utils/
│   └── queryClient.ts
├── App.tsx
├── App.module.css
└── main.tsx
```

# API Integration

- Users: https://jsonplaceholder.typicode.com/users
- Todos: https://jsonplaceholder.typicode.com/users/{userId}/todos
- Use fp-ts TaskEither for error handling
- Integrate with React Query
