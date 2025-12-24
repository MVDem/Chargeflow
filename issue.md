Home Assignment — Frontend Developer

- **Required Framework:** React (TypeScript)

- **Estimated Time:** 3 hours

- **Backend:** Use the public REST API from [JSONPlaceholder](https://jsonplaceholder.typicode.com/)

---

Objective

Build a small React application that displays a list of users and their related TODO items, allowing the user to view, filter, and persist UI state. The goal is to evaluate your understanding of React fundamentals, composition, CSS layout, routing, and architectural structure.

---

Functional Requirements

1. User List

- On initial load, fetch a list of users from the API and display them as cards.

- Each card should include:

- Username

- Name

- A **"Show TODOS"** button

2. TODOS

- When a user clicks **"Show TODOs"**:

- Highlight the selected user's card.

- Fetch and display that user's TODOS.

- Each TODO should include:

- A checkbox (checked if completed)

- The TODO title

3. Filter

- Add a filter labeled **"Hide completed"** that hides completed TODOS.

- The filter state should reset (unchecked) when a different user is selected.

4. State Persistence

- Preserve both the selected user and filter state across page refreshes.

- Use either React Router state or session storage for persistence.

---

Technical Requirements & Guidelines

1. Routing

- Use React Router v6.4+ with the `createBrowserRouter` API.

- Define all routes using a strongly-typed object in `src/config/routes/`.

- Handle all route states:

- Main route (`/`)

- Not Found (404)

- Error route (fallback UI)

2. Hooks & State Management

- Manage state, effects, and derived logic using **custom hooks** (no inline state logic inside components).

- _Example: useTodos, useUserSelection, etc._

- Handle loading, error, and empty states for all API calls clearly in the UI.

3. Styling

- **Do not use** CSS frameworks like MUI, Tailwind, or Bootstrap.

- Implement layout and responsiveness using pure CSS / CSS Modules / CSS-in-JS or styled-components.

- Demonstrate your CSS skills, including:

- Grid and Flexbox layouts

- Responsive design (mobile and desktop)

- Component-level modular styling

4. Folder Structure

Your project should follow this structure:

```text
src/
  api/
    users.ts
    todos.ts
  components/
    Todo/
      Todo.tsx
      styles.ts
      useTodo.ts
      Todo.test.tsx
  pages/
    Home/
    NotFound/
    Error/
  config/
    routes/
      index.ts

```

5. Additional Guidelines

- Use TypeScript.

- Include unit tests for at least one component or hook.

- Use React Query, Zustand, Redux Toolkit, or Context API for data/state handling.

- Ensure the app is responsive, modular, and easy to extend.

6. Bonus Points

- Clean and consistent folder organization

- Reusable and declarative component composition

- Clear UX for loading and error handling states

- Type-safe route definitions and hooks

- Keep state persistent between refreshes
