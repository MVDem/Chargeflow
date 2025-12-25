import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './utils/queryClient';
import { routes } from './config/routes';
import { Home } from './pages/Home/Home';
import { NotFound } from './pages/NotFound/NotFound';
import { ErrorPage } from './pages/Error/Error';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { OfflineDetector } from './components/OfflineDetector/OfflineDetector';
import './App.css';

const router = createBrowserRouter([
  {
    path: routes.home.path,
    element: <Home />,
    errorElement: <ErrorPage />,
  },
  {
    path: routes.notFound.path,
    element: <NotFound />,
  },
]);

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <OfflineDetector />
        <RouterProvider router={router} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
