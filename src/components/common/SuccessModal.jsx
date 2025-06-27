import React, { useEffect } from 'react';

/**
 * SuccessModal
 * @param {string} message - Mensaje a mostrar
 * @param {function} onClose - Función a llamar al cerrar el modal
 * @param {number} duration - (Opcional) Tiempo en ms antes de autocerrar (default: 2500ms)
 * @param {boolean} isError - (Opcional) Si es mensaje de error (color rojo)
 */
export default function SuccessModal({ message, onClose, duration = 2500, isError = false }) {
  useEffect(() => {
    if (!onClose) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div 
      className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center justify-between transition-opacity z-50
        ${isError ? 'bg-red-50 border-l-4 border-red-500 text-red-700' : 'bg-green-50 border-l-4 border-green-500 text-green-700'}`}
      style={{ minWidth: '300px', maxWidth: '400px', zIndex: 999999 }}
    >
      <div className="flex-1">
        <p className="font-medium">
          {isError ? 'Error' : 'Éxito'}
        </p>
        <p className="text-sm">{message}</p>
      </div>
      <button 
        className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
        onClick={onClose}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
