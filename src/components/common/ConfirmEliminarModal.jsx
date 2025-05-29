import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

// Componente de modal
const ConfirmEliminarModalComponent = ({ isOpen, onConfirm, onCancel, mensaje = '¿Está seguro que desea eliminar este elemento?', titulo = 'Confirmar Eliminación', textoBotonConfirmar = 'Eliminar', loading = false, error = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            {titulo}
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
              className="px-4 py-2 w-24 border-2 border-gray-400 rounded text-sm font-medium hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="px-4 py-2 w-24 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center transition-colors"
            >
              {loading ? (
                <>
                  <span className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></span>
                  {textoBotonConfirmar}...
                </>
              ) : (
                textoBotonConfirmar
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

ConfirmEliminarModalComponent.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  mensaje: PropTypes.string,
  titulo: PropTypes.string,
  textoBotonConfirmar: PropTypes.string,
  loading: PropTypes.bool,
  error: PropTypes.string
};

// Hook personalizado para manejar la confirmación
export const useConfirmarEliminacion = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState({
    mensaje: '¿Está seguro que desea eliminar este elemento?',
    titulo: 'Confirmar Eliminación',
    textoBotonConfirmar: 'Eliminar',
    onConfirm: null,
    onSuccess: null,
    onError: null
  });

  const show = useCallback(({ 
    mensaje = '¿Está seguro que desea eliminar este elemento?',
    titulo = 'Confirmar Eliminación',
    textoBotonConfirmar = 'Eliminar',
    onConfirm,
    onSuccess,
    onError 
  }) => {
    setConfig({
      mensaje,
      titulo,
      textoBotonConfirmar,
      onConfirm,
      onSuccess,
      onError
    });
    setIsOpen(true);
  }, []);

  const hide = useCallback(() => {
    setIsOpen(false);
    setError('');
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!config.onConfirm) return;
    
    setLoading(true);
    setError('');
    
    try {
      const result = await config.onConfirm();
      if (config.onSuccess) {
        config.onSuccess(result);
      }
      hide();
    } catch (err) {
      const errorMessage = err.message || 'Ocurrió un error al procesar la solicitud';
      setError(errorMessage);
      if (config.onError) {
        config.onError(err);
      }
    } finally {
      setLoading(false);
    }
  }, [config, hide]);

  const handleCancel = useCallback(() => {
    hide();
  }, [hide]);

  const ConfirmDialog = useCallback(() => (
    <ConfirmEliminarModalComponent
      isOpen={isOpen}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      mensaje={config.mensaje}
      titulo={config.titulo}
      textoBotonConfirmar={config.textoBotonConfirmar}
      loading={loading}
      error={error}
    />
  ), [isOpen, handleConfirm, handleCancel, config, loading, error]);

  return {
    show,
    hide,
    ConfirmDialog
  };
};

// Exportar el componente por defecto
export const ConfirmEliminarModal = ConfirmEliminarModalComponent;

export default ConfirmEliminarModal;
