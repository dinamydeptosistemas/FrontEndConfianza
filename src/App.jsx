import React from 'react';
import { createBrowserRouter, RouterProvider, useLocation } from 'react-router-dom';
// Importaciones de contextos y modales globales eliminadas, ahora en index.js

import { AppRoutes } from './routes/AppRoutes'; // Mantener solo AppRoutes

// Importar todos los proveedores de contexto globales
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { CurrentUserProvider } from './contexts/CurrentUserContext';
import ReportTaskProvider from './contexts/ReportTaskContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import useInactivityLogout from './hooks/useInactivityLogout';
import GlobalReportModals from './components/modals/GlobalReportModals';

const InactivityManager = ({ children }) => {
  const location = useLocation(); // useLocation debe estar dentro de un Router
  const excludedPaths = ['/login', '/registrar-usuario-interno', '/registrar-usuario-externo'];
  const isEnabled = !excludedPaths.includes(location.pathname);

  React.useEffect(() => {
      if (!isEnabled) {
      }
  }, [isEnabled]);

  useInactivityLogout({
      inactivityThreshold: 1 * 60 * 1000, // 10 minutos
      onInactivity: ({ lastActivity, minutesInactive }) => {
      },
      enabled: isEnabled,
  });

  return (
      <>
          {children}
      </>
  );
};

const AppContainer = () => {
  const location = useLocation();
  const publicPaths = ['/login', '/registrar-usuario-interno', '/registrar-usuario-externo', '/']; // Añade '/' como ruta pública si es necesario
  const showGlobalModals = !publicPaths.includes(location.pathname);

  return (
    // Solo AppRoutes, todos los proveedores están en index.js
    <ErrorBoundary>
      <ConfigProvider>
        <AuthProvider>
          <NotificationProvider>
            <CurrentUserProvider>
              <ReportTaskProvider>
                <InactivityManager>
                  <AppRoutes />
                </InactivityManager>
                {showGlobalModals && <GlobalReportModals />}
              </ReportTaskProvider>
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