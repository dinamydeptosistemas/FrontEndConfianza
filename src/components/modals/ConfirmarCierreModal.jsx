import React from 'react';

const ConfirmarCierreModal = ({ isOpen, onClose, onConfirm, onSave, saving }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Cambios sin guardar</h2>
        <p className="mb-6">¿Estás seguro de que quieres salir? Hay cambios sin guardar.</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded text-gray-700 bg-gray-200 hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded text-white bg-red-500 hover:bg-red-600"
          >
            Salir sin guardar
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-2 rounded text-white bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300"
          >
            {saving ? 'Guardando...' : 'Guardar y Salir'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmarCierreModal;
