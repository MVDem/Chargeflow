# ChargeFlow - Users & TODOs Application

A modern React application built with TypeScript, demonstrating clean architecture, functional programming with fp-ts, and best practices in frontend development.

## 🚀 Features

- **User Management**: Browse and select users from JSONPlaceholder API
- **TODO Management**: View and filter TODOs for selected users
- **State Persistence**: URL-based state management for seamless navigation
- **Filter Logic**: Hide completed TODOs with automatic reset on user change
- **Responsive Design**: Mobile-first approach with pure CSS Modules
- **Error Handling**: Comprehensive error boundaries and loading states
- **Type Safety**: Strict TypeScript with no \`any\` types
- **Testing**: Unit tests with Vitest and React Testing Library

## 🛠 Tech Stack

- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite (Rolldown)
- **Routing**: React Router v6.4+ with \`createBrowserRouter\`
- **State Management**: TanStack Query (React Query)
- **Functional Programming**: fp-ts with TaskEither
- **Styling**: Pure CSS Modules (no frameworks)
- **Testing**: Vitest + React Testing Library

## 🏃 Getting Started

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
\`\`\`

## 🎯 Key Features

### 1. Functional Programming with fp-ts
API calls use TaskEither for elegant error handling

### 2. URL-Based State Management
State persists across page refreshes using URL search parameters

### 3. Critical Filter Reset Logic
When a user changes, the "Hide completed" filter automatically resets

### 4. Pure CSS Modules
Modern CSS with variables, nesting, and transitions

## 🧪 Testing

7 unit tests included for TodoItem component with full coverage.

## 📐 Architecture

- Clean separation of concerns
- Custom hooks for all logic
- Type-safe route configuration
- fp-ts for functional error handling

---

**Built with ❤️ using React, TypeScript, and fp-ts**
