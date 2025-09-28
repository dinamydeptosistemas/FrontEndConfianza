import React from 'react';
import PropTypes from 'prop-types';

export const SecondWarningModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors" aria-label="Cerrar modal">
          <span className="text-2xl" aria-hidden="true">&times;</span>
        </button>
        <div className="flex items-center mb-4">
          <div className="bg-red-100 p-3 rounded-full mr-4">
            <div className="w-6 h-6 bg-red-500 rounded-full"></div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Segundo Aviso</h2>
            <p className="text-gray-600 text-sm">Tu sesión está a punto de expirar</p>
          </div>
        </div>
        <div className="mb-6">
          <p className="text-gray-600 text-sm leading-relaxed">
            Tu sesión se cerrará muy pronto. Por favor, guarda cualquier trabajo pendiente para no perderlo.
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

SecondWarningModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
