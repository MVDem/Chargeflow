# Implementation Plan - ChargeFlow React App

## Milestone 1: Конфигурация и инфраструктура

- [ ] 1.1. Инициализировать Vite + React + TypeScript проект
- [ ] 1.2. Установить зависимости: react-router-dom, @tanstack/react-query, fp-ts
- [ ] 1.3. Установить dev-зависимости: vitest, @testing-library/react, @testing-library/jest-dom, jsdom
- [ ] 1.4. Настроить Vitest в `vite.config.ts`
- [ ] 1.5. Создать типы для User и Todo в `src/types/`
- [ ] 1.6. Настроить QueryClient в `src/utils/queryClient.ts`
- [ ] 1.7. Создать строго типизированный объект роутов в `src/config/routes/index.ts`
- [ ] 1.8. Настроить `createBrowserRouter` в `App.tsx`

## Milestone 2: API Layer с fp-ts

- [ ] 2.1. Реализовать `src/api/users.ts` с использованием `TaskEither` из `fp-ts`
- [ ] 2.2. Реализовать `src/api/todos.ts` с использованием `TaskEither` из `fp-ts`
- [ ] 2.3. Добавить типизацию для API responses
- [ ] 2.4. Добавить error handling для network requests

## Milestone 3: Custom Hooks

- [ ] 3.1. Создать `useUserSelection` для управления selectedUserId через URL params
- [ ] 3.2. Создать `useTodos` с интеграцией React Query
- [ ] 3.3. Реализовать логику сброса фильтра при смене пользователя (**КРИТИЧНО**)
- [ ] 3.4. Создать `useHome` для координации состояния на главной странице
- [ ] 3.5. Добавить обработку loading, error и empty states в hooks

## Milestone 4: UI Components (Dumb Components)

- [ ] 4.1. **Skeleton** - компонент загрузки с плавной анимацией
- [ ] 4.2. **UserCard** - карточка пользователя с кнопкой "Show TODOS"
- [ ] 4.3. **UserList** - сетка карточек пользователей (Grid layout)
- [ ] 4.4. **TodoItem** - элемент TODO с чекбоксом
- [ ] 4.5. **TodoList** - список TODO с фильтром "Hide completed"
- [ ] 4.6. **ErrorBoundary** - обработка ошибок с retry функционалом

## Milestone 5: Pages

- [ ] 5.1. **Home** - главная страница с UserList и TodoList
- [ ] 5.2. **NotFound** - 404 страница
- [ ] 5.3. **Error** - fallback UI для ошибок роутинга

## Milestone 6: Styling (Pure CSS Modules)

- [ ] 6.1. Создать глобальные CSS переменные (colors, spacing, transitions)
- [ ] 6.2. Стилизовать UserCard с Grid/Flexbox и hover эффектами
- [ ] 6.3. Стилизовать TodoList и TodoItem
- [ ] 6.4. Добавить responsive design (mobile-first approach)
- [ ] 6.5. Реализовать transitions для плавных анимаций (transition: all 0.3s ease)
- [ ] 6.6. Применить Native CSS Nesting где уместно

## Milestone 7: State Persistence

- [ ] 7.1. Интегрировать `selectedUserId` в URL search params
- [ ] 7.2. Интегрировать `hideCompleted` в URL search params
- [ ] 7.3. Синхронизировать состояние с URL при изменениях
- [ ] 7.4. Протестировать сохранение состояния при refresh

## Milestone 8: Testing

- [ ] 8.1. Написать unit-тест для `useTodos` hook
- [ ] 8.2. Написать unit-тест для `TodoItem` component
- [ ] 8.3. Протестировать логику сброса фильтра при смене пользователя
- [ ] 8.4. Настроить test setup с jsdom

## Milestone 9: Polish & UX

- [ ] 9.1. Добавить loading states с Skeleton loaders
- [ ] 9.2. Добавить error states с retry функционалом
- [ ] 9.3. Добавить empty states (нет пользователей, нет TODO)
- [ ] 9.4. Финальная проверка accessibility
- [ ] 9.5. Финальная проверка responsiveness на mobile и desktop
- [ ] 9.6. Code review и рефакторинг

---

## Критические правила реализации

### ❌ ЗАПРЕЩЕНО:

- Использовать SCSS, Tailwind, MUI, Bootstrap
- Inline стили или styled-components (только CSS Modules)
- Использовать `any` в TypeScript
- Inline state logic в components

### ✅ ОБЯЗАТЕЛЬНО:

- Pure CSS Modules (`.module.css`)
- Строгая типизация без `any`
- Custom hooks для всей логики
- fp-ts TaskEither для API calls
- React Query для data fetching
- URL Search Parameters для state persistence
- **Сброс фильтра при смене пользователя**
- Error Boundaries
- Loading и Empty states
- Минимум 1 unit-тест

---

## API Endpoints

- **Users**: `https://jsonplaceholder.typicode.com/users`
- **Todos**: `https://jsonplaceholder.typicode.com/users/{userId}/todos`

---

## Порядок выполнения

1. Начать с **Milestone 1** (конфигурация)
2. Перейти к **Milestone 2** (API layer)
3. Реализовать **Milestone 3** (hooks)
4. Построить **Milestone 4** (UI components)
5. Собрать **Milestone 5** (pages)
6. Стилизовать **Milestone 6** (CSS)
7. Добавить **Milestone 7** (persistence)
8. Тестировать **Milestone 8** (tests)
9. Отполировать **Milestone 9** (UX)
