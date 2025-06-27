import { useLocation } from 'react-router-dom';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import { useAuth } from '../contexts/AuthContext';

const publicRoutes = ['/login', '/registrar-usuario-interno'];

const SessionTimeoutHandler = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Solo habilitar el timeout si hay un usuario autenticado
  const shouldEnableTimeout = user && !publicRoutes.includes(location.pathname);
  
  useSessionTimeout({ 
    disabled: !shouldEnableTimeout 
  });
  
  return null;
};

export default SessionTimeoutHandler; 