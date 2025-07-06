import React from 'react';

// Componente LoadingSpinner reutilizable
export const LoadingSpinner = ({ size = 'md', color = 'blue', message = '' }) => {
  // Tamaños predefinidos
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  // Colores predefinidos
  const colors = {
    blue: 'border-blue-500',
    gray: 'border-gray-500',
    white: 'border-white',
    primary: 'border-[#1e4e9c]'
  };

  return (
    <div className="flex items-center justify-center">
      <div className={`${sizes[size] || sizes.md} border-2 ${colors[color] || colors.blue} border-t-transparent rounded-full animate-spin`}></div>
      {message && <span className="ml-2 text-sm text-gray-600">{message}</span>}
    </div>
  );
};

// Componente LoadingOverlay reutilizable
export const LoadingOverlay = ({ isLoading, message = 'Cargando...' }) => {
  if (!isLoading) return null;
  
  return (
    <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center">
        <LoadingSpinner size="lg" color="primary" />
        <p className="mt-2 text-[#1e4e9c] font-medium">{message}</p>
      </div>
    </div>
  );
};

// Componente ActionButtons reutilizable
const ActionButtons = ({ onClose, handleSubmit, disabled = false, loading = false, loadingText = 'Guardando...', submitText = 'Guardar', cancelText = 'Cancelar' }) => {
  return (
    <div className="flex gap-3 mt-6 justify-end">
      <button
        type="button"
        onClick={handleSubmit}
        disabled={disabled || loading}
        className={`px-8 py-2 text-sm font-medium rounded outline-none flex items-center justify-center min-w-[120px] ${
          disabled || loading
            ? 'bg-gray-400 cursor-not-allowed text-white' 
            : 'bg-[#1e4e9c] text-white hover:bg-blue-700'
        }`}
      >
        {loading ? (
          <>
            <LoadingSpinner size="sm" color="white" />
            <span className="ml-2">{loadingText}</span>
          </>
        ) : (
          submitText
        )}
      </button>
      <button
        type="button"
        onClick={onClose}
        disabled={loading}
        className={`px-8 py-2 text-sm font-medium rounded outline-none ${
          loading ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
        }`}
      >
        {cancelText}
      </button>
    </div>
  );
};

export default ActionButtons;