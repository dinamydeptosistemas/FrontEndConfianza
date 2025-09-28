import React from 'react';
import PropTypes from 'prop-types';

export const SessionExpiredModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <div className="flex items-center mb-4">
          <div className="bg-red-100 p-3 rounded-full mr-4">
            <div className="w-6 h-6 bg-red-500 rounded-full"></div>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Sesión Expirada</h2>
            <p className="text-gray-600 text-sm">Tu sesión ha finalizado.</p>
          </div>
        </div>
        <div className="mb-6">
          <p className="text-gray-600 text-sm leading-relaxed">
            Por tu seguridad, la sesión se ha cerrado. Por favor, inicia sesión de nuevo.
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

SessionExpiredModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};
