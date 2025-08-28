import React, { createContext, useState, useContext } from 'react';

import SuccessModal from '../components/common/SuccessModal';

// Crear el contexto
const NotificationContext = createContext();

// Hook personalizado para usar el contexto
export const useNotification = () => useContext(NotificationContext);

// Proveedor del contexto
export const NotificationProvider = ({ children }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showError, setShowError] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Función para mostrar mensaje de éxito
  const showSuccessMessage = (message, duration = 3000) => {
    setSuccessMsg(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), duration);
  };

  // Función para mostrar mensaje de error
  const showErrorMessage = (message, duration = 3000) => {
    setErrorMsg(message);
    setShowError(true);
    setTimeout(() => setShowError(false), duration);
  };

  return (
    <NotificationContext.Provider value={{ showSuccessMessage, showErrorMessage }}>
      {children}
      {/* Componente global de notificación de éxito */}
      {showSuccess && (
        <SuccessModal
          message={successMsg}
          duration={3000}
          onClose={() => setShowSuccess(false)}
        />
      )}
      {/* Componente global de notificación de error */}
      {showError && (
        <SuccessModal
          message={errorMsg}
          duration={3000}
          onClose={() => setShowError(false)}
          isError={true}
        />
      )}
    </NotificationContext.Provider>
  );
};
