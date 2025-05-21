import React from 'react';
import PropTypes from 'prop-types';

const ConfirmEliminarModal = ({ isOpen, onConfirm, onCancel, mensaje = '¿Está seguro que desea eliminar este elemento?', loading = false, error = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Confirmar Eliminación
          </h2>

          {error ? (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          ) : (
            <p className="text-gray-600 mb-6">{mensaje}</p>
          )}

          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-3 border-2 border-gray-400 rounded text-base font-semibold hover:bg-gray-100 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                  Eliminando...
                </>
              ) : (
                'Eliminar'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ConfirmEliminarModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  mensaje: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.string
};

export default ConfirmEliminarModal;
