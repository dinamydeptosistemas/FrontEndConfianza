import React from 'react';
import PropTypes from 'prop-types';

export const FirstWarningModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Cerrar modal">
          <span className="text-2xl" aria-hidden="true">&times;</span>
        </button>
        <div className="flex items-center mb-4">
          <div className="bg-orange-100 p-3 rounded-full mr-4">
            <div className="w-6 h-6 bg-orange-500 rounded-full"></div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Primer Aviso</h2>
            <p className="text-gray-600 text-sm">Tu sesión está próxima a expirar</p>
          </div>
        </div>
        <div className="mb-6">
          <p className="text-gray-600 text-sm leading-relaxed">
            Para mantener tu sesión activa, confirma que sigues trabajando. Si no respondes, tu sesión se cerrará pronto.
          </p>
        </div>
        <div className="flex justify-center">
          <button onClick={onClose} className="bg-blue-600 text-white py-3 px-8 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

FirstWarningModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
