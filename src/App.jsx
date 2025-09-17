import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ConfigProvider } from './contexts/ConfigContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import { AppRoutes } from './routes/AppRoutes';

const AppContainer = () => {
  return (
    <ErrorBoundary>
      <ConfigProvider>
        <AuthProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </AuthProvider>
      </ConfigProvider>
    </ErrorBoundary>
  );
};

const router = createBrowserRouter([
  {
    path: "/*",
    element: <AppContainer />,
  }
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
