import { useLocation } from 'react-router-dom';
import { useSessionTimeout } from '../hooks/useSessionTimeout';

const publicRoutes = ['/login', '/registrar-usuario-interno'];

const SessionTimeoutHandler = () => {
  const location = useLocation();
  useSessionTimeout({ disabled: publicRoutes.includes(location.pathname) });
  return null;
};

export default SessionTimeoutHandler; 