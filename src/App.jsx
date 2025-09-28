import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ConfigProvider } from './contexts/ConfigContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import { AppRoutes } from './routes/AppRoutes';
import { CurrentUserProvider } from './contexts/CurrentUserContext';


const AppContainer = () => {
  return (
    <ErrorBoundary>
      <ConfigProvider>
        <AuthProvider>
          
          <NotificationProvider>
            <CurrentUserProvider>
            <AppRoutes />
            </CurrentUserProvider>
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