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
  
  // Función para mostrar mensaje de éxito
  const showSuccessMessage = (message, duration = 3000) => {
    setSuccessMsg(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), duration);
  };

  return (
    <NotificationContext.Provider value={{ showSuccessMessage }}>
      {children}
      
      {/* Componente global de notificación de éxito */}
      {showSuccess && (
        <SuccessModal
          message={successMsg}
          duration={3000}
          onClose={() => setShowSuccess(false)}
        />
      )}
    </NotificationContext.Provider>
  );
};
